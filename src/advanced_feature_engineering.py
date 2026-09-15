# ==========================================================
# SMART WAFER DEMAND PREDICTION SYSTEM
# ADVANCED FEATURE ENGINEERING
# ==========================================================

import pandas as pd
import numpy as np

print("=" * 70)
print("SMART WAFER DEMAND PREDICTION SYSTEM")
print("ADVANCED FEATURE ENGINEERING")
print("=" * 70)

# ----------------------------------------------------------
# Load Dataset
# ----------------------------------------------------------

df = pd.read_csv(
    "data/processed/feature_engineered_step2.csv"
)

print("\nDataset Loaded Successfully!")
print("Shape :", df.shape)

# ==========================================================
# ADVANCED FEATURE ENGINEERING
# ==========================================================

print("\nCreating Advanced Features...")

# ----------------------------------------------------------
# 1. Company Age Ratio
# ----------------------------------------------------------

df["company_fab_age_ratio"] = (
    df["fab_age"] /
    (df["process_node_nm"] + 1)
)

# ----------------------------------------------------------
# 2. Shipments per AI Launch
# ----------------------------------------------------------

df["shipments_per_launch"] = (
    df["total_ai_shipments"] /
    (df["ai_chip_launches"] + 1)
)

# ----------------------------------------------------------
# 3. Revenue per AI Launch
# ----------------------------------------------------------

df["revenue_per_ai_launch"] = (
    df["total_ai_revenue_m"] /
    (df["ai_chip_launches"] + 1)
)

# ----------------------------------------------------------
# 4. Profit Margin
# ----------------------------------------------------------

df["profit_margin"] = (
    df["operating_income_usd_bn"] /
    (df["revenue_usd_bn"] + 1e-6)
)

# ----------------------------------------------------------
# 5. Performance Score
# ----------------------------------------------------------

df["performance_score"] = (
    df["avg_fp16_tflops"] *
    df["avg_memory_gb"]
)

# ----------------------------------------------------------
# 6. Performance per Watt
# ----------------------------------------------------------

df["performance_per_watt"] = (
    df["avg_fp16_tflops"] /
    (df["avg_tdp"] + 1)
)

# ----------------------------------------------------------
# 7. Price Index
# ----------------------------------------------------------

df["price_index"] = (
    df["avg_chip_price"] /
    (df["highest_chip_price"] + 1)
)

# ----------------------------------------------------------
# 8. Price Volatility
# ----------------------------------------------------------

df["price_volatility"] = (
    df["price_spread"] /
    (df["avg_chip_price"] + 1)
)

# ----------------------------------------------------------
# 9. Export Risk Score
# ----------------------------------------------------------

df["export_risk_score"] = (
    df["export_control_events"] *
    df["avg_severity_score"]
)

# ----------------------------------------------------------
# 10. Geographic Risk
# ----------------------------------------------------------

df["geo_risk"] = (
    df["us_actions"] +
    df["china_actions"] +
    df["netherlands_actions"]
)

# ----------------------------------------------------------
# 11. Innovation Score
# ----------------------------------------------------------

df["innovation_score"] = (
    df["rd_spend_usd_bn"] *
    (df["ai_chip_launches"] + 1)
)

# ----------------------------------------------------------
# 12. Investment Score
# ----------------------------------------------------------

df["investment_score"] = (
    df["capex_usd_bn"] +
    df["rd_spend_usd_bn"]
)

# ----------------------------------------------------------
# 13. AI Market Score
# ----------------------------------------------------------

df["ai_market_score"] = (
    df["total_ai_shipments"] *
    df["avg_chip_price"]
) / 1_000_000

# ----------------------------------------------------------
# 14. Sales Variation
# ----------------------------------------------------------

df["sales_variation"] = (
    df["max_monthly_sales"] -
    df["average_monthly_sales"]
)

# ----------------------------------------------------------
# 15. Growth Potential
# ----------------------------------------------------------

df["growth_potential"] = (
    df["rd_spend_usd_bn"] +
    df["capex_usd_bn"]
)

# ==========================================================
# Check Generated Features
# ==========================================================

print("\nAdvanced Features Created Successfully!")

advanced_features = [
    "company_fab_age_ratio",
    "shipments_per_launch",
    "revenue_per_ai_launch",
    "profit_margin",
    "performance_score",
    "performance_per_watt",
    "price_index",
    "price_volatility",
    "export_risk_score",
    "geo_risk",
    "innovation_score",
    "investment_score",
    "ai_market_score",
    "sales_variation",
    "growth_potential"
]

print(df[advanced_features].head())

# ==========================================================
# Save Dataset
# ==========================================================

output_path = "data/processed/advanced_features.csv"

df.to_csv(
    output_path,
    index=False
)

print("\nDataset Saved Successfully!")
print(output_path)

print("\nFinal Dataset Shape :", df.shape)

print("\nAdvanced Feature Engineering Completed!")
