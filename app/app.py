import sys
from pathlib import Path

import streamlit as st

# ==========================================
# Add project root to Python path
# ==========================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# ==========================================
# Streamlit Page Configuration
# ==========================================

st.set_page_config(
    page_title="Smart Wafer Demand Prediction",
    page_icon="🏭",
    layout="wide"
)

# ==========================================
# Main Title
# ==========================================

st.title("🏭 Smart Wafer Demand Prediction System")

# ==========================================
# Sidebar
# ==========================================

mode = st.sidebar.radio(
    "Select Prediction Mode",
    [
        "Existing Company",
        "Startup Company"
    ]
)

# ==========================================
# Load Selected Page
# ==========================================

if mode == "Existing Company":

    from src.predict import show_existing_company
    show_existing_company()

else:

    from src.startup.startup_ui import show_startup_company
    show_startup_company()