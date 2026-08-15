"""
history.py

Prediction History
Displays all saved predictions of a company.
"""

from database.prediction_repository import get_predictions_by_company


# ==========================================================
# Prediction History
# ==========================================================

def main():

    print("=" * 70)
    print("PREDICTION HISTORY")
    print("=" * 70)

    company_id = input("Enter Company ID : ").strip().upper()

    history = get_predictions_by_company(company_id)

    print()

    if len(history) == 0:

        print("No prediction history found.")
        return

    print(f"Found {len(history)} prediction(s).\n")

    print("=" * 70)

    for prediction in history:

        print(f"Prediction ID      : {prediction['id']}")
        print(f"Prediction Name    : {prediction['prediction_name']}")
        print(f"Company            : {prediction['company']}")
        print(f"Prediction Type    : {prediction['prediction_type']}")
        print(f"Predicted Wafers   : {prediction['predicted_wafers']:,.2f}")
        print(f"Confidence         : {prediction['confidence']}%")
        print(f"Model Version      : {prediction['model_version']}")
        print(f"Prediction Time    : {prediction['prediction_time']}")

        print("-" * 70)


# ==========================================================

if __name__ == "__main__":
    main()