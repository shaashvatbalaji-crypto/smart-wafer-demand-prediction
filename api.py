"""
api.py

Smart Wafer Demand Prediction System — REST API Bridge
Connects Next.js Frontend to existing Python Backend, Models, Repositories, and Live Data Services.

REST Endpoints:
- GET  /api/health
- GET/POST /api/companies/search & /api/company/search
- POST /api/company/lookup & GET/POST /api/company/data
- POST /api/predict/company & /api/company/predict
- POST /api/company/save
- GET/POST /api/startups/search & /api/startup/data
- POST /api/predict/startup & /api/startup/predict
- POST /api/startup/save
- GET  /api/dashboard/company/<company_id>
- GET  /api/predictions/history
- GET  /api/predictions/<prediction_id>
- DELETE /api/predictions/<prediction_id>
- POST /api/predictions/compare
- GET  /api/financial/<company_name>
- GET  /api/market-intelligence
- POST /api/reports/pdf
"""

from datetime import datetime
import io
import os
import sys

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Existing ML Prediction Engines
from src.dataset_repository import get_company, get_all_companies
from src.predictor import predict_company
from src.startup.startup_predict import StartupPredictor

# Existing Repositories
from database.company_repository import (
    find_company_by_name,
    find_company_by_id,
    search_company as search_company_db,
    create_company,
)
from database.prediction_repository import (
    save_prediction,
    get_prediction_history,
    get_prediction_by_id,
    delete_prediction,
    compare_predictions as compare_predictions_repo,
)
from database.statistics_repository import (
    get_company_statistics,
    get_latest_prediction,
    get_prediction_trend,
)

# Services
from src.services.company_service import get_or_create_company
from src.services.search_service import search as search_service_func
from src.services.delete_service import delete_prediction_service

# Live Data Services
from src.live_data.financial_data_service import get_live_financial_data
from src.live_data.semiconductor_market_service import get_market_intelligence_data
from src.analytics.benchmark import get_growing_companies_data, get_toplevel_companies_data, format_number
from src.analytics.pdf_report import generate_pdf_report


# ============================================================
# FLASK APP SETUP & CORS CONFIGURATION
# ============================================================

app = Flask(__name__)

# Allow requests from localhost:3000 (Next.js) or any configured frontend origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

startup_predictor = StartupPredictor()


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def make_points(value):
    if value is None:
        return []
    if isinstance(value, list):
        points = []
        for item in value:
            if isinstance(item, dict):
                text = (
                    item.get("text")
                    or item.get("message")
                    or item.get("recommendation")
                    or item.get("explanation")
                    or str(item)
                )
                points.append(str(text))
            else:
                points.append(str(item))
        return points
    if isinstance(value, tuple):
        return [str(item) for item in value]
    if isinstance(value, dict):
        points = []
        for key, item in value.items():
            if isinstance(item, list):
                for sub_item in item:
                    points.append(f"{key}: {sub_item}")
            else:
                points.append(f"{key}: {item}")
        return points
    if isinstance(value, str):
        lines = [line.strip() for line in value.splitlines() if line.strip()]
        return lines
    return [str(value)]


def clean_json_value(value):
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(key): clean_json_value(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [clean_json_value(item) for item in value]
    return str(value)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "message": "Smart Wafer Demand Intelligence API is running",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })


# ============================================================
# COMPANY SEARCH & LOOKUP
# ============================================================

@app.route("/api/companies/search", methods=["GET", "POST"])
@app.route("/api/company/search", methods=["GET", "POST"])
def company_search():
    try:
        query = request.args.get("query", "")
        if not query and request.is_json:
            data = request.get_json() or {}
            query = data.get("query", data.get("company", ""))
        
        db_records = search_company_db(query) if query else search_company_db("")
        
        company_map = {}
        for rec in db_records or []:
            name = rec.get("company_name") or rec.get("company")
            cid = rec.get("company_id")
            if name and cid and not str(cid).startswith("COMP_") and not str(name).startswith("COMP_"):
                ds_row = get_company(name) or {}
                company_map[name.lower()] = {
                    "company_id": cid,
                    "company_name": name,
                    "country": rec.get("country") or ds_row.get("country_iso3") or "TWN",
                    "company_type": rec.get("company_type", "Existing"),
                    "fab_type": rec.get("fab_type") or ds_row.get("fab_type") or "Logic Leading Edge",
                    "segment": rec.get("segment") or ds_row.get("segment") or "Foundry",
                    "process_node_nm": ds_row.get("process_node_nm") or 3,
                }

        dataset_list = get_all_companies()
        for idx, c_name in enumerate(dataset_list):
            if not c_name or str(c_name).startswith("COMP_"):
                continue
            c_lower = c_name.lower()
            ds_row = get_company(c_name) or {}
            if c_lower not in company_map:
                found = find_company_by_name(c_name)
                if found and found.get("company_id"):
                    company_map[c_lower] = {
                        "company_id": found["company_id"],
                        "company_name": found.get("company_name", c_name),
                        "country": found.get("country") or ds_row.get("country_iso3") or "TWN",
                        "company_type": found.get("company_type", "Existing"),
                        "fab_type": found.get("fab_type") or ds_row.get("fab_type") or "Logic Leading Edge",
                        "segment": found.get("segment") or ds_row.get("segment") or "Foundry",
                        "process_node_nm": ds_row.get("process_node_nm") or 3,
                    }
                else:
                    country_code = ds_row.get("country_iso3") or ds_row.get("country") or "TWN"
                    company_id = f"EC{len(company_map) + 1:04d}"
                    company_map[c_lower] = {
                        "company_id": company_id,
                        "company_name": c_name,
                        "country": country_code,
                        "company_type": "Existing",
                        "fab_type": ds_row.get("fab_type") or "Logic Leading Edge",
                        "segment": ds_row.get("segment") or "Foundry",
                        "process_node_nm": ds_row.get("process_node_nm") or 3,
                    }

        results = list(company_map.values())
        results.sort(key=lambda x: x["company_name"])

        if query:
            q_lower = query.lower()
            results = [
                c for c in results
                if q_lower in c["company_name"].lower()
                or q_lower in c["company_id"].lower()
                or q_lower in str(c.get("country", "")).lower()
                or q_lower in str(c.get("segment", "")).lower()
                or q_lower in str(c.get("fab_type", "")).lower()
            ]

        return jsonify({
            "success": True,
            "query": query,
            "companies": clean_json_value(results)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/company/lookup", methods=["POST"])
@app.route("/api/company/data", methods=["GET", "POST"])
def company_lookup():
    try:
        data = {}
        if request.is_json:
            data = request.get_json() or {}
        company_name = request.args.get("name") or request.args.get("company") or data.get("company") or data.get("name") or ""
        
        if isinstance(company_name, dict):
            company_name = str(company_name.get("company", "")).strip()
        else:
            company_name = str(company_name).strip()
            
        if not company_name:
            return jsonify({"success": False, "error": "Company name is required."}), 400

        company = get_company(company_name)
        if company is None:
            return jsonify({"success": False, "error": f"Company '{company_name}' not found in dataset."}), 404

        company_db = find_company_by_name(company["company"])
        company_id = company_db["company_id"] if company_db else f"COMP_{company['company'][:4].upper()}"

        return jsonify({
            "success": True,
            "company": clean_json_value(company),
            "company_id": company_id
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# EXISTING COMPANY PREDICTION
# ============================================================

@app.route("/api/predict/company", methods=["POST"])
@app.route("/api/company/predict", methods=["POST"])
@app.route("/api/predict/existing", methods=["POST"])
def company_predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No request data received."}), 400

        company_input = data.get("company", "")
        if isinstance(company_input, dict):
            company_data = company_input
            company_name = str(company_data.get("company", "")).strip()
        else:
            company_name = str(company_input).strip()
            company_data = get_company(company_name)

        if not company_data:
            return jsonify({"success": False, "error": f"Company dataset not found for '{company_name}'"}), 404

        # Run core ML model prediction
        prediction = predict_company(company_data)

        if isinstance(prediction, dict):
            predicted_wafers = (
                prediction.get("prediction")
                or prediction.get("predicted_wafer_demand")
                or prediction.get("monthly_wafer_demand")
                or prediction.get("wafer_demand", 0.0)
            )
            result = prediction
        else:
            predicted_wafers = float(prediction)
            result = {"prediction": predicted_wafers}

        # Calculate Analyst Benchmark Data
        bm_data = get_growing_companies_data(company_name, predicted_wafers, company_data)

        return jsonify({
            "success": True,
            "company": clean_json_value(company_data),
            "prediction": round(float(predicted_wafers), 2),
            "predicted_wafer_demand": round(float(predicted_wafers), 2),
            "confidence": 95.0,
            "benchmark": clean_json_value(bm_data),
            "result": clean_json_value(result)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/company/save", methods=["POST"])
def save_company_prediction_route():
    try:
        data = request.get_json() or {}
        prediction_name = str(data.get("prediction_name", "Company Prediction")).strip()
        company_id = data.get("company_id", "COMP001")
        company = data.get("company", "")
        prediction_type = data.get("prediction_type", "Existing Company")
        original_data = data.get("original_data", {})
        modified_data = data.get("modified_data", original_data)
        predicted_wafers = data.get("predicted_wafers")
        confidence = data.get("confidence", 95.0)
        model_version = data.get("model_version", "CatBoost_v1")

        if predicted_wafers is None:
            return jsonify({"success": False, "error": "Predicted wafer demand is required."}), 400

        save_prediction(
            prediction_name=prediction_name,
            company_id=company_id,
            company=company,
            prediction_type=prediction_type,
            original_data=original_data,
            modified_data=modified_data,
            predicted_wafers=float(predicted_wafers),
            confidence=float(confidence),
            model_version=model_version,
        )

        return jsonify({"success": True, "message": "Company prediction saved successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# STARTUP PREDICTION & LOOKUP
# ============================================================

@app.route("/api/startups/search", methods=["GET", "POST"])
@app.route("/api/startup/data", methods=["GET", "POST"])
def startup_lookup():
    try:
        name = request.args.get("name") or request.args.get("company")
        if not name and request.is_json:
            data = request.get_json() or {}
            name = data.get("name", data.get("company", ""))
            
        if not name:
            return jsonify({"success": False, "error": "Startup name is required"}), 400

        existing = find_company_by_name(name.strip())
        if existing:
            company_id = existing.get("company_id")
            latest_data = None
            try:
                latest_pred = get_latest_prediction(company_id)
                if latest_pred:
                    raw_data = latest_pred.get("modified_data") or latest_pred.get("original_data")
                    if isinstance(raw_data, str):
                        import json
                        latest_data = json.loads(raw_data)
                    elif isinstance(raw_data, dict):
                        latest_data = raw_data
            except Exception as ex:
                print(f"Notice fetching latest prediction for {company_id}: {ex}")

            return jsonify({
                "success": True,
                "exists": True,
                "company_id": company_id,
                "company_type": existing.get("company_type", "Startup"),
                "startup": clean_json_value(existing),
                "latest_data": clean_json_value(latest_data) if isinstance(latest_data, dict) else None
            })
        else:
            return jsonify({
                "success": True,
                "exists": False,
                "company_id": None,
                "message": "New startup. ID will be generated upon saving."
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/startup/create", methods=["POST"])
def create_startup_route():
    try:
        data = request.get_json() or {}
        company_name = str(data.get("company", data.get("company_name", ""))).strip()
        if not company_name:
            return jsonify({"success": False, "error": "Startup company name is required."}), 400

        startup_info = {
            "company": company_name,
            "country": str(data.get("country", "USA")).strip(),
            "fab_type": str(data.get("fab_type", "logic_leading")).strip(),
            "segment": str(data.get("segment", "foundry")).strip(),
        }

        result = get_or_create_company(startup_info)
        company_rec = result.get("company", {})
        company_id = company_rec.get("company_id")
        is_new = result.get("is_new", False)

        return jsonify({
            "success": True,
            "company_id": company_id,
            "is_new": is_new,
            "company": clean_json_value(company_rec),
            "message": f"Startup '{company_name}' {'registered successfully' if is_new else 'loaded from database'} with Company ID: {company_id}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/predict/startup", methods=["POST"])
@app.route("/api/startup/predict", methods=["POST"])
def startup_predict_route():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No startup data received."}), 400

        required_fields = [
            "company", "country", "fab_type", "segment", "year",
            "process_node_nm", "expected_revenue", "rd_budget", "capex",
            "ai_chip_launches", "expected_shipments", "expected_ai_revenue"
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"success": False, "error": f"Missing startup fields: {', '.join(missing)}"}), 400

        startup_inputs = {
            "company": str(data["company"]).strip(),
            "country": str(data["country"]).strip(),
            "fab_type": str(data["fab_type"]).strip(),
            "segment": str(data["segment"]).strip(),
            "year": int(data["year"]),
            "process_node_nm": float(data["process_node_nm"]),
            "expected_revenue": float(data["expected_revenue"]),
            "rd_budget": float(data["rd_budget"]),
            "capex": float(data["capex"]),
            "ai_chip_launches": int(data["ai_chip_launches"]),
            "expected_shipments": float(data["expected_shipments"]),
            "expected_ai_revenue": float(data["expected_ai_revenue"]),
        }

        # Optional hardware fields
        for k in ["avg_memory_gb", "avg_fp16_tflops", "avg_tdp", "avg_chip_price", "highest_chip_price", "lowest_chip_price", "worldwide_sales"]:
            if k in data:
                startup_inputs[k] = float(data[k])

        # Get or create company ID automatically in persistence layer
        company_id = data.get("company_id")
        is_new_startup = False
        try:
            company_res = get_or_create_company(startup_inputs)
            company_rec = company_res.get("company", {})
            if company_rec and company_rec.get("company_id"):
                company_id = company_rec.get("company_id")
            is_new_startup = company_res.get("is_new", False)
        except Exception as ex:
            print(f"Company DB service notice: {ex}")

        # Run Startup Hybrid ML predictor
        prediction = startup_predictor.predict_details(startup_inputs)
        explanation_points = make_points(prediction.get("explanation"))
        recommendation_points = make_points(prediction.get("recommendations"))

        result = {
            "ai_prediction": round(float(prediction["ai_prediction"]), 2),
            "business_prediction": round(float(prediction["business_prediction"]), 2),
            "final_prediction": round(float(prediction["final_prediction"]), 2),
            "confidence": round(float(prediction["confidence"]), 2),
            "explanation": explanation_points,
            "recommendations": recommendation_points,
            "startup_stage": prediction.get("startup_stage"),
            "investment_rating": prediction.get("investment_rating"),
        }

        # Benchmark vs Top Leaders
        bm_top = get_toplevel_companies_data(startup_inputs["company"], result["final_prediction"], startup_inputs)

        return jsonify({
            "success": True,
            "company_id": company_id,
            "is_new": is_new_startup,
            "startup": startup_inputs,
            "prediction": result["final_prediction"],
            "predicted_wafer_demand": result["final_prediction"],
            "monthly_wafer_demand": result["final_prediction"],
            "ai_prediction": result["ai_prediction"],
            "business_prediction": result["business_prediction"],
            "confidence": result["confidence"],
            "explanation": result["explanation"],
            "recommendations": result["recommendations"],
            "startup_stage": result["startup_stage"],
            "investment_rating": result["investment_rating"],
            "benchmark": clean_json_value(bm_top),
            "result": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/startup/save", methods=["POST"])
def save_startup_prediction_route():
    try:
        data = request.get_json() or {}
        startup_inputs = data.get("startup", data.get("input", {}))
        company = str(startup_inputs.get("company", "Startup")).strip()
        prediction_data = data.get("prediction", {})

        if isinstance(prediction_data, dict):
            predicted_wafers = (
                prediction_data.get("final_prediction")
                or prediction_data.get("prediction")
                or prediction_data.get("monthly_wafer_demand")
                or prediction_data.get("predicted_wafer_demand")
            )
            confidence = prediction_data.get("confidence", data.get("confidence", 90.0))
        else:
            predicted_wafers = prediction_data or data.get("predicted_wafers")
            confidence = data.get("confidence", 90.0)

        if predicted_wafers is None:
            return jsonify({"success": False, "error": "Predicted wafer demand is required."}), 400

        prediction_name = str(data.get("prediction_name", f"{company} Startup Prediction")).strip()
        company_id = data.get("company_id")

        if not company_id and startup_inputs and "company" in startup_inputs:
            try:
                company_res = get_or_create_company(startup_inputs)
                company_rec = company_res.get("company", {})
                if company_rec:
                    company_id = company_rec.get("company_id")
            except Exception as ex:
                print(f"Save company_id resolution notice: {ex}")

        save_prediction(
            prediction_name=prediction_name,
            company_id=company_id,
            company=company,
            prediction_type="startup",
            original_data=startup_inputs,
            modified_data={"startup_inputs": startup_inputs, "prediction": prediction_data},
            predicted_wafers=float(predicted_wafers),
            confidence=float(confidence),
            model_version="Startup Hybrid CatBoost v1.0",
        )

        return jsonify({
            "success": True,
            "message": "Startup prediction saved successfully.",
            "company": company,
            "predicted_wafers": round(float(predicted_wafers), 2),
            "confidence": round(float(confidence), 2)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# COMPANY DASHBOARD & STATISTICS
# ============================================================

@app.route("/api/dashboard/company/<company_id>", methods=["GET"])
def company_dashboard(company_id):
    try:
        # Lookup company in DB or dataset
        comp_record = find_company_by_id(company_id) or find_company_by_name(company_id)
        
        company_name = company_id
        if comp_record:
            company_name = comp_record.get("company_name") or comp_record.get("company") or company_id
            real_id = comp_record.get("company_id")
            if real_id:
                company_id = real_id

        stats = get_company_statistics(company_id)
        latest = get_latest_prediction(company_id)
        trend = get_prediction_trend(company_id)
        
        ds_company = get_company(company_name)

        predicted_wafers = 0.0
        if latest:
            predicted_wafers = float(latest.get("predicted_wafers", 0.0))
        elif ds_company:
            predicted_wafers = float(ds_company.get("monthly_wafer_capacity", 0.0))
            if predicted_wafers == 0:
                predicted_wafers = float(ds_company.get("revenue_usd_bn", 1.0)) * 25000.0

        company_inputs = ds_company or (latest.get("original_data") if latest else None) or comp_record or {}
        if isinstance(company_inputs, str):
            try:
                import json
                company_inputs = json.loads(company_inputs)
            except Exception:
                company_inputs = {}

        bm_data = get_growing_companies_data(company_name, predicted_wafers, company_inputs)

        fin_data = None
        try:
            fin_data = get_live_financial_data(company_name)
        except Exception as ex:
            print(f"Notice fetching live financial data for dashboard: {ex}")

        return jsonify({
            "success": True,
            "company_id": company_id,
            "company_name": company_name,
            "company": clean_json_value(comp_record or {"company_name": company_name, "company_id": company_id}),
            "dataset_data": clean_json_value(ds_company),
            "statistics": clean_json_value(stats),
            "latest_prediction": clean_json_value(latest),
            "trend": clean_json_value(trend),
            "benchmark": clean_json_value(bm_data),
            "financial": clean_json_value(fin_data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# PREDICTION HISTORY & MANAGEMENT
# ============================================================

@app.route("/api/predictions/history", methods=["GET"])
def prediction_history():
    try:
        history = get_prediction_history()
        cleaned = clean_json_value(history) or []
        return jsonify({
            "success": True,
            "predictions": cleaned,
            "history": cleaned,
            "count": len(cleaned)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/predictions/<int:prediction_id>", methods=["GET"])
def get_prediction_route(prediction_id):
    try:
        prediction = get_prediction_by_id(prediction_id)
        if prediction is None:
            return jsonify({"success": False, "error": "Prediction not found."}), 404
        return jsonify({
            "success": True,
            "prediction": clean_json_value(prediction)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/predictions/<int:prediction_id>", methods=["DELETE"])
def remove_prediction(prediction_id):
    try:
        deleted = delete_prediction(prediction_id)
        if not deleted:
            return jsonify({"success": False, "error": "Prediction not found."}), 404
        return jsonify({"success": True, "message": "Prediction deleted successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/predictions/compare", methods=["POST"])
def compare_predictions():
    try:
        data = request.get_json() or {}
        prediction_ids = data.get("prediction_ids", [])
        if not prediction_ids:
            return jsonify({"success": False, "error": "prediction_ids list required"}), 400

        if len(prediction_ids) == 1:
            p1 = get_prediction_by_id(prediction_ids[0])
            records = [p1] if p1 else []
        else:
            p1, p2 = compare_predictions_repo(prediction_ids[0], prediction_ids[1])
            records = [p for p in [p1, p2] if p is not None]

        return jsonify({"success": True, "comparison": clean_json_value(records)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# LIVE FINANCIAL & MARKET INTELLIGENCE
# ============================================================

@app.route("/api/financial/<company_name>", methods=["GET"])
def get_financial(company_name):
    try:
        data = get_live_financial_data(company_name)
        return jsonify({
            "success": True,
            "status": data.get("status", "fallback"),
            "source": data.get("source"),
            "reporting_period": data.get("reporting_period"),
            "retrieved_timestamp": data.get("retrieved_timestamp"),
            "data": clean_json_value(data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/market-intelligence", methods=["GET"])
def get_market_intelligence():
    try:
        data = get_market_intelligence_data()
        return jsonify({
            "success": True,
            "status": data.get("overall_status", "fallback"),
            "data": clean_json_value(data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# PDF REPORT EXPORT
# ============================================================

@app.route("/api/reports/pdf", methods=["POST"])
def download_pdf_report():
    try:
        data = request.get_json() or {}
        entity_name = data.get("entity_name", "Company")
        pdf_bytes = generate_pdf_report(
            entity_name=entity_name,
            company_id=data.get("company_id", "COMP001"),
            entity_type=data.get("entity_type", "Existing Company"),
            inputs=data.get("inputs", {}),
            prediction_result=data.get("prediction_result", {}),
            benchmark_data=data.get("benchmark_data", {}),
            gap_statements=data.get("gap_statements"),
            is_startup=data.get("is_startup", False),
            financial_data=data.get("financial_data"),
            market_intel_data=data.get("market_intel_data"),
        )
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"Analyst_Report_{entity_name}.pdf",
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# DATASET SCATTER METRICS (READ-ONLY)
# ============================================================

@app.route("/api/dataset/scatter", methods=["GET"])
def dataset_scatter():
    try:
        dataset_list = get_all_companies()
        points = []
        for idx, c_name in enumerate(dataset_list):
            if not c_name or str(c_name).startswith("COMP_"):
                continue
            ds_row = get_company(c_name) or {}
            found = find_company_by_name(c_name) or {}
            cid = found.get("company_id") or ds_row.get("company_id") or f"EC{idx+1:04d}"
            country = ds_row.get("country_iso3") or ds_row.get("country") or found.get("country") or "TWN"
            
            rev = float(ds_row.get("revenue_usd_bn") or 0.0)
            rd = float(ds_row.get("rd_spend_usd_bn") or 0.0)
            capex = float(ds_row.get("capex_usd_bn") or 0.0)
            ai_ship = float(ds_row.get("total_ai_shipments") or 0.0)
            wafers = float(ds_row.get("monthly_wafer_capacity") or (rev * 25000.0) or 100000.0)
            node = float(ds_row.get("process_node_nm") or 5.0)

            points.append({
                "company_name": c_name,
                "company_id": cid,
                "country": country,
                "country_iso3": country,
                "revenue_usd_bn": rev,
                "rd_spend_usd_bn": rd,
                "capex_usd_bn": capex,
                "total_ai_shipments": ai_ship,
                "monthly_wafer_capacity": wafers,
                "process_node_nm": node,
                "prediction_type": "Existing Company"
            })
        
        return jsonify({
            "success": True,
            "companies": clean_json_value(points)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting Smart Wafer Demand Prediction REST API Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)

