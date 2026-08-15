from startup.startup_predict import StartupPredictor
from startup.startup_classifier import (
    classify_startup,
    investment_rating
)

predictor = StartupPredictor()

# ============================================================
# Test Startup Data
# ============================================================

startups = [

    {
        "company": "TinyAI Labs",
        "country": "IND",
        "fab_type": "logic_mature",
        "segment": "foundry",
        "year": 2028,
        "process_node_nm": 28,

        "expected_revenue": 0.01,
        "rd_budget": 0.005,
        "capex": 0.01,

        "ai_chip_launches": 1,
        "expected_shipments": 1000,
        "expected_ai_revenue": 2
    },

    {
        "company": "VisionAI",
        "country": "IND",
        "fab_type": "logic_mature",
        "segment": "foundry",
        "year": 2028,
        "process_node_nm": 14,

        "expected_revenue": 0.10,
        "rd_budget": 0.02,
        "capex": 0.05,

        "ai_chip_launches": 2,
        "expected_shipments": 10000,
        "expected_ai_revenue": 20
    },

    {
        "company": "NextChip",
        "country": "USA",
        "fab_type": "logic_leading",
        "segment": "fabless",
        "year": 2028,
        "process_node_nm": 7,

        "expected_revenue": 0.50,
        "rd_budget": 0.15,
        "capex": 0.30,

        "ai_chip_launches": 4,
        "expected_shipments": 100000,
        "expected_ai_revenue": 150
    },

    {
        "company": "Quantum Silicon",
        "country": "USA",
        "fab_type": "logic_leading",
        "segment": "fabless",
        "year": 2028,
        "process_node_nm": 5,

        "expected_revenue": 2.0,
        "rd_budget": 0.50,
        "capex": 1.00,

        "ai_chip_launches": 8,
        "expected_shipments": 1000000,
        "expected_ai_revenue": 1200
    },

    {
        "company": "FutureAI Semiconductor",
        "country": "TWN",
        "fab_type": "logic_leading",
        "segment": "foundry",
        "year": 2028,
        "process_node_nm": 3,

        "expected_revenue": 5.0,
        "rd_budget": 1.50,
        "capex": 3.00,

        "ai_chip_launches": 12,
        "expected_shipments": 5000000,
        "expected_ai_revenue": 5000
    }

]

# ============================================================
# Run Prediction
# ============================================================

print("=" * 90)
print("          STARTUP WAFER DEMAND PREDICTION SYSTEM")
print("=" * 90)

for startup in startups:

    result = predictor.predict_details(startup)

    stage = classify_startup(startup)
    rating = investment_rating(startup)

    print("\n")
    print("=" * 90)
    print("Prediction Successful!")
    print("=" * 90)

    print(f"Startup Name       : {startup['company']}")
    print(f"Country            : {startup['country']}")
    print(f"Fab Type           : {startup['fab_type']}")
    print(f"Segment            : {startup['segment']}")
    print(f"Year               : {startup['year']}")
    print(f"Technology Node    : {startup['process_node_nm']} nm")

    print()

    print(f"Expected Revenue   : ${startup['expected_revenue']} Billion")
    print(f"R&D Budget         : ${startup['rd_budget']} Billion")
    print(f"CapEx              : ${startup['capex']} Billion")

    print()

    print(f"AI Chip Launches   : {startup['ai_chip_launches']}")
    print(f"Expected Shipments : {startup['expected_shipments']:,}")
    print(f"AI Revenue         : ${startup['expected_ai_revenue']} Million")

    print("\n" + "-" * 70)

    print(f"AI Model Prediction      : {result['ai_prediction']:,.0f} wafers/month")
    print(f"Business Engine Estimate : {result['business_prediction']:,.0f} wafers/month")
    print(f"Final Hybrid Prediction  : {result['final_prediction']:,.0f} wafers/month")

    print("-" * 70)

    print(f"Prediction Confidence    : {result['confidence']}%")
    print(f"Startup Stage            : {stage}")
    print(f"Investment Rating        : {rating}")

    print("\nReasons Behind Prediction:")

    for reason in result["explanation"]:
        print(f"✔ {reason}")

    print("\nRecommendations:")

    for rec in result["recommendations"]:
        print(f"➜ {rec}")

    print("=" * 90)