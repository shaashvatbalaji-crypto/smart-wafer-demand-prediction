"""
company_prediction.py

Existing Company Prediction
"""

from copy import deepcopy

from src.dataset_repository import get_company
from src.predictor import predict_company

from database.company_repository import find_company_by_name
from database.prediction_repository import save_prediction


# ==========================================================
# Modify Float Value
# ==========================================================

def modify_float(data, key, label):

    print(f"\nCurrent {label}: {data[key]}")

    choice = input(f"Modify {label}? (y/n): ").strip().lower()

    if choice == "y":

        while True:

            try:

                data[key] = float(input(f"Enter new {label}: "))
                break

            except ValueError:

                print("Please enter a valid number.")


# ==========================================================
# Modify Integer Value
# ==========================================================

def modify_int(data, key, label):

    print(f"\nCurrent {label}: {data[key]}")

    choice = input(f"Modify {label}? (y/n): ").strip().lower()

    if choice == "y":

        while True:

            try:

                data[key] = int(input(f"Enter new {label}: "))
                break

            except ValueError:

                print("Please enter a valid integer.")


# ==========================================================
# Existing Company Prediction
# ==========================================================

def main():

    print("=" * 70)
    print("SMART WAFER DEMAND PREDICTION")
    print("EXISTING COMPANY ANALYSIS")
    print("=" * 70)

    company_name = input("\nEnter Company Name : ").strip()

    # ------------------------------------------------------
    # Load Company Dataset
    # ------------------------------------------------------

    company = get_company(company_name)

    if company is None:

        print("\n❌ Company not found in dataset.")
        return

    # ------------------------------------------------------
    # Find Company ID from Database
    # ------------------------------------------------------

    company_db = find_company_by_name(company["company"])

    if company_db is None:

        print("\n❌ Company not found in Company Database.")
        print("Please register this company first.")
        return

    company_id = company_db["company_id"]

    # ------------------------------------------------------
    # Backup Original Inputs
    # ------------------------------------------------------

    original_company = deepcopy(company)

    # ------------------------------------------------------
    # Display Current Values
    # ------------------------------------------------------

    print("\n✅ Company Found")
    print("-" * 70)

    print(f"Company ID         : {company_id}")
    print(f"Company            : {company['company']}")
    print(f"Country            : {company['country_iso3']}")
    print(f"Process Node       : {company['process_node_nm']} nm")
    print(f"Revenue            : {company['revenue_usd_bn']} B$")
    print(f"R&D Budget         : {company['rd_spend_usd_bn']} B$")
    print(f"CapEx              : {company['capex_usd_bn']} B$")
    print(f"AI Chip Launches   : {company['ai_chip_launches']}")
    print(f"Worldwide Sales    : {company['worldwide_sales']}")

    # ------------------------------------------------------
    # Modify Inputs
    # ------------------------------------------------------

    print("\nModify Inputs")
    print("-" * 70)

    modify_float(company, "revenue_usd_bn", "Revenue")
    modify_float(company, "rd_spend_usd_bn", "R&D Budget")
    modify_float(company, "capex_usd_bn", "CapEx")

    modify_int(company, "process_node_nm", "Process Node")
    modify_int(company, "ai_chip_launches", "AI Chip Launches")

    # ------------------------------------------------------
    # AI Prediction
    # ------------------------------------------------------

    print("\nRunning AI Prediction...\n")

    prediction = predict_company(company)

    # ------------------------------------------------------
    # Results
    # ------------------------------------------------------

    print("=" * 70)
    print("PREDICTION RESULT")
    print("=" * 70)

    print(f"Company            : {company['company']}")
    print(f"Company ID         : {company_id}")
    print(f"Predicted Demand   : {prediction:,.2f} wafers/month")
    print(f"Confidence         : 95%")
    print(f"Model              : CatBoost_v1")

    print("=" * 70)

    # ------------------------------------------------------
    # Save Prediction
    # ------------------------------------------------------

    prediction_name = input("\nEnter Prediction Name : ").strip()

    try:

        save_prediction(

            prediction_name=prediction_name,

            company_id=company_id,

            company=company["company"],

            prediction_type="Existing Company",

            original_data=original_company,

            modified_data=company,

            predicted_wafers=prediction,

            confidence=95.0,

            model_version="CatBoost_v1"

        )

        print("\n✅ Prediction History Saved Successfully!")

    except Exception as e:

        print("\n❌ Failed to save prediction.")
        print(e)


# ==========================================================

if __name__ == "__main__":
    main()
