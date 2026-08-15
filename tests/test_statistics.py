from database.statistics_repository import (
    get_company_statistics,
    get_latest_prediction,
    get_prediction_trend
)

print("=" * 70)
print("COMPANY DASHBOARD")
print("=" * 70)

company_id = input("Enter Company ID: ")

stats = get_company_statistics(company_id)

if not stats:
    print("\nCompany not found.")
    exit()

print("\nCompany Information")
print("-" * 70)

print(f"Company              : {stats['company']}")
print(f"Company ID           : {stats['company_id']}")

print("\nStatistics")
print("-" * 70)

print(f"Total Predictions    : {stats['total_predictions']}")
print(f"Average Prediction   : {stats['average_prediction']:,.2f}")
print(f"Highest Prediction   : {stats['highest_prediction']:,.2f}")
print(f"Lowest Prediction    : {stats['lowest_prediction']:,.2f}")
print(f"Average Confidence   : {stats['average_confidence']}%")

latest = get_latest_prediction(company_id)

print("\nLatest Prediction")
print("-" * 70)

print(f"Prediction Name      : {latest['prediction_name']}")
print(f"Predicted Wafers     : {latest['predicted_wafers']:,.2f}")
print(f"Confidence           : {latest['confidence']}%")
print(f"Time                 : {latest['prediction_time']}")

print("\nPrediction Timeline")
print("-" * 70)

trend = get_prediction_trend(company_id)

for row in trend:

    print(
        f"{row['prediction_time']} | "
        f"{row['prediction_name']:<20} | "
        f"{row['predicted_wafers']:>12,.2f} wafers | "
        f"{row['confidence']}%"
    )

print("=" * 70)