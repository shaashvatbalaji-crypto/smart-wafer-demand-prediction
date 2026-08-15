from database.prediction_repository import save_prediction


save_prediction(
    prediction_name="Original Forecast",

    company="TSMC",

    prediction_type="existing_company",

    original_data={
        "revenue": 74.93,
        "capex": 33.72,
        "rd_budget": 5.99
    },

    modified_data={
        "revenue": 90,
        "capex": 40,
        "rd_budget": 5.99
    },

    predicted_wafers=163245,

    confidence=94.5
)