"""
streamlit_app.py

Smart Wafer Demand Prediction System
Streamlit Application

Startup workflow:
    1. Enter startup name
    2. If startup exists -> load its saved data + STxxxx ID
    3. If startup is new -> ask for startup details
    4. Run prediction
    5. New startups are automatically saved
    6. Existing startups are not duplicated
"""

import io
import json
from datetime import datetime

import streamlit as st

# ==========================================================
# Existing Company / Startup Imports
# ==========================================================

from src.dataset_repository import get_company
from src.predictor import predict_company

from src.startup.startup_predict import StartupPredictor

from database.company_repository import (
    find_company_by_name,
    create_company,
)

from database.prediction_repository import (
    save_prediction,
    get_prediction_history,
)


# ==========================================================
# Page Configuration
# ==========================================================

st.set_page_config(
    page_title="Smart Wafer Demand Prediction",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ==========================================================
# Session State
# ==========================================================

if "startup_loaded" not in st.session_state:
    st.session_state.startup_loaded = False

if "startup_is_existing" not in st.session_state:
    st.session_state.startup_is_existing = False

if "startup_data" not in st.session_state:
    st.session_state.startup_data = None

if "startup_company_id" not in st.session_state:
    st.session_state.startup_company_id = None

if "startup_name_search" not in st.session_state:
    st.session_state.startup_name_search = ""

if "startup_prediction" not in st.session_state:
    st.session_state.startup_prediction = None


# ==========================================================
# Styling
# ==========================================================

st.markdown(
    """
    <style>

    .main-title {
        font-size: 38px;
        font-weight: 700;
        margin-bottom: 5px;
    }

    .sub-title {
        font-size: 17px;
        color: #777;
        margin-bottom: 25px;
    }

    .company-card {
        padding: 18px;
        border-radius: 12px;
        border: 1px solid #ddd;
        margin-bottom: 20px;
    }

    .id-box {
        font-size: 24px;
        font-weight: 700;
    }

    </style>
    """,
    unsafe_allow_html=True,
)


# ==========================================================
# Helper
# ==========================================================

def safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def clear_startup_state():
    st.session_state.startup_loaded = False
    st.session_state.startup_is_existing = False
    st.session_state.startup_data = None
    st.session_state.startup_company_id = None
    st.session_state.startup_prediction = None


# ==========================================================
# Startup Database Search
# ==========================================================

def load_existing_startup(company_name):
    """
    Search the companies database.

    Returns:
        company dictionary or None
    """

    if not company_name:
        return None

    try:
        company = find_company_by_name(company_name.strip())

        if company and company.get("company_type") == "Startup":
            return company

    except Exception as e:
        st.error(f"Database error: {e}")

    return None


# ==========================================================
# Startup Page
# ==========================================================

def startup_prediction_page():

    st.markdown(
        '<div class="main-title">🚀 Startup Company Prediction</div>',
        unsafe_allow_html=True,
    )

    st.markdown(
        '<div class="sub-title">'
        "Predict wafer demand for semiconductor startups using the hybrid AI + business engine."
        "</div>",
        unsafe_allow_html=True,
    )

    # ======================================================
    # STEP 1 — Startup Name
    # ======================================================

    st.subheader("1. Enter Startup Company")

    company_name = st.text_input(
        "Startup Company Name",
        value=st.session_state.startup_name_search,
        placeholder="Enter startup name",
        key="startup_name_input",
    )

    col1, col2 = st.columns([1, 1])

    with col1:

        load_button = st.button(
            "🔎 Load Startup",
            type="primary",
            width="stretch",
        )

    with col2:

        new_button = st.button(
            "➕ Enter New Startup",
            width="stretch",
        )

    # ======================================================
    # LOAD STARTUP
    # ======================================================

    if load_button:

        if not company_name.strip():

            st.warning("Please enter a startup company name.")

        else:

            existing = load_existing_startup(company_name)

            if existing:

                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = True
                st.session_state.startup_data = existing
                st.session_state.startup_company_id = existing.get(
                    "company_id"
                )
                st.session_state.startup_name_search = company_name

                st.success(
                    f"Existing startup found — "
                    f"{existing.get('company_id', 'N/A')}"
                )

            else:

                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = False
                st.session_state.startup_data = None
                st.session_state.startup_company_id = None
                st.session_state.startup_name_search = company_name

                st.info(
                    "This is a new startup. Please enter the required details below."
                )

    # ======================================================
    # NEW STARTUP BUTTON
    # ======================================================

    if new_button:

        if not company_name.strip():

            st.warning("Please enter the startup company name first.")

        else:

            existing = load_existing_startup(company_name)

            if existing:

                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = True
                st.session_state.startup_data = existing
                st.session_state.startup_company_id = existing.get(
                    "company_id"
                )

                st.warning(
                    f"This startup already exists as "
                    f"{existing.get('company_id', 'N/A')}. "
                    "Its existing data has been loaded."
                )

            else:

                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = False
                st.session_state.startup_data = None
                st.session_state.startup_company_id = None

                st.info(
                    "New startup. Please enter the startup details."
                )

    # ======================================================
    # Don't show form until name has been processed
    # ======================================================

    if not st.session_state.startup_loaded:
        st.info(
            "Enter a startup name above and click **Load Startup**."
        )
        return

    existing = st.session_state.startup_is_existing
    loaded = st.session_state.startup_data

    # ======================================================
    # COMPANY INFORMATION
    # ======================================================

    st.divider()

    st.subheader("2. Startup Information")

    if existing and loaded:

        company_id = loaded.get("company_id", "N/A")

        st.markdown(
            f"""
            <div class="company-card">
                <div>Startup Company</div>
                <div class="id-box">
                    {loaded.get("company_name", company_name)}
                </div>
                <br>
                <div>Startup ID</div>
                <div class="id-box">
                    {company_id}
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # ----------------------------------------------
        # Existing startup values
        # ----------------------------------------------

        loaded_country = loaded.get("country", "IND")
        loaded_fab_type = loaded.get("fab_type", "logic_leading")
        loaded_segment = loaded.get("segment", "AI / HPC")

    else:

        st.info(
            "🆕 New startup — the Startup ID will be generated "
            "automatically when the startup is saved."
        )

        loaded_country = "IND"
        loaded_fab_type = "logic_leading"
        loaded_segment = "AI / HPC"

    # ======================================================
    # BASIC DETAILS
    # ======================================================

    col1, col2, col3 = st.columns(3)

    with col1:

        startup_company = st.text_input(
            "Startup Name",
            value=(
                loaded.get("company_name", company_name)
                if existing and loaded
                else company_name
            ),
            disabled=existing,
        )

    with col2:

        # EXACT COUNTRY LIST REQUESTED
        country = st.selectbox(
            "Country",
            [
                "IND",
                "USA",
                "TWN",
                "KOR",
                "CHN"
            ],
            index=(
                [
                    "IND",
                    "USA",
                    "TWN",
                    "KOR",
                    "CHN"
                ].index(loaded_country)
                if loaded_country in
                [
                    "IND",
                    "USA",
                    "TWN",
                    "KOR",
                    "CHN"
                ]
                else 0
            ),
        )

    with col3:

        fab_type_options = [
            "logic_leading",
            "logic_mature",
            "memory",
            "analog",
            "power",
            "specialty",
            "other",
        ]

        fab_index = (
            fab_type_options.index(loaded_fab_type)
            if loaded_fab_type in fab_type_options
            else 0
        )

        fab_type = st.selectbox(
            "Fab Type",
            fab_type_options,
            index=fab_index,
        )

    # ======================================================
    # SEGMENT
    # ======================================================

    segment_options = [
        "AI / HPC",
        "AI",
        "HPC",
        "Automotive",
        "Mobile",
        "Consumer",
        "Industrial",
        "Networking",
        "Other",
    ]

    segment_index = (
        segment_options.index(loaded_segment)
        if loaded_segment in segment_options
        else 0
    )

    segment = st.selectbox(
        "Market Segment",
        segment_options,
        index=segment_index,
    )

    # ======================================================
    # BUSINESS INPUTS
    # ======================================================

    st.subheader("Business & Financial Inputs")

    col1, col2, col3 = st.columns(3)

    with col1:

        year = st.number_input(
            "Year",
            min_value=2020,
            max_value=2100,
            value=safe_int(
                loaded.get("year", datetime.now().year)
                if existing and loaded
                else datetime.now().year,
                datetime.now().year,
            ),
            step=1,
        )

    with col2:

        process_node = st.number_input(
            "Process Node (nm)",
            min_value=1,
            max_value=500,
            value=safe_int(
                loaded.get("process_node_nm", 5)
                if existing and loaded
                else 5,
                5,
            ),
            step=1,
        )

    with col3:

        expected_revenue = st.number_input(
            "Expected Annual Revenue (B$)",
            min_value=0.0,
            value=safe_float(
                loaded.get("expected_revenue", 0.1)
                if existing and loaded
                else 0.1,
                0.1,
            ),
            step=0.1,
        )

    col1, col2, col3 = st.columns(3)

    with col1:

        rd_budget = st.number_input(
            "R&D Budget (B$)",
            min_value=0.0,
            value=safe_float(
                loaded.get("rd_budget", 0.05)
                if existing and loaded
                else 0.05,
                0.05,
            ),
            step=0.01,
        )

    with col2:

        capex = st.number_input(
            "CapEx (B$)",
            min_value=0.0,
            value=safe_float(
                loaded.get("capex", 0.1)
                if existing and loaded
                else 0.1,
                0.1,
            ),
            step=0.05,
        )

    with col3:

        ai_chip_launches = st.number_input(
            "AI Chip Launches",
            min_value=0,
            value=safe_int(
                loaded.get("ai_chip_launches", 1)
                if existing and loaded
                else 1,
                1,
            ),
            step=1,
        )

    # ======================================================
    # AI / MARKET INPUTS
    # ======================================================

    st.subheader("AI & Market Inputs")

    col1, col2, col3 = st.columns(3)

    with col1:

        expected_ai_shipments = st.number_input(
            "Expected AI Shipments (M units)",
            min_value=0.0,
            value=safe_float(
                loaded.get("expected_ai_shipments", 1.0)
                if existing and loaded
                else 1.0,
                1.0,
            ),
            step=0.1,
        )

    with col2:

        expected_ai_revenue = st.number_input(
            "Expected AI Revenue (B$)",
            min_value=0.0,
            value=safe_float(
                loaded.get("expected_ai_revenue", 0.1)
                if existing and loaded
                else 0.1,
                0.1,
            ),
            step=0.1,
        )

    with col3:

        worldwide_sales = st.number_input(
            "Worldwide Sales",
            min_value=0.0,
            value=safe_float(
                loaded.get("worldwide_sales", 1.0)
                if existing and loaded
                else 1.0,
                1.0,
            ),
            step=0.1,
        )

    # ======================================================
    # HARDWARE DEFAULTS
    # ======================================================

    st.subheader("Hardware Information")

    col1, col2, col3 = st.columns(3)

    with col1:

        avg_memory_gb = st.number_input(
            "Average Memory (GB)",
            min_value=0.0,
            value=safe_float(
                loaded.get("avg_memory_gb", 32)
                if existing and loaded
                else 32,
                32,
            ),
            step=1.0,
        )

    with col2:

        avg_fp16_tflops = st.number_input(
            "Average FP16 TFLOPS",
            min_value=0.0,
            value=safe_float(
                loaded.get("avg_fp16_tflops", 1000)
                if existing and loaded
                else 1000,
                1000,
            ),
            step=10.0,
        )

    with col3:

        avg_tdp = st.number_input(
            "Average TDP",
            min_value=0.0,
            value=safe_float(
                loaded.get("avg_tdp", 350)
                if existing and loaded
                else 350,
                350,
            ),
            step=10.0,
        )

    # ======================================================
    # CHIP PRICING
    # ======================================================

    st.subheader("Chip Pricing")

    col1, col2, col3 = st.columns(3)

    with col1:

        avg_chip_price = st.number_input(
            "Average Chip Price ($)",
            min_value=0.0,
            value=safe_float(
                loaded.get("avg_chip_price", 18000)
                if existing and loaded
                else 18000,
                18000,
            ),
            step=100.0,
        )

    with col2:

        highest_chip_price = st.number_input(
            "Highest Chip Price ($)",
            min_value=0.0,
            value=safe_float(
                loaded.get("highest_chip_price", 30000)
                if existing and loaded
                else 30000,
                30000,
            ),
            step=100.0,
        )

    with col3:

        lowest_chip_price = st.number_input(
            "Lowest Chip Price ($)",
            min_value=0.0,
            value=safe_float(
                loaded.get("lowest_chip_price", 8000)
                if existing and loaded
                else 8000,
                8000,
            ),
            step=100.0,
        )

    # ======================================================
    # AI SCORES
    # ======================================================

    st.subheader("AI & Innovation Scores")

    col1, col2, col3 = st.columns(3)

    with col1:

        performance_score = st.slider(
            "Performance Score",
            0,
            100,
            safe_int(
                loaded.get("performance_score", 75)
                if existing and loaded
                else 75,
                75,
            ),
        )

    with col2:

        innovation_score = st.slider(
            "Innovation Score",
            0,
            100,
            safe_int(
                loaded.get("innovation_score", 65)
                if existing and loaded
                else 65,
                65,
            ),
        )

    with col3:

        investment_score = st.slider(
            "Investment Score",
            0,
            100,
            safe_int(
                loaded.get("investment_score", 60)
                if existing and loaded
                else 60,
                60,
            ),
        )

    col1, col2, col3 = st.columns(3)

    with col1:

        ai_market_score = st.slider(
            "AI Market Score",
            0,
            100,
            safe_int(
                loaded.get("ai_market_score", 55)
                if existing and loaded
                else 55,
                55,
            ),
        )

    with col2:

        performance_per_watt = st.number_input(
            "Performance / Watt",
            min_value=0.0,
            value=safe_float(
                loaded.get("performance_per_watt", 2.2)
                if existing and loaded
                else 2.2,
                2.2,
            ),
            step=0.1,
        )

    with col3:

        price_index = st.number_input(
            "Price Index",
            min_value=0.0,
            value=safe_float(
                loaded.get("price_index", 1.0)
                if existing and loaded
                else 1.0,
                1.0,
            ),
            step=0.1,
        )

    # ======================================================
    # GEOPOLITICAL INPUTS
    # ======================================================

    st.subheader("Geopolitical & Export Risk")

    col1, col2, col3 = st.columns(3)

    with col1:

        price_volatility = st.number_input(
            "Price Volatility",
            min_value=0.0,
            value=safe_float(
                loaded.get("price_volatility", 0.20)
                if existing and loaded
                else 0.20,
                0.20,
            ),
            step=0.05,
        )

    with col2:

        export_control_events = st.number_input(
            "Export Control Events",
            min_value=0,
            value=safe_int(
                loaded.get("export_control_events", 0)
                if existing and loaded
                else 0,
                0,
            ),
            step=1,
        )

    with col3:

        avg_severity_score = st.number_input(
            "Average Severity Score",
            min_value=0.0,
            value=safe_float(
                loaded.get("avg_severity_score", 0.10)
                if existing and loaded
                else 0.10,
                0.10,
            ),
            step=0.05,
        )

    col1, col2 = st.columns(2)

    with col1:

        export_risk_score = st.number_input(
            "Export Risk Score",
            min_value=0.0,
            value=safe_float(
                loaded.get("export_risk_score", 0.10)
                if existing and loaded
                else 0.10,
                0.10,
            ),
            step=0.05,
        )

    with col2:

        geo_risk = st.number_input(
            "Geopolitical Risk",
            min_value=0.0,
            value=safe_float(
                loaded.get("geo_risk", 0.15)
                if existing and loaded
                else 0.15,
                0.15,
            ),
            step=0.05,
        )

    # ======================================================
    # BUILD INPUT DICTIONARY
    # ======================================================

    startup_inputs = {

        "company": startup_company,

        "country": country,

        "fab_type": fab_type,

        "segment": segment,

        "year": year,

        "process_node_nm": process_node,

        "expected_revenue": expected_revenue,

        "rd_budget": rd_budget,

        "capex": capex,

        "ai_chip_launches": ai_chip_launches,

        "expected_ai_shipments": expected_ai_shipments,

        "expected_ai_revenue": expected_ai_revenue,

        "worldwide_sales": worldwide_sales,

        "avg_memory_gb": avg_memory_gb,

        "avg_fp16_tflops": avg_fp16_tflops,

        "avg_tdp": avg_tdp,

        "avg_chip_price": avg_chip_price,

        "highest_chip_price": highest_chip_price,

        "lowest_chip_price": lowest_chip_price,

        "price_index": price_index,

        "price_volatility": price_volatility,

        "export_control_events": export_control_events,

        "avg_severity_score": avg_severity_score,

        "export_risk_score": export_risk_score,

        "geo_risk": geo_risk,

        "performance_score": performance_score,

        "performance_per_watt": performance_per_watt,

        "innovation_score": innovation_score,

        "investment_score": investment_score,

        "ai_market_score": ai_market_score,
    }

    # ======================================================
    # RUN PREDICTION
    # ======================================================

    st.divider()

    st.subheader("3. Run Prediction")

    predict_button = st.button(
        "🚀 Run Startup Prediction",
        type="primary",
        width="stretch",
    )

    if not predict_button:
        return

    if not startup_company.strip():

        st.error("Startup name cannot be empty.")
        return

    try:

        with st.spinner("Running Startup AI Prediction..."):

            predictor = StartupPredictor()

            details = predictor.predict_details(
                startup_inputs
            )

        st.session_state.startup_prediction = details

        # ==================================================
        # NEW STARTUP
        # ==================================================

        if not existing:

            company_data = {

                "company_name": startup_company.strip(),

                "company_type": "Startup",

                "country": country,

                "fab_type": fab_type,

                "segment": segment,

            }

            company_id = create_company(company_data)

            if not company_id:

                raise Exception(
                    "Startup prediction worked, but the company "
                    "could not be created in the database."
                )

            st.session_state.startup_company_id = company_id

            st.session_state.startup_data = {
                **company_data,
                "company_id": company_id,
            }

            st.session_state.startup_is_existing = True

            st.success(
                f"✅ New startup saved successfully — {company_id}"
            )

        else:

            company_id = st.session_state.startup_company_id

            st.info(
                f"Existing startup used — {company_id}"
            )

        # ==================================================
        # RESULT
        # ==================================================

        st.divider()

        st.subheader("4. Prediction Result")

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "Startup ID",
                st.session_state.startup_company_id
                or "N/A",
            )

        with col2:

            st.metric(
                "Predicted Demand",
                f"{details['final_prediction']:,.2f} wafers/month",
            )

        with col3:

            confidence = details.get(
                "confidence",
                0,
            )

            st.metric(
                "Confidence",
                f"{confidence}%",
            )

        st.success(
            f"Startup Stage: {details.get('startup_stage', 'N/A')}"
        )

        st.info(
            f"Investment Rating: "
            f"{details.get('investment_rating', 'N/A')}"
        )

        # ==================================================
        # Prediction Components
        # ==================================================

        st.subheader("Prediction Breakdown")

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "AI Prediction",
                f"{details['ai_prediction']:,.2f}",
            )

        with col2:

            st.metric(
                "Business Prediction",
                f"{details['business_prediction']:,.2f}",
            )

        with col3:

            st.metric(
                "Hybrid Prediction",
                f"{details['final_prediction']:,.2f}",
            )

        # ==================================================
        # Explanation
        # ==================================================

        explanation = details.get(
            "explanation"
        )

        if explanation:

            st.subheader("Prediction Explanation")

            if isinstance(explanation, list):

                for item in explanation:
                    st.write(f"• {item}")

            else:

                st.write(explanation)

        # ==================================================
        # Recommendations
        # ==================================================

        recommendations = details.get(
            "recommendations"
        )

        if recommendations:

            st.subheader("Recommendations")

            if isinstance(recommendations, list):

                for item in recommendations:
                    st.write(f"• {item}")

            else:

                st.write(recommendations)

        # ==================================================
        # Save Prediction
        # ==================================================

        prediction_name = (
            f"{startup_company.strip()} - "
            f"Startup Prediction - "
            f"{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )

        try:

            save_prediction(

                prediction_name=prediction_name,

                company_id=st.session_state.startup_company_id,

                company=startup_company.strip(),

                prediction_type="Startup Company",

                original_data=startup_inputs,

                modified_data=startup_inputs,

                predicted_wafers=details[
                    "final_prediction"
                ],

                confidence=details.get(
                    "confidence",
                    0,
                ),

                model_version="CatBoost_v1",

            )

            st.success(
                "✅ Prediction history saved successfully."
            )

        except Exception as e:

            st.warning(
                f"Prediction completed, but history could not "
                f"be saved: {e}"
            )

    except Exception as e:

        st.error("❌ Startup Prediction Failed")

        st.exception(e)


# ==========================================================
# Existing Company Page
# ==========================================================

def existing_company_page():

    st.markdown(
        '<div class="main-title">🏢 Existing Company Prediction</div>',
        unsafe_allow_html=True,
    )

    st.markdown(
        '<div class="sub-title">'
        "Load an existing semiconductor company and predict wafer demand."
        "</div>",
        unsafe_allow_html=True,
    )

    company_name = st.text_input(
        "Enter Company Name",
        placeholder="Example: NVIDIA",
    )

    if not company_name.strip():
        st.info("Enter a company name to continue.")
        return

    company = get_company(company_name)

    if company is None:

        st.error("Company not found in dataset.")
        return

    company_db = find_company_by_name(
        company["company"]
    )

    if company_db is None:

        st.error(
            "Company is not available in the company database."
        )
        return

    company_id = company_db.get(
        "company_id",
        "N/A",
    )

    st.success(
        f"Company found — {company_id}"
    )

    st.write(
        f"**Company:** {company['company']}"
    )

    st.write(
        f"**Country:** {company.get('country_iso3', 'N/A')}"
    )

    st.write(
        f"**Process Node:** "
        f"{company.get('process_node_nm', 'N/A')} nm"
    )

    st.write(
        f"**Revenue:** "
        f"{company.get('revenue_usd_bn', 'N/A')} B$"
    )

    st.write(
        f"**R&D Budget:** "
        f"{company.get('rd_spend_usd_bn', 'N/A')} B$"
    )

    st.write(
        f"**CapEx:** "
        f"{company.get('capex_usd_bn', 'N/A')} B$"
    )

    st.write(
        f"**AI Chip Launches:** "
        f"{company.get('ai_chip_launches', 'N/A')}"
    )

    st.divider()

    if st.button(
        "🚀 Run Existing Company Prediction",
        type="primary",
        width="stretch",
    ):

        try:

            prediction = predict_company(company)

            st.success("Prediction completed.")

            st.metric(
                "Predicted Demand",
                f"{prediction:,.2f} wafers/month",
            )

            st.metric(
                "Company ID",
                company_id,
            )

        except Exception as e:

            st.error(
                f"Prediction failed: {e}"
            )


# ==========================================================
# Dashboard
# ==========================================================

def dashboard_page():

    st.markdown(
        '<div class="main-title">📊 Prediction Dashboard</div>',
        unsafe_allow_html=True,
    )

    try:

        history = get_prediction_history()

        if not history:

            st.info(
                "No prediction history available."
            )
            return

        import pandas as pd

        df = pd.DataFrame(history)

        st.dataframe(
            df,
            width="stretch",
            hide_index=True,
        )

    except Exception as e:

        st.error(
            f"Unable to load dashboard: {e}"
        )


# ==========================================================
# History
# ==========================================================

def history_page():

    st.markdown(
        '<div class="main-title">📜 Prediction History</div>',
        unsafe_allow_html=True,
    )

    try:

        history = get_prediction_history()

        if not history:

            st.info(
                "No prediction history available."
            )
            return

        import pandas as pd

        df = pd.DataFrame(history)

        st.dataframe(
            df,
            width="stretch",
            hide_index=True,
        )

    except Exception as e:

        st.error(
            f"Unable to load history: {e}"
        )


# ==========================================================
# Main Navigation
# ==========================================================

def main():

    st.sidebar.title(
        "🔬 Smart Wafer"
    )

    st.sidebar.caption(
        "Demand Prediction System"
    )

    st.sidebar.divider()

    page = st.sidebar.radio(
        "Navigation",
        [
            "🏢 Existing Company",
            "🚀 Startup Company",
            "📊 Dashboard",
            "📜 Prediction History",
        ],
    )

    st.sidebar.divider()

    st.sidebar.caption(
        "AI + Business Hybrid Prediction"
    )

    # ======================================================
    # Pages
    # ======================================================

    if page == "🏢 Existing Company":

        existing_company_page()

    elif page == "🚀 Startup Company":

        startup_prediction_page()

    elif page == "📊 Dashboard":

        dashboard_page()

    elif page == "📜 Prediction History":

        history_page()


# ==========================================================
# Run
# ==========================================================

if __name__ == "__main__":
    main()