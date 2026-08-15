"""
search_company.py

Search Company Module
"""

from src.services.search_service import (
    search,
    company_details
)


# ==========================================================
# Display Company Details
# ==========================================================

def display_company(info):

    company = info["company"]
    latest = info["latest_prediction"]
    prediction_count = info["prediction_count"]

    print("\n" + "=" * 70)
    print("COMPANY DETAILS")
    print("=" * 70)

    print(f"Company ID        : {company['company_id']}")
    print(f"Company Name      : {company['company_name']}")
    print(f"Company Type      : {company['company_type']}")
    print(f"Country           : {company['country']}")
    print(f"Fab Type          : {company['fab_type']}")
    print(f"Segment           : {company['segment']}")

    print("-" * 70)

    print(f"Prediction Count  : {prediction_count}")

    if latest:

        print("\nLATEST PREDICTION")
        print("-" * 70)

        print(f"Prediction Name   : {latest['prediction_name']}")
        print(f"Prediction Type   : {latest['prediction_type']}")
        print(f"Predicted Wafers  : {latest['predicted_wafers']:,.2f}")
        print(f"Confidence        : {latest['confidence']}%")
        print(f"Model Version     : {latest['model_version']}")
        print(f"Prediction Time   : {latest['prediction_time']}")

    else:

        print("\nNo prediction history available.")

    print("=" * 70)


# ==========================================================
# Main
# ==========================================================

def main():

    print("=" * 70)
    print("SEARCH COMPANY")
    print("=" * 70)

    keyword = input("\nEnter Company Name or Company ID : ").strip()

    results = search(keyword)

    if len(results) == 0:

        print("\n❌ No company found.")

        return

    # ------------------------------------------------------
    # Only one company found
    # ------------------------------------------------------

    if len(results) == 1:

        company_id = results[0]["company_id"]

    # ------------------------------------------------------
    # Multiple companies found
    # ------------------------------------------------------

    else:

        print(f"\nFound {len(results)} companies.\n")

        for index, company in enumerate(results, start=1):

            print(
                f"{index}. "
                f"{company['company_name']} "
                f"({company['company_id']})"
            )

        while True:

            try:

                choice = int(
                    input("\nSelect Company Number : ")
                )

                if 1 <= choice <= len(results):

                    company_id = results[choice - 1]["company_id"]

                    break

                else:

                    print("Invalid selection.")

            except ValueError:

                print("Please enter a valid number.")

    # ------------------------------------------------------
    # Fetch Complete Details
    # ------------------------------------------------------

    info = company_details(company_id)

    if info is None:

        print("\n❌ Unable to retrieve company details.")

        return

    display_company(info)


# ==========================================================

if __name__ == "__main__":

    main()