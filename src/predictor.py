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
# Global Variables
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
    Loads all trained prediction components.

    Each component is checked independently so that a
    partially initialized model state cannot occur.
    """

    global model
    global preprocessor
    global selected_mask
    global feature_columns

    # ------------------------------------------------------
    # Model
    # ------------------------------------------------------

    if model is None:

        print("=" * 60)
        print("Loading AI Prediction Engine...")
        print("=" * 60)

        model = joblib.load(
            "models/catboost_model.pkl"
        )

    # ------------------------------------------------------
    # Preprocessor
    # ------------------------------------------------------

    if preprocessor is None:

        preprocessor = joblib.load(
            "models/preprocessor.pkl"
        )

    # ------------------------------------------------------
    # Selected Feature Mask
    # ------------------------------------------------------

    if selected_mask is None:

        selected_mask = joblib.load(
            "models/selected_mask.pkl"
        )

    # ------------------------------------------------------
    # Raw Feature Columns
    # ------------------------------------------------------

    if feature_columns is None:

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
    Predict monthly wafer demand.

    Parameters
    ----------
    company_data : dict

    Returns
    -------
    float
    """

    # ------------------------------------------------------
    # Load all required model components
    # ------------------------------------------------------

    load_model()

    # ------------------------------------------------------
    # Feature Engineering
    # ------------------------------------------------------

    df = engineer_features(
        company_data
    )

    # ------------------------------------------------------
    # Arrange columns exactly like training
    # ------------------------------------------------------

    df = df.reindex(
        columns=feature_columns,
        fill_value=0
    )

    # ------------------------------------------------------
    # Preprocessing
    # ------------------------------------------------------

    processed = preprocessor.transform(
        df
    )

    # ------------------------------------------------------
    # Feature Selection
    # ------------------------------------------------------

    selected = processed[
        :,
        selected_mask
    ]

    # ------------------------------------------------------
    # Prediction
    # ------------------------------------------------------

    prediction = model.predict(
        selected
    )[0]

    return float(prediction)


# ==========================================================
# Feature Importance
# ==========================================================

def get_feature_importance():
    """
    Returns feature importance from the trained model.
    """

    load_model()

    feature_names = (
        preprocessor
        .get_feature_names_out()
    )

    selected_features = (
        feature_names[selected_mask]
    )

    importance = (
        model.get_feature_importance()
    )

    return list(
        zip(
            selected_features,
            importance
        )
    )


# ==========================================================
# Model Information
# ==========================================================

def model_information():
    """
    Displays model information.
    """

    load_model()

    feature_names = (
        preprocessor
        .get_feature_names_out()
    )

    selected_features = (
        feature_names[selected_mask]
    )

    print("=" * 60)
    print("MODEL INFORMATION")
    print("=" * 60)

    print(
        "Model              : CatBoost Regressor"
    )

    print(
        f"Encoded Features   : "
        f"{len(feature_names)}"
    )

    print(
        f"Selected Features  : "
        f"{len(selected_features)}"
    )

    print(
        "Prediction Target  : "
        "Monthly Wafer Capacity"
    )

    print("=" * 60)


# ==========================================================
# Quick Test
# ==========================================================

if __name__ == "__main__":

    model_information()
