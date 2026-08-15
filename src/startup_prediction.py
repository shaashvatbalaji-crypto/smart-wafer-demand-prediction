"""
startup_prediction.py

Startup Company Prediction
"""

from copy import deepcopy

from src.startup.startup_predict import StartupPredictor
from database.prediction_repository import save_prediction
from src.services.company_service import get_or_create_company


# ==========================================================
# Helper Functions
# ==========================================================

def input_float(label):
    while True:
        try:
            return float(input(f"{label}: "))
        except ValueError:
            print("❌ Please enter a valid number.")


def input_int(label):
    while True:
        try:
            return int(input(f"{label}: "))
        except ValueError:
            print("❌ Please enter a valid integer.")


# ==========================================================
# Main
# ==========================================================

def main():

    print("=" * 70)
    print("SMART WAFER DEMAND PREDICTION")
    print("STARTUP COMPANY ANALYSIS")
    print("=" * 70)

    startup = {}

    # ==========================================================
    # Basic Information
    # ==========================================================

    print("\nBasic Information")
    print("-" * 70)

    startup["company"] = input("Startup Name: ").strip()

    startup["country"] = input(
        "Country (IND/USA/TWN/KOR/CHN): "
    ).strip().upper()

    startup["fab_type"] = input(
        "Fab Type (logic_leading/logic_mature/memory_DRAM/memory_NAND): "
    ).strip()

    startup["segment"] = input(
        "Segment (foundry/idm_logic/idm_memory): "
    ).strip()

    # ==========================================================
    # Technology Information
    # ==========================================================

    print("\nTechnology Information")
    print("-" * 70)

    startup["year"] = input_int("Year")

    startup["process_node_nm"] = input_float(
        "Process Node (nm)"
    )

    # ==========================================================
    # Financial Information
    # ==========================================================

    print("\nFinancial Information")
    print("-" * 70)

    startup["expected_revenue"] = input_float(
        "Expected Revenue (USD Billion)"
    )

    startup["rd_budget"] = input_float(
        "R&D Budget (USD Billion)"
    )

    startup["capex"] = input_float(
        "CapEx (USD Billion)"
    )

    # ==========================================================
    # AI Information
    # ==========================================================

    print("\nAI Business Information")
    print("-" * 70)

    startup["ai_chip_launches"] = input_int(
        "AI Chip Launches"
    )

    startup["expected_shipments"] = input_int(
        "Expected AI Shipments"
    )

    startup["expected_ai_revenue"] = input_float(
        "Expected AI Revenue (Million USD)"
    )

    # ==========================================================
    # Keep Original Copy
    # ==========================================================

    original_startup = deepcopy(startup)

    # ==========================================================
    # Company Registration
    # ==========================================================

    print("\nChecking Company Database...")

    company = get_or_create_company(startup)

    company_id = company["company_id"]

    print(f"\nCompany ID : {company_id}")

    # ==========================================================
    # AI Prediction
    # ==========================================================

    print("\nRunning Hybrid AI Prediction...\n")

    predictor = StartupPredictor()

    result = predictor.predict_details(startup)

    # ==========================================================
    # Results
    # ==========================================================

    print("=" * 70)
    print("PREDICTION RESULT")
    print("=" * 70)

    print(f"Startup                : {startup['company']}")
    print(f"Company ID             : {company_id}")
    print(f"AI Prediction          : {result['ai_prediction']:,.0f}")
    print(f"Business Prediction    : {result['business_prediction']:,.0f}")
    print(f"Final Prediction       : {result['final_prediction']:,.0f} wafers/month")
    print(f"Confidence             : {result['confidence']}%")
    print(f"Startup Stage          : {result['startup_stage']}")
    print(f"Investment Rating      : {result['investment_rating']}")

    print("=" * 70)

    # ==========================================================
    # Explanation
    # ==========================================================

    print("\nAI Explanation")
    print("-" * 70)
    print(result["explanation"])

    # ==========================================================
    # Recommendations
    # ==========================================================

    print("\nRecommendations")
    print("-" * 70)

    for rec in result["recommendations"]:
        print(f"• {rec}")

    # ==========================================================
    # Save Prediction
    # ==========================================================

    prediction_name = input("\nEnter Prediction Name: ").strip()

    try:

        save_prediction(

            prediction_name=prediction_name,

            company_id=company_id,

            company=startup["company"],

            prediction_type="Startup",

            original_data=original_startup,

            modified_data=startup,

            predicted_wafers=result["final_prediction"],

            confidence=result["confidence"],

            model_version="Hybrid_v1"

        )

        print("\n✅ Prediction History Saved Successfully!")

    except Exception as e:

        print("\n❌ Failed to save prediction.")
        print(e)

    input("\nPress Enter to return to Main Menu...")


# ==========================================================

if __name__ == "__main__":
    main()