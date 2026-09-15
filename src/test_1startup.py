from startup.startup_predict import StartupPredictor

# ==========================================================
# Initialize Predictor
# ==========================================================

predictor = StartupPredictor()

# ==========================================================
# Sample Startup Inputs
# ==========================================================

startup = {

    "company": "MyAI Startup",

    "country": "IND",

    "fab_type": "logic_leading",

    "segment": "foundry",

    "year": 2027,

    "process_node_nm": 3,

    "expected_revenue": 2.5,      # USD Billion

    "rd_budget": 0.8,             # USD Billion

    "capex": 1.5,                 # USD Billion

    "ai_chip_launches": 2,

    "expected_shipments": 500000,

    "expected_ai_revenue": 800    # Million USD
}

# ==========================================================
# Predict
# ==========================================================

result = predictor.predict_details(startup)

# ==========================================================
# Display Inputs
# ==========================================================

print("=" * 65)
print("           SMART STARTUP WAFER DEMAND PREDICTION")
print("=" * 65)

print(f"Startup Name      : {startup['company']}")
print(f"Country           : {startup['country']}")
print(f"Fab Type          : {startup['fab_type']}")
print(f"Segment           : {startup['segment']}")
print(f"Year              : {startup['year']}")
print(f"Process Node      : {startup['process_node_nm']} nm")

print()

print(f"Expected Revenue  : ${startup['expected_revenue']} Billion")
print(f"R&D Budget        : ${startup['rd_budget']} Billion")
print(f"CapEx             : ${startup['capex']} Billion")

print()

print(f"AI Chip Launches  : {startup['ai_chip_launches']}")
print(f"AI Shipments      : {startup['expected_shipments']:,}")
print(f"AI Revenue        : ${startup['expected_ai_revenue']} Million")

print("-" * 65)

# ==========================================================
# Display Predictions
# ==========================================================

print(f"AI Model Prediction        : {result['ai_prediction']:,.0f} wafers/month")

print(f"Business Engine Estimate   : {result['business_prediction']:,.0f} wafers/month")

print("-" * 65)

print(f"FINAL HYBRID PREDICTION    : {result['final_prediction']:,.0f} wafers/month")

print("=" * 65)
