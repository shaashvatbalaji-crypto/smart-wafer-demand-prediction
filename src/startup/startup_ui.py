"""
startup_ui.py

Startup Company Prediction UI

FLOW
----

1. User enters Startup Name.
2. User clicks "Load Startup Data".

IF EXISTING STARTUP
-------------------
- Find startup in companies table.
- Show Company ID such as ST0001.
- Load latest prediction data from prediction_history.
- Display loaded values.
- User can modify values.
- Run prediction.
- If values are unchanged:
      Do NOT save duplicate prediction.
- If values are changed:
      Ask user whether to save the new prediction.
      Yes -> save
      No  -> do not save.

IF NEW STARTUP
--------------
- Show new startup form only after name is searched.
- Ask required startup information.
- Run prediction.
- Create ST0001/ST0002/... automatically.
- Save company automatically.
- Save first prediction automatically.
"""

import streamlit as st
from copy import deepcopy
import json

from .startup_predict import StartupPredictor

from database.company_repository import (
    find_company_by_name,
)

from database.prediction_repository import (
    save_prediction,
    get_latest_prediction,
)


# ==========================================================
# PAGE CONFIG
# ==========================================================

st.set_page_config(
    page_title="Startup Company Prediction",
    page_icon="🚀",
    layout="wide"
)


# ==========================================================
# SESSION STATE INITIALIZATION
# ==========================================================

def initialize_state():

    defaults = {

        # Search
        "startup_loaded": False,
        "startup_name_search": "",

        # Company
        "startup_company": None,
        "startup_company_id": None,
        "startup_is_new": False,

        # Loaded values
        "startup_loaded_data": None,

        # Prediction
        "startup_result": None,
        "startup_prediction_generated": False,

        # Save state
        "startup_save_requested": False,
        "startup_saved": False,
        "startup_save_message": None,

        # Error
        "startup_error": None,

    }

    for key, value in defaults.items():

        if key not in st.session_state:

            st.session_state[key] = value


initialize_state()


# ==========================================================
# HELPER - SAFE NUMBER
# ==========================================================

def safe_float(value, default=0.0):

    try:
        return float(value)
    except Exception:
        return float(default)


def safe_int(value, default=0):

    try:
        return int(float(value))
    except Exception:
        return int(default)


# ==========================================================
# HELPER - GET LATEST STARTUP DATA
# ==========================================================

def get_latest_startup_data(company_id):

    """
    Get the latest prediction for the startup.

    The prediction_history table stores original_data
    and modified_data as JSON.
    """

    prediction = get_latest_prediction(company_id)

    if not prediction:

        return None

    data = prediction.get("modified_data")

    if not data:

        data = prediction.get("original_data")

    if not data:

        return None

    try:

        if isinstance(data, str):

            data = json.loads(data)

        if isinstance(data, dict):

            return data

    except Exception:

        return None

    return None


# ==========================================================
# HELPER - CLEAR PREDICTION
# ==========================================================

def clear_prediction():

    st.session_state.startup_result = None

    st.session_state.startup_prediction_generated = False

    st.session_state.startup_saved = False

    st.session_state.startup_save_requested = False

    st.session_state.startup_save_message = None


# ==========================================================
# PAGE HEADER
# ==========================================================

st.title("🚀 Startup Company Prediction")

st.caption(
    "AI-powered wafer demand prediction for semiconductor startups."
)

st.divider()


# ==========================================================
# STEP 1 - SEARCH STARTUP
# ==========================================================

st.header("1. Select Startup Company")

st.write(
    "Enter the startup name first. "
    "The system will check whether the startup already exists."
)


search_col1, search_col2 = st.columns([4, 1])


with search_col1:

    company_name_input = st.text_input(
        "Enter Startup Name",
        placeholder="Example: Latent Fabs, NeoAI Technologies",
        key="startup_name_search"
    )


with search_col2:

    st.write("")

    load_startup = st.button(
        "🔍 Load Startup Data",
        type="primary",
        width="stretch"
    )


# ==========================================================
# SEARCH / LOAD BUTTON
# ==========================================================

if load_startup:

    entered_name = company_name_input.strip()

    if not entered_name:

        st.error(
            "Please enter a startup company name."
        )

        st.session_state.startup_loaded = False

        st.stop()


    try:

        # --------------------------------------------------
        # Find company
        # --------------------------------------------------

        company = find_company_by_name(
            entered_name
        )


        # --------------------------------------------------
        # IMPORTANT
        #
        # A company with EC0001 etc. is NOT a startup.
        #
        # Only companies with company_type = Startup
        # should be treated as existing startups.
        # --------------------------------------------------

        if company:

            company_type = str(
                company.get(
                    "company_type",
                    ""
                )
            ).strip().lower()

            if company_type != "startup":

                company = None


        # ==================================================
        # EXISTING STARTUP
        # ==================================================

        if company:

            company_id = company.get(
                "company_id"
            )


            # Get latest saved prediction data

            latest_data = get_latest_startup_data(
                company_id
            )


            # ------------------------------------------------
            # If prediction history exists, use it.
            # Otherwise use company table information.
            # ------------------------------------------------

            if latest_data:

                loaded_data = deepcopy(
                    latest_data
                )

            else:

                loaded_data = {

                    "company":
                        company.get(
                            "company_name",
                            entered_name
                        ),

                    "country":
                        company.get(
                            "country",
                            "IND"
                        ),

                    "fab_type":
                        company.get(
                            "fab_type",
                            "logic_leading"
                        ),

                    "segment":
                        company.get(
                            "segment",
                            "foundry"
                        ),

                    "year":
                        2027,

                    "process_node_nm":
                        3.0,

                    "expected_revenue":
                        2.5,

                    "rd_budget":
                        0.8,

                    "capex":
                        1.5,

                    "ai_chip_launches":
                        2,

                    "expected_shipments":
                        500000,

                    "expected_ai_revenue":
                        800.0

                }


            # Make sure company name comes from database

            loaded_data["company"] = company.get(
                "company_name",
                entered_name
            )


            # ------------------------------------------------
            # Store session information
            # ------------------------------------------------

            st.session_state.startup_loaded = True

            st.session_state.startup_company = deepcopy(
                company
            )

            st.session_state.startup_company_id = (
                company_id
            )

            st.session_state.startup_is_new = False

            st.session_state.startup_loaded_data = (
                deepcopy(loaded_data)
            )

            clear_prediction()


            st.success(
                f"Existing startup found — Company ID: {company_id}"
            )


        # ==================================================
        # NEW STARTUP
        # ==================================================

        else:

            new_data = {

                "company":
                    entered_name,

                "country":
                    "IND",

                "fab_type":
                    "logic_leading",

                "segment":
                    "foundry",

                "year":
                    2027,

                "process_node_nm":
                    3.0,

                "expected_revenue":
                    2.5,

                "rd_budget":
                    0.8,

                "capex":
                    1.5,

                "ai_chip_launches":
                    2,

                "expected_shipments":
                    500000,

                "expected_ai_revenue":
                    800.0

            }


            st.session_state.startup_loaded = True

            st.session_state.startup_company = None

            st.session_state.startup_company_id = None

            st.session_state.startup_is_new = True

            st.session_state.startup_loaded_data = (
                deepcopy(new_data)
            )

            clear_prediction()


            st.info(
                f"'{entered_name}' is a new startup. "
                "Please enter the required startup information below."
            )


        # Force clean display

        st.rerun()


    except Exception as e:

        st.error(
            f"Unable to load startup data: {e}"
        )

        st.session_state.startup_loaded = False

        st.stop()


# ==========================================================
# STOP UNTIL STARTUP IS SEARCHED
# ==========================================================

if not st.session_state.startup_loaded:

    st.info(
        "Enter a startup name above and click "
        "'Load Startup Data' to continue."
    )

    st.stop()


# ==========================================================
# CURRENT STARTUP INFORMATION
# ==========================================================

company = st.session_state.startup_company

company_id = st.session_state.startup_company_id

is_new = st.session_state.startup_is_new

loaded = st.session_state.startup_loaded_data


# ==========================================================
# EXISTING STARTUP HEADER
# ==========================================================

if not is_new:

    st.header("2. Startup Information")

    info1, info2, info3 = st.columns(3)

    with info1:

        st.caption("Startup Company")

        st.markdown(
            f"### {company.get('company_name', loaded['company'])}"
        )

    with info2:

        st.caption("Company ID")

        st.markdown(
            f"### {company_id}"
        )

    with info3:

        st.caption("Company Type")

        st.markdown(
            "### Startup"
        )

    st.success(
        "Startup data loaded from the database. "
        "You can modify the prediction inputs below."
    )

else:

    st.header("2. New Startup Information")

    st.warning(
        "This is a new startup. "
        "Complete the required information below. "
        "A new Company ID such as ST0001 will be created automatically."
    )


# ==========================================================
# STARTUP INPUT FORM
# ==========================================================

st.subheader("Startup Prediction Inputs")


# ----------------------------------------------------------
# Use loaded values
# ----------------------------------------------------------

default_company = loaded.get(
    "company",
    st.session_state.startup_name_search
)

default_country = loaded.get(
    "country",
    "IND"
)

default_fab_type = loaded.get(
    "fab_type",
    "logic_leading"
)

default_segment = loaded.get(
    "segment",
    "foundry"
)

default_year = safe_int(
    loaded.get(
        "year",
        2027
    ),
    2027
)

default_node = safe_float(
    loaded.get(
        "process_node_nm",
        3.0
    ),
    3.0
)

default_revenue = safe_float(
    loaded.get(
        "expected_revenue",
        2.5
    ),
    2.5
)

default_rd = safe_float(
    loaded.get(
        "rd_budget",
        0.8
    ),
    0.8
)

default_capex = safe_float(
    loaded.get(
        "capex",
        1.5
    ),
    1.5
)

default_launches = safe_int(
    loaded.get(
        "ai_chip_launches",
        2
    ),
    2
)

default_shipments = safe_int(
    loaded.get(
        "expected_shipments",
        500000
    ),
    500000
)

default_ai_revenue = safe_float(
    loaded.get(
        "expected_ai_revenue",
        800.0
    ),
    800.0
)


# ==========================================================
# INPUT FORM
# ==========================================================

with st.form(
    "startup_prediction_form"
):

    left, right = st.columns(2)


    # ======================================================
    # LEFT
    # ======================================================

    with left:

        startup_name = st.text_input(
            "Startup Name",
            value=default_company,
            disabled=True
        )


        country_options = [
            "IND",
            "USA",
            "TWN",
            "KOR",
            "CHN"
        ]

        if default_country not in country_options:

            country_options.append(
                default_country
            )

        country = st.selectbox(
            "Country",
            country_options,
            index=country_options.index(
                default_country
            )
        )


        fab_options = [
            "logic_leading",
            "logic_mature",
            "memory_DRAM",
            "memory_NAND"
        ]

        if default_fab_type not in fab_options:

            fab_options.append(
                default_fab_type
            )

        fab_type = st.selectbox(
            "Fab Type",
            fab_options,
            index=fab_options.index(
                default_fab_type
            )
        )


        segment_options = [
            "foundry",
            "idm_logic",
            "idm_memory"
        ]

        if default_segment not in segment_options:

            segment_options.append(
                default_segment
            )

        segment = st.selectbox(
            "Segment",
            segment_options,
            index=segment_options.index(
                default_segment
            )
        )


        year = st.number_input(
            "Year",
            min_value=2024,
            max_value=2035,
            value=max(
                2024,
                min(
                    2035,
                    default_year
                )
            ),
            step=1
        )


        process_node_nm = st.number_input(
            "Process Node (nm)",
            min_value=1.0,
            max_value=100.0,
            value=max(
                1.0,
                min(
                    100.0,
                    default_node
                )
            ),
            step=0.5,
            format="%.2f"
        )


    # ======================================================
    # RIGHT
    # ======================================================

    with right:

        expected_revenue = st.number_input(
            "Expected Annual Revenue (USD Billion)",
            min_value=0.0,
            value=max(
                0.0,
                default_revenue
            ),
            step=0.1,
            format="%.2f"
        )


        rd_budget = st.number_input(
            "R&D Budget (USD Billion)",
            min_value=0.0,
            value=max(
                0.0,
                default_rd
            ),
            step=0.1,
            format="%.2f"
        )


        capex = st.number_input(
            "CapEx (USD Billion)",
            min_value=0.0,
            value=max(
                0.0,
                default_capex
            ),
            step=0.1,
            format="%.2f"
        )


        ai_chip_launches = st.number_input(
            "AI Chip Launches",
            min_value=1,
            value=max(
                1,
                default_launches
            ),
            step=1
        )


        expected_shipments = st.number_input(
            "Expected AI Shipments",
            min_value=1,
            value=max(
                1,
                default_shipments
            ),
            step=1000
        )


        expected_ai_revenue = st.number_input(
            "Expected AI Revenue (Million USD)",
            min_value=0.0,
            value=max(
                0.0,
                default_ai_revenue
            ),
            step=10.0,
            format="%.2f"
        )


    st.divider()


    run_prediction = st.form_submit_button(
        "🚀 Run Startup Prediction",
        type="primary",
        width="stretch"
    )


# ==========================================================
# RUN PREDICTION
# ==========================================================

if run_prediction:

    # ------------------------------------------------------
    # Build input dictionary
    # ------------------------------------------------------

    startup_inputs = {

        "company":
            startup_name.strip(),

        "country":
            country.strip().upper(),

        "fab_type":
            fab_type.strip(),

        "segment":
            segment.strip(),

        "year":
            int(year),

        "process_node_nm":
            float(process_node_nm),

        "expected_revenue":
            float(expected_revenue),

        "rd_budget":
            float(rd_budget),

        "capex":
            float(capex),

        "ai_chip_launches":
            int(ai_chip_launches),

        "expected_shipments":
            int(expected_shipments),

        "expected_ai_revenue":
            float(expected_ai_revenue)

    }


    try:

        # ==================================================
        # PREDICTION
        # ==================================================

        with st.spinner(
            "Loading AI Prediction Engine..."
        ):

            predictor = StartupPredictor()


        with st.spinner(
            "Running Hybrid Startup Prediction..."
        ):

            result = predictor.predict_details(
                startup_inputs
            )


        # --------------------------------------------------
        # Store result
        # --------------------------------------------------

        st.session_state.startup_result = (
            deepcopy(result)
        )

        st.session_state.startup_prediction_generated = True

        st.session_state.startup_save_requested = False

        st.session_state.startup_saved = False

        st.session_state.startup_save_message = None


        # ==================================================
        # NEW STARTUP
        # ==================================================

        if is_new:

            # ------------------------------------------------
            # Create startup company
            #
            # get_or_create_company is imported here so
            # existing code in company_service.py remains used.
            # ------------------------------------------------

            from src.services.company_service import (
                get_or_create_company
            )


            with st.spinner(
                "Registering new startup..."
            ):

                company_record = get_or_create_company(
                    startup_inputs
                )


            if not company_record:

                raise Exception(
                    "Unable to create the startup company."
                )


            new_company_id = company_record.get(
                "company_id"
            )


            if not new_company_id:

                raise Exception(
                    "Startup Company ID was not generated."
                )


            # ------------------------------------------------
            # Store company
            # ------------------------------------------------

            st.session_state.startup_company = (
                deepcopy(company_record)
            )

            st.session_state.startup_company_id = (
                new_company_id
            )

            st.session_state.startup_is_new = False


            # ------------------------------------------------
            # Automatically save first prediction
            # ------------------------------------------------

            with st.spinner(
                "Saving new startup prediction..."
            ):

                save_prediction(

                    prediction_name=(
                        f"{startup_inputs['company']} "
                        f"Startup Prediction"
                    ),

                    company_id=new_company_id,

                    company=startup_inputs[
                        "company"
                    ],

                    prediction_type="Startup",

                    original_data=deepcopy(
                        startup_inputs
                    ),

                    modified_data=deepcopy(
                        startup_inputs
                    ),

                    predicted_wafers=float(
                        result[
                            "final_prediction"
                        ]
                    ),

                    confidence=float(
                        result[
                            "confidence"
                        ]
                    ),

                    model_version=(
                        "Startup Hybrid CatBoost v1.0"
                    )
                )


            st.session_state.startup_saved = True

            st.session_state.startup_save_message = (
                "New startup and first prediction "
                f"saved successfully. Company ID: {new_company_id}"
            )


            # ------------------------------------------------
            # Update loaded data
            # ------------------------------------------------

            st.session_state.startup_loaded_data = (
                deepcopy(startup_inputs)
            )


        # ==================================================
        # EXISTING STARTUP
        # ==================================================

        else:

            # ------------------------------------------------
            # Compare current values with originally loaded data
            # ------------------------------------------------

            original_data = (
                st.session_state.startup_loaded_data
            )


            # Only compare prediction-related values.
            #
            # Company name is already fixed.
            # ------------------------------------------------

            comparison_keys = [

                "country",
                "fab_type",
                "segment",
                "year",
                "process_node_nm",
                "expected_revenue",
                "rd_budget",
                "capex",
                "ai_chip_launches",
                "expected_shipments",
                "expected_ai_revenue"

            ]


            changed = False


            for key in comparison_keys:

                old_value = original_data.get(
                    key
                )

                new_value = startup_inputs.get(
                    key
                )


                try:

                    if float(old_value) != float(new_value):

                        changed = True

                except Exception:

                    if str(old_value) != str(new_value):

                        changed = True


                if changed:

                    break


            # ------------------------------------------------
            # UNCHANGED
            # ------------------------------------------------

            if not changed:

                st.session_state.startup_save_message = (
                    "Prediction generated successfully. "
                    "No values were changed, so the existing "
                    "prediction was not saved again."
                )


            # ------------------------------------------------
            # CHANGED
            # ------------------------------------------------

            else:

                st.session_state.startup_save_requested = True

                st.session_state.startup_pending_inputs = (
                    deepcopy(startup_inputs)
                )


        st.rerun()


    except Exception as e:

        st.session_state.startup_error = str(e)

        st.error(
            f"Startup prediction failed: {e}"
        )


# ==========================================================
# DISPLAY ERROR
# ==========================================================

if st.session_state.startup_error:

    st.error(
        st.session_state.startup_error
    )

    st.session_state.startup_error = None


# ==========================================================
# SAVE QUESTION FOR MODIFIED EXISTING STARTUP
# ==========================================================

if (
    st.session_state.get(
        "startup_save_requested",
        False
    )
    and not st.session_state.get(
        "startup_saved",
        False
    )
):

    st.warning(
        "The startup already exists, but you changed one or more "
        "prediction inputs."
    )

    st.write(
        "Do you want to save this new prediction to prediction history?"
    )


    save_col1, save_col2 = st.columns(2)


    with save_col1:

        save_new_prediction = st.button(
            "✅ Yes, Save New Prediction",
            type="primary",
            width="stretch"
        )


    with save_col2:

        dont_save_prediction = st.button(
            "❌ No, Don't Save",
            width="stretch"
        )


    # ------------------------------------------------------
    # YES
    # ------------------------------------------------------

    if save_new_prediction:

        try:

            pending = (
                st.session_state.startup_pending_inputs
            )

            result = (
                st.session_state.startup_result
            )

            company_id = (
                st.session_state.startup_company_id
            )


            save_prediction(

                prediction_name=(
                    f"{pending['company']} "
                    f"Startup Prediction"
                ),

                company_id=company_id,

                company=pending[
                    "company"
                ],

                prediction_type="Startup",

                original_data=deepcopy(
                    st.session_state.startup_loaded_data
                ),

                modified_data=deepcopy(
                    pending
                ),

                predicted_wafers=float(
                    result[
                        "final_prediction"
                    ]
                ),

                confidence=float(
                    result[
                        "confidence"
                    ]
                ),

                model_version=(
                    "Startup Hybrid CatBoost v1.0"
                )
            )


            # ------------------------------------------------
            # Update loaded state
            # ------------------------------------------------

            st.session_state.startup_loaded_data = (
                deepcopy(pending)
            )

            st.session_state.startup_saved = True

            st.session_state.startup_save_requested = False

            st.session_state.startup_save_message = (
                "New prediction saved successfully."
            )

            st.session_state.startup_pending_inputs = None

            st.rerun()


        except Exception as e:

            st.error(
                f"Unable to save prediction: {e}"
            )


    # ------------------------------------------------------
    # NO
    # ------------------------------------------------------

    if dont_save_prediction:

        st.session_state.startup_save_requested = False

        st.session_state.startup_saved = False

        st.session_state.startup_pending_inputs = None

        st.session_state.startup_save_message = (
            "New prediction was not saved."
        )

        st.rerun()


# ==========================================================
# SAVE MESSAGE
# ==========================================================

if st.session_state.startup_save_message:

    st.info(
        st.session_state.startup_save_message
    )


# ==========================================================
# PREDICTION RESULT
# ==========================================================

if st.session_state.startup_result is not None:

    result = st.session_state.startup_result

    st.divider()

    st.header("3. Prediction Result")


    # ------------------------------------------------------
    # Company ID
    # ------------------------------------------------------

    result_col1, result_col2, result_col3, result_col4 = (
        st.columns(4)
    )


    with result_col1:

        st.caption("Company ID")

        display_id = (
            st.session_state.startup_company_id
        )

        if display_id:

            st.markdown(
                f"### {display_id}"
            )

        else:

            st.markdown(
                "### Pending"
            )


    with result_col2:

        st.caption("Monthly Wafer Demand")

        st.markdown(
            f"### {result['final_prediction']:,.2f}"
        )

        st.caption(
            "wafers / month"
        )


    with result_col3:

        st.caption("Confidence")

        st.markdown(
            f"### {result['confidence']}%"
        )


    with result_col4:

        st.caption("Startup Stage")

        st.markdown(
            f"### {result['startup_stage']}"
        )


    # ======================================================
    # HYBRID BREAKDOWN
    # ======================================================

    st.subheader(
        "4. Hybrid Prediction Breakdown"
    )


    breakdown1, breakdown2 = st.columns(2)


    with breakdown1:

        st.caption("AI Prediction")

        st.markdown(
            f"### {result['ai_prediction']:,.2f}"
        )

        st.caption(
            "Machine learning estimate"
        )


    with breakdown2:

        st.caption("Business Prediction")

        st.markdown(
            f"### {result['business_prediction']:,.2f}"
        )

        st.caption(
            "Business-rule estimate"
        )


    # ======================================================
    # INVESTMENT RATING
    # ======================================================

    st.subheader(
        "5. Startup Assessment"
    )


    rating_col1, rating_col2 = st.columns(2)


    with rating_col1:

        st.caption("Investment Rating")

        st.markdown(
            f"### {result['investment_rating']}"
        )


    with rating_col2:

        st.caption("Company ID")

        st.markdown(
            f"### {st.session_state.startup_company_id}"
        )


    # ======================================================
    # EXPLANATION
    # ======================================================

    if result.get("explanation"):

        st.subheader(
            "6. Prediction Explanation"
        )

        for reason in result["explanation"]:

            st.write(
                f"• {reason}"
            )


    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    if result.get("recommendations"):

        st.subheader(
            "7. Recommendations"
        )

        for recommendation in result[
            "recommendations"
        ]:

            st.write(
                f"• {recommendation}"
            )