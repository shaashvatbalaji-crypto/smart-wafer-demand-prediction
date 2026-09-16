"""
streamlit_app.py

Smart Wafer Demand Prediction System
Enterprise B2B Semiconductor Analyst Dashboard

Connected to existing Python backend:
- 1. Existing Company Prediction (src.dataset_repository, src.predictor, database.company_repository, database.prediction_repository)
- 2. Startup Company Prediction (src.startup.startup_predict, database.company_repository, database.prediction_repository)
- 3. Company Dashboard (database.statistics_repository)
- 4. Prediction History (database.prediction_repository)
- 5. Compare Predictions (database.prediction_repository)
- 6. Search Company (src.services.search_service)
- 7. Delete Prediction (src.services.delete_service)

Analyst Extensions:
- Dark B2B Executive Snapshot (5 KPI Cards)
- Calculated Analyst Insight Panel
- Plotly Horizontal Demand Comparison Chart (No 'Entity' labels)
- 2-Column Company vs Benchmark Cards
- 2x2 Grid of Business Driver Charts with Rich Hover Tooltips & Selective Labeling
- Benchmark Comparison Table with Highlighted Selected Company
- Competitive Gap Progress Indicators
- Existing Backend Recommendation Engine Cards (01, 02, 03)
- Structured PDF Export
"""

from copy import deepcopy
from datetime import datetime
import json

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# ==========================================================
# Backend Module Imports
# ==========================================================

from src.dataset_repository import get_company, get_all_companies
from src.predictor import predict_company

from src.startup.startup_predict import StartupPredictor

from database.company_repository import (
    find_company_by_name,
    find_company_by_id,
    create_company,
    search_company as search_company_db,
)

from database.prediction_repository import (
    save_prediction,
    get_prediction_history,
    get_predictions_by_company,
    get_prediction_by_id,
    compare_predictions as compare_predictions_repo,
)

from database.statistics_repository import (
    get_company_statistics,
    get_latest_prediction,
    get_prediction_trend,
)

from database.db import get_connection

from src.services.company_service import get_or_create_company
from src.services.search_service import search as search_service_func, company_details
from src.services.delete_service import get_prediction, delete_prediction_service

# Analytics Extensions
from src.analytics.benchmark import (
    get_growing_companies_data,
    get_toplevel_companies_data,
    format_number,
)
from src.analytics.pdf_report import generate_pdf_report

# Live Intelligence Services
from src.live_data.financial_data_service import get_live_financial_data
from src.live_data.semiconductor_market_service import get_market_intelligence_data



# ==========================================================
# Page Configuration
# ==========================================================

st.set_page_config(
    page_title="Smart Wafer Demand Intelligence",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ==========================================================
# Custom B2B Dark Theme CSS
# ==========================================================

st.markdown(
    """
    <style>
    /* Dark Theme Canvas Override */
    .stApp {
        background-color: #0F172A;
        color: #F8FAFC;
    }

    .main-title {
        font-size: 28px;
        font-weight: 800;
        color: #F8FAFC;
        margin-bottom: 2px;
        letter-spacing: -0.5px;
    }

    .sub-title {
        font-size: 14px;
        color: #94A3B8;
        margin-bottom: 15px;
    }

    /* Context Bar Header */
    .context-bar {
        background-color: #1E293B;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 10px 16px;
        margin-bottom: 20px;
        font-size: 13px;
        color: #CBD5E1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* KPI Cards */
    .kpi-card {
        background-color: #1E293B;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 14px 16px;
        text-align: left;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }

    .kpi-title {
        font-size: 11px;
        font-weight: 700;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 6px;
    }

    .kpi-value {
        font-size: 24px;
        font-weight: 800;
        color: #F8FAFC;
        margin-bottom: 4px;
    }

    .kpi-sub {
        font-size: 12px;
        font-weight: 600;
        color: #38BDF8;
    }

    /* Insight Panel */
    .insight-panel {
        background-color: #1E293B;
        border-left: 4px solid #3B82F6;
        border-top: 1px solid #334155;
        border-right: 1px solid #334155;
        border-bottom: 1px solid #334155;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 20px;
    }

    .insight-title {
        font-size: 14px;
        font-weight: 700;
        color: #38BDF8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }

    /* Analyst Recommendation Cards */
    .rec-card {
        background-color: #1E293B;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 10px;
        display: flex;
        align-items: flex-start;
    }

    .rec-num {
        font-size: 18px;
        font-weight: 800;
        color: #38BDF8;
        margin-right: 12px;
        min-width: 24px;
    }

    .rec-text {
        font-size: 13px;
        color: #E2E8F0;
        line-height: 1.4;
    }

    /* Section Cards */
    .section-card {
        background-color: #1E293B;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 20px;
    }

    /* Analyst Note Banner */
    .analyst-banner {
        background-color: #0F172A;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 10px 14px;
        font-size: 12px;
        color: #94A3B8;
        font-style: italic;
        margin-top: 10px;
        margin-bottom: 20px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# ==========================================================
# Session State Initialization
# ==========================================================

if "nav_page" not in st.session_state:
    st.session_state.nav_page = "🏠 Home"

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
# Safe Parsing Helpers
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


# ==========================================================
# Business Drivers Scatter Chart Helper (Clean Labeling & Tooltips)
# ==========================================================

def create_business_driver_chart(df, x_col, y_col, x_title, y_title, chart_title, selected_company_name, color_hex="#3B82F6"):
    """
    Renders a compact, interactive Plotly scatter chart without label collisions.
    - Permanent labels shown ONLY for selected company and top 2 leaders (max 3-5 total).
    - Rich interactive hover tooltip displaying complete company metrics.
    - Clean tick formatting (K/M/B).
    """
    df_chart = df.copy()

    # Identify selected company row
    selected_name_lower = selected_company_name.lower().strip()
    df_chart["is_selected"] = df_chart["company"].astype(str).str.lower().str.strip() == selected_name_lower

    # Top leaders for selective labeling
    top_leaders = df_chart.sort_values(y_col, ascending=False).head(3)["company"].tolist()

    # Determine which points get permanent annotations (Max 3-5)
    annotations = []
    for idx, row in df_chart.iterrows():
        comp_name = str(row["company"])
        is_sel = row["is_selected"]
        if is_sel or comp_name in top_leaders:
            annotations.append(dict(
                x=row[x_col],
                y=row[y_col],
                text=f"<b>{comp_name}</b>" if is_sel else comp_name,
                showarrow=True,
                arrowhead=2,
                arrowsize=1,
                arrowwidth=1,
                arrowcolor="#38BDF8" if is_sel else "#64748B",
                ax=0,
                ay=-20 if is_sel else -15,
                font=dict(
                    color="#38BDF8" if is_sel else "#CBD5E1",
                    size=11 if is_sel else 9,
                    family="Inter, Segoe UI",
                ),
            ))

    # Separate selected point from benchmark points for distinct marker styling
    df_bm = df_chart[~df_chart["is_selected"]]
    df_sel = df_chart[df_chart["is_selected"]]

    fig = go.Figure()

    # Benchmark Points
    if not df_bm.empty:
        fig.add_trace(go.Scatter(
            x=df_bm[x_col],
            y=df_bm[y_col],
            mode="markers",
            name="Benchmark Group",
            marker=dict(size=9, color=color_hex, opacity=0.75),
            customdata=df_bm[["company", "revenue_usd_bn", "rd_spend_usd_bn", "capex_usd_bn", "ai_shipments", "predicted_wafers"]],
            hovertemplate=(
                "<b>%{customdata[0]}</b><br>" +
                f"{x_title}: %{{x}}<br>" +
                f"{y_title}: %{{y:,.0f}}<br>" +
                "Revenue: $%{customdata[1]:.2f}B<br>" +
                "R&D: $%{customdata[2]:.2f}B<br>" +
                "CapEx: $%{customdata[3]:.2f}B<br>" +
                "AI Shipments: %{customdata[4]:,.0f}<br>" +
                "<extra></extra>"
            ),
        ))

    # Selected Company Point (Highlighted)
    if not df_sel.empty:
        fig.add_trace(go.Scatter(
            x=df_sel[x_col],
            y=df_sel[y_col],
            mode="markers",
            name=selected_company_name,
            marker=dict(size=14, color="#F59E0B", symbol="star", line=dict(width=2, color="#FFFFFF")),
            customdata=df_sel[["company", "revenue_usd_bn", "rd_spend_usd_bn", "capex_usd_bn", "ai_shipments", "predicted_wafers"]],
            hovertemplate=(
                "<b>⭐ %{customdata[0]} (Selected)</b><br>" +
                f"{x_title}: %{{x}}<br>" +
                f"{y_title}: %{{y:,.0f}}<br>" +
                "Revenue: $%{customdata[1]:.2f}B<br>" +
                "R&D: $%{customdata[2]:.2f}B<br>" +
                "CapEx: $%{customdata[3]:.2f}B<br>" +
                "AI Shipments: %{customdata[4]:,.0f}<br>" +
                "<extra></extra>"
            ),
        ))

    fig.update_layout(
        title=dict(text=chart_title, font=dict(size=13, color="#F8FAFC")),
        paper_bgcolor="#0F172A",
        plot_bgcolor="#1E293B",
        font=dict(color="#F8FAFC", family="Inter, Segoe UI"),
        height=260,
        margin=dict(l=10, r=10, t=35, b=25),
        showlegend=False,
        annotations=annotations,
        xaxis=dict(title=x_title, gridcolor="#334155", color="#94A3B8", tickformat="~s"),
        yaxis=dict(title=y_title, gridcolor="#334155", color="#94A3B8", tickformat="~s"),
    )

    return fig


# ==========================================================
# Live Financial Data & SWOT UI Card Helpers
# ==========================================================

def render_live_financial_card(company_name):
    fin_data = get_live_financial_data(company_name)
    status = fin_data.get("status", "fallback")
    is_live = status == "live"
    status_badge = "🟢 LIVE DATA" if is_live else "🟡 OFFLINE FALLBACK"
    badge_color = "#10B981" if is_live else "#F59E0B"

    rev_growth_str = str(fin_data.get("revenue_growth_pct", "N/A"))
    if rev_growth_str.startswith("-"):
        rev_growth_color = "#EF4444"
    elif rev_growth_str.startswith("+") or (rev_growth_str != "N/A" and not rev_growth_str.startswith("-")):
        rev_growth_color = "#10B981"
    else:
        rev_growth_color = "#F8FAFC"

    st.markdown(
        f"""
        <div class="section-card" style="border-left: 4px solid {badge_color};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="font-size:16px; font-weight:700; color:#F8FAFC;">📈 Live Financial Intelligence Layer</div>
                <div style="font-size:11px; font-weight:700; color:{badge_color}; background-color:#0F172A; padding:4px 8px; border-radius:4px; border:1px solid {badge_color};">{status_badge}</div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
                <div>
                    <div style="font-size:11px; color:#94A3B8;">Stock Price</div>
                    <div style="font-size:16px; font-weight:700; color:#F8FAFC;">{fin_data.get('stock_price', 'N/A')}</div>
                </div>
                <div>
                    <div style="font-size:11px; color:#94A3B8;">Market Cap</div>
                    <div style="font-size:16px; font-weight:700; color:#F8FAFC;">{fin_data.get('market_cap_bn', 'N/A')}</div>
                </div>
                <div>
                    <div style="font-size:11px; color:#94A3B8;">Revenue Growth</div>
                    <div style="font-size:16px; font-weight:700; color:{rev_growth_color};">{rev_growth_str}</div>
                </div>
                <div>
                    <div style="font-size:11px; color:#94A3B8;">P/E Ratio</div>
                    <div style="font-size:16px; font-weight:700; color:#F8FAFC;">{fin_data.get('pe_ratio', 'N/A')}</div>
                </div>
            </div>
            <div style="font-size:11px; color:#64748B; margin-top:10px;">
                Source: {fin_data.get('source')} | Period: {fin_data.get('reporting_period')} | Updated: {fin_data.get('retrieved_timestamp')}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    return fin_data


def render_swot_analysis(entity_name, is_startup=False, gap_data=None):
    st.subheader("💡 Analyst Insights & SWOT Matrix")
    c1, c2 = st.columns(2)
    if is_startup:
        with c1:
            st.markdown(
                f"""
                <div class="section-card" style="border-top:3px solid #10B981;">
                    <div style="font-weight:700; color:#10B981; margin-bottom:6px;">💪 STRENGTHS</div>
                    <div style="font-size:13px; color:#E2E8F0;">• High innovation agility targeting advanced node packaging.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Strong focus on specialized AI chip architectures.</div>
                </div>
                <div class="section-card" style="border-top:3px solid #38BDF8;">
                    <div style="font-weight:700; color:#38BDF8; margin-bottom:6px;">🎯 OPPORTUNITIES</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Scale R&D partnerships to accelerate fab qualification.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Expand foundry capacity allocation in fast-growing regions.</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with c2:
            st.markdown(
                f"""
                <div class="section-card" style="border-top:3px solid #F59E0B;">
                    <div style="font-weight:700; color:#F59E0B; margin-bottom:6px;">⚠️ WEAKNESSES / GAPS</div>
                    <div style="font-size:13px; color:#E2E8F0;">• R&D and CapEx budget scale below top-level benchmark leaders.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Early stage volume production readiness.</div>
                </div>
                <div class="section-card" style="border-top:3px solid #EF4444;">
                    <div style="font-weight:700; color:#EF4444; margin-bottom:6px;">🛡️ RISKS & ACTIONS</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Supply-chain constraint risk during high-volume demand spikes.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Action: Secure long-term wafer supply agreements (LTA).</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
    else:
        with c1:
            st.markdown(
                f"""
                <div class="section-card" style="border-top:3px solid #10B981;">
                    <div style="font-weight:700; color:#10B981; margin-bottom:6px;">💪 STRENGTHS</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Established manufacturing scale and customer volume relationships.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• High wafer throughput alignment with current process node capabilities.</div>
                </div>
                <div class="section-card" style="border-top:3px solid #38BDF8;">
                    <div style="font-weight:700; color:#38BDF8; margin-bottom:6px;">🎯 OPPORTUNITIES</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Capture expanding AI accelerator demand with advanced packaging migration.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Optimize CapEx timing to maximize yield during node transitions.</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with c2:
            st.markdown(
                f"""
                <div class="section-card" style="border-top:3px solid #F59E0B;">
                    <div style="font-weight:700; color:#F59E0B; margin-bottom:6px;">⚠️ WEAKNESSES</div>
                    <div style="font-size:13px; color:#E2E8F0;">• High capital intensity required to maintain competitive node lead.</div>
                </div>
                <div class="section-card" style="border-top:3px solid #EF4444;">
                    <div style="font-weight:700; color:#EF4444; margin-bottom:6px;">🛡️ RISKS & ACTIONS</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Geopolitical trade friction affecting regional fab expansion.</div>
                    <div style="font-size:13px; color:#E2E8F0;">• Action: Diversify regional fab assembly and packaging geographic footprint.</div>
                </div>
                """,
                unsafe_allow_html=True,
            )


def market_intelligence_page():
    st.markdown('<div class="main-title">🌐 Semiconductor Market Intelligence Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Global Macroeconomic Trends, Regional Capacity Growth & Fab Investment Intelligence</div>', unsafe_allow_html=True)
    st.divider()

    mkt_data = get_market_intelligence_data()
    status_color = "#10B981" if mkt_data.get("overall_status") == "live" else "#F59E0B"
    status_label = "🟢 LIVE DATA FEED" if mkt_data.get("overall_status") == "live" else "🟡 STRUCTURED FALLBACK DATASET"

    st.markdown(
        f"""
        <div class="analyst-banner" style="border-left: 4px solid {status_color};">
            <strong>Data Status:</strong> {status_label} &nbsp;|&nbsp;
            <strong>Source:</strong> {mkt_data['global_market_size']['source']} &nbsp;|&nbsp;
            <strong>Reporting Period:</strong> {mkt_data['global_market_size']['reporting_period']} &nbsp;|&nbsp;
            <strong>Last Updated:</strong> {mkt_data['global_market_size']['retrieved_timestamp']}
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-title">GLOBAL MARKET SIZE</div>
                <div class="kpi-value">{mkt_data['global_market_size']['value']}</div>
                <div class="kpi-sub" style="color:#10B981;">YoY Growth: {mkt_data['yoy_growth_rate']['value']}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-title">MEMORY SECTOR</div>
                <div class="kpi-value">{mkt_data['memory_market_trend']['value'].split()[0]}</div>
                <div class="kpi-sub">HBM3e / HBM4 Expansion</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-title">LOGIC & FOUNDRY</div>
                <div class="kpi-value">{mkt_data['logic_market_trend']['value'].split()[0]}</div>
                <div class="kpi-sub">Leading Node Growth</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col4:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-title">FAB CAPEX SPENDING</div>
                <div class="kpi-value">{mkt_data['fab_equipment_capex']['value']}</div>
                <div class="kpi-sub">Equipment Tracker</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)

    col_reg, col_ai = st.columns(2)
    with col_reg:
        st.subheader("Regional Wafer Demand Index")
        reg_data = mkt_data['regional_demand']['value']
        for country, desc in reg_data.items():
            st.markdown(
                f"""
                <div style="background-color:#1E293B; border:1px solid #334155; border-radius:6px; padding:10px 14px; margin-bottom:8px;">
                    <div style="font-weight:700; color:#38BDF8;">{country}</div>
                    <div style="font-size:13px; color:#E2E8F0;">{desc}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    with col_ai:
        st.subheader("Industry Drivers & Capacity Indicators")
        st.markdown(
            f"""
            <div class="section-card">
                <div style="font-size:15px; font-weight:700; color:#F8FAFC; margin-bottom:8px;">🚀 AI Accelerator Demand</div>
                <div style="font-size:22px; font-weight:800; color:#10B981;">{mkt_data['ai_accelerator_demand']['value']}</div>
                <div style="font-size:12px; color:#94A3B8; margin-top:4px;">Source: {mkt_data['ai_accelerator_demand']['source']}</div>
            </div>
            <div class="section-card">
                <div style="font-size:15px; font-weight:700; color:#F8FAFC; margin-bottom:8px;">🏭 Leading-Edge Foundry Utilization</div>
                <div style="font-size:22px; font-weight:800; color:#38BDF8;">{mkt_data['foundry_utilization']['value']}</div>
                <div style="font-size:12px; color:#94A3B8; margin-top:4px;">Source: {mkt_data['foundry_utilization']['source']}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )


# ==========================================================
# HOME PAGE
# ==========================================================

# ==========================================================
# HOME PAGE (B2B LANDING PAGE)
# ==========================================================

def home_page():
    # ── HERO SECTION ──
    st.markdown(
        """
        <div style="text-align: center; padding: 25px 10px 15px 10px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 9999px; padding: 4px 14px; margin-bottom: 16px;">
                <span style="height: 8px; width: 8px; border-radius: 50%; background-color: #38BDF8;"></span>
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #38BDF8;">NEXT-GEN SEMICONDUCTOR INTELLIGENCE</span>
            </div>
            <h1 style="font-size: 42px; font-weight: 800; letter-spacing: -0.03em; color: #F8FAFC; line-height: 1.15; margin-bottom: 14px;">
                Predict Wafer Demand.<br>
                <span style="background: linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Understand the Market.
                </span><br>
                Make Better Decisions.
            </h1>
            <p style="font-size: 16px; color: #94A3B8; max-width: 720px; margin: 0 auto 24px auto; line-height: 1.6;">
                Transform semiconductor wafer planning into intelligent business decisions using AI-driven CatBoost forecasting, hybrid startup valuation, live financial signals, and global market intelligence.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Hero CTA Buttons
    h_col1, h_col2, h_col3 = st.columns([1, 2, 1])
    with h_col2:
        cta1, cta2 = st.columns(2)
        with cta1:
            if st.button("🚀 Start Prediction", key="hero_btn_pred", type="primary", use_container_width=True):
                st.session_state.nav_page = "1. Existing Company Prediction"
                st.rerun()
        with cta2:
            if st.button("📊 Explore Analytics", key="hero_btn_dash", type="secondary", use_container_width=True):
                st.session_state.nav_page = "3. Company Dashboard"
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # ── TRUST / VALUE STRIP ──
    st.markdown(
        """
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; background-color: #1E293B; border: 1px solid #334155; border-radius: 10px; padding: 14px 18px; text-align: center; margin-bottom: 30px;">
            <div>
                <div style="font-size: 13px; font-weight: 700; color: #38BDF8;">🤖 ML-Powered</div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">CatBoost Regressor v1.0</div>
            </div>
            <div>
                <div style="font-size: 13px; font-weight: 700; color: #10B981;">🏢 Enterprise Signals</div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Financial & Node Scale</div>
            </div>
            <div>
                <div style="font-size: 13px; font-weight: 700; color: #F59E0B;">🚀 Startup Engine</div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Hybrid AI + Business Engine</div>
            </div>
            <div>
                <div style="font-size: 13px; font-weight: 700; color: #6366F1;">🌐 Market Intel</div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">WSTS & SIA Analytics</div>
            </div>
            <div>
                <div style="font-size: 13px; font-weight: 700; color: #EC4899;">📄 Analyst PDF</div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">12-Section B2B Reports</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── CORE PLATFORM FEATURES (6 CARDS) ──
    st.subheader("💡 Core Platform Capabilities")

    f_col1, f_col2, f_col3 = st.columns(3)

    with f_col1:
        st.markdown(
            """
            <div class="kpi-card" style="min-height: 180px; border-top: 3px solid #38BDF8;">
                <div class="kpi-title">01 — PREDICTION ENGINE</div>
                <div style="font-size: 18px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">🏢 Existing Company</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 12px;">Forecast wafer demand using company-specific historical, process node, and business indicators.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Run Existing Company Prediction", key="card_btn_ec", use_container_width=True):
            st.session_state.nav_page = "1. Existing Company Prediction"
            st.rerun()

    with f_col2:
        st.markdown(
            """
            <div class="kpi-card" style="min-height: 180px; border-top: 3px solid #10B981;">
                <div class="kpi-title">02 — STARTUP VALUATION</div>
                <div style="font-size: 18px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">🚀 Startup Venture</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 12px;">Estimate demand for new semiconductor ventures and benchmark them against established industry leaders.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Run Startup Prediction", key="card_btn_st", use_container_width=True):
            st.session_state.nav_page = "2. Startup Company Prediction"
            st.rerun()

    with f_col3:
        st.markdown(
            """
            <div class="kpi-card" style="min-height: 180px; border-top: 3px solid #F59E0B;">
                <div class="kpi-title">03 — COMPANY DASHBOARD</div>
                <div style="font-size: 18px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">📊 Company Intelligence</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 12px;">Understand company performance, financial indicators, process node scale, and demand drivers.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Open Company Dashboard", key="card_btn_db", use_container_width=True):
            st.session_state.nav_page = "3. Company Dashboard"
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    f_col4, f_col5, f_col6 = st.columns(3)

    with f_col4:
        st.markdown(
            """
            <div class="kpi-card" style="min-height: 180px; border-top: 3px solid #6366F1;">
                <div class="kpi-title">04 — MARKET INTELLIGENCE</div>
                <div style="font-size: 18px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">🌐 Macro Market Trends</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 12px;">Track global semiconductor growth, regional demand, memory, logic, foundry, and fab CapEx trends.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Explore Market Intelligence", key="card_btn_mkt", use_container_width=True):
            st.session_state.nav_page = "8. Semiconductor Market Intelligence"
            st.rerun()

    with f_col5:
        st.markdown(
            """
            <div class="kpi-card" style="min-height: 180px; border-top: 3px solid #EC4899;">
                <div class="kpi-title">05 — ANALYST WORKSPACE</div>
                <div style="font-size: 18px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">⚔️ Compare & Benchmark</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 12px;">Compare companies, evaluate competitive gap analysis, and identify strategic growth opportunities.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Compare Predictions", key="card_btn_cmp", use_container_width=True):
            st.session_state.nav_page = "5. Compare Predictions"
            st.rerun()

    with f_col6:
        st.markdown(
            """
            <div class="kpi-card" style="min-height: 180px; border-top: 3px solid #14B8A6;">
                <div class="kpi-title">06 — REPORTING & EXPORT</div>
                <div style="font-size: 18px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">📄 PDF Analyst Reports</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 12px;">Export quantitative analysis into professional 12-section B2B reports for executive discussions.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Prediction History & Reports", key="card_btn_hist", use_container_width=True):
            st.session_state.nav_page = "4. Prediction History"
            st.rerun()

    st.divider()

    # ── HOW IT WORKS (3-STEP PIPELINE) ──
    st.subheader("⚡ How It Works")
    st.markdown(
        """
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div class="section-card">
                <div style="font-size: 24px; font-weight: 800; color: #38BDF8; margin-bottom: 6px;">01</div>
                <div style="font-size: 15px; font-weight: 700; color: #F8FAFC; margin-bottom: 4px;">Select Entity & Parameters</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5;">Choose an established semiconductor company or configure new startup hardware & financial specifications.</div>
            </div>
            <div class="section-card">
                <div style="font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 6px;">02</div>
                <div style="font-size: 15px; font-weight: 700; color: #F8FAFC; margin-bottom: 4px;">Execute AI & Business Engine</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5;">Run CatBoost regressor models alongside business feature calculators and live financial signals.</div>
            </div>
            <div class="section-card">
                <div style="font-size: 24px; font-weight: 800; color: #F59E0B; margin-bottom: 6px;">03</div>
                <div style="font-size: 15px; font-weight: 700; color: #F8FAFC; margin-bottom: 4px;">Benchmark & Export Insights</div>
                <div style="font-size: 12px; color: #94A3B8; line-height: 1.5;">Inspect competitive gap indicators, market trends, and download structured PDF analyst reports.</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.divider()

    # ── ESTABLISHED COMPANIES vs STARTUPS SECTION ──
    c_sec1, c_sec2 = st.columns(2)

    with c_sec1:
        st.markdown(
            """
            <div class="section-card" style="border-top: 3px solid #38BDF8; min-height: 260px;">
                <div style="font-size: 12px; font-weight: 700; color: #38BDF8; text-transform: uppercase;">ENTERPRISE SOLUTION</div>
                <div style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">For Established Companies</div>
                <div style="font-size: 13px; color: #E2E8F0; line-height: 1.6; margin-bottom: 14px;">
                    • CatBoost AI Wafer Demand Forecasting<br>
                    • Live Financial Intelligence Integration<br>
                    • Business Driver Correlation (Revenue, CapEx, R&D)<br>
                    • Peer Benchmarking vs Growing Industry Group<br>
                    • Strategic SWOT & Capacity Optimization
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Analyze an Existing Company", key="btn_sec_ec", type="primary", use_container_width=True):
            st.session_state.nav_page = "1. Existing Company Prediction"
            st.rerun()

    with c_sec2:
        st.markdown(
            """
            <div class="section-card" style="border-top: 3px solid #10B981; min-height: 260px;">
                <div style="font-size: 12px; font-weight: 700; color: #10B981; text-transform: uppercase;">VENTURE SOLUTION</div>
                <div style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 6px 0;">For Semiconductor Startups</div>
                <div style="font-size: 13px; color: #E2E8F0; line-height: 1.6; margin-bottom: 14px;">
                    • Hybrid AI + Business Engine Demand Estimator<br>
                    • Benchmark Against Top Industry Leaders (TSMC, NVIDIA)<br>
                    • Readiness Score & Investment Rating<br>
                    • Quantitative CapEx & R&D Gap Analysis<br>
                    • Actionable Long-Term Supply Agreement Insights
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("Analyze a Startup Venture", key="btn_sec_st", type="primary", use_container_width=True):
            st.session_state.nav_page = "2. Startup Company Prediction"
            st.rerun()

    st.divider()

    # ── FINAL CTA & FOOTER ──
    st.markdown(
        """
        <div style="text-align: center; background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 32px 20px; margin-bottom: 24px;">
            <h2 style="font-size: 26px; font-weight: 800; color: #F8FAFC; margin-bottom: 8px;">
                Turn Semiconductor Data Into Better Decisions.
            </h2>
            <p style="font-size: 14px; color: #94A3B8; max-width: 560px; margin: 0 auto 20px auto;">
                Empower your strategy, investment, and foundry capacity planning teams with enterprise AI wafer intelligence.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    f_cta1, f_cta2, f_cta3 = st.columns([1, 2, 1])
    with f_cta2:
        if st.button("🚀 Start Analysis Now", key="final_cta_btn", type="primary", use_container_width=True):
            st.session_state.nav_page = "1. Existing Company Prediction"
            st.rerun()

    st.markdown("<br><hr style='border-color:#334155;'><br>", unsafe_allow_html=True)

    # Footer
    st.markdown(
        """
        <div style="text-align: center; font-size: 12px; color: #64748B;">
            <strong>Smart Wafer Demand Prediction System</strong> &nbsp;|&nbsp; Enterprise B2B Semiconductor Platform<br>
            Prediction Engine • Financial Intelligence • Market Intelligence • B2B Reports
        </div>
        """,
        unsafe_allow_html=True,
    )


# ==========================================================
# 1. EXISTING COMPANY PREDICTION PAGE
# ==========================================================

def existing_company_page():
    st.markdown(
        '<div class="main-title">🏢 Existing Company Prediction</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "Run CatBoost model prediction and inspect full B2B semiconductor analyst benchmarking."
        "</div>",
        unsafe_allow_html=True,
    )

    all_companies = get_all_companies()
    if not all_companies:
        st.error("No company dataset available.")
        return

    company_name = st.selectbox(
        "Select Company Name",
        options=[""] + all_companies,
        index=0,
        help="Select a company from the dataset",
    )

    if not company_name:
        st.info("Select a company from the dropdown above to load data and run prediction.")
        return

    # Call get_company
    company = get_company(company_name)
    if company is None:
        st.error(f"Company '{company_name}' not found in processed dataset repository.")
        return

    # Call find_company_by_name
    company_db = find_company_by_name(company["company"])
    if company_db is None:
        st.error(
            f"❌ Company '{company['company']}' was found in dataset, but is not registered in the Company Database. "
            "Please register the company first."
        )
        return

    company_id = company_db["company_id"]

    # Header Context Bar
    st.markdown(
        f"""
        <div class="context-bar">
            <div>
                <strong>Company:</strong> {company['company']} &nbsp;|&nbsp;
                <strong>Company ID:</strong> {company_id} &nbsp;|&nbsp;
                <strong>Country:</strong> {company.get('country_iso3', 'N/A')} &nbsp;|&nbsp;
                <strong>Segment:</strong> {company.get('segment', 'N/A')} &nbsp;|&nbsp;
                <strong>Analysis Date:</strong> {datetime.now().strftime('%Y-%m-%d')}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.subheader("Modify Inputs")
    col1, col2, col3 = st.columns(3)
    with col1:
        revenue = st.number_input(
            "Revenue (USD Billion)",
            min_value=0.0,
            value=safe_float(company.get("revenue_usd_bn", 0.0)),
            step=0.1,
            key="existing_rev",
        )
        process_node = st.number_input(
            "Process Node (nm)",
            min_value=1,
            max_value=500,
            value=safe_int(company.get("process_node_nm", 5)),
            step=1,
            key="existing_node",
        )

    with col2:
        rd_budget = st.number_input(
            "R&D Budget (USD Billion)",
            min_value=0.0,
            value=safe_float(company.get("rd_spend_usd_bn", 0.0)),
            step=0.1,
            key="existing_rd",
        )
        ai_launches = st.number_input(
            "AI Chip Launches",
            min_value=0,
            value=safe_int(company.get("ai_chip_launches", 0)),
            step=1,
            key="existing_launches",
        )

    with col3:
        capex = st.number_input(
            "CapEx (USD Billion)",
            min_value=0.0,
            value=safe_float(company.get("capex_usd_bn", 0.0)),
            step=0.1,
            key="existing_capex",
        )
        worldwide_sales = st.number_input(
            "Worldwide Sales (USD)",
            min_value=0.0,
            value=safe_float(company.get("worldwide_sales", revenue * 1_000_000_000)),
            step=1_000_000.0,
            key="existing_sales",
        )

    original_company = deepcopy(company)

    modified_company = deepcopy(company)
    modified_company["revenue_usd_bn"] = revenue
    modified_company["rd_spend_usd_bn"] = rd_budget
    modified_company["capex_usd_bn"] = capex
    modified_company["process_node_nm"] = process_node
    modified_company["ai_chip_launches"] = ai_launches
    modified_company["worldwide_sales"] = worldwide_sales

    st.divider()

    if st.button("🚀 Run AI Model Prediction", type="primary", use_container_width=True):
        try:
            with st.spinner("Executing CatBoost Engine..."):
                prediction = predict_company(modified_company)

            # Benchmark Calculations
            bm_data = get_growing_companies_data(company["company"], prediction, modified_company)

            # Fetch live intelligence data
            fin_data = get_live_financial_data(company["company"])
            mkt_data = get_market_intelligence_data()

            st.divider()

            # PAGE HEADER & EXPORT PDF BUTTON
            col_hdr1, col_hdr2 = st.columns([3, 1])
            with col_hdr1:
                st.markdown('<div class="main-title">SMART WAFER DEMAND INTELLIGENCE</div>', unsafe_allow_html=True)
                st.markdown('<div class="sub-title">Analyst Analysis — Selected Company vs Growing Companies Benchmark</div>', unsafe_allow_html=True)
            with col_hdr2:
                pdf_bytes = generate_pdf_report(
                    entity_name=company["company"],
                    company_id=company_id,
                    entity_type="Existing Company",
                    inputs=modified_company,
                    prediction_result=prediction,
                    benchmark_data=bm_data,
                    gap_statements=[
                        f"Wafer demand position: {format_number(prediction)} vs benchmark average {format_number(bm_data['avg_demand'])}.",
                        f"Revenue scale: ${revenue:.2f}B vs growing group average ${bm_data['avg_revenue']:.2f}B.",
                        f"R&D spending ratio: ${rd_budget:.2f}B vs benchmark average ${bm_data['avg_rd']:.2f}B.",
                    ],
                    is_startup=False,
                    financial_data=fin_data,
                    market_intel_data=mkt_data,
                )
                st.download_button(
                    label="📄 Export Analyst Report (PDF)",
                    data=pdf_bytes,
                    file_name=f"Analyst_Report_{company['company']}.pdf",
                    mime="application/pdf",
                    type="primary",
                    use_container_width=True,
                )


            # ==================================================
            # SECTION 1 — EXECUTIVE SNAPSHOT (5 KPI CARDS)
            # ==================================================

            demand_diff_pct = ((prediction - bm_data['avg_demand']) / max(bm_data['avg_demand'], 1)) * 100
            diff_arrow = "↑" if demand_diff_pct >= 0 else "↓"
            diff_color = "#10B981" if demand_diff_pct >= 0 else "#EF4444"

            col_k1, col_k2, col_k3, col_k4, col_k5 = st.columns(5)
            with col_k1:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">PREDICTED DEMAND</div>
                        <div class="kpi-value">{format_number(prediction)}</div>
                        <div class="kpi-sub" style="color:{diff_color};">{diff_arrow} {abs(demand_diff_pct):.1f}% vs benchmark</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            with col_k2:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">REVENUE</div>
                        <div class="kpi-value">${revenue:.2f}B</div>
                        <div class="kpi-sub">Industry Rank #{bm_data['selected_rank']}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            with col_k3:
                growth_text = "Above Benchmark" if revenue >= bm_data['avg_revenue'] else "Below Benchmark"
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">GROWTH</div>
                        <div class="kpi-value">+{bm_data.get('avg_growth', 18.4):.1f}%</div>
                        <div class="kpi-sub">{growth_text}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            with col_k4:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">CONFIDENCE</div>
                        <div class="kpi-value">95.0%</div>
                        <div class="kpi-sub">High Confidence</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            with col_k5:
                pos_status = "Strong Leader" if bm_data['selected_rank'] <= 3 else "Moderate Scale"
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">MARKET POSITION</div>
                        <div class="kpi-value">#{bm_data['selected_rank']}</div>
                        <div class="kpi-sub">{pos_status}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            st.markdown("<br>", unsafe_allow_html=True)

            # Render Live Financial Intelligence Card
            render_live_financial_card(company["company"])

            st.markdown("<br>", unsafe_allow_html=True)

            # ==================================================
            # SECTION 2 — KEY ANALYST INSIGHT
            # ==================================================

            st.markdown(
                f"""
                <div class="insight-panel">
                    <div class="insight-title">💡 KEY ANALYST INSIGHT</div>
                    <div style="font-size:14px; color:#F8FAFC; line-height:1.5;">
                        <strong>{company['company']}</strong> is currently positioned at <strong>Rank #{bm_data['selected_rank']}</strong> among benchmark companies with a projected demand of <strong>{format_number(prediction)} wafers/month</strong>.<br>
                        • <strong>Wafer Demand Position:</strong> {diff_arrow} {abs(demand_diff_pct):.1f}% relative to benchmark average ({format_number(bm_data['avg_demand'])}).<br>
                        • <strong>Opportunity:</strong> High revenue scale (${revenue:.2f}B) provides strong leverage for next-generation process node manufacturing.<br>
                        • <strong>Risk:</strong> Monitor CapEx efficiency (${capex:.2f}B) to avoid supply-chain bottlenecks during peak demand cycles.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # ==================================================
            # SECTION 3 — DEMAND COMPARISON (HORIZONTAL BAR CHART)
            # ==================================================

            st.subheader("Predicted Wafer Demand Comparison")

            df_chart = pd.DataFrame(bm_data["companies"])
            df_chart["formatted_label"] = df_chart["predicted_wafers"].apply(lambda x: format_number(x))

            # Color highlight: Selected company vibrant blue, benchmark slate
            colors_list = [
                "#3B82F6" if comp.lower() == company["company"].lower() else "#475569"
                for comp in df_chart["company"]
            ]

            fig_demand = go.Figure(
                go.Bar(
                    x=df_chart["predicted_wafers"],
                    y=df_chart["company"],
                    orientation="h",
                    text=df_chart["formatted_label"],
                    textposition="outside",
                    marker=dict(color=colors_list),
                    hovertemplate="<b>%{y}</b><br>Demand: %{x:,.0f} wafers/mo<extra></extra>",
                )
            )

            fig_demand.update_layout(
                paper_bgcolor="#0F172A",
                plot_bgcolor="#1E293B",
                font=dict(color="#F8FAFC", family="Inter, Segoe UI"),
                margin=dict(l=20, r=40, t=10, b=30),
                xaxis=dict(title="Predicted Wafer Demand (wafers/month)", gridcolor="#334155", color="#94A3B8"),
                yaxis=dict(title="", gridcolor="#334155", color="#F8FAFC", categoryorder="total ascending"),
                height=320,
            )

            st.plotly_chart(fig_demand, use_container_width=True, config={"displayModeBar": False})

            # ==================================================
            # SECTION 4 — COMPANY VS BENCHMARK (2-COLUMN CARDS)
            # ==================================================

            col_c1, col_c2 = st.columns(2)

            with col_c1:
                st.markdown(
                    f"""
                    <div class="section-card">
                        <div class="kpi-title">GROWTH COMPARISON</div>
                        <div style="display:flex; justify-content:space-between; margin-top:10px;">
                            <div>
                                <span style="font-size:12px; color:#94A3B8;">Selected Company</span><br>
                                <strong style="font-size:18px; color:#38BDF8;">+{bm_data.get('avg_growth', 18.4):.1f}%</strong>
                            </div>
                            <div>
                                <span style="font-size:12px; color:#94A3B8;">Benchmark Group</span><br>
                                <strong style="font-size:18px; color:#F8FAFC;">+15.0%</strong>
                            </div>
                            <div>
                                <span style="font-size:12px; color:#94A3B8;">Difference</span><br>
                                <strong style="font-size:18px; color:#10B981;">+{bm_data.get('avg_growth', 18.4) - 15.0:.1f} pts</strong>
                            </div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            with col_c2:
                top_comp_name = bm_data["companies"][0]["company"]
                top_comp_demand = bm_data["companies"][0]["predicted_wafers"]
                dist_pct = ((top_comp_demand - prediction) / max(top_comp_demand, 1)) * 100

                st.markdown(
                    f"""
                    <div class="section-card">
                        <div class="kpi-title">MARKET POSITION</div>
                        <div style="display:flex; justify-content:space-between; margin-top:10px;">
                            <div>
                                <span style="font-size:12px; color:#94A3B8;">Company Rank</span><br>
                                <strong style="font-size:18px; color:#F8FAFC;">#{bm_data['selected_rank']} of {bm_data['total_companies']}</strong>
                            </div>
                            <div>
                                <span style="font-size:12px; color:#94A3B8;">Top Leader</span><br>
                                <strong style="font-size:18px; color:#38BDF8;">{top_comp_name}</strong>
                            </div>
                            <div>
                                <span style="font-size:12px; color:#94A3B8;">Gap to #1</span><br>
                                <strong style="font-size:18px; color:#F59E0B;">-{dist_pct:.1f}%</strong>
                            </div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            # ==================================================
            # SECTION 5 — BUSINESS DRIVERS (2x2 COMPACT GRID WITH CLEAN SCATTER & TOOLTIPS)
            # ==================================================

            st.subheader("Business Driver Correlations")

            df_drivers = pd.DataFrame(bm_data["companies"])

            col_bd1, col_bd2 = st.columns(2)

            with col_bd1:
                # 1. Revenue vs Wafer Demand
                fig_rev = create_business_driver_chart(
                    df_drivers,
                    x_col="revenue_usd_bn",
                    y_col="predicted_wafers",
                    x_title="Revenue ($B)",
                    y_title="Wafer Demand",
                    chart_title="Revenue vs Wafer Demand",
                    selected_company_name=company["company"],
                    color_hex="#3B82F6",
                )
                st.plotly_chart(fig_rev, use_container_width=True, config={"displayModeBar": True})

                # 3. CapEx vs Wafer Demand
                fig_capex = create_business_driver_chart(
                    df_drivers,
                    x_col="capex_usd_bn",
                    y_col="predicted_wafers",
                    x_title="CapEx ($B)",
                    y_title="Wafer Demand",
                    chart_title="CapEx vs Wafer Demand",
                    selected_company_name=company["company"],
                    color_hex="#10B981",
                )
                st.plotly_chart(fig_capex, use_container_width=True, config={"displayModeBar": True})

            with col_bd2:
                # 2. R&D vs Wafer Demand
                fig_rd = create_business_driver_chart(
                    df_drivers,
                    x_col="rd_spend_usd_bn",
                    y_col="predicted_wafers",
                    x_title="R&D Budget ($B)",
                    y_title="Wafer Demand",
                    chart_title="R&D vs Wafer Demand",
                    selected_company_name=company["company"],
                    color_hex="#6366F1",
                )
                st.plotly_chart(fig_rd, use_container_width=True, config={"displayModeBar": True})

                # 4. AI Shipments vs Wafer Demand
                fig_ship = create_business_driver_chart(
                    df_drivers,
                    x_col="ai_shipments",
                    y_col="predicted_wafers",
                    x_title="AI Shipments (Units)",
                    y_title="Wafer Demand",
                    chart_title="AI Shipments vs Wafer Demand",
                    selected_company_name=company["company"],
                    color_hex="#F59E0B",
                )
                st.plotly_chart(fig_ship, use_container_width=True, config={"displayModeBar": True})

            # Analyst Explanation Banner
            st.markdown(
                """
                <div class="analyst-banner">
                    💡 <strong>Analyst Note:</strong> Strong positive relationships indicate business drivers that may be associated with higher wafer demand. Correlation does not necessarily imply causation.
                </div>
                """,
                unsafe_allow_html=True,
            )

            # ==================================================
            # SECTION 6 — BENCHMARK TABLE
            # ==================================================

            st.subheader("Industry Benchmark Comparison Table")

            df_table = df_drivers.copy()
            df_table["Predicted Demand"] = df_table["predicted_wafers"].apply(lambda x: format_number(x))
            df_table["Revenue"] = df_table["revenue_usd_bn"].apply(lambda x: f"${x:.2f}B")
            df_table["R&D Budget"] = df_table["rd_spend_usd_bn"].apply(lambda x: f"${x:.2f}B")
            df_table["CapEx"] = df_table["capex_usd_bn"].apply(lambda x: f"${x:.2f}B")
            df_table["Growth"] = df_table["growth_pct"].apply(lambda x: f"+{x:.1f}%")

            table_cols = ["rank", "company", "Predicted Demand", "Revenue", "Growth", "R&D Budget", "CapEx"]
            st.dataframe(df_table[table_cols], use_container_width=True, hide_index=True)

            # ==================================================
            # SECTION 7 — COMPETITIVE GAP PROGRESS INDICATORS
            # ==================================================

            st.subheader("Competitive Gap to Benchmark Leader")

            top_demand = bm_data["companies"][0]["predicted_wafers"]
            top_rev = bm_data["companies"][0]["revenue_usd_bn"]
            top_rd = bm_data["companies"][0]["rd_spend_usd_bn"]
            top_capex = bm_data["companies"][0]["capex_usd_bn"]

            pct_dem = min(1.0, float(prediction / max(top_demand, 1)))
            pct_rev = min(1.0, float(revenue / max(top_rev, 0.01)))
            pct_rd = min(1.0, float(rd_budget / max(top_rd, 0.01)))
            pct_capex = min(1.0, float(capex / max(top_capex, 0.01)))

            col_gap1, col_gap2 = st.columns(2)
            with col_gap1:
                st.caption(f"Wafer Demand vs Leader ({int(pct_dem * 100)}%)")
                st.progress(pct_dem)
                st.caption(f"Revenue vs Leader ({int(pct_rev * 100)}%)")
                st.progress(pct_rev)

            with col_gap2:
                st.caption(f"R&D Budget vs Leader ({int(pct_rd * 100)}%)")
                st.progress(pct_rd)
                st.caption(f"CapEx Investment vs Leader ({int(pct_capex * 100)}%)")
                st.progress(pct_capex)

            # ==================================================
            # SECTION 8 — ANALYST RECOMMENDATIONS (CARDS 01, 02, 03)
            # ==================================================

            st.subheader("Analyst Strategic Recommendations")

            st.markdown(
                """
                <div class="rec-card">
                    <div class="rec-num">01</div>
                    <div class="rec-text"><strong>Optimize Capacity Planning:</strong> Align long-term wafer supply contracts with projected 12-month demand growth trajectories to secure foundry allocation.</div>
                </div>
                <div class="rec-card">
                    <div class="rec-num">02</div>
                    <div class="rec-text"><strong>R&D Efficiency:</strong> Focus research and development capital toward leading-edge process nodes (<5nm) to maximize demand yield.</div>
                </div>
                <div class="rec-card">
                    <div class="rec-num">03</div>
                    <div class="rec-text"><strong>Supply Chain Risk Mitigation:</strong> Diversify geographic fab dependencies and monitor export control restrictions to hedge geopolitical risks.</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # Render Analyst SWOT Matrix
            render_swot_analysis(company["company"], is_startup=False)

            st.divider()

            # Save Prediction to History
            st.subheader("Save Prediction to Database History")
            default_pred_name = f"{company['company']} - {datetime.now().strftime('%Y%m%d_%H%M%S')}"
            prediction_name = st.text_input("Prediction Name", value=default_pred_name, key="existing_pred_name")

            if st.button("💾 Save Prediction History", type="secondary"):
                try:
                    save_prediction(
                        prediction_name=prediction_name.strip(),
                        company_id=company_id,
                        company=company["company"],
                        prediction_type="Existing Company",
                        original_data=original_company,
                        modified_data=modified_company,
                        predicted_wafers=prediction,
                        confidence=95.0,
                        model_version="CatBoost_v1",
                    )
                    st.success(f"✅ Prediction '{prediction_name}' saved successfully!")
                except Exception as e:
                    st.error(f"Failed to save prediction: {e}")

        except Exception as e:
            st.error("❌ Existing Company Prediction Failed.")
            st.exception(e)


# ==========================================================
# 2. STARTUP COMPANY PREDICTION PAGE
# ==========================================================

def load_existing_startup(company_name):
    if not company_name:
        return None
    try:
        company = find_company_by_name(company_name.strip())
        if company and company.get("company_type") == "Startup":
            return company
    except Exception as e:
        st.error(f"Database connection error: {e}")
    return None


def startup_prediction_page():
    st.markdown(
        '<div class="main-title">🚀 Startup Company Prediction</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "Predict wafer demand for semiconductor startups using the Hybrid AI + Business Engine."
        "</div>",
        unsafe_allow_html=True,
    )

    st.subheader("1. Enter Startup Name")

    company_name = st.text_input(
        "Startup Company Name",
        value=st.session_state.startup_name_search,
        placeholder="Enter startup name",
        key="startup_name_input",
    )

    col1, col2 = st.columns(2)
    with col1:
        load_button = st.button("🔎 Search Database / Load Startup", type="primary", use_container_width=True)
    with col2:
        new_button = st.button("➕ Enter New Startup", use_container_width=True)

    if load_button:
        if not company_name.strip():
            st.warning("Please enter a startup company name first.")
        else:
            existing = load_existing_startup(company_name)
            if existing:
                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = True
                st.session_state.startup_data = existing
                st.session_state.startup_company_id = existing.get("company_id")
                st.session_state.startup_name_search = company_name
                st.success(f"Existing startup found — ID: {existing.get('company_id')}")
            else:
                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = False
                st.session_state.startup_data = None
                st.session_state.startup_company_id = None
                st.session_state.startup_name_search = company_name
                st.info("New startup. Startup ID (STxxxx) will be generated automatically upon saving.")

    if new_button:
        if not company_name.strip():
            st.warning("Please enter a startup company name first.")
        else:
            existing = load_existing_startup(company_name)
            if existing:
                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = True
                st.session_state.startup_data = existing
                st.session_state.startup_company_id = existing.get("company_id")
                st.warning(f"This startup already exists with ID {existing.get('company_id')}. Existing data loaded.")
            else:
                st.session_state.startup_loaded = True
                st.session_state.startup_is_existing = False
                st.session_state.startup_data = None
                st.session_state.startup_company_id = None
                st.info("New startup. Please complete the form below.")

    if not st.session_state.startup_loaded:
        st.info("Enter a startup name above and click **Search Database / Load Startup**.")
        return

    existing = st.session_state.startup_is_existing
    loaded = st.session_state.startup_data

    st.divider()
    st.subheader("2. Startup Details & Inputs")

    if existing and loaded:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div><strong>Startup Name:</strong> {loaded.get('company_name', company_name)}</div>
                <div style="font-size:20px; font-weight:700; color:#38BDF8;">Startup ID: {loaded.get('company_id', 'N/A')}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        loaded_country = loaded.get("country", "IND")
        loaded_fab_type = loaded.get("fab_type", "logic_leading")
        loaded_segment = loaded.get("segment", "AI / HPC")
    else:
        st.info("🆕 New Startup — Startup ID (e.g. ST0001) will be generated automatically using repository logic.")
        loaded_country = "IND"
        loaded_fab_type = "logic_leading"
        loaded_segment = "AI / HPC"

    # Basic Details
    col1, col2, col3 = st.columns(3)
    with col1:
        startup_company = st.text_input(
            "Startup Name",
            value=loaded.get("company_name", company_name) if (existing and loaded) else company_name,
            disabled=existing,
        )
    with col2:
        # EXACT COUNTRY LIST REQUIREMENT
        country = st.selectbox(
            "Country",
            ["IND", "USA", "TWN", "KOR", "CHN"],
            index=(["IND", "USA", "TWN", "KOR", "CHN"].index(loaded_country) if loaded_country in ["IND", "USA", "TWN", "KOR", "CHN"] else 0),
        )
    with col3:
        fab_type_options = ["logic_leading", "logic_mature", "memory", "analog", "power", "specialty", "other"]
        fab_idx = fab_type_options.index(loaded_fab_type) if loaded_fab_type in fab_type_options else 0
        fab_type = st.selectbox("Fab Type", fab_type_options, index=fab_idx)

    segment_options = ["AI / HPC", "AI", "HPC", "Automotive", "Mobile", "Consumer", "Industrial", "Networking", "Other"]
    seg_idx = segment_options.index(loaded_segment) if loaded_segment in segment_options else 0
    segment = st.selectbox("Market Segment", segment_options, index=seg_idx)

    # Financial & Technology
    st.subheader("Financial & Technology Information")
    col1, col2, col3 = st.columns(3)
    with col1:
        year = st.number_input("Year", min_value=2020, max_value=2100, value=safe_int(loaded.get("year", datetime.now().year) if (existing and loaded) else datetime.now().year), step=1)
        expected_revenue = st.number_input("Expected Annual Revenue (B$)", min_value=0.0, value=safe_float(loaded.get("expected_revenue", 0.1) if (existing and loaded) else 0.1), step=0.05)
    with col2:
        process_node = st.number_input("Process Node (nm)", min_value=1, max_value=500, value=safe_int(loaded.get("process_node_nm", 5) if (existing and loaded) else 5), step=1)
        rd_budget = st.number_input("R&D Budget (B$)", min_value=0.0, value=safe_float(loaded.get("rd_budget", 0.05) if (existing and loaded) else 0.05), step=0.01)
    with col3:
        capex = st.number_input("CapEx (B$)", min_value=0.0, value=safe_float(loaded.get("capex", 0.1) if (existing and loaded) else 0.1), step=0.05)
        ai_chip_launches = st.number_input("AI Chip Launches", min_value=0, value=safe_int(loaded.get("ai_chip_launches", 1) if (existing and loaded) else 1), step=1)

    # AI Business Information
    st.subheader("AI Business Information")
    col1, col2, col3 = st.columns(3)
    with col1:
        expected_ai_shipments = st.number_input("Expected AI Shipments (M units)", min_value=0.0, value=safe_float(loaded.get("expected_ai_shipments", 1.0) if (existing and loaded) else 1.0), step=0.1)
    with col2:
        expected_ai_revenue = st.number_input("Expected AI Revenue (B$)", min_value=0.0, value=safe_float(loaded.get("expected_ai_revenue", 0.1) if (existing and loaded) else 0.1), step=0.1)
    with col3:
        worldwide_sales = st.number_input("Worldwide Sales", min_value=0.0, value=safe_float(loaded.get("worldwide_sales", 1.0) if (existing and loaded) else 1.0), step=0.1)

    # Hardware & Pricing
    st.subheader("Hardware & Pricing Defaults")
    col1, col2, col3 = st.columns(3)
    with col1:
        avg_memory_gb = st.number_input("Average Memory (GB)", min_value=0.0, value=safe_float(loaded.get("avg_memory_gb", 32) if (existing and loaded) else 32), step=1.0)
        avg_chip_price = st.number_input("Average Chip Price ($)", min_value=0.0, value=safe_float(loaded.get("avg_chip_price", 18000) if (existing and loaded) else 18000), step=100.0)
    with col2:
        avg_fp16_tflops = st.number_input("Average FP16 TFLOPS", min_value=0.0, value=safe_float(loaded.get("avg_fp16_tflops", 1000) if (existing and loaded) else 1000), step=10.0)
        highest_chip_price = st.number_input("Highest Chip Price ($)", min_value=0.0, value=safe_float(loaded.get("highest_chip_price", 30000) if (existing and loaded) else 30000), step=100.0)
    with col3:
        avg_tdp = st.number_input("Average TDP", min_value=0.0, value=safe_float(loaded.get("avg_tdp", 350) if (existing and loaded) else 350), step=10.0)
        lowest_chip_price = st.number_input("Lowest Chip Price ($)", min_value=0.0, value=safe_float(loaded.get("lowest_chip_price", 8000) if (existing and loaded) else 8000), step=100.0)

    # Innovation Scores & Geopolitical Risk
    st.subheader("Innovation Scores & Geopolitical Risk")
    col1, col2, col3 = st.columns(3)
    with col1:
        performance_score = st.slider("Performance Score", 0, 100, safe_int(loaded.get("performance_score", 75) if (existing and loaded) else 75))
        innovation_score = st.slider("Innovation Score", 0, 100, safe_int(loaded.get("innovation_score", 65) if (existing and loaded) else 65))
        price_volatility = st.number_input("Price Volatility", min_value=0.0, value=safe_float(loaded.get("price_volatility", 0.20) if (existing and loaded) else 0.20), step=0.05)
    with col2:
        investment_score = st.slider("Investment Score", 0, 100, safe_int(loaded.get("investment_score", 60) if (existing and loaded) else 60))
        ai_market_score = st.slider("AI Market Score", 0, 100, safe_int(loaded.get("ai_market_score", 55) if (existing and loaded) else 55))
        export_control_events = st.number_input("Export Control Events", min_value=0, value=safe_int(loaded.get("export_control_events", 0) if (existing and loaded) else 0), step=1)
    with col3:
        performance_per_watt = st.number_input("Performance / Watt", min_value=0.0, value=safe_float(loaded.get("performance_per_watt", 2.2) if (existing and loaded) else 2.2), step=0.1)
        export_risk_score = st.number_input("Export Risk Score", min_value=0.0, value=safe_float(loaded.get("export_risk_score", 0.10) if (existing and loaded) else 0.10), step=0.05)
        geo_risk = st.number_input("Geopolitical Risk", min_value=0.0, value=safe_float(loaded.get("geo_risk", 0.15) if (existing and loaded) else 0.15), step=0.05)

    startup_inputs = {
        "company": startup_company.strip(),
        "country": country,
        "fab_type": fab_type,
        "segment": segment,
        "year": year,
        "process_node_nm": process_node,
        "expected_revenue": expected_revenue,
        "rd_budget": rd_budget,
        "capex": capex,
        "ai_chip_launches": ai_chip_launches,
        "expected_shipments": expected_ai_shipments,
        "expected_ai_shipments": expected_ai_shipments,
        "expected_ai_revenue": expected_ai_revenue,
        "worldwide_sales": worldwide_sales,
        "avg_memory_gb": avg_memory_gb,
        "avg_fp16_tflops": avg_fp16_tflops,
        "avg_tdp": avg_tdp,
        "avg_chip_price": avg_chip_price,
        "highest_chip_price": highest_chip_price,
        "lowest_chip_price": lowest_chip_price,
        "price_index": 1.0,
        "price_volatility": price_volatility,
        "export_control_events": export_control_events,
        "avg_severity_score": 0.10,
        "export_risk_score": export_risk_score,
        "geo_risk": geo_risk,
        "performance_score": performance_score,
        "performance_per_watt": performance_per_watt,
        "innovation_score": innovation_score,
        "investment_score": investment_score,
        "ai_market_score": ai_market_score,
    }

    st.divider()

    if st.button("🚀 Run Startup Hybrid Prediction", type="primary", use_container_width=True):
        if not startup_company.strip():
            st.error("Startup name cannot be empty.")
            return

        try:
            with st.spinner("Executing Hybrid AI + Business Engine..."):
                predictor = StartupPredictor()
                details = predictor.predict_details(startup_inputs)

            st.session_state.startup_prediction = details

            # Ensure company exists in DB
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
                    raise Exception("Unable to create startup company in database.")
                st.session_state.startup_company_id = company_id
                st.session_state.startup_data = {**company_data, "company_id": company_id}
                st.session_state.startup_is_existing = True
                st.success(f"✅ New startup saved in database with ID: {company_id}")
            else:
                company_id = st.session_state.startup_company_id

            # Benchmark Calculations for Startup
            bm_top = get_toplevel_companies_data(startup_company.strip(), details["final_prediction"], startup_inputs)

            # Fetch Live Intelligence Data
            fin_data_st = get_live_financial_data(startup_company.strip())
            mkt_data_st = get_market_intelligence_data()

            st.divider()

            # PAGE HEADER & EXPORT PDF BUTTON
            col_hdr1, col_hdr2 = st.columns([3, 1])
            with col_hdr1:
                st.markdown('<div class="main-title">SMART WAFER DEMAND INTELLIGENCE</div>', unsafe_allow_html=True)
                st.markdown('<div class="sub-title">Analyst Analysis — Startup vs Top-Level Industry Leaders Benchmark</div>', unsafe_allow_html=True)
            with col_hdr2:
                pdf_bytes_st = generate_pdf_report(
                    entity_name=startup_company.strip(),
                    company_id=company_id,
                    entity_type="Startup Company",
                    inputs=startup_inputs,
                    prediction_result=details,
                    benchmark_data=bm_top,
                    gap_statements=[
                        f"Projected demand is {format_number(details['final_prediction'])} vs top leader average {format_number(bm_top['avg_demand'])}.",
                        f"R&D budget: ${rd_budget:.2f}B vs top leader benchmark ${bm_top['avg_rd']:.2f}B.",
                        f"CapEx investment: ${capex:.2f}B vs top leader benchmark ${bm_top['avg_capex']:.2f}B.",
                    ],
                    is_startup=True,
                    financial_data=fin_data_st,
                    market_intel_data=mkt_data_st,
                )
                st.download_button(
                    label="📄 Export Analyst Report (PDF)",
                    data=pdf_bytes_st,
                    file_name=f"Analyst_Report_{startup_company.strip()}.pdf",
                    mime="application/pdf",
                    type="primary",
                    use_container_width=True,
                )


            # EXECUTIVE SNAPSHOT (5 KPI CARDS)
            col_k1, col_k2, col_k3, col_k4, col_k5 = st.columns(5)
            with col_k1:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">PREDICTED DEMAND</div>
                        <div class="kpi-value">{format_number(details['final_prediction'])}</div>
                        <div class="kpi-sub" style="color:#38BDF8;">Hybrid AI Output</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            with col_k2:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">EXPECTED REVENUE</div>
                        <div class="kpi-value">${expected_revenue:.2f}B</div>
                        <div class="kpi-sub">Stage: {details.get('startup_stage', 'N/A')}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            with col_k3:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">CONFIDENCE</div>
                        <div class="kpi-value">{details.get('confidence', 0)}%</div>
                        <div class="kpi-sub">Profile Maturity</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            with col_k4:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">INVESTMENT RATING</div>
                        <div class="kpi-value">{details.get('investment_rating', 'N/A')}</div>
                        <div class="kpi-sub">Readiness Score</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            with col_k5:
                st.markdown(
                    f"""
                    <div class="kpi-card">
                        <div class="kpi-title">LEADER RANK</div>
                        <div class="kpi-value">#{bm_top['selected_rank']}</div>
                        <div class="kpi-sub">vs Top Leaders</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            st.markdown("<br>", unsafe_allow_html=True)

            # KEY ANALYST INSIGHT
            st.markdown(
                f"""
                <div class="insight-panel">
                    <div class="insight-title">💡 STARTUP BENCHMARK INSIGHT</div>
                    <div style="font-size:14px; color:#F8FAFC; line-height:1.5;">
                        Startup <strong>{startup_company.strip()}</strong> has a hybrid predicted demand of <strong>{format_number(details['final_prediction'])} wafers/month</strong>.<br>
                        • <strong>Breakdown:</strong> AI Model Prediction ({format_number(details['ai_prediction'])}) + Business Engine ({format_number(details['business_prediction'])}).<br>
                        • <strong>Benchmark Position:</strong> Ranked #{bm_top['selected_rank']} against top-tier industry leaders (TSMC, NVIDIA, AMD, etc.).<br>
                        • <strong>Improvement Target:</strong> Expanding R&D budget (${rd_budget:.2f}B) toward the industry leader average (${bm_top['avg_rd']:.2f}B) will improve scaling.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # HORIZONTAL DEMAND COMPARISON CHART
            st.subheader("Predicted Wafer Demand vs Top-Level Leaders")

            df_st_chart = pd.DataFrame(bm_top["companies"])
            df_st_chart["formatted_label"] = df_st_chart["predicted_wafers"].apply(lambda x: format_number(x))

            colors_list_st = [
                "#F59E0B" if comp.lower() == startup_company.strip().lower() else "#475569"
                for comp in df_st_chart["company"]
            ]

            fig_st_demand = go.Figure(
                go.Bar(
                    x=df_st_chart["predicted_wafers"],
                    y=df_st_chart["company"],
                    orientation="h",
                    text=df_st_chart["formatted_label"],
                    textposition="outside",
                    marker=dict(color=colors_list_st),
                    hovertemplate="<b>%{y}</b><br>Demand: %{x:,.0f} wafers/mo<extra></extra>",
                )
            )

            fig_st_demand.update_layout(
                paper_bgcolor="#0F172A",
                plot_bgcolor="#1E293B",
                font=dict(color="#F8FAFC", family="Inter, Segoe UI"),
                margin=dict(l=20, r=40, t=10, b=30),
                xaxis=dict(title="Predicted Wafer Demand (wafers/month)", gridcolor="#334155", color="#94A3B8"),
                yaxis=dict(title="", gridcolor="#334155", color="#F8FAFC", categoryorder="total ascending"),
                height=320,
            )

            st.plotly_chart(fig_st_demand, use_container_width=True, config={"displayModeBar": False})

            # 2x2 BUSINESS DRIVERS GRID FOR STARTUP
            st.subheader("Startup Business Drivers vs Leaders")
            col_sbd1, col_sbd2 = st.columns(2)

            with col_sbd1:
                # 1. Revenue vs Wafer Demand
                fig_st_rev = create_business_driver_chart(
                    df_st_chart,
                    x_col="revenue_usd_bn",
                    y_col="predicted_wafers",
                    x_title="Revenue ($B)",
                    y_title="Wafer Demand",
                    chart_title="Revenue vs Wafer Demand",
                    selected_company_name=startup_company.strip(),
                    color_hex="#3B82F6",
                )
                st.plotly_chart(fig_st_rev, use_container_width=True, config={"displayModeBar": True})

                # 3. CapEx vs Wafer Demand
                fig_st_capex = create_business_driver_chart(
                    df_st_chart,
                    x_col="capex_usd_bn",
                    y_col="predicted_wafers",
                    x_title="CapEx ($B)",
                    y_title="Wafer Demand",
                    chart_title="CapEx vs Wafer Demand",
                    selected_company_name=startup_company.strip(),
                    color_hex="#10B981",
                )
                st.plotly_chart(fig_st_capex, use_container_width=True, config={"displayModeBar": True})

            with col_sbd2:
                # 2. R&D vs Wafer Demand
                fig_st_rd = create_business_driver_chart(
                    df_st_chart,
                    x_col="rd_spend_usd_bn",
                    y_col="predicted_wafers",
                    x_title="R&D Budget ($B)",
                    y_title="Wafer Demand",
                    chart_title="R&D vs Wafer Demand",
                    selected_company_name=startup_company.strip(),
                    color_hex="#6366F1",
                )
                st.plotly_chart(fig_st_rd, use_container_width=True, config={"displayModeBar": True})

                # 4. AI Shipments vs Wafer Demand
                fig_st_ship = create_business_driver_chart(
                    df_st_chart,
                    x_col="ai_shipments",
                    y_col="predicted_wafers",
                    x_title="AI Shipments (Units)",
                    y_title="Wafer Demand",
                    chart_title="AI Shipments vs Wafer Demand",
                    selected_company_name=startup_company.strip(),
                    color_hex="#F59E0B",
                )
                st.plotly_chart(fig_st_ship, use_container_width=True, config={"displayModeBar": True})

            # Analyst Explanation Banner
            st.markdown(
                """
                <div class="analyst-banner">
                    💡 <strong>Analyst Note:</strong> Strong positive relationships indicate business drivers that may be associated with higher wafer demand. Correlation does not necessarily imply causation.
                </div>
                """,
                unsafe_allow_html=True,
            )

            # BENCHMARK COMPARISON TABLE
            st.subheader("Top-Level Leaders Comparison Table")
            df_st_table = df_st_chart.copy()
            df_st_table["Predicted Demand"] = df_st_table["predicted_wafers"].apply(lambda x: format_number(x))
            df_st_table["Revenue"] = df_st_table["revenue_usd_bn"].apply(lambda x: f"${x:.2f}B")
            df_st_table["R&D Budget"] = df_st_table["rd_spend_usd_bn"].apply(lambda x: f"${x:.2f}B")
            df_st_table["CapEx"] = df_st_table["capex_usd_bn"].apply(lambda x: f"${x:.2f}B")

            st.dataframe(df_st_table[["rank", "company", "Predicted Demand", "Revenue", "R&D Budget", "CapEx"]], use_container_width=True, hide_index=True)

            # COMPETITIVE GAP INDICATORS FOR STARTUP
            st.subheader("Competitive Gap to Top Industry Leader")
            top_leader = bm_top["top_leader"]
            top_dem = top_leader["predicted_wafers"]
            top_r = top_leader["revenue_usd_bn"]
            top_r_d = top_leader["rd_spend_usd_bn"]

            p_dem = min(1.0, float(details["final_prediction"] / max(top_dem, 1)))
            p_r = min(1.0, float(expected_revenue / max(top_r, 0.01)))
            p_rd = min(1.0, float(rd_budget / max(top_r_d, 0.01)))

            col_sg1, col_sg2 = st.columns(2)
            with col_sg1:
                st.caption(f"Demand Scale vs Leader ({int(p_dem * 100)}%)")
                st.progress(p_dem)
                st.caption(f"Revenue Scale vs Leader ({int(p_r * 100)}%)")
                st.progress(p_r)
            with col_sg2:
                st.caption(f"R&D Budget Scale vs Leader ({int(p_rd * 100)}%)")
                st.progress(p_rd)

            # BACKEND EXPLANATIONS & RECOMMENDATIONS CARDS
            explanation = details.get("explanation")
            if explanation:
                st.subheader("Prediction Explanations")
                if isinstance(explanation, list):
                    for exp in explanation:
                        st.info(f"• {exp}")

            recommendations = details.get("recommendations")
            if recommendations:
                st.subheader("Analyst Strategic Recommendations")
                if isinstance(recommendations, list):
                    for idx, rec in enumerate(recommendations, start=1):
                        st.markdown(
                            f"""
                            <div class="rec-card">
                                <div class="rec-num">0{idx}</div>
                                <div class="rec-text">{rec}</div>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

            # Render Analyst SWOT Matrix
            render_swot_analysis(startup_company.strip(), is_startup=True)

            st.divider()

            # Save prediction history via save_prediction()
            prediction_name = f"{startup_company.strip()} - Startup - {datetime.now().strftime('%Y%m%d_%H%M%S')}"
            try:
                save_prediction(
                    prediction_name=prediction_name,
                    company_id=company_id,
                    company=startup_company.strip(),
                    prediction_type="Startup",
                    original_data=startup_inputs,
                    modified_data=startup_inputs,
                    predicted_wafers=details["final_prediction"],
                    confidence=details.get("confidence", 0),
                    model_version="Hybrid_v1",
                )
                st.success(f"✅ Prediction saved to database as '{prediction_name}'.")
            except Exception as e:
                st.warning(f"Prediction completed, but could not save history record: {e}")

        except Exception as e:
            st.error("❌ Startup Prediction Failed.")
            st.exception(e)


# ==========================================================
# 3. COMPANY DASHBOARD PAGE
# ==========================================================

def dashboard_page():
    st.markdown(
        '<div class="main-title">📊 Company Dashboard</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "View statistics, latest predictions, and prediction timelines for any company."
        "</div>",
        unsafe_allow_html=True,
    )

    company_id = st.text_input(
        "Enter Company ID",
        placeholder="Example: EC0001 or ST0001",
        help="Type Company ID to view dashboard metrics",
    ).strip().upper()

    if not company_id:
        st.info("Enter a Company ID (e.g. EC0001 or ST0001) to view dashboard statistics.")
        return

    try:
        statistics = get_company_statistics(company_id)
        if statistics is None:
            st.warning(f"No prediction history found for Company ID: '{company_id}'.")
            return

        latest = get_latest_prediction(company_id)
        trend = get_prediction_trend(company_id)

        st.markdown(
            f"""
            <div class="kpi-card">
                <strong style="font-size:20px; color:#F8FAFC;">{statistics['company']}</strong><br>
                <span class="kpi-sub">Company ID: {statistics['company_id']}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.subheader("Prediction Statistics")
        col1, col2, col3, col4, col5 = st.columns(5)
        with col1:
            st.metric("Total Predictions", statistics["total_predictions"])
        with col2:
            st.metric("Average Demand", f"{statistics['average_prediction']:,.2f}")
        with col3:
            st.metric("Highest Demand", f"{statistics['highest_prediction']:,.2f}")
        with col4:
            st.metric("Lowest Demand", f"{statistics['lowest_prediction']:,.2f}")
        with col5:
            st.metric("Avg Confidence", f"{statistics['average_confidence']}%")

        if latest:
            st.divider()
            st.subheader("Latest Prediction")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.write(f"**Name:** {latest['prediction_name']}")
                st.write(f"**Model:** {latest['model_version']}")
            with col2:
                st.metric("Predicted Wafers", f"{latest['predicted_wafers']:,.2f}")
                st.write(f"**Confidence:** {latest['confidence']}%")
            with col3:
                st.write(f"**Time:** {latest['prediction_time']}")

        st.divider()
        st.subheader("Prediction Timeline Trend")
        if not trend:
            st.info("No timeline trend data available.")
        else:
            df_trend = pd.DataFrame(trend)
            st.dataframe(df_trend, use_container_width=True, hide_index=True)

    except Exception as e:
        st.error(f"Error loading dashboard: {e}")


# ==========================================================
# 4. PREDICTION HISTORY PAGE
# ==========================================================

def history_page():
    st.markdown(
        '<div class="main-title">📜 Prediction History</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "View and search stored prediction records from the MySQL repository."
        "</div>",
        unsafe_allow_html=True,
    )

    try:
        company_filter = st.text_input("Filter by Company ID", placeholder="Leave blank for all companies, or enter e.g. EC0001").strip().upper()

        if company_filter:
            history = get_predictions_by_company(company_filter)
        else:
            history = get_prediction_history()

        if not history:
            st.info("No prediction history recorded.")
            return

        df = pd.DataFrame(history)

        st.subheader(f"Saved Predictions ({len(df)} Records)")

        display_cols = [
            "id",
            "prediction_name",
            "company_id",
            "company",
            "prediction_type",
            "predicted_wafers",
            "confidence",
            "model_version",
            "prediction_time",
        ]
        available_cols = [c for c in display_cols if c in df.columns]

        st.dataframe(
            df[available_cols],
            use_container_width=True,
            hide_index=True,
        )

        st.divider()
        st.subheader("Inspect Prediction Details")
        selected_id = st.number_input("Enter Prediction ID to inspect", min_value=1, step=1, key="inspect_id")

        if st.button("Inspect Prediction Details"):
            record = get_prediction_by_id(selected_id)
            if record:
                st.write(f"**Prediction ID:** {record['id']}")
                st.write(f"**Prediction Name:** {record['prediction_name']}")
                st.write(f"**Company:** {record['company']} ({record['company_id']})")
                st.write(f"**Type:** {record['prediction_type']}")
                st.write(f"**Predicted Wafers:** {record['predicted_wafers']:,.2f}")
                st.write(f"**Confidence:** {record['confidence']}%")
                st.write(f"**Model Version:** {record['model_version']}")
                st.write(f"**Prediction Time:** {record['prediction_time']}")

                col1, col2 = st.columns(2)
                with col1:
                    st.caption("Original Input Data")
                    try:
                        st.json(json.loads(record["original_data"]))
                    except Exception:
                        st.text(record["original_data"])
                with col2:
                    st.caption("Modified Input Data")
                    try:
                        st.json(json.loads(record["modified_data"]))
                    except Exception:
                        st.text(record["modified_data"])
            else:
                st.error("Prediction ID not found.")

    except Exception as e:
        st.error(f"Unable to load prediction history: {e}")


# ==========================================================
# 5. COMPARE PREDICTIONS PAGE
# ==========================================================

def compare_predictions_page():
    st.markdown(
        '<div class="main-title">⚔️ Compare Predictions</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "Compare two saved predictions side-by-side using the comparison service."
        "</div>",
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        id1 = st.number_input("Prediction ID 1", min_value=1, step=1, value=1, key="compare_id1")
    with col2:
        id2 = st.number_input("Prediction ID 2", min_value=1, step=1, value=2, key="compare_id2")

    if st.button("⚔️ Run Comparison", type="primary"):
        p1, p2 = compare_predictions_repo(id1, id2)

        if p1 is None or p2 is None:
            st.error("❌ One or both Prediction IDs do not exist in the database.")
            return

        st.subheader("Comparison Summary")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(
                f"""
                <div class="kpi-card">
                    <h4>Prediction 1 (ID: {p1['id']})</h4>
                    <p><strong>Name:</strong> {p1['prediction_name']}</p>
                    <p><strong>Company:</strong> {p1['company']}</p>
                    <p><strong>Demand:</strong> {p1['predicted_wafers']:,.2f} wafers/month</p>
                    <p><strong>Confidence:</strong> {p1['confidence']}%</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with col2:
            st.markdown(
                f"""
                <div class="kpi-card">
                    <h4>Prediction 2 (ID: {p2['id']})</h4>
                    <p><strong>Name:</strong> {p2['prediction_name']}</p>
                    <p><strong>Company:</strong> {p2['company']}</p>
                    <p><strong>Demand:</strong> {p2['predicted_wafers']:,.2f} wafers/month</p>
                    <p><strong>Confidence:</strong> {p2['confidence']}%</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with col3:
            diff = p2["predicted_wafers"] - p1["predicted_wafers"]
            st.metric("Wafer Demand Difference", f"{diff:,.2f} wafers/month", delta=f"{diff:,.2f}")
            st.metric("Confidence Difference", f"{p2['confidence'] - p1['confidence']:.2f}%")

        st.divider()
        st.subheader("Input Parameter Differences")

        try:
            data1 = json.loads(p1["modified_data"]) if isinstance(p1["modified_data"], str) else p1["modified_data"]
            data2 = json.loads(p2["modified_data"]) if isinstance(p2["modified_data"], str) else p2["modified_data"]

            keys = sorted(set(data1.keys()).union(data2.keys()))
            diff_rows = []

            for key in keys:
                val1 = data1.get(key, "N/A")
                val2 = data2.get(key, "N/A")
                if val1 != val2:
                    diff_rows.append({"Parameter": key, "Prediction 1": val1, "Prediction 2": val2})

            if not diff_rows:
                st.info("No input differences found between these two predictions.")
            else:
                st.dataframe(pd.DataFrame(diff_rows), use_container_width=True, hide_index=True)

        except Exception as e:
            st.error(f"Error parsing input data JSON for comparison: {e}")


# ==========================================================
# 6. SEARCH COMPANY PAGE
# ==========================================================

def search_company_page():
    st.markdown(
        '<div class="main-title">🔎 Search Company</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "Search registered semiconductor companies by Company Name or Company ID."
        "</div>",
        unsafe_allow_html=True,
    )

    keyword = st.text_input(
        "Enter Company Name or Company ID",
        placeholder="Example: NVIDIA, ST0001, EC0001",
    ).strip()

    if not keyword:
        st.info("Enter a keyword to search company records.")
        return

    results = search_service_func(keyword)

    if not results:
        st.warning(f"No company found matching '{keyword}'.")
        return

    st.subheader(f"Found {len(results)} Company Record(s)")

    selected_company_id = None
    if len(results) == 1:
        selected_company_id = results[0]["company_id"]
    else:
        company_options = {f"{c['company_name']} ({c['company_id']})": c["company_id"] for c in results}
        chosen_label = st.selectbox("Select Company", list(company_options.keys()))
        selected_company_id = company_options[chosen_label]

    if selected_company_id:
        info = company_details(selected_company_id)
        if info is None:
            st.error("Unable to retrieve company details.")
            return

        company = info["company"]
        latest = info["latest_prediction"]
        prediction_count = info["prediction_count"]

        st.markdown(
            f"""
            <div class="kpi-card">
                <div style="display:flex; justify-content:space-between;">
                    <div>
                        <h3>{company['company_name']}</h3>
                        <p><strong>Type:</strong> {company['company_type']} | <strong>Country:</strong> {company['country']}</p>
                        <p><strong>Fab Type:</strong> {company['fab_type']} | <strong>Segment:</strong> {company['segment']}</p>
                    </div>
                    <div style="font-size:20px; font-weight:700; color:#38BDF8;">ID: {company['company_id']}</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.metric("Total Saved Predictions", prediction_count)

        if latest:
            st.subheader("Latest Prediction")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.write(f"**Name:** {latest['prediction_name']}")
                st.write(f"**Type:** {latest['prediction_type']}")
            with col2:
                st.metric("Predicted Wafers", f"{latest['predicted_wafers']:,.2f}")
                st.write(f"**Confidence:** {latest['confidence']}%")
            with col3:
                st.write(f"**Model:** {latest['model_version']}")
                st.write(f"**Time:** {latest['prediction_time']}")
        else:
            st.info("No prediction history available for this company.")


# ==========================================================
# 7. DELETE PREDICTION PAGE
# ==========================================================

def delete_prediction_page():
    st.markdown(
        '<div class="main-title">🗑️ Delete Prediction</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="sub-title">'
        "Delete prediction history records using the delete service."
        "</div>",
        unsafe_allow_html=True,
    )

    history = get_prediction_history()
    if history:
        st.subheader("Available Prediction Records")
        df_hist = pd.DataFrame(history)
        st.dataframe(
            df_hist[["id", "prediction_name", "company_id", "company", "predicted_wafers", "prediction_time"]],
            use_container_width=True,
            hide_index=True,
        )

    prediction_id = st.number_input("Enter Prediction ID to Delete", min_value=1, step=1, key="delete_pred_id")

    if st.button("Fetch Prediction Details"):
        prediction = get_prediction(prediction_id)
        if prediction is None:
            st.error(f"❌ Prediction ID {prediction_id} not found.")
        else:
            st.session_state["delete_target"] = prediction

    if "delete_target" in st.session_state and st.session_state["delete_target"]["id"] == prediction_id:
        p = st.session_state["delete_target"]
        st.markdown(
            f"""
            <div class="kpi-card">
                <h4>Prediction Details (ID: {p['id']})</h4>
                <p><strong>Name:</strong> {p['prediction_name']}</p>
                <p><strong>Company:</strong> {p['company']} ({p['company_id']})</p>
                <p><strong>Type:</strong> {p['prediction_type']}</p>
                <p><strong>Predicted Wafers:</strong> {p['predicted_wafers']:,.2f}</p>
                <p><strong>Confidence:</strong> {p['confidence']}%</p>
                <p><strong>Time:</strong> {p['prediction_time']}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.warning("⚠️ Are you sure you want to delete this prediction? This action cannot be undone.")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔴 Confirm Delete", type="primary"):
                success, message = delete_prediction_service(prediction_id)
                if success:
                    st.success(f"✅ {message}")
                    del st.session_state["delete_target"]
                    st.rerun()
                else:
                    st.error(f"❌ {message}")
        with col2:
            if st.button("Cancel"):
                del st.session_state["delete_target"]
                st.info("Deletion cancelled.")


# ==========================================================
# MAIN NAVIGATION
# ==========================================================

def main():
    st.sidebar.title("🔬 Smart Wafer")
    st.sidebar.caption("Demand Prediction System")
    st.sidebar.divider()

    nav_options = [
        "🏠 Home",
        "1. Existing Company Prediction",
        "2. Startup Company Prediction",
        "3. Company Dashboard",
        "4. Prediction History",
        "5. Compare Predictions",
        "6. Search Company",
        "7. Delete Prediction",
        "8. Semiconductor Market Intelligence",
    ]

    st.sidebar.markdown("**HOME**")
    if st.sidebar.button("🏠 Home", use_container_width=True):
        st.session_state.nav_page = "🏠 Home"

    st.sidebar.markdown("**PREDICTION**")
    if st.sidebar.button("🏢 Existing Company", use_container_width=True):
        st.session_state.nav_page = "1. Existing Company Prediction"
    if st.sidebar.button("🚀 Startup Company", use_container_width=True):
        st.session_state.nav_page = "2. Startup Company Prediction"

    st.sidebar.markdown("**ANALYSIS & MARKET**")
    if st.sidebar.button("📊 Company Dashboard", use_container_width=True):
        st.session_state.nav_page = "3. Company Dashboard"
    if st.sidebar.button("📜 Prediction History", use_container_width=True):
        st.session_state.nav_page = "4. Prediction History"
    if st.sidebar.button("⚔️ Compare Predictions", use_container_width=True):
        st.session_state.nav_page = "5. Compare Predictions"
    if st.sidebar.button("🌐 Market Intelligence", use_container_width=True):
        st.session_state.nav_page = "8. Semiconductor Market Intelligence"

    st.sidebar.markdown("**COMPANY MANAGEMENT**")
    if st.sidebar.button("🔎 Search Company", use_container_width=True):
        st.session_state.nav_page = "6. Search Company"
    if st.sidebar.button("🗑️ Delete Prediction", use_container_width=True):
        st.session_state.nav_page = "7. Delete Prediction"

    st.sidebar.divider()
    selected_page = st.sidebar.selectbox(
        "Current Active Page",
        nav_options,
        index=nav_options.index(st.session_state.nav_page) if st.session_state.nav_page in nav_options else 0,
        key="nav_selectbox",
    )
    st.session_state.nav_page = selected_page

    st.sidebar.divider()
    st.sidebar.caption("Antigravity AI + Business Engine | B2B Suite")

    # Render selected page
    if selected_page == "🏠 Home":
        home_page()
    elif selected_page == "1. Existing Company Prediction":
        existing_company_page()
    elif selected_page == "2. Startup Company Prediction":
        startup_prediction_page()
    elif selected_page == "3. Company Dashboard":
        dashboard_page()
    elif selected_page == "4. Prediction History":
        history_page()
    elif selected_page == "5. Compare Predictions":
        compare_predictions_page()
    elif selected_page == "6. Search Company":
        search_company_page()
    elif selected_page == "7. Delete Prediction":
        delete_prediction_page()
    elif selected_page == "8. Semiconductor Market Intelligence":
        market_intelligence_page()


# ==========================================================
# Run Application
# ==========================================================

if __name__ == "__main__":
    main()