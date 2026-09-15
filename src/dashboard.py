"""
dashboard.py

Company Dashboard
Displays company statistics and prediction trends.
"""

from database.statistics_repository import (
    get_company_statistics,
    get_latest_prediction,
    get_prediction_trend,
)


# ==========================================================
# Dashboard
# ==========================================================

def main():

    print("=" * 70)
    print("COMPANY DASHBOARD")
    print("=" * 70)

    company_id = input("Enter Company ID : ").strip().upper()

    print()

    # ------------------------------------------------------
    # Statistics
    # ------------------------------------------------------

    statistics = get_company_statistics(company_id)

    if statistics is None:

        print("No prediction history found.")
        return

    latest = get_latest_prediction(company_id)

    trend = get_prediction_trend(company_id)

    print("=" * 70)
    print("COMPANY INFORMATION")
    print("=" * 70)

    print(f"Company ID          : {statistics['company_id']}")
    print(f"Company Name        : {statistics['company']}")

    print()

    print("=" * 70)
    print("PREDICTION STATISTICS")
    print("=" * 70)

    print(f"Total Predictions   : {statistics['total_predictions']}")
    print(f"Average Prediction  : {statistics['average_prediction']:,.2f}")
    print(f"Highest Prediction  : {statistics['highest_prediction']:,.2f}")
    print(f"Lowest Prediction   : {statistics['lowest_prediction']:,.2f}")
    print(f"Average Confidence  : {statistics['average_confidence']}%")

    print()

    # ------------------------------------------------------
    # Latest Prediction
    # ------------------------------------------------------

    if latest:

        print("=" * 70)
        print("LATEST PREDICTION")
        print("=" * 70)

        print(f"Prediction Name     : {latest['prediction_name']}")
        print(f"Predicted Wafers    : {latest['predicted_wafers']:,.2f}")
        print(f"Confidence          : {latest['confidence']}%")
        print(f"Model Version       : {latest['model_version']}")
        print(f"Prediction Time     : {latest['prediction_time']}")

        print()

    # ------------------------------------------------------
    # Timeline
    # ------------------------------------------------------

    print("=" * 70)
    print("PREDICTION TIMELINE")
    print("=" * 70)

    if len(trend) == 0:

        print("No prediction history available.")

    else:

        for index, row in enumerate(trend, start=1):

            print(f"{index}. {row['prediction_name']}")
            print(f"   Demand      : {row['predicted_wafers']:,.2f}")
            print(f"   Confidence  : {row['confidence']}%")
            print(f"   Time        : {row['prediction_time']}")
            print("-" * 70)


# ==========================================================

if __name__ == "__main__":
    main()
