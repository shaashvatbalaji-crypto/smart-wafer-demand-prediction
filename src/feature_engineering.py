"""
feature_engineering.py

Reusable Feature Engineering
Used by the AI Prediction Engine
"""

import pandas as pd


def engineer_features(company):

    df = pd.DataFrame([company])

    # ------------------------------------------------------
    # Ensure fab_age exists
    # ------------------------------------------------------

    if "fab_age" not in df.columns:

        if "fab_started_year" in df.columns:

            df["fab_age"] = (
                df["year"] -
                df["fab_started_year"]
            )

        else:

            raise ValueError(
                "Either 'fab_age' or 'fab_started_year' must be provided."
            )

    # ------------------------------------------------------
    # Basic Features
    # ------------------------------------------------------

    df["rd_ratio"] = (
        df["rd_spend_usd_bn"] /
        (df["revenue_usd_bn"] + 1e-6)
    )

    df["capex_ratio"] = (
        df["capex_usd_bn"] /
        (df["revenue_usd_bn"] + 1e-6)
    )

    df["operating_income_ratio"] = (
        df["operating_margin_pct"] / 100
    )

    df["ai_revenue_per_chip"] = (
        df["total_ai_revenue_m"] /
        (df["total_ai_shipments"] + 1)
    )

    df["sales_per_launch"] = (
        df["worldwide_sales"] /
        (df["ai_chip_launches"] + 1)
    )

    df["price_spread"] = (
        df["highest_chip_price"] -
        df["lowest_chip_price"]
    )

    # ------------------------------------------------------
    # Advanced Features
    # ------------------------------------------------------

    df["company_fab_age_ratio"] = (
        df["fab_age"] /
        (df["year"] + 1)
    )

    df["shipments_per_launch"] = (
        df["total_ai_shipments"] /
        (df["ai_chip_launches"] + 1)
    )

    df["revenue_per_ai_launch"] = (
        df["total_ai_revenue_m"] /
        (df["ai_chip_launches"] + 1)
    )

    df["profit_margin"] = (
        df["operating_margin_pct"]
    )

    df["performance_score"] = (
        df["avg_fp16_tflops"] *
        df["avg_memory_gb"]
    )

    df["performance_per_watt"] = (
        df["avg_fp16_tflops"] /
        (df["avg_tdp"] + 1)
    )

    df["price_index"] = (
        df["avg_chip_price"] /
        (df["highest_chip_price"] + 1)
    )

    df["price_volatility"] = (
        df["price_spread"] /
        (df["avg_chip_price"] + 1)
    )

    df["export_risk_score"] = (
        df["export_control_events"] *
        df["avg_severity_score"]
    )

    df["geo_risk"] = (
        df["export_control_events"] +
        df["avg_severity_score"]
    )

    df["innovation_score"] = (
        df["rd_ratio"] *
        df["ai_chip_launches"] *
        100
    )

    df["investment_score"] = (
        df["capex_ratio"] *
        df["operating_margin_pct"]
    )

    df["ai_market_score"] = (
        df["total_ai_shipments"] *
        df["avg_fp16_tflops"] /
        1_000_000
    )

    df["sales_variation"] = (
        df["max_monthly_sales"] -
        df["average_monthly_sales"]
    )

    df["growth_potential"] = (
        df["rd_ratio"] *
        df["capex_ratio"] *
        100
    )

    return df