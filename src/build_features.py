"""
build_features.py

Builds the Feature Engineered Dataset

Run manually whenever the master dataset changes.

Output:
data/processed/feature_engineered_step2.csv
"""

import pandas as pd


# ==========================================================
# Load Dataset
# ==========================================================

print("=" * 70)
print("SMART WAFER DEMAND PREDICTION SYSTEM")
print("FEATURE ENGINEERING")
print("=" * 70)

df = pd.read_csv("data/processed/master_dataset_final.csv")

print("\n✓ Master Dataset Loaded")

print("\nShape :", df.shape)


# ==========================================================
# Handle Missing Values
# ==========================================================

print("\nHandling Missing Values...")

ai_columns = [
    "ai_chip_launches",
    "total_ai_shipments",
    "total_ai_revenue_m",
    "avg_memory_gb",
    "avg_fp16_tflops",
    "avg_tdp"
]

df[ai_columns] = df[ai_columns].fillna(0)

export_columns = [
    "export_control_events",
    "avg_severity_score",
    "us_actions",
    "china_actions",
    "netherlands_actions"
]

df[export_columns] = df[export_columns].fillna(0)

price_columns = [
    "avg_chip_price",
    "highest_chip_price",
    "lowest_chip_price"
]

for col in price_columns:
    df[col] = df[col].fillna(df[col].median())


# ==========================================================
# Feature Engineering
# ==========================================================

print("\nCreating Features...")

# ----------------------------------------------------------
# Basic Features
# ----------------------------------------------------------

df["fab_age"] = (
    df["year"] -
    df["fab_started_year"]
)

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

# ----------------------------------------------------------
# Advanced Features
# ----------------------------------------------------------

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

print("✓ Feature Engineering Completed")

print("\nFinal Shape :", df.shape)


# ==========================================================
# Save Dataset
# ==========================================================

output_file = "data/processed/feature_engineered_step2.csv"

df.to_csv(
    output_file,
    index=False
)

print("\n✓ Dataset Saved Successfully")

print(output_file)

print("\nDone.")
