"""
Sensitivity Analysis

Tests how each feature affects wafer prediction.
"""

from copy import deepcopy
from dataset_repository import get_company
from predictor import predict_company


def test_feature(company_name, feature, values):

    company = get_company(company_name)

    if company is None:
        print("Company not found.")
        return

    baseline = predict_company(deepcopy(company))

    print("=" * 80)
    print(f"Company : {company_name}")
    print(f"Testing : {feature}")
    print("=" * 80)

    print(f"Baseline Prediction : {baseline:,.0f} wafers/month\n")

    for value in values:

        test_company = deepcopy(company)

        test_company[feature] = value

        prediction = predict_company(test_company)

        difference = prediction - baseline
        percent = (difference / baseline) * 100

        print(
            f"{feature:25}"
            f"{value:12}"
            f"{prediction:15,.0f}"
            f"{difference:12,.0f}"
            f"{percent:10.2f}%"
        )


if __name__ == "__main__":

    test_feature(
        "Intel",
        "revenue_usd_bn",
        [40, 60, 80, 100, 120, 140]
    )
    