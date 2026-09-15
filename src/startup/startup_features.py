import pandas as pd
from .startup_defaults import DEFAULTS


def build_startup_features(inputs):

    revenue = inputs["expected_revenue"]          # Billion USD
    capex = inputs["capex"]                       # Billion USD
    rd = inputs["rd_budget"]                      # Billion USD
    revenue_m = inputs["expected_ai_revenue"]     # Million USD
    shipments = inputs["expected_shipments"]

    launches = max(inputs["ai_chip_launches"], 1)

    # ===================================================
    # Derived Financial Metrics
    # ===================================================

    operating_margin_pct = 25.0

    operating_income = revenue * operating_margin_pct / 100

    rd_ratio = rd / max(revenue, 0.0001)

    capex_ratio = capex / max(revenue, 0.0001)

    operating_income_ratio = (
        operating_income / max(revenue, 0.0001)
    )

    profit_margin = operating_margin_pct

    # ===================================================
    # Derived AI Metrics
    # ===================================================

    ai_revenue_per_chip = (
        revenue_m / max(shipments, 1)
    )

    sales_per_launch = (
        revenue * 1_000_000_000 / launches
    )

    shipments_per_launch = (
        shipments / launches
    )

    # ===================================================
    # Sales Metrics
    # ===================================================

    worldwide_sales = revenue * 1_000_000_000

    average_monthly_sales = worldwide_sales / 12

    max_monthly_sales = worldwide_sales / 10

    # ===================================================
    # Final Feature Dictionary
    # ===================================================

    features = {

        "company": inputs["company"],
        "country_iso3": inputs["country"],
        "fab_type": inputs["fab_type"],
        "segment": inputs["segment"],

        "year": inputs["year"],
        "process_node_nm": inputs["process_node_nm"],

        "fab_age": 0,

        "revenue_usd_bn": revenue,
        "operating_margin_pct": operating_margin_pct,
        "rd_spend_usd_bn": rd,
        "capex_usd_bn": capex,

        "ai_chip_launches": launches,
        "total_ai_shipments": shipments,
        "total_ai_revenue_m": revenue_m,

        "avg_memory_gb": DEFAULTS["avg_memory_gb"],
        "avg_fp16_tflops": DEFAULTS["avg_fp16_tflops"],
        "avg_tdp": DEFAULTS["avg_tdp"],

        "avg_chip_price": DEFAULTS["avg_chip_price"],
        "highest_chip_price": DEFAULTS["highest_chip_price"],
        "lowest_chip_price": DEFAULTS["lowest_chip_price"],

        "export_control_events": DEFAULTS["export_control_events"],
        "avg_severity_score": DEFAULTS["avg_severity_score"],

        "worldwide_sales": worldwide_sales,
        "average_monthly_sales": average_monthly_sales,
        "max_monthly_sales": max_monthly_sales,

        # ===============================
        # Dynamic Financial Features
        # ===============================

        "rd_ratio": rd_ratio,
        "capex_ratio": capex_ratio,
        "operating_income_ratio": operating_income_ratio,

        "ai_revenue_per_chip": ai_revenue_per_chip,
        "sales_per_launch": sales_per_launch,
        "price_spread": (
            DEFAULTS["highest_chip_price"] -
            DEFAULTS["lowest_chip_price"]
        ),

        # ===============================
        # Advanced Features
        # ===============================

        "company_fab_age_ratio": 0,
        "shipments_per_launch": shipments_per_launch,
        "revenue_per_ai_launch": revenue_m / launches,

        "profit_margin": profit_margin,

        "performance_score": DEFAULTS["performance_score"],
        "performance_per_watt": DEFAULTS["performance_per_watt"],

        "price_index": DEFAULTS["price_index"],
        "price_volatility": DEFAULTS["price_volatility"],

        "export_risk_score": DEFAULTS["export_risk_score"],
        "geo_risk": DEFAULTS["geo_risk"],

        "innovation_score": DEFAULTS["innovation_score"],
        "investment_score": DEFAULTS["investment_score"],
        "ai_market_score": DEFAULTS["ai_market_score"],

        "sales_variation": 0,
        "growth_potential": min(
            100,
            50 + revenue * 2 + rd * 10
        )

    }

    return pd.DataFrame([features])
