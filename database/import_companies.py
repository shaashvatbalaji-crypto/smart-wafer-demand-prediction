import pandas as pd
from db import get_connection

# -------------------------------------------------------
# Load Dataset
# -------------------------------------------------------

df = pd.read_csv("data/processed/master_dataset_final.csv")

conn = get_connection()
cursor = conn.cursor()

count = 0

for _, row in df.iterrows():

    sql = """
    INSERT IGNORE INTO companies
    (
        company,
        country,
        fab_type,
        segment,
        process_node_nm,
        revenue,
        rd_budget,
        capex
    )
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """

    values = (

        row["company"],
        row["country_iso3"],
        row["fab_type"],
        row["segment"],
        int(row["process_node_nm"]),
        float(row["revenue_usd_bn"]),
        float(row["rd_spend_usd_bn"]),
        float(row["capex_usd_bn"])

    )

    cursor.execute(sql, values)
    count += 1

conn.commit()

cursor.close()
conn.close()

print("=" * 60)
print(f"{count} Records Imported Successfully!")
print("=" * 60)
