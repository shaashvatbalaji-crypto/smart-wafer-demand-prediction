import streamlit as st

from .startup_predict import StartupPredictor
from database.prediction_repository import save_prediction


def show_startup_company():

    st.header("🚀 Startup Company Prediction")

    st.write(
        "Enter your startup information to estimate the required monthly wafer demand."
    )

    col1, col2 = st.columns(2)

    # ==========================================================
    # Left Column
    # ==========================================================

    with col1:

        startup_name = st.text_input(
            "Startup Name",
            "MyAI Startup"
        )

        country = st.selectbox(
            "Country",
            ["IND", "USA", "TWN", "KOR", "CHN"]
        )

        fab_type = st.selectbox(
            "Fab Type",
            [
                "logic_leading",
                "logic_mature",
                "memory_DRAM",
                "memory_NAND"
            ]
        )

        segment = st.selectbox(
            "Segment",
            [
                "foundry",
                "idm_logic",
                "idm_memory"
            ]
        )

        year = st.number_input(
            "Year",
            min_value=2024,
            max_value=2035,
            value=2027
        )

        process_node_nm = st.number_input(
            "Process Node (nm)",
            min_value=1.0,
            value=3.0
        )

    # ==========================================================
    # Right Column
    # ==========================================================

    with col2:

        expected_revenue = st.number_input(
            "Expected Annual Revenue (USD Billion)",
            min_value=0.0,
            value=2.5
        )

        rd_budget = st.number_input(
            "R&D Budget (USD Billion)",
            min_value=0.0,
            value=0.8
        )

        capex = st.number_input(
            "CapEx (USD Billion)",
            min_value=0.0,
            value=1.5
        )

        ai_chip_launches = st.number_input(
            "AI Chip Launches",
            min_value=1,
            value=2
        )

        expected_shipments = st.number_input(
            "Expected AI Shipments",
            min_value=1,
            value=500000
        )

        expected_ai_revenue = st.number_input(
            "Expected AI Revenue (Million USD)",
            min_value=0.0,
            value=800.0
        )

    # ==========================================================
    # Prediction Button
    # ==========================================================

    if st.button(
        "Predict Startup Wafer Demand",
        use_container_width=True
    ):

        predictor = StartupPredictor()

        startup = {

            "company": startup_name,
            "country": country,
            "fab_type": fab_type,
            "segment": segment,

            "year": year,
            "process_node_nm": process_node_nm,

            "expected_revenue": expected_revenue,
            "rd_budget": rd_budget,
            "capex": capex,

            "ai_chip_launches": ai_chip_launches,
            "expected_shipments": expected_shipments,
            "expected_ai_revenue": expected_ai_revenue
        }

        # ======================================================
        # Prediction
        # ======================================================

        result = predictor.predict_details(startup)

        prediction = result["final_prediction"]
        confidence = result["confidence"]
        stage = result["startup_stage"]
        rating = result["investment_rating"]
        explanation = result["explanation"]
        recommendations = result["recommendations"]

        ai_prediction = result["ai_prediction"]
        business_prediction = result["business_prediction"]

        # ======================================================
        # Save to Database
        # ======================================================

        try:

            save_prediction(

                prediction_name=f"{startup_name} Startup",

                company=startup_name,

                prediction_type="Startup",

                original_data=startup,

                modified_data=startup,

                predicted_wafers=prediction,

                confidence=confidence,

                model_version="CatBoost_v1"

            )

            st.success("✅ Prediction saved successfully!")

        except Exception as e:

            st.error(f"Database Error : {e}")

        # ======================================================
        # Prediction Result
        # ======================================================

        st.success("Prediction Completed Successfully!")

        st.subheader("📊 Prediction Results")

        c1, c2, c3 = st.columns(3)

        with c1:
            st.metric(
                "Monthly Wafer Demand",
                f"{prediction:,.0f}"
            )

        with c2:
            st.metric(
                "Confidence",
                f"{confidence}%"
            )

        with c3:
            st.metric(
                "Investment Rating",
                rating
            )

        # ======================================================
        # Hybrid Prediction
        # ======================================================

        st.subheader("🤖 Hybrid Prediction Breakdown")

        col1, col2 = st.columns(2)

        with col1:

            st.metric(
                "AI Prediction",
                f"{ai_prediction:,.0f}"
            )

        with col2:

            st.metric(
                "Business Prediction",
                f"{business_prediction:,.0f}"
            )

        # ======================================================
        # Startup Details
        # ======================================================

        st.subheader("🏢 Startup Summary")

        st.write(f"**Startup Name:** {startup_name}")
        st.write(f"**Country:** {country}")
        st.write(f"**Technology Node:** {process_node_nm} nm")
        st.write(f"**Expected Revenue:** ${expected_revenue:.2f} Billion")
        st.write(f"**Startup Stage:** {stage}")

        # ======================================================
        # AI Explanation
        # ======================================================

        st.subheader("🧠 AI Explanation")

        st.write(explanation)

        # ======================================================
        # Recommendations
        # ======================================================

        st.subheader("💡 Recommendations")

        for recommendation in recommendations:
            st.success(recommendation)