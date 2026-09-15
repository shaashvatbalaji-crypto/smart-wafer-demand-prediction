"""
benchmark.py

Enterprise Analyst Benchmarking Engine for Smart Wafer Demand Prediction System

Calculates:
1. Detailed Growing Companies Benchmark dataset & rankings
2. Top-Level Industry Leaders Benchmark dataset & rankings
3. Data-driven Gap Analysis and formatting helpers (K, M, B)
"""

from pathlib import Path
import pandas as pd

DATASET_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "advanced_features.csv"


def load_dataset():
    """
    Loads advanced features dataset safely.
    """
    try:
        if DATASET_PATH.exists():
            return pd.read_csv(DATASET_PATH)
    except Exception:
        pass
    return None


def format_number(val, is_currency=False):
    """
    Formats numbers cleanly as K, M, B.
    e.g. 1240000 -> 1.24M, 42800000000 -> $42.8B
    """
    if val is None or pd.isna(val):
        return "N/A"

    num = float(val)
    prefix = "$" if is_currency else ""

    if abs(num) >= 1_000_000_000:
        return f"{prefix}{num / 1_000_000_000:.2f}B"
    elif abs(num) >= 1_000_000:
        return f"{prefix}{num / 1_000_000:.2f}M"
    elif abs(num) >= 1_000:
        return f"{prefix}{num / 1_000:.1f}K"
    else:
        return f"{prefix}{num:.2f}"


def get_growing_companies_data(selected_company_name, selected_demand=0.0, selected_inputs=None):
    """
    Returns detailed company list and benchmark statistics for Growing Companies.
    """
    df = load_dataset()
    if df is None or df.empty:
        # Fallback dataset if file unavailable
        companies_data = [
            {"company": "NVIDIA", "predicted_wafers": 2800000.0, "revenue_usd_bn": 60.9, "rd_spend_usd_bn": 8.6, "capex_usd_bn": 1.2, "growth_pct": 24.1},
            {"company": "AMD", "predicted_wafers": 2100000.0, "revenue_usd_bn": 22.7, "rd_spend_usd_bn": 5.8, "capex_usd_bn": 0.9, "growth_pct": 19.4},
            {"company": "Qualcomm", "predicted_wafers": 1650000.0, "revenue_usd_bn": 35.8, "rd_spend_usd_bn": 8.8, "capex_usd_bn": 1.1, "growth_pct": 15.2},
            {"company": "Intel", "predicted_wafers": 1100000.0, "revenue_usd_bn": 54.2, "rd_spend_usd_bn": 16.0, "capex_usd_bn": 25.8, "growth_pct": 13.7},
        ]
    else:
        # Filter for latest record per company
        latest_df = df.sort_values("year", ascending=False).groupby("company").first().reset_index()

        companies_data = []
        for _, row in latest_df.iterrows():
            comp_name = str(row["company"])
            # Use monthly_wafer_capacity or revenue scaling if capacity is zero
            wafers = float(row.get("monthly_wafer_capacity", 0))
            if wafers == 0:
                wafers = float(row.get("revenue_usd_bn", 1.0)) * 25000.0

            growth = float(row.get("growth_potential", row.get("profit_margin", 15.0)))
            if growth == 0:
                growth = 15.0

            companies_data.append({
                "company": comp_name,
                "predicted_wafers": round(wafers, 2),
                "revenue_usd_bn": round(float(row.get("revenue_usd_bn", 0)), 2),
                "rd_spend_usd_bn": round(float(row.get("rd_spend_usd_bn", 0)), 2),
                "capex_usd_bn": round(float(row.get("capex_usd_bn", 0)), 2),
                "ai_shipments": round(float(row.get("total_ai_shipments", 0)), 2),
                "ai_revenue": round(float(row.get("total_ai_revenue_m", 0)), 2),
                "growth_pct": round(growth, 1),
            })

    # Add or update selected company in list
    sel_rev = safe_float(selected_inputs.get("revenue_usd_bn", 0) if selected_inputs else 0)
    sel_rd = safe_float(selected_inputs.get("rd_spend_usd_bn", 0) if selected_inputs else 0)
    sel_capex = safe_float(selected_inputs.get("capex_usd_bn", 0) if selected_inputs else 0)

    found = False
    for item in companies_data:
        if item["company"].lower() == selected_company_name.lower():
            item["predicted_wafers"] = selected_demand
            if sel_rev > 0:
                item["revenue_usd_bn"] = sel_rev
            if sel_rd > 0:
                item["rd_spend_usd_bn"] = sel_rd
            if sel_capex > 0:
                item["capex_usd_bn"] = sel_capex
            found = True
            break

    if not found:
        companies_data.append({
            "company": selected_company_name,
            "predicted_wafers": selected_demand,
            "revenue_usd_bn": sel_rev,
            "rd_spend_usd_bn": sel_rd,
            "capex_usd_bn": sel_capex,
            "ai_shipments": 0.0,
            "ai_revenue": 0.0,
            "growth_pct": 18.4,
        })

    # Sort companies by predicted_wafers descending
    companies_data.sort(key=lambda x: x["predicted_wafers"], reverse=True)

    # Assign rankings
    sel_rank = 1
    for idx, item in enumerate(companies_data, start=1):
        item["rank"] = f"#{idx}"
        if item["company"].lower() == selected_company_name.lower():
            sel_rank = idx

    df_comp = pd.DataFrame(companies_data)

    avg_demand = float(df_comp["predicted_wafers"].mean())
    avg_rev = float(df_comp["revenue_usd_bn"].mean())
    avg_rd = float(df_comp["rd_spend_usd_bn"].mean())
    avg_capex = float(df_comp["capex_usd_bn"].mean())
    avg_growth = float(df_comp["growth_pct"].mean())

    return {
        "companies": companies_data,
        "selected_rank": sel_rank,
        "total_companies": len(companies_data),
        "avg_demand": round(avg_demand, 2),
        "avg_revenue": round(avg_rev, 2),
        "avg_rd": round(avg_rd, 2),
        "avg_capex": round(avg_capex, 2),
        "avg_growth": round(avg_growth, 1),
    }


def get_toplevel_companies_data(startup_name, startup_demand=0.0, startup_inputs=None):
    """
    Returns benchmark dataset & rankings comparing startup to Top-Level Industry Leaders.
    """
    df = load_dataset()
    leaders = ["TSMC", "NVIDIA", "Intel", "AMD", "Qualcomm", "Broadcom", "Samsung"]

    companies_data = []

    if df is not None and not df.empty:
        latest_df = df.sort_values("year", ascending=False).groupby("company").first().reset_index()
        for _, row in latest_df.iterrows():
            comp_name = str(row["company"])
            if comp_name in leaders or row.get("revenue_usd_bn", 0) >= 15.0:
                wafers = float(row.get("monthly_wafer_capacity", 0))
                if wafers == 0:
                    wafers = float(row.get("revenue_usd_bn", 1.0)) * 25000.0

                companies_data.append({
                    "company": comp_name,
                    "predicted_wafers": round(wafers, 2),
                    "revenue_usd_bn": round(float(row.get("revenue_usd_bn", 0)), 2),
                    "rd_spend_usd_bn": round(float(row.get("rd_spend_usd_bn", 0)), 2),
                    "capex_usd_bn": round(float(row.get("capex_usd_bn", 0)), 2),
                    "ai_shipments": round(float(row.get("total_ai_shipments", 0)), 2),
                    "ai_revenue": round(float(row.get("total_ai_revenue_m", 0)), 2),
                    "growth_pct": round(float(row.get("growth_potential", 20.0)), 1),
                })

    if not companies_data:
        companies_data = [
            {"company": "TSMC", "predicted_wafers": 136143.0, "revenue_usd_bn": 113.25, "rd_spend_usd_bn": 9.06, "capex_usd_bn": 50.96, "ai_shipments": 2935334.0, "ai_revenue": 70687.7, "growth_pct": 60.0},
            {"company": "NVIDIA", "predicted_wafers": 120000.0, "revenue_usd_bn": 60.90, "rd_spend_usd_bn": 8.60, "capex_usd_bn": 1.20, "ai_shipments": 1800000.0, "ai_revenue": 45000.0, "growth_pct": 55.0},
            {"company": "AMD", "predicted_wafers": 85000.0, "revenue_usd_bn": 22.70, "rd_spend_usd_bn": 5.80, "capex_usd_bn": 0.90, "ai_shipments": 800000.0, "ai_revenue": 12000.0, "growth_pct": 35.0},
            {"company": "Intel", "predicted_wafers": 95000.0, "revenue_usd_bn": 54.20, "rd_spend_usd_bn": 16.00, "capex_usd_bn": 25.80, "ai_shipments": 600000.0, "ai_revenue": 8000.0, "growth_pct": 25.0},
        ]

    # Add startup to comparison
    st_rev = safe_float(startup_inputs.get("expected_revenue", 0) if startup_inputs else 0)
    st_rd = safe_float(startup_inputs.get("rd_budget", 0) if startup_inputs else 0)
    st_capex = safe_float(startup_inputs.get("capex", 0) if startup_inputs else 0)
    st_ship = safe_float(startup_inputs.get("expected_ai_shipments", startup_inputs.get("expected_shipments", 0)) if startup_inputs else 0) * 1_000_000.0
    st_airev = safe_float(startup_inputs.get("expected_ai_revenue", 0) if startup_inputs else 0) * 1_000.0

    companies_data.append({
        "company": startup_name,
        "predicted_wafers": startup_demand,
        "revenue_usd_bn": st_rev,
        "rd_spend_usd_bn": st_rd,
        "capex_usd_bn": st_capex,
        "ai_shipments": st_ship,
        "ai_revenue": st_airev,
        "growth_pct": 45.0,
    })

    companies_data.sort(key=lambda x: x["predicted_wafers"], reverse=True)

    st_rank = 1
    for idx, item in enumerate(companies_data, start=1):
        item["rank"] = f"#{idx}"
        if item["company"].lower() == startup_name.lower():
            st_rank = idx

    df_comp = pd.DataFrame(companies_data)

    return {
        "companies": companies_data,
        "selected_rank": st_rank,
        "total_companies": len(companies_data),
        "top_leader": companies_data[0],
        "avg_demand": round(float(df_comp["predicted_wafers"].mean()), 2),
        "avg_revenue": round(float(df_comp["revenue_usd_bn"].mean()), 2),
        "avg_rd": round(float(df_comp["rd_spend_usd_bn"].mean()), 2),
        "avg_capex": round(float(df_comp["capex_usd_bn"].mean()), 2),
        "avg_ai_shipments": round(float(df_comp["ai_shipments"].mean()), 2),
        "avg_ai_revenue": round(float(df_comp["ai_revenue"].mean()), 2),
    }


def safe_float(val, default=0.0):
    try:
        return float(val)
    except (TypeError, ValueError):
        return default
