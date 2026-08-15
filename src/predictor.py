"""
predictor.py

Reusable AI Prediction Engine

Used by:
1. Existing Company Prediction
2. Startup Prediction
"""

import joblib

from src.feature_engineering import engineer_features


# ==========================================================
# Global Variables (Loaded Only Once)
# ==========================================================

model = None
preprocessor = None
selected_mask = None
feature_columns = None


# ==========================================================
# Lazy Model Loader
# ==========================================================

def load_model():
    """
    Loads the trained AI model only once.
    """

    global model
    global preprocessor
    global selected_mask
    global feature_columns

    if model is None:

        print("=" * 60)
        print("Loading AI Prediction Engine...")
        print("=" * 60)

        model = joblib.load("models/catboost_model.pkl")

        preprocessor = joblib.load(
            "models/preprocessor.pkl"
        )

        selected_mask = joblib.load(
            "models/selected_mask.pkl"
        )

        feature_columns = joblib.load(
            "models/raw_feature_columns.pkl"
        )

        print("✓ AI Engine Ready!")
        print()


# ==========================================================
# Predict Company
# ==========================================================

def predict_company(company_data):
    """
    Predict monthly wafer capacity.

    Parameters
    ----------
    company_data : dict

    Returns
    -------
    float
    """

    # Load model if not already loaded
    load_model()

    # ------------------------------------------------------
    # Feature Engineering
    # ------------------------------------------------------

    df = engineer_features(company_data)

    # ------------------------------------------------------
    # Arrange Columns Exactly Like Training
    # ------------------------------------------------------

    df = df.reindex(
        columns=feature_columns,
        fill_value=0
    )

    # ------------------------------------------------------
    # Preprocessing
    # ------------------------------------------------------

    processed = preprocessor.transform(df)

    # ------------------------------------------------------
    # Feature Selection
    # ------------------------------------------------------

    selected = processed[:, selected_mask]

    # ------------------------------------------------------
    # Prediction
    # ------------------------------------------------------

    prediction = model.predict(selected)[0]

    return float(prediction)


# ==========================================================
# Feature Importance
# ==========================================================

def get_feature_importance():
    """
    Returns feature importance from the trained model.
    """

    load_model()

    feature_names = preprocessor.get_feature_names_out()

    selected_features = feature_names[selected_mask]

    importance = model.get_feature_importance()

    return list(zip(selected_features, importance))


# ==========================================================
# Model Information
# ==========================================================

def model_information():
    """
    Displays model information.
    """

    load_model()

    feature_names = preprocessor.get_feature_names_out()

    selected_features = feature_names[selected_mask]

    print("=" * 60)
    print("MODEL INFORMATION")
    print("=" * 60)

    print(f"Model              : CatBoost Regressor")
    print(f"Encoded Features   : {len(feature_names)}")
    print(f"Selected Features  : {len(selected_features)}")
    print(f"Prediction Target  : Monthly Wafer Capacity")

    print("=" * 60)


# ==========================================================
# Quick Test
# ==========================================================

if __name__ == "__main__":

    model_information()