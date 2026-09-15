"""
api.py

Flask API for INSIQ
Smart Wafer Demand Prediction System

Existing Company Prediction + Startup Prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

# ============================================================
# EXISTING COMPANY ML
# ============================================================

from src.dataset_repository import get_company
from src.predictor import predict_company

# ============================================================
# STARTUP ML
# ============================================================

from src.startup.startup_predict import StartupPredictor

# ============================================================
# DATABASE
# ============================================================

from database.company_repository import find_company_by_name

from database.prediction_repository import (
    save_prediction,
    get_prediction_history,
    get_prediction_by_id,
    delete_prediction,
)


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# STARTUP PREDICTOR
# ============================================================

startup_predictor = StartupPredictor()


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def make_points(value):
    """
    Converts explanation/recommendations into a clean
    list of strings for the frontend.
    """

    if value is None:
        return []

    if isinstance(value, list):
        points = []

        for item in value:

            if isinstance(item, dict):

                # Try common text keys
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
                    points.append(
                        f"{key}: {sub_item}"
                    )

            else:

                points.append(
                    f"{key}: {item}"
                )

        return points

    # If explanation is a multiline string
    if isinstance(value, str):

        lines = [
            line.strip()
            for line in value.splitlines()
            if line.strip()
        ]

        return lines

    return [str(value)]


def clean_json_value(value):
    """
    Makes values safe for JSON responses.
    """

    if value is None:
        return None

    if isinstance(value, (str, int, float, bool)):
        return value

    if isinstance(value, dict):

        return {
            str(key): clean_json_value(item)
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple)):

        return [
            clean_json_value(item)
            for item in value
        ]

    return str(value)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({

        "success": True,

        "message": "INSIQ API is running"

    })


# ============================================================
# EXISTING COMPANY LOOKUP
# ============================================================

@app.route(
    "/api/company/lookup",
    methods=["POST"]
)
def company_lookup():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No request data received."

            }), 400

        company_input = data.get(
            "company",
            ""
        )

        # ----------------------------------------------------
        # Handle company as string OR object
        # ----------------------------------------------------

        if isinstance(
            company_input,
            dict
        ):

            company_name = str(

                company_input.get(
                    "company",
                    ""
                )

            ).strip()

        else:

            company_name = str(
                company_input
            ).strip()

        if not company_name:

            return jsonify({

                "success": False,

                "error":
                    "Company name is required."

            }), 400

        # ----------------------------------------------------
        # Get company from ML dataset
        # ----------------------------------------------------

        company = get_company(
            company_name
        )

        if company is None:

            return jsonify({

                "success": False,

                "error":
                    "Company not found in dataset."

            }), 404

        # ----------------------------------------------------
        # Verify company in MySQL
        # ----------------------------------------------------

        company_db = find_company_by_name(
            company["company"]
        )

        if company_db is None:

            return jsonify({

                "success": False,

                "error":
                    "Company not found in Company Database."

            }), 404

        company_id = company_db[
            "company_id"
        ]

        # ----------------------------------------------------
        # Return complete company information
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "company": clean_json_value(
                company
            ),

            "company_id": company_id

        })

    except Exception as e:

        print(
            "Company lookup error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# EXISTING COMPANY PREDICTION
# ============================================================

@app.route(
    "/api/company/predict",
    methods=["POST"]
)
def company_predict():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No request data received."

            }), 400

        # ----------------------------------------------------
        # Get company
        # ----------------------------------------------------

        company_input = data.get(
            "company",
            ""
        )

        if isinstance(
            company_input,
            dict
        ):

            company_name = str(

                company_input.get(
                    "company",
                    ""
                )

            ).strip()

        else:

            company_name = str(
                company_input
            ).strip()

        if not company_name:

            return jsonify({

                "success": False,

                "error":
                    "Company name is required."

            }), 400

        # ----------------------------------------------------
        # Get company information
        # ----------------------------------------------------

        company = get_company(
            company_name
        )

        if company is None:

            return jsonify({

                "success": False,

                "error":
                    "Company not found in dataset."

            }), 404

        # ----------------------------------------------------
        # Run existing company prediction
        # ----------------------------------------------------

        prediction = predict_company(
            company
        )

        # ----------------------------------------------------
        # Handle different predictor formats
        # ----------------------------------------------------

        if isinstance(
            prediction,
            dict
        ):

            result = prediction

            predicted_wafers = (

                result.get(
                    "prediction"
                )

                or result.get(
                    "predicted_wafer_demand"
                )

                or result.get(
                    "monthly_wafer_demand"
                )

                or result.get(
                    "wafer_demand"
                )

            )

        else:

            predicted_wafers = float(
                prediction
            )

            result = {

                "prediction":
                    predicted_wafers

            }

        # ----------------------------------------------------
        # Return existing company result
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "company":
                clean_json_value(
                    company
                ),

            "prediction":
                predicted_wafers,

            "result":
                clean_json_value(
                    result
                )

        })

    except Exception as e:

        print(
            "Company prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# SAVE EXISTING COMPANY PREDICTION
# ============================================================

@app.route(
    "/api/company/save",
    methods=["POST"]
)
def save_company_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No request data received."

            }), 400

        prediction_name = str(

            data.get(
                "prediction_name",
                "Company Prediction"
            )

        ).strip()

        company_id = data.get(
            "company_id"
        )

        company = data.get(
            "company",
            ""
        )

        prediction_type = data.get(

            "prediction_type",
            "existing_company"

        )

        original_data = data.get(

            "original_data",
            {}

        )

        modified_data = data.get(

            "modified_data",
            original_data

        )

        predicted_wafers = data.get(
            "predicted_wafers"
        )

        confidence = data.get(
            "confidence",
            0
        )

        model_version = data.get(

            "model_version",
            "CatBoost v1.0"

        )

        if predicted_wafers is None:

            return jsonify({

                "success": False,

                "error":
                    "Predicted wafer demand is required."

            }), 400

        if company_id is None:

            return jsonify({

                "success": False,

                "error":
                    "Company ID is required."

            }), 400

        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        save_prediction(

            prediction_name=
                prediction_name,

            company_id=
                company_id,

            company=
                company,

            prediction_type=
                prediction_type,

            original_data=
                original_data,

            modified_data=
                modified_data,

            predicted_wafers=
                predicted_wafers,

            confidence=
                confidence,

            model_version=
                model_version

        )

        return jsonify({

            "success": True,

            "message":
                "Company prediction saved successfully."

        })

    except Exception as e:

        print(
            "Save company prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# STARTUP PREDICTION
# ============================================================

@app.route(
    "/api/startup/predict",
    methods=["POST"]
)
def startup_predict():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No startup data received."

            }), 400

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        required_fields = [

            "company",
            "country",
            "fab_type",
            "segment",
            "year",
            "process_node_nm",
            "expected_revenue",
            "rd_budget",
            "capex",
            "ai_chip_launches",
            "expected_shipments",
            "expected_ai_revenue"

        ]

        missing_fields = [

            field

            for field in required_fields

            if field not in data

        ]

        if missing_fields:

            return jsonify({

                "success": False,

                "error":
                    "Missing startup fields: "
                    + ", ".join(
                        missing_fields
                    )

            }), 400

        # ----------------------------------------------------
        # Clean startup input
        # ----------------------------------------------------

        startup_inputs = {

            "company": str(
                data["company"]
            ).strip(),

            "country": str(
                data["country"]
            ).strip(),

            "fab_type": str(
                data["fab_type"]
            ).strip(),

            "segment": str(
                data["segment"]
            ).strip(),

            "year": int(
                data["year"]
            ),

            "process_node_nm": float(
                data["process_node_nm"]
            ),

            "expected_revenue": float(
                data["expected_revenue"]
            ),

            "rd_budget": float(
                data["rd_budget"]
            ),

            "capex": float(
                data["capex"]
            ),

            "ai_chip_launches": int(
                data["ai_chip_launches"]
            ),

            "expected_shipments": float(
                data["expected_shipments"]
            ),

            "expected_ai_revenue": float(
                data["expected_ai_revenue"]
            )

        }

        # ----------------------------------------------------
        # Run actual Startup ML model
        # ----------------------------------------------------

        prediction = (
            startup_predictor.predict_details(
                startup_inputs
            )
        )

        # ----------------------------------------------------
        # Convert explanation/recommendations
        # into frontend-friendly points
        # ----------------------------------------------------

        explanation_points = make_points(

            prediction.get(
                "explanation"
            )

        )

        recommendation_points = make_points(

            prediction.get(
                "recommendations"
            )

        )

        # ----------------------------------------------------
        # Build complete result
        # ----------------------------------------------------

        result = {

            "ai_prediction":
                round(
                    float(
                        prediction[
                            "ai_prediction"
                        ]
                    ),
                    2
                ),

            "business_prediction":
                round(
                    float(
                        prediction[
                            "business_prediction"
                        ]
                    ),
                    2
                ),

            "final_prediction":
                round(
                    float(
                        prediction[
                            "final_prediction"
                        ]
                    ),
                    2
                ),

            "confidence":
                round(
                    float(
                        prediction[
                            "confidence"
                        ]
                    ),
                    2
                ),

            "explanation":
                explanation_points,

            "recommendations":
                recommendation_points,

            "startup_stage":
                prediction.get(
                    "startup_stage"
                ),

            "investment_rating":
                prediction.get(
                    "investment_rating"
                )

        }

        # ----------------------------------------------------
        # Return complete startup ML output
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "startup":
                startup_inputs,

            # Main prediction
            "prediction":
                result[
                    "final_prediction"
                ],

            "predicted_wafer_demand":
                result[
                    "final_prediction"
                ],

            "monthly_wafer_demand":
                result[
                    "final_prediction"
                ],

            # Detailed ML results
            "ai_prediction":
                result[
                    "ai_prediction"
                ],

            "business_prediction":
                result[
                    "business_prediction"
                ],

            "confidence":
                result[
                    "confidence"
                ],

            "explanation":
                result[
                    "explanation"
                ],

            "recommendations":
                result[
                    "recommendations"
                ],

            "startup_stage":
                result[
                    "startup_stage"
                ],

            "investment_rating":
                result[
                    "investment_rating"
                ],

            # Complete result object
            "result":
                result

        })

    except ValueError as e:

        print(
            "Startup input validation error:",
            e
        )

        return jsonify({

            "success": False,

            "error":
                "Invalid startup input: "
                + str(e)

        }), 400

    except Exception as e:

        print(
            "Startup prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# SAVE STARTUP PREDICTION
# ============================================================

@app.route(
    "/api/startup/save",
    methods=["POST"]
)
def save_startup_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No startup prediction data received."

            }), 400

        # ----------------------------------------------------
        # Startup information
        # ----------------------------------------------------

        startup_inputs = data.get(

            "startup",

            data.get(
                "input",
                {}
            )

        )

        if not startup_inputs:

            return jsonify({

                "success": False,

                "error":
                    "Startup input data is required."

            }), 400

        company = str(

            startup_inputs.get(
                "company",
                "Startup"
            )

        ).strip()

        # ----------------------------------------------------
        # Prediction result
        # ----------------------------------------------------

        prediction_data = data.get(
            "prediction",
            {}
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # The frontend may send the complete result object
        # or only the numeric prediction.
        # ----------------------------------------------------

        if isinstance(
            prediction_data,
            dict
        ):

            predicted_wafers = (

                prediction_data.get(
                    "final_prediction"
                )

                or prediction_data.get(
                    "prediction"
                )

                or prediction_data.get(
                    "monthly_wafer_demand"
                )

                or prediction_data.get(
                    "predicted_wafer_demand"
                )

            )

            confidence = prediction_data.get(

                "confidence",
                data.get(
                    "confidence",
                    0
                )

            )

        else:

            predicted_wafers = (
                prediction_data
            )

            confidence = data.get(
                "confidence",
                0
            )

        # ----------------------------------------------------
        # Direct values support
        # ----------------------------------------------------

        if predicted_wafers is None:

            predicted_wafers = data.get(
                "predicted_wafers"
            )

        if predicted_wafers is None:

            predicted_wafers = data.get(
                "final_prediction"
            )

        if predicted_wafers is None:

            predicted_wafers = data.get(
                "monthly_wafer_demand"
            )

        if predicted_wafers is None:

            return jsonify({

                "success": False,

                "error":
                    "Predicted wafer demand is required."

            }), 400

        # ----------------------------------------------------
        # Prediction name
        # ----------------------------------------------------

        prediction_name = str(

            data.get(

                "prediction_name",

                f"{company} Startup Prediction"

            )

        ).strip()

        # ----------------------------------------------------
        # Startup company ID
        #
        # A startup does not necessarily exist in the
        # existing-company database.
        #
        # Therefore NULL is used when no company_id
        # is supplied.
        # ----------------------------------------------------

        company_id = data.get(
            "company_id"
        )

        # ----------------------------------------------------
        # Store complete startup information
        # ----------------------------------------------------

        original_data = (
            startup_inputs
        )

        # Preserve the complete result
        # sent by the frontend.

        modified_data = {

            "startup_inputs":
                startup_inputs,

            "prediction":
                prediction_data,

            "confidence":
                confidence,

            "ai_prediction":
                data.get(
                    "ai_prediction"
                ),

            "business_prediction":
                data.get(
                    "business_prediction"
                ),

            "explanation":
                data.get(
                    "explanation",
                    []
                ),

            "recommendations":
                data.get(
                    "recommendations",
                    []
                ),

            "startup_stage":
                data.get(
                    "startup_stage"
                ),

            "investment_rating":
                data.get(
                    "investment_rating"
                )

        }

        # ----------------------------------------------------
        # Save to MySQL
        # ----------------------------------------------------

        save_prediction(

            prediction_name=
                prediction_name,

            company_id=
                company_id,

            company=
                company,

            prediction_type=
                "startup",

            original_data=
                original_data,

            modified_data=
                modified_data,

            predicted_wafers=
                float(
                    predicted_wafers
                ),

            confidence=
                float(
                    confidence
                ),

            model_version=
                "Startup Hybrid CatBoost v1.0"

        )

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "message":
                "Startup prediction saved successfully.",

            "company":
                company,

            "predicted_wafers":
                round(
                    float(
                        predicted_wafers
                    ),
                    2
                ),

            "confidence":
                round(
                    float(
                        confidence
                    ),
                    2
                )

        })

    except Exception as e:

        print(
            "Save startup prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# PREDICTION HISTORY
# ============================================================

@app.route(
    "/api/predictions/history",
    methods=["GET"]
)
def prediction_history():

    try:

        history = get_prediction_history()

        return jsonify({

            "success": True,

            "predictions":
                clean_json_value(
                    history
                )

        })

    except Exception as e:

        print(
            "Prediction history error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# GET PREDICTION BY ID
# ============================================================

@app.route(
    "/api/predictions/<int:prediction_id>",
    methods=["GET"]
)
def get_prediction(prediction_id):

    try:

        prediction = get_prediction_by_id(
            prediction_id
        )

        if prediction is None:

            return jsonify({

                "success": False,

                "error":
                    "Prediction not found."

            }), 404

        return jsonify({

            "success": True,

            "prediction":
                clean_json_value(
                    prediction
                )

        })

    except Exception as e:

        print(
            "Get prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# DELETE PREDICTION
# ============================================================

@app.route(
    "/api/predictions/<int:prediction_id>",
    methods=["DELETE"]
)
def remove_prediction(prediction_id):

    try:

        deleted = delete_prediction(
            prediction_id
        )

        if not deleted:

            return jsonify({

                "success": False,

                "error":
                    "Prediction not found."

            }), 404

        return jsonify({

            "success": True,

            "message":
                "Prediction deleted successfully."

        })

    except Exception as e:

        print(
            "Delete prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
