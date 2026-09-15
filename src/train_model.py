# ==========================================================
# SMART WAFER DEMAND PREDICTION SYSTEM
# Train Model (CatBoost)
# ==========================================================

import os
import warnings
import joblib

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

# ----------------------------------------------------------
# Machine Learning
# ----------------------------------------------------------

from sklearn.model_selection import (
    train_test_split,
    RandomizedSearchCV,
    RepeatedKFold
)

from sklearn.compose import ColumnTransformer

from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler
)

from sklearn.feature_selection import SelectFromModel

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from sklearn.inspection import permutation_importance

from catboost import CatBoostRegressor

# ==========================================================
# Create Output Directories
# ==========================================================

os.makedirs("models", exist_ok=True)
os.makedirs("results", exist_ok=True)

print("=" * 70)
print("SMART WAFER DEMAND PREDICTION SYSTEM")
print("CATBOOST REGRESSION MODEL")
print("=" * 70)

# ==========================================================
# Load Dataset
# ==========================================================

print("\nLoading Dataset...")

df = pd.read_csv(
    "data/processed/advanced_features.csv"
)

print("Dataset Loaded Successfully!")

print("Dataset Shape :", df.shape)

print("\nFirst Five Rows:\n")
print(df.head())

print("\nColumns in Dataset:\n")
print(df.columns.tolist())

print("\n==============================")
print("CHECKING TSMC RECORDS")
print("==============================")

print(
    df[
        df["company"] == "TSMC"
    ][
        [
            "company",
            "year",
            "fab_type",
            "segment",
            "monthly_wafer_capacity"
        ]
    ].sort_values(["year", "fab_type", "segment"])
)

print("\n==============================")
print("CHECKING DUPLICATES")
print("==============================")

print(
    "Duplicate Company-Year Rows:",
    df.duplicated(subset=["company", "year"]).sum()
)
print("Original Shape:", df.shape)

df = df[df["monthly_wafer_capacity"] > 0]

print("After Removing Zero Capacity:", df.shape)
# ==========================================================
# STEP 4 : Define Features and Target
# ==========================================================

print("\nDefining Features and Target...")

target = "monthly_wafer_capacity"
feature_columns = [

    # Categorical
    "company",
    "country_iso3",
    "fab_type",
    "segment",

    # Original Features
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

    # Existing Engineered Features
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

print("Total Features :", len(feature_columns))
print("Feature Matrix :", X.shape)
print("Target Shape   :", y.shape)

print("\nChecking zero target values...")

print("Number of zero targets:", (y == 0).sum())

print(df[df[target] == 0][["company", "year", target]])

# ==========================================================
# STEP 3 : Train-Test Split
# ==========================================================

from sklearn.model_selection import train_test_split

print("\nSplitting Dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=df["company"]
)

print("\nTraining Samples :", X_train.shape)
print("Testing Samples  :", X_test.shape)

# ==========================================================
# STEP 4 : Identify Feature Types
# ==========================================================

print("\nIdentifying Feature Types...")

categorical_features = [
    "company",
    "country_iso3",
    "fab_type",
    "segment"
]

numerical_features = [
    col for col in feature_columns
    if col not in categorical_features
]

print("Categorical Features :", len(categorical_features))
print("Numerical Features   :", len(numerical_features))

# ==========================================================
# STEP 5 : Encode Categorical Features
# ==========================================================

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

print("\nEncoding Categorical Features...")

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "num",
            StandardScaler(),
            numerical_features
        )
    ]
)

# Fit on training data only
X_train_processed = preprocessor.fit_transform(X_train)

# Transform test data
X_test_processed = preprocessor.transform(X_test)

print("\nEncoding Completed!")

print("\nProcessed Training Shape:")
print(X_train_processed.shape)

print("\nProcessed Testing Shape:")
print(X_test_processed.shape)

# Get feature names after preprocessing
feature_names = preprocessor.get_feature_names_out()

print("\nTotal Encoded Features :", len(feature_names))

# ==========================================================
# STEP 6 : Feature Selection using CatBoost
# ==========================================================

from sklearn.feature_selection import SelectFromModel
from catboost import CatBoostRegressor

print("\nSelecting Important Features...")

selector = SelectFromModel(

    CatBoostRegressor(

        iterations=300,

        depth=6,

        learning_rate=0.05,

        loss_function="RMSE",

        verbose=False,

        random_seed=42

    ),

    threshold="median"

)

# Fit selector

X_train_selected = selector.fit_transform(
    X_train_processed,
    y_train
)

X_test_selected = selector.transform(
    X_test_processed
)

print("\nFeature Selection Completed!")

print("Original Features :", X_train_processed.shape[1])

print("Selected Features :", X_train_selected.shape[1])

# Get selected feature names

feature_names = preprocessor.get_feature_names_out()

selected_features = feature_names[selector.get_support()]

selected_mask = selector.get_support()

joblib.dump(selected_mask, "models/selected_mask.pkl")

print("\nTop Selected Features:\n")

for feature in selected_features[:20]:
    print(feature)


# ==========================================================
# STEP 7 : Train Final CatBoost Model
# ==========================================================

from catboost import CatBoostRegressor

print("\nTraining Final CatBoost Model...")

model = CatBoostRegressor(
    iterations=1000,
    learning_rate=0.05,
    depth=4,
    l2_leaf_reg=3,
    bagging_temperature=1,
    random_strength=1,
    loss_function="RMSE",
    random_seed=42,
    verbose=100
)

model.fit(
    X_train_selected,
    y_train
)

print("\n===================================")
print("Final Model Training Completed!")
print("===================================")

# ==========================================================
# STEP 8 : Prediction
# ==========================================================

import pandas as pd
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

print("\nMaking Predictions...")

# Predict on selected test features
y_pred = model.predict(X_test_selected)

print("Prediction Completed!")

# Prediction Table
results = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred
})

print("\nFirst 10 Predictions\n")
print(results.head(10))

# ==========================================================
# STEP 9 : Model Evaluation
# ==========================================================

from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error
)
import numpy as np

print("\n===================================")
print("MODEL PERFORMANCE")
print("===================================")

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

mape = np.mean(
    np.abs((y_test - y_pred) / y_test)
) * 100

print(f"R² Score : {r2:.4f}")
print(f"MAE      : {mae:.2f}")
print(f"RMSE     : {rmse:.2f}")
print(f"MAPE     : {mape:.2f}%")

import matplotlib.pyplot as plt

plt.figure(figsize=(8,8))

plt.scatter(y_test, y_pred)

plt.plot(
    [y_test.min(), y_test.max()],
    [y_test.min(), y_test.max()],
    'r--'
)

plt.xlabel("Actual Capacity")
plt.ylabel("Predicted Capacity")

plt.title("Actual vs Predicted")

plt.show()

import joblib

joblib.dump(model, "models/catboost_model.pkl")
joblib.dump(preprocessor, "models/preprocessor.pkl")
joblib.dump(selector, "models/feature_selector.pkl")
joblib.dump(selected_mask, "models/selected_mask.pkl")
joblib.dump(feature_columns, "models/raw_feature_columns.pkl")

print("\nAll model files saved successfully!")

# ==========================================================
# STEP 10 : Feature Importance (Final Model)
# ==========================================================

print("\n===================================")
print("FEATURE IMPORTANCE")
print("===================================")

importance = model.get_feature_importance()

importance_df = pd.DataFrame({
    "Feature": selected_features,
    "Importance": importance
})

importance_df = importance_df.sort_values(
    by="Importance",
    ascending=False
)

print("\nTop 20 Important Features\n")
print(importance_df.head(20))

# Save to CSV
importance_df.to_csv(
    "results/feature_importance.csv",
    index=False
)

# Plot
plt.figure(figsize=(10,8))

plt.barh(
    importance_df["Feature"][:20],
    importance_df["Importance"][:20]
)

plt.gca().invert_yaxis()

plt.xlabel("Importance Score")
plt.ylabel("Feature")
plt.title("Top 20 Important Features")

plt.tight_layout()

plt.savefig(
    "results/feature_importance.png",
    dpi=300
)

plt.show()


