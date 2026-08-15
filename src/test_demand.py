import joblib
import pandas as pd

print("=" * 60)
print("CATBOOST FEATURE IMPORTANCE")
print("=" * 60)

# --------------------------------------------------
# Load Model
# --------------------------------------------------

model = joblib.load("models/catboost_model.pkl")

# --------------------------------------------------
# Load Feature Information
# --------------------------------------------------

feature_columns = joblib.load("models/feature_columns.pkl")
selected_mask = joblib.load("models/selected_mask.pkl")

# --------------------------------------------------
# Get Selected Feature Names
# --------------------------------------------------

selected_features = [
    feature
    for feature, keep in zip(feature_columns, selected_mask)
    if keep
]

# --------------------------------------------------
# Get Feature Importance
# --------------------------------------------------

importance = model.get_feature_importance()

print(f"\nTotal Original Features : {len(feature_columns)}")
print(f"Selected Features       : {len(selected_features)}")
print(f"Importance Values       : {len(importance)}")

# --------------------------------------------------
# Safety Check
# --------------------------------------------------

if len(selected_features) != len(importance):
    print("\nERROR:")
    print("Selected feature count and importance count do not match.")
    print("This means the saved feature_columns.pkl does not correspond")
    print("to the trained CatBoost model.")
    exit()

# --------------------------------------------------
# Create Importance Table
# --------------------------------------------------

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

# --------------------------------------------------
# Save
# --------------------------------------------------

importance_df.to_csv(
    "results/feature_importance.csv",
    index=False
)

print("\nFeature importance saved successfully.")
print("results/feature_importance.csv")