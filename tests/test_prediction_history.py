from database.prediction_repository import get_predictions_by_company

print("=" * 60)
print("PREDICTION HISTORY TEST")
print("=" * 60)

company_id = input("Enter Company ID: ")

history = get_predictions_by_company(company_id)

if not history:

    print("\nNo predictions found.")

else:

    print(f"\nFound {len(history)} prediction(s).\n")

    for prediction in history:

        print("-" * 60)

        print("Prediction ID :", prediction["id"])
        print("Prediction    :", prediction["prediction_name"])
        print("Company       :", prediction["company"])
        print("Demand        :", prediction["predicted_wafers"])
        print("Confidence    :", prediction["confidence"])
        print("Time          :", prediction["prediction_time"])

print("=" * 60)
