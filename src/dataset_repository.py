"""
dataset_repository.py

Provides company data from the processed dataset.
"""

import pandas as pd

DATASET_PATH = "data/processed/advanced_features.csv"

# Load dataset once
df = pd.read_csv(DATASET_PATH)


def get_company(company_name):
    """
    Returns the latest record for the given company.
    """

    company = df[
        df["company"].str.lower() == company_name.lower()
    ]

    if company.empty:
        return None

    # Return latest year
    company = company.sort_values(
        "year",
        ascending=False
    )

    return company.iloc[0].to_dict()


def get_all_companies():
    """
    Returns all available company names.
    """

    return sorted(
        df["company"].unique().tolist()
    )
