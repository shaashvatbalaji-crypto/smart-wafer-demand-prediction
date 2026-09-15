# ==========================================================
# Smart Wafer Demand Prediction System
# Master Dataset Creation
# ==========================================================

import pandas as pd

print("=" * 70)
print("SMART WAFER DEMAND PREDICTION SYSTEM")
print("MASTER DATASET CREATION")
print("=" * 70)

# ----------------------------------------------------------
# STEP 1 : Load all cleaned datasets
# ----------------------------------------------------------

fab = pd.read_csv("data/cleaned/fab_capacity_cleaned.csv")

financials = pd.read_csv(
    "data/cleaned/chip_companies_financials_cleaned.csv"
)

ai_market = pd.read_csv(
    "data/cleaned/ai_chip_market_cleaned.csv"
)

prices = pd.read_csv(
    "data/cleaned/chip_prices_cleaned.csv"
)

export_controls = pd.read_csv(
    "data/cleaned/export_controls_cleaned.csv"
)

wsts = pd.read_csv(
    "data/cleaned/wsts_monthly_cleaned.csv"
)

print("\nAll datasets loaded successfully!")


# ==========================================================
# STEP 2 : Merge Fab Capacity with Company Financials
# ==========================================================

# ==========================================================
# Standardize Company Names
# ==========================================================

fab["company"] = fab["company"].replace({
    "Samsung": "Samsung Foundry",
    "NXP": "NXP Semiconductors",
    "YMTC": "Yangtze Memory (YMTC)",
    "CXMT": "ChangXin Memory (CXMT)"
})

print("\nMerging Fab Capacity with Company Financials...")

master = pd.merge(
    fab,
    financials,
    left_on=["company", "year"],
    right_on=["company_name", "year"],
    how="left"
)

print("Merge Completed!")

print("\nMaster Dataset Shape:")
print(master.shape)

print("\nColumns:")
print(master.columns.tolist())

print("\nMissing Values After Merge:")
print(master.isnull().sum())

print("\nFirst 5 Rows:")
print(master.head())

# Save intermediate dataset
master.to_csv(
    "data/processed/master_dataset_step1.csv",
    index=False
)

print("\nSaved Successfully!")
print("data/processed/master_dataset_step1.csv")

print("\nCompanies with missing financial data:")

missing = master[master["company_name"].isna()]

print(missing["company"].unique())

print("\nCompanies in Financial Dataset:\n")
print(sorted(financials["company_name"].unique()))

# Remove duplicate columns
master = master.drop(columns=["company_name", "country_iso3_y"])

# Rename remaining columns
master = master.rename(columns={
    "country_iso3_x": "country_iso3"
})


# ==========================================================
# STEP 3 : Create AI Market Yearly Summary
# ==========================================================

print("\nCreating AI Market Yearly Summary...")

ai_summary = ai_market.groupby("year").agg(
    ai_chip_launches=("chip_name", "count"),
    total_ai_shipments=("estimated_shipments_units", "sum"),
    total_ai_revenue_m=("estimated_revenue_usd_m", "sum"),
    avg_memory_gb=("memory_gb", "mean"),
    avg_fp16_tflops=("fp16_tflops", "mean"),
    avg_tdp=("tdp_watts", "mean")
).reset_index()

print("\nAI Summary Created!")

print(ai_summary.head())


# ==========================================================
# STEP 4 : Merge AI Summary with Master Dataset
# ==========================================================

print("\nMerging AI Market with Master Dataset...")

master = pd.merge(
    master,
    ai_summary,
    on="year",
    how="left"
)

print("Merge Completed!")

print("\nMaster Dataset Shape:")
print(master.shape)

print("\nMissing Values:")
print(master.isnull().sum())

print("\nFirst 5 Rows:")
print(master.head())

master.to_csv(
    "data/processed/master_dataset_step2.csv",
    index=False
)

print("\nSaved Successfully!")
print("data/processed/master_dataset_step2.csv")

print("\nCreating Yearly Chip Price Summary...")

price_summary = (
    prices
    .groupby("year")
    .agg(
        avg_chip_price=("price", "mean"),
        highest_chip_price=("price", "max"),
        lowest_chip_price=("price", "min")
    )
    .reset_index()
)

print("\nPrice Summary Created!")
print(price_summary.head())

print("\nMerging Chip Prices with Master Dataset...")

master = master.merge(
    price_summary,
    on="year",
    how="left"
)

print("Merge Completed!")

print("\nMaster Dataset Shape:")
print(master.shape)

print("\nMissing Values:")
print(master.isnull().sum())

print("\nFirst 5 Rows:")
print(master.head())

master.to_csv(
    "data/processed/master_dataset_step3.csv",
    index=False
)

print("\nSaved Successfully!")
print("data/processed/master_dataset_step3.csv")
print("\nCreating Export Control Yearly Summary...")

export_summary = (
    export_controls
    .groupby("year")
    .agg(
        export_control_events=("control_id", "count"),
        avg_severity_score=("severity_score", "mean"),
        us_actions=("is_us_action", "sum"),
        china_actions=("is_china_action", "sum"),
        netherlands_actions=("is_netherlands_action", "sum")
    )
    .reset_index()
)

print("\nExport Control Summary Created!")
print(export_summary.head())

print("\nMerging Export Controls with Master Dataset...")

master = master.merge(
    export_summary,
    on="year",
    how="left"
)

print("Merge Completed!")

print("\nMaster Dataset Shape:")
print(master.shape)

print("\nMissing Values:")
print(master.isnull().sum())

print("\nFirst 5 Rows:")
print(master.head())


master.to_csv(
    "data/processed/master_dataset_step4.csv",
    index=False
)

print("\nSaved Successfully!")
print("data/processed/master_dataset_step4.csv")

print("\nCreating WSTS Yearly Summary...")

wsts_summary = (
    wsts
    .groupby("Year")
    .agg(
        worldwide_sales=("Sales_USD_1000", "sum"),
        average_monthly_sales=("Sales_USD_1000", "mean"),
        max_monthly_sales=("Sales_USD_1000", "max")
    )
    .reset_index()
)

wsts_summary.rename(columns={"Year": "year"}, inplace=True)

print("\nWSTS Summary Created!")
print(wsts_summary.head())

print("\nMerging WSTS with Master Dataset...")

master = pd.merge(
    master,
    wsts_summary,
    on="year",
    how="left"
)

print("Merge Completed!")


print("\nMaster Dataset Shape:")
print(master.shape)

print("\nMissing Values:")
print(master.isnull().sum())

print("\nFirst 5 Rows:")
print(master.head())


master.to_csv(
    "data/processed/master_dataset_final.csv",
    index=False
)

print("\nSaved Successfully!")
print("data/processed/master_dataset_final.csv")
