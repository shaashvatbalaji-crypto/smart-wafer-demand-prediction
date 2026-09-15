from db import get_connection

conn = get_connection()
cursor = conn.cursor()

# ---------------------------------------------------------
# Companies Table
# ---------------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS companies (

    id INT AUTO_INCREMENT PRIMARY KEY,

    company VARCHAR(150) UNIQUE,

    country VARCHAR(20),

    fab_type VARCHAR(50),

    segment VARCHAR(50),

    process_node_nm INT,

    revenue DECIMAL(12,2),

    rd_budget DECIMAL(12,2),

    capex DECIMAL(12,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)
""")

# ---------------------------------------------------------
# Startups Table
# ---------------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS startups (

    id INT AUTO_INCREMENT PRIMARY KEY,

    company VARCHAR(150) UNIQUE,

    country VARCHAR(20),

    fab_type VARCHAR(50),

    segment VARCHAR(50),

    process_node_nm INT,

    expected_revenue DECIMAL(12,2),

    rd_budget DECIMAL(12,2),

    capex DECIMAL(12,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)
""")

# ---------------------------------------------------------
# Prediction History
# ---------------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS predictions (

    id INT AUTO_INCREMENT PRIMARY KEY,

    company_name VARCHAR(150),

    prediction_type VARCHAR(30),

    monthly_capacity DOUBLE,

    confidence DOUBLE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)
""")

conn.commit()

cursor.close()
conn.close()

print("✅ Database Tables Created Successfully!")
