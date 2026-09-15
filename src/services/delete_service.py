"""
delete_service.py

Business logic for deleting prediction history.
"""

from database.prediction_repository import (
    get_prediction_by_id,
    delete_prediction,
    get_predictions_by_company,
)


# ==========================================================
# Get Prediction
# ==========================================================

def get_prediction(prediction_id):
    """
    Returns a prediction by ID.

    Parameters
    ----------
    prediction_id : int

    Returns
    -------
    dict | None
    """
    return get_prediction_by_id(prediction_id)


# ==========================================================
# Delete Single Prediction
# ==========================================================

def delete_prediction_service(prediction_id):
    """
    Deletes a prediction after verifying it exists.

    Parameters
    ----------
    prediction_id : int

    Returns
    -------
    tuple
        (success, message)
    """

    prediction = get_prediction_by_id(prediction_id)

    if prediction is None:
        return (
            False,
            "Prediction not found."
        )

    success = delete_prediction(prediction_id)

    if success:

        return (
            True,
            f"Prediction '{prediction['prediction_name']}' deleted successfully."
        )

    return (
        False,
        "Failed to delete prediction."
    )


# ==========================================================
# Delete All Predictions of One Company
# ==========================================================

def delete_company_predictions(company_id):
    """
    Deletes all predictions belonging to a company.

    Parameters
    ----------
    company_id : str

    Returns
    -------
    tuple
        (success, message)
    """

    predictions = get_predictions_by_company(company_id)

    if len(predictions) == 0:

        return (
            False,
            "No predictions found for this company."
        )

    deleted = 0

    for prediction in predictions:

        if delete_prediction(prediction["id"]):
            deleted += 1

    return (
        True,
        f"{deleted} prediction(s) deleted successfully."
    )


# ==========================================================
# Check Prediction Exists
# ==========================================================

def prediction_exists(prediction_id):
    """
    Returns True if prediction exists.
    """

    return get_prediction_by_id(prediction_id) is not None
