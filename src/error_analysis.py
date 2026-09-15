from startup.startup_predict import StartupPredictor

print("=" * 75)
print("        EXISTING SEMICONDUCTOR COMPANY WAFER DEMAND PREDICTION")
print("=" * 75)

# ==========================================================
# CHANGE THIS COMPANY TO TEST DIFFERENT COMPANIES
# ==========================================================

company = {
    "company": "GlobalFoundries",
    "country": "USA",
    "fab_type": "logic_mature",
    "segment": "foundry",
    "year": 2026,
    "process_node_nm": 12,

    "expected_revenue": 8,
    "rd_budget": 1.2,
    "capex": 2.5,

    "ai_chip_launches": 2,
    "expected_shipments": 1800000,
    "expected_ai_revenue": 900
}

# ==========================================================

predictor = StartupPredictor()

result = predictor.predict_details(company)

print("\nPrediction Successful!\n")

print(f"Company            : {company['company']}")
print(f"Country            : {company['country']}")
print(f"Fab Type           : {company['fab_type']}")
print(f"Segment            : {company['segment']}")
print(f"Year               : {company['year']}")
print(f"Technology Node    : {company['process_node_nm']} nm")

print()

print(f"Expected Revenue   : ${company['expected_revenue']} Billion")
print(f"R&D Budget         : ${company['rd_budget']} Billion")
print(f"CapEx              : ${company['capex']} Billion")

print()

print(f"AI Chip Launches   : {company['ai_chip_launches']}")
print(f"Expected Shipments : {company['expected_shipments']:,}")
print(f"AI Revenue         : ${company['expected_ai_revenue']} Million")

print("\n" + "-" * 75)

print(f"AI Model Prediction      : {result['ai_prediction']:,.0f} wafers/month")
print(f"Business Engine Estimate : {result['business_prediction']:,.0f} wafers/month")
print(f"Final Hybrid Prediction  : {result['final_prediction']:,.0f} wafers/month")

print("-" * 75)

print(f"Prediction Confidence    : {result['confidence']}%")

print("\nReasons Behind Prediction:")

for reason in result["explanation"]:
    print(f"✔ {reason}")

print("=" * 75)
