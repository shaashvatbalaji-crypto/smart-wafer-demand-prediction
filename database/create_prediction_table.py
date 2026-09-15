"""
create_prediction_table.py

Creates the prediction_history table.
"""

from database.db import get_connection


def create_prediction_table():

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    CREATE TABLE IF NOT EXISTS prediction_history (

        id INT AUTO_INCREMENT PRIMARY KEY,

        prediction_name VARCHAR(100),

        company VARCHAR(150) NOT NULL,

        prediction_type VARCHAR(30) NOT NULL,

        original_data JSON,

        modified_data JSON,

        predicted_wafers DOUBLE,

        confidence DOUBLE,

        model_version VARCHAR(30),

        prediction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
    """

    cursor.execute(query)

    conn.commit()

    cursor.close()
    conn.close()

    print("✅ prediction_history table created successfully!")


if __name__ == "__main__":
    create_prediction_table()
