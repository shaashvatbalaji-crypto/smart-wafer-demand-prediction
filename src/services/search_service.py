"""
search_service.py

Business logic for searching companies.
"""

from database.company_repository import (
    search_company,
    find_company_by_id,
)

from database.statistics_repository import (
    get_latest_prediction,
)

from database.prediction_repository import (
    get_predictions_by_company,
)


def search(keyword):
    """
    Search companies by Company ID or Company Name.
    """

    # Search by Company ID first
    company = find_company_by_id(keyword)

    if company is None:

        results = search_company(keyword)

        if len(results) == 0:
            return []

        return results

    return [company]


def company_details(company_id):
    """
    Returns company details with prediction information.
    """

    company = find_company_by_id(company_id)

    if company is None:
        return None

    latest = get_latest_prediction(company_id)

    history = get_predictions_by_company(company_id)

    return {

        "company": company,

        "latest_prediction": latest,

        "prediction_count": len(history)

    }
