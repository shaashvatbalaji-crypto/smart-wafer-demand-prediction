"""
prediction_repository.py

Repository for storing and managing prediction history in MySQL.
"""

import json
from database.db import get_connection


# ==========================================================
# Save Prediction
# ==========================================================

def save_prediction(
    prediction_name,
    company_id,
    company,
    prediction_type,
    original_data,
    modified_data,
    predicted_wafers,
    confidence,
    model_version="CatBoost v1.0"
):
    """
    Saves a prediction into the prediction_history table.
    """

    conn = get_connection()

    if conn is None:
        raise Exception("Unable to connect to MySQL database.")

    cursor = conn.cursor()

    try:

        query = """
        INSERT INTO prediction_history
        (
            prediction_name,
            company_id,
            company,
            prediction_type,
            original_data,
            modified_data,
            predicted_wafers,
            confidence,
            model_version
        )
        VALUES
        (
            %s,%s,%s,%s,%s,%s,%s,%s,%s
        )
        """

        values = (

            prediction_name,
            company_id,
            company,
            prediction_type,
            json.dumps(original_data),
            json.dumps(modified_data),
            round(float(predicted_wafers), 2),
            round(float(confidence), 2),
            model_version

        )

        cursor.execute(query, values)

        conn.commit()

        return True

    except Exception as e:

        conn.rollback()
        raise e

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Get All Prediction History
# ==========================================================

def get_prediction_history():
    """
    Returns all predictions ordered by newest first.
    """

    conn = get_connection()

    if conn is None:
        return []

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT *
            FROM prediction_history
            ORDER BY prediction_time DESC
        """)

        return cursor.fetchall()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Get Prediction By ID
# ==========================================================

def get_prediction_by_id(prediction_id):
    """
    Returns one prediction by ID.
    """

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT *
            FROM prediction_history
            WHERE id=%s
            """,
            (prediction_id,)
        )

        return cursor.fetchone()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Check Prediction Exists
# ==========================================================

def prediction_exists(prediction_id):
    """
    Returns True if prediction exists.
    """

    prediction = get_prediction_by_id(prediction_id)

    return prediction is not None


# ==========================================================
# Delete Prediction
# ==========================================================

def delete_prediction(prediction_id):
    """
    Deletes one prediction.

    Returns
    -------
    bool
    """

    conn = get_connection()

    if conn is None:
        return False

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            DELETE FROM prediction_history
            WHERE id=%s
            """,
            (prediction_id,)
        )

        conn.commit()

        return cursor.rowcount > 0

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Total Prediction Count
# ==========================================================

def get_prediction_count():
    """
    Returns total number of predictions.
    """

    conn = get_connection()

    if conn is None:
        return 0

    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT COUNT(*)
            FROM prediction_history
        """)

        return cursor.fetchone()[0]

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Get Predictions of One Company
# ==========================================================

def get_predictions_by_company(company_id):
    """
    Returns all predictions of a company.
    """

    conn = get_connection()

    if conn is None:
        return []

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT *
        FROM prediction_history
        WHERE company_id=%s
        ORDER BY prediction_time DESC
        """

        cursor.execute(query, (company_id,))

        return cursor.fetchall()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Compare Two Predictions
# ==========================================================

def compare_predictions(prediction_id_1, prediction_id_2):
    """
    Returns two prediction records.
    """

    prediction1 = get_prediction_by_id(prediction_id_1)

    prediction2 = get_prediction_by_id(prediction_id_2)

    return prediction1, prediction2


# ==========================================================
# Get Latest Prediction of Company
# ==========================================================

def get_latest_prediction(company_id):
    """
    Returns the latest prediction of a company.
    """

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT *
        FROM prediction_history
        WHERE company_id=%s
        ORDER BY prediction_time DESC
        LIMIT 1
        """

        cursor.execute(query, (company_id,))

        return cursor.fetchone()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Get Prediction Names
# ==========================================================

def get_prediction_names(company_id):
    """
    Returns only prediction IDs and names of a company.
    Useful for Delete Prediction module.
    """

    conn = get_connection()

    if conn is None:
        return []

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT
            id,
            prediction_name,
            prediction_time
        FROM prediction_history
        WHERE company_id=%s
        ORDER BY prediction_time DESC
        """

        cursor.execute(query, (company_id,))

        return cursor.fetchall()

    finally:

        cursor.close()
        conn.close()
