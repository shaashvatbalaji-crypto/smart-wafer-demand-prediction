import json

from database.prediction_repository import compare_predictions

print("=" * 70)
print("COMPARE PREDICTIONS")
print("=" * 70)

id1 = int(input("Prediction ID 1 : "))
id2 = int(input("Prediction ID 2 : "))

prediction1, prediction2 = compare_predictions(id1, id2)

if prediction1 is None or prediction2 is None:
    print("\nPrediction not found.")
    exit()

print("\nPrediction 1 :", prediction1["prediction_name"])
print("Prediction 2 :", prediction2["prediction_name"])

print("\nCompany")
print("-" * 70)
print(prediction1["company"])
print(prediction2["company"])

print("\nPredicted Wafers")
print("-" * 70)
print(f'{prediction1["predicted_wafers"]:,.2f}')
print(f'{prediction2["predicted_wafers"]:,.2f}')

difference = (
    prediction2["predicted_wafers"] -
    prediction1["predicted_wafers"]
)

print(f"\nDifference : {difference:,.2f} wafers/month")

print("\nConfidence")
print("-" * 70)
print(f'{prediction1["confidence"]}%')
print(f'{prediction2["confidence"]}%')

print("\nPrediction Time")
print("-" * 70)
print(prediction1["prediction_time"])
print(prediction2["prediction_time"])

print("\n" + "=" * 70)
print("INPUT COMPARISON")
print("=" * 70)

data1 = json.loads(prediction1["modified_data"])
data2 = json.loads(prediction2["modified_data"])

all_keys = sorted(set(data1.keys()) | set(data2.keys()))

for key in all_keys:

    value1 = data1.get(key, "N/A")
    value2 = data2.get(key, "N/A")

    if value1 != value2:

        print(f"\n{key}")
        print(f"  Prediction 1 : {value1}")
        print(f"  Prediction 2 : {value2}")

print("\n" + "=" * 70)
