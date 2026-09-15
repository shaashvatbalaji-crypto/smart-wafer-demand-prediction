"""
compare_predictions.py

CLI for comparing two saved predictions.
"""

import json

from database.prediction_repository import compare_predictions


def main():

    print("=" * 70)
    print("COMPARE PREDICTIONS")
    print("=" * 70)

    try:
        id1 = int(input("Prediction ID 1 : "))
        id2 = int(input("Prediction ID 2 : "))
    except ValueError:
        print("\n❌ Invalid Prediction ID.")
        input("\nPress Enter...")
        return

    p1, p2 = compare_predictions(id1, id2)

    if p1 is None or p2 is None:
        print("\n❌ One or both Prediction IDs do not exist.")
        input("\nPress Enter...")
        return

    print("\nPrediction 1 :", p1["prediction_name"])
    print("Prediction 2 :", p2["prediction_name"])

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    print(f"Company 1        : {p1['company']}")
    print(f"Company 2        : {p2['company']}")

    print()

    print(f"Prediction 1     : {p1['predicted_wafers']:,.2f}")
    print(f"Prediction 2     : {p2['predicted_wafers']:,.2f}")

    difference = (
        p2["predicted_wafers"] -
        p1["predicted_wafers"]
    )

    print(f"\nDifference       : {difference:,.2f} wafers/month")

    print(f"\nConfidence 1     : {p1['confidence']}%")
    print(f"Confidence 2     : {p2['confidence']}%")

    print("\nPrediction Time")

    print("1 :", p1["prediction_time"])
    print("2 :", p2["prediction_time"])

    print("\n" + "=" * 70)
    print("INPUT DIFFERENCES")
    print("=" * 70)

    data1 = json.loads(p1["modified_data"])
    data2 = json.loads(p2["modified_data"])

    keys = sorted(
        set(data1.keys()).union(data2.keys())
    )

    for key in keys:

        value1 = data1.get(key, "N/A")
        value2 = data2.get(key, "N/A")

        if value1 != value2:

            print(f"\n{key}")
            print(f"  Prediction 1 : {value1}")
            print(f"  Prediction 2 : {value2}")

    input("\nPress Enter to Continue...")


if __name__ == "__main__":
    main()
