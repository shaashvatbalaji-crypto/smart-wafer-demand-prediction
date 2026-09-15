# ==========================================================
# TEST SAVED CATBOOST MODEL
# ==========================================================

import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error
)

print("=" * 70)
print("TESTING SAVED CATBOOST MODEL")
print("=" * 70)

# ==========================================================
# Load Saved Files
# ==========================================================

print("\nLoading Saved Model...")

model = joblib.load("models/catboost_model.pkl")
preprocessor = joblib.load("models/preprocessor.pkl")
selected_mask = joblib.load("models/selected_mask.pkl")

print("Model Loaded Successfully!")

# ==========================================================
# Load Dataset
# ==========================================================

print("\nLoading Dataset...")

df = pd.read_csv("data/processed/advanced_features.csv")

df = df[df["monthly_wafer_capacity"] > 0]

print("Dataset Shape :", df.shape)

# ==========================================================
# Features
# ==========================================================

target = "monthly_wafer_capacity"

feature_columns = [

    "company",
    "country_iso3",
    "fab_type",
    "segment",

    "year",
    "process_node_nm",
    "fab_age",
    "revenue_usd_bn",
    "operating_margin_pct",
    "rd_spend_usd_bn",
    "capex_usd_bn",
    "ai_chip_launches",
    "total_ai_shipments",
    "total_ai_revenue_m",
    "avg_memory_gb",
    "avg_fp16_tflops",
    "avg_tdp",
    "avg_chip_price",
    "highest_chip_price",
    "lowest_chip_price",
    "export_control_events",
    "avg_severity_score",
    "worldwide_sales",
    "average_monthly_sales",
    "max_monthly_sales",
    "rd_ratio",
    "capex_ratio",
    "operating_income_ratio",
    "ai_revenue_per_chip",
    "sales_per_launch",
    "price_spread",

    "company_fab_age_ratio",
    "shipments_per_launch",
    "revenue_per_ai_launch",
    "profit_margin",
    "performance_score",
    "performance_per_watt",
    "price_index",
    "price_volatility",
    "export_risk_score",
    "geo_risk",
    "innovation_score",
    "investment_score",
    "ai_market_score",
    "sales_variation",
    "growth_potential"
]

X = df[feature_columns]
y = df[target]

# ==========================================================
# Same Train/Test Split Used During Training
# ==========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=df["company"]
)

# ==========================================================
# Preprocess
# ==========================================================

print("\nPreprocessing Test Data...")

X_test_processed = preprocessor.transform(X_test)

print("Encoded Features :", X_test_processed.shape[1])

print("Selected Features :", selected_mask.sum())

# Apply feature selection using saved boolean mask
X_test_selected = X_test_processed[:, selected_mask]

# ==========================================================
# Predict
# ==========================================================

print("\nMaking Predictions...")

y_pred = model.predict(X_test_selected)

print("Prediction Completed!")

# ==========================================================
# Metrics
# ==========================================================

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

print("\n" + "=" * 70)
print("CATBOOST MODEL PERFORMANCE")
print("=" * 70)

print(f"R² Score : {r2:.4f}")
print(f"MAE      : {mae:.2f}")
print(f"RMSE     : {rmse:.2f}")
print(f"MAPE     : {mape:.2f}%")

# ==========================================================
# Prediction Table
# ==========================================================

results = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred
})

results["Error"] = results["Actual"] - results["Predicted"]

print("\nFirst 10 Predictions\n")
print(results.head(10))

print("\nWorst 10 Predictions\n")
print(results.reindex(results.Error.abs().sort_values(ascending=False).index).head(10))

print("\n" + "=" * 70)
print("TEST COMPLETED SUCCESSFULLY")
print("=" * 70)
