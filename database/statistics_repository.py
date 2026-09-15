"""
statistics_repository.py

Repository for Company Dashboard Statistics.
"""

from database.db import get_connection


# ==========================================================
# Company Statistics
# ==========================================================

def get_company_statistics(company_id):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT

            company_id,
            company,

            COUNT(*) AS total_predictions,

            ROUND(AVG(predicted_wafers),2) AS average_prediction,

            ROUND(MAX(predicted_wafers),2) AS highest_prediction,

            ROUND(MIN(predicted_wafers),2) AS lowest_prediction,

            ROUND(AVG(confidence),2) AS average_confidence

        FROM prediction_history

        WHERE company_id=%s

        GROUP BY company_id, company
        """

        cursor.execute(query, (company_id,))

        return cursor.fetchone()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Latest Prediction
# ==========================================================

def get_latest_prediction(company_id):

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
# Prediction Trend
# ==========================================================

def get_prediction_trend(company_id):

    conn = get_connection()

    if conn is None:
        return []

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT

            prediction_name,

            predicted_wafers,

            confidence,

            prediction_time

        FROM prediction_history

        WHERE company_id=%s

        ORDER BY prediction_time
        """

        cursor.execute(query, (company_id,))

        return cursor.fetchall()

    finally:

        cursor.close()
        conn.close()
