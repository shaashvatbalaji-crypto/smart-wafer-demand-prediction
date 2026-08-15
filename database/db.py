import mysql.connector


def get_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="lion",
        database="wafer_prediction"
    )