# ==========================================================
# SMART WAFER DEMAND PREDICTION SYSTEM
# Prediction Script
# ==========================================================

import joblib
import pandas as pd

# ==========================================================
# Load Saved Model
# ==========================================================

print("Loading Saved Model...")

model = joblib.load("models/catboost_model.pkl")
preprocessor = joblib.load("models/preprocessor.pkl")

print("Model Loaded Successfully!")

# ==========================================================
# Example Input
# Replace these values with user input later
# ==========================================================

new_data = pd.DataFrame({

    "company": ["TSMC"],
    "country_iso3": ["TWN"],
    "fab_type": ["logic_leading"],
    "segment": ["foundry"],

    "year": [2027],
    "process_node_nm": [2],
    "fab_age": [40],

    "revenue_usd_bn": [130],
    "operating_margin_pct": [46],
    "rd_spend_usd_bn": [24],
    "capex_usd_bn": [45],

    "ai_chip_launches": [6],
    "total_ai_shipments": [25000000],
    "total_ai_revenue_m": [45000],

    "avg_memory_gb": [32],
    "avg_fp16_tflops": [1500],
    "avg_tdp": [500],

    "avg_chip_price": [25000],
    "highest_chip_price": [42000],
    "lowest_chip_price": [12000],

    "export_control_events": [2],
    "avg_severity_score": [0.40],

    "worldwide_sales": [900000000],
    "average_monthly_sales": [75000000],
    "max_monthly_sales": [100000000],

    "rd_ratio": [0.18],
    "capex_ratio": [0.34],
    "operating_income_ratio": [0.42],

    "ai_revenue_per_chip": [1800],
    "sales_per_launch": [150000000],

    "price_spread": [30000],

    "company_fab_age_ratio": [40 / 2027],
    "shipments_per_launch": [25000000 / 6],
    "revenue_per_ai_launch": [45000 / 6],

    "profit_margin": [42],

    "performance_score": [92],
    "performance_per_watt": [3.0],

    "price_index": [1.15],
    "price_volatility": [0.18],

    "export_risk_score": [0.25],
    "geo_risk": [0.30],

    "innovation_score": [90],
    "investment_score": [91],
    "ai_market_score": [95],

    "sales_variation": [12000000],
    "growth_potential": [65]

})

# ==========================================================
# Preprocess Input
# ==========================================================

processed_data = preprocessor.transform(new_data)

# ==========================================================
# Predict
# ==========================================================

prediction = model.predict(processed_data)

# ==========================================================
# Display Result
# ==========================================================

print("\n======================================")
print(" SMART WAFER DEMAND PREDICTION ")
print("======================================")

print(f"Company : {new_data.loc[0,'company']}")
print(f"Year    : {new_data.loc[0,'year']}")

print("\nPredicted Monthly Wafer Capacity")

print(f"{prediction[0]:,.0f} wafers/month")

print("======================================")
