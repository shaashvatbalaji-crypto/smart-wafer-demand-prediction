import pandas as pd
import joblib

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# ====================================
# Load model
# ====================================

model = joblib.load("models/catboost_model.pkl")
preprocessor = joblib.load("models/preprocessor.pkl")
selected_mask = joblib.load("models/selected_mask.pkl")

# ====================================
# CHANGE THESE IF NEEDED
# ====================================

DATASET = "data/processed/advanced_features.csv"
TARGET = "monthly_wafer_capacity"

# Load dataset
df = pd.read_csv(DATASET)

print("Original Dataset Shape :", df.shape)

# Remove rows with zero wafer capacity
df = df[df["monthly_wafer_capacity"] > 0].copy()

print("After Removing Zero Capacity :", df.shape)

# Features and target
X = df.drop(columns=[TARGET])
y = df[TARGET]

# ====================================
# Split
# ====================================

X = df.drop(columns=[TARGET])
y = df[TARGET]

# ====================================
# Preprocess
# ====================================

processed = preprocessor.transform(X)

print("\nProcessed Shape :", processed.shape)

selected = processed[:, selected_mask]

print("Selected Shape :", selected.shape)

# ====================================
# Predict
# ====================================

prediction = model.predict(selected)

# ====================================
# Metrics
# ====================================

mae = mean_absolute_error(y, prediction)
rmse = mean_squared_error(y, prediction) ** 0.5
r2 = r2_score(y, prediction)

print("\n")
print("=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")

# ====================================
# First 10 Predictions
# ====================================

print("\n")
print("=" * 60)
print("FIRST 10 PREDICTIONS")
print("=" * 60)

results = pd.DataFrame({
    "Actual": y.values,
    "Predicted": prediction
})

results["Error"] = results["Actual"] - results["Predicted"]

print(results.head(10))

# ====================================
# Random Sample Check
# ====================================

print("\n")
print("=" * 60)
print("5 RANDOM SAMPLES")
print("=" * 60)

sample = results.sample(5, random_state=42)

print(sample)

print("\n")
print("=" * 60)
print("Finished Successfully")
print("=" * 60)
