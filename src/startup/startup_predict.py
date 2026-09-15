"""
startup_predict.py

Hybrid Startup Wafer Demand Prediction
"""

from pathlib import Path
import joblib

from .startup_features import build_startup_features
from .business_engine import estimate_monthly_demand
from .confidence_engine import calculate_confidence
from .explanation_engine import explain_prediction
from .recommendations import generate_recommendations
from .startup_classifier import (
    classify_startup,
    investment_rating
)


class StartupPredictor:

    # Default weights
    AI_WEIGHT = 0.60
    BUSINESS_WEIGHT = 0.40

    def __init__(self):

        root = Path(__file__).resolve().parents[2]
        model_dir = root / "models"

        self.model = joblib.load(model_dir / "catboost_model.pkl")
        self.preprocessor = joblib.load(model_dir / "preprocessor.pkl")
        self.selected_mask = joblib.load(model_dir / "selected_mask.pkl")

    # -------------------------------------------------------
    # Internal Prediction
    # -------------------------------------------------------

    def _predict_all(self, startup_inputs):

        # Build startup feature dataframe
        df = build_startup_features(startup_inputs)

        # Preprocess
        processed = self.preprocessor.transform(df)

        # Feature Selection
        selected = processed[:, self.selected_mask]

        # ----------------------------
        # AI Prediction
        # ----------------------------

        ai_prediction = float(
            self.model.predict(selected)[0]
        )

        # Scale AI prediction for startups
        startup_factor = min(
            startup_inputs["expected_revenue"] / 1.0,
            1.0
        )

        ai_prediction *= startup_factor

        # ----------------------------
        # Business Prediction
        # ----------------------------

        business_prediction = float(
            estimate_monthly_demand(startup_inputs)
        )

        # ----------------------------
        # Dynamic Hybrid Weights
        # ----------------------------

        revenue = startup_inputs["expected_revenue"]

        if revenue < 0.1:
            ai_weight = 0.20
            business_weight = 0.80

        elif revenue < 1:
            ai_weight = 0.40
            business_weight = 0.60

        else:
            ai_weight = 0.60
            business_weight = 0.40

        # ----------------------------
        # Final Prediction
        # ----------------------------

        final_prediction = (
            ai_weight * ai_prediction
            + business_weight * business_prediction
        )

        return (
            ai_prediction,
            business_prediction,
            final_prediction
        )

    # -------------------------------------------------------
    # Final Prediction Only
    # -------------------------------------------------------

    def predict(self, startup_inputs):

        _, _, final_prediction = self._predict_all(startup_inputs)

        return round(final_prediction, 2)

    # -------------------------------------------------------
    # Detailed Prediction
    # -------------------------------------------------------

    def predict_details(self, startup_inputs):

        (
            ai_prediction,
            business_prediction,
            final_prediction
        ) = self._predict_all(startup_inputs)

        confidence = calculate_confidence(startup_inputs)

        explanation = explain_prediction(startup_inputs)

        recommendations = generate_recommendations(startup_inputs)

        stage = classify_startup(startup_inputs)

        rating = investment_rating(startup_inputs)

        return {

            "ai_prediction": round(ai_prediction, 2),

            "business_prediction": round(business_prediction, 2),

            "final_prediction": round(final_prediction, 2),

            "confidence": confidence,

            "explanation": explanation,

            "recommendations": recommendations,

            "startup_stage": stage,

            "investment_rating": rating

        }
