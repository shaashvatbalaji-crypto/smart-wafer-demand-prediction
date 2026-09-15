import pandas as pd
from pathlib import Path

RAW_DATA = Path("data/raw")
CLEANED_DATA = Path("data/cleaned")

CLEANED_DATA.mkdir(exist_ok=True)

file = RAW_DATA / "WSTS-Historical-Billings-Report-May_2026.xlsx"

# Read without header
df = pd.read_excel(file, sheet_name="Monthly Data", header=None)

# Extract month names
months = df.iloc[3, 1:13].tolist()

records = []

current_year = None

for i in range(4, len(df)):

    first_cell = df.iloc[i, 0]

    # Detect Year
    if isinstance(first_cell, (int, float)):
        current_year = int(first_cell)
        continue

    # Detect Region
    if isinstance(first_cell, str):

        region = first_cell.strip()

        for j, month in enumerate(months):

            value = df.iloc[i, j + 1]

            records.append(
                {
                    "Year": current_year,
                    "Region": region,
                    "Month": month,
                    "Sales_USD_1000": value,
                }
            )

# Create DataFrame
wsts_cleaned = pd.DataFrame(records)

# Remove missing sales
wsts_cleaned.dropna(subset=["Sales_USD_1000"], inplace=True)

# Reset index
wsts_cleaned.reset_index(drop=True, inplace=True)

# Save
output = CLEANED_DATA / "wsts_monthly_cleaned.csv"

wsts_cleaned.to_csv(output, index=False)

print("=" * 60)
print("WSTS CLEANED SUCCESSFULLY")
print("=" * 60)

print()

print(wsts_cleaned.head())

print()

print("Shape:", wsts_cleaned.shape)

print()

print("Saved to")

print(output)
