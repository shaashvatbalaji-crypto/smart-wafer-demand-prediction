"""
delete_prediction.py

Delete Prediction Module
"""

from src.services.delete_service import (
    get_prediction,
    delete_prediction_service,
)


# ==========================================================
# Main
# ==========================================================

def main():

    print("=" * 70)
    print("DELETE PREDICTION")
    print("=" * 70)

    prediction_id = input("\nEnter Prediction ID : ").strip()

    if not prediction_id.isdigit():
        print("\n❌ Invalid Prediction ID.")
        return

    prediction_id = int(prediction_id)

    prediction = get_prediction(prediction_id)

    if prediction is None:
        print("\n❌ Prediction not found.")
        return

    print("\nPrediction Found")
    print("-" * 70)

    print(f"Prediction ID    : {prediction['id']}")
    print(f"Prediction Name  : {prediction['prediction_name']}")
    print(f"Company          : {prediction['company']}")
    print(f"Company ID       : {prediction['company_id']}")
    print(f"Prediction Type  : {prediction['prediction_type']}")
    print(f"Predicted Wafers : {prediction['predicted_wafers']:,.2f}")
    print(f"Confidence       : {prediction['confidence']}%")
    print(f"Prediction Time  : {prediction['prediction_time']}")

    print("-" * 70)

    confirm = input("\nDelete this prediction? (Y/N): ").strip().upper()

    if confirm != "Y":
        print("\nDeletion Cancelled.")
        return

    success, message = delete_prediction_service(prediction_id)

    if success:
        print(f"\n✅ {message}")
    else:
        print(f"\n❌ {message}")


# ==========================================================

if __name__ == "__main__":
    main()
