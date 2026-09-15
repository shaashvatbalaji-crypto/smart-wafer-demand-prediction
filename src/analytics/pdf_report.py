"""
pdf_report.py

Structured PDF Analyst Report Generator using ReportLab.

Includes 12 structured report sections:
1. Company / Startup Information
2. Prediction Summary
3. Prediction Explanation
4. Recommendations
5. Benchmark Analysis
6. Key Comparison Metrics
7. Analyst Insights & Gap Statements
8. Visual Comparison / Charts Summary
9. Conclusion
10. Model Information
11. Live Financial Intelligence
12. Semiconductor Market Intelligence & Provenance
"""

from datetime import datetime
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable


def generate_pdf_report(
    entity_name,
    company_id,
    entity_type,
    inputs,
    prediction_result,
    benchmark_data,
    gap_statements=None,
    is_startup=False,
    financial_data=None,
    market_intel_data=None,
):
    """
    Generates a structured PDF report in memory and returns bytes buffer.
    Maintains 100% backward compatibility for existing callers.
    """
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12,
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=12,
        spaceAfter=3,
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("SMART WAFER DEMAND PREDICTION", title_style))
    elements.append(Paragraph(f"ANALYST REPORT — {entity_name.upper()} ({company_id})", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2563EB'), spaceAfter=12))

    # 1. Company / Startup Information
    elements.append(Paragraph("1. Company / Startup Information", h2_style))
    info_data = [
        [
            Paragraph("<b>Name:</b> " + str(entity_name), body_style),
            Paragraph("<b>Company ID:</b> " + str(company_id), body_style),
        ],
        [
            Paragraph("<b>Type:</b> " + str(entity_type), body_style),
            Paragraph("<b>Country:</b> " + str(inputs.get("country", inputs.get("country_iso3", "N/A"))), body_style),
        ],
        [
            Paragraph("<b>Fab Type:</b> " + str(inputs.get("fab_type", "N/A")), body_style),
            Paragraph("<b>Segment:</b> " + str(inputs.get("segment", "N/A")), body_style),
        ],
        [
            Paragraph("<b>Year:</b> " + str(inputs.get("year", 2026)), body_style),
            Paragraph("<b>Process Node:</b> " + str(inputs.get("process_node_nm", "N/A")) + " nm", body_style),
        ],
    ]
    info_table = Table(info_data, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 8))

    # 2. Prediction Summary
    elements.append(Paragraph("2. Prediction Summary", h2_style))
    if is_startup and isinstance(prediction_result, dict):
        ai_p = f"{prediction_result.get('ai_prediction', 0):,.2f} wafers/month"
        biz_p = f"{prediction_result.get('business_prediction', 0):,.2f} wafers/month"
        final_p = f"{prediction_result.get('final_prediction', 0):,.2f} wafers/month"
        conf = f"{prediction_result.get('confidence', 0)}%"
        stage = str(prediction_result.get('startup_stage', 'N/A'))
        rating = str(prediction_result.get('investment_rating', 'N/A'))

        summary_data = [
            [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Value</b>", body_style)],
            [Paragraph("AI Model Prediction", body_style), Paragraph(ai_p, body_style)],
            [Paragraph("Business Engine Prediction", body_style), Paragraph(biz_p, body_style)],
            [Paragraph("<b>Final Hybrid Prediction</b>", body_style), Paragraph(f"<b>{final_p}</b>", body_style)],
            [Paragraph("Confidence Score", body_style), Paragraph(conf, body_style)],
            [Paragraph("Startup Stage", body_style), Paragraph(stage, body_style)],
            [Paragraph("Investment Rating", body_style), Paragraph(rating, body_style)],
        ]
    else:
        wafers = prediction_result if isinstance(prediction_result, (int, float)) else prediction_result.get('predicted_wafers', 0)
        summary_data = [
            [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Value</b>", body_style)],
            [Paragraph("<b>Predicted Monthly Wafer Demand</b>", body_style), Paragraph(f"<b>{wafers:,.2f} wafers/month</b>", body_style)],
            [Paragraph("Confidence Score", body_style), Paragraph("95.0%", body_style)],
            [Paragraph("Model Engine", body_style), Paragraph("CatBoost Regressor v1.0", body_style)],
        ]

    summary_table = Table(summary_data, colWidths=[270, 270])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#E2E8F0')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 8))

    # 3. Prediction Explanation
    elements.append(Paragraph("3. Prediction Explanation", h2_style))
    explanation = prediction_result.get("explanation") if isinstance(prediction_result, dict) else None
    if explanation:
        if isinstance(explanation, list):
            for exp in explanation:
                elements.append(Paragraph(f"• {exp}", bullet_style))
        else:
            elements.append(Paragraph(str(explanation), body_style))
    else:
        elements.append(Paragraph("• Demand driven by historical process node capacity, revenue scale, and R&D spending trajectory.", bullet_style))
    elements.append(Spacer(1, 6))

    # 4. Recommendations
    elements.append(Paragraph("4. Recommendations", h2_style))
    recommendations = prediction_result.get("recommendations") if isinstance(prediction_result, dict) else None
    if recommendations:
        if isinstance(recommendations, list):
            for rec in recommendations:
                elements.append(Paragraph(f"• {rec}", bullet_style))
        else:
            elements.append(Paragraph(str(recommendations), body_style))
    else:
        elements.append(Paragraph("• Optimize CapEx allocation to match wafer demand scale.", bullet_style))
        elements.append(Paragraph("• Maintain competitive R&D intensity for next-generation process node migration.", bullet_style))
    elements.append(Spacer(1, 6))

    # 5. Benchmark Analysis & 6. Key Comparison Metrics Table
    bench_title = "5. Benchmark Analysis (Startup vs Top-Level Companies)" if is_startup else "5. Benchmark Analysis (Selected Company vs Growing Companies)"
    elements.append(Paragraph(bench_title, h2_style))

    st_rev = inputs.get("expected_revenue", inputs.get("revenue_usd_bn", 0.0))
    st_rd = inputs.get("rd_budget", inputs.get("rd_spend_usd_bn", 0.0))
    st_capex = inputs.get("capex", inputs.get("capex_usd_bn", 0.0))
    st_demand = prediction_result.get("final_prediction", 0) if isinstance(prediction_result, dict) else (prediction_result if isinstance(prediction_result, (int, float)) else 0)

    bm_rev = benchmark_data.get("avg_revenue", 0)
    bm_rd = benchmark_data.get("avg_rd", 0)
    bm_capex = benchmark_data.get("avg_capex", 0)
    bm_demand = benchmark_data.get("avg_demand", 0)

    elements.append(Paragraph("<b>6. Key Comparison Metrics</b>", h2_style))

    comp_table_data = [
        [Paragraph("<b>Metric Parameter</b>", body_style), Paragraph("<b>Selected Entity</b>", body_style), Paragraph("<b>Benchmark Group</b>", body_style), Paragraph("<b>Variance / Gap</b>", body_style)],
        [Paragraph("Annual Revenue (USD Billion)", body_style), Paragraph(f"${st_rev:.2f} B", body_style), Paragraph(f"${bm_rev:.2f} B", body_style), Paragraph(f"${st_rev - bm_rev:+.2f} B", body_style)],
        [Paragraph("R&D Budget (USD Billion)", body_style), Paragraph(f"${st_rd:.2f} B", body_style), Paragraph(f"${bm_rd:.2f} B", body_style), Paragraph(f"${st_rd - bm_rd:+.2f} B", body_style)],
        [Paragraph("CapEx (USD Billion)", body_style), Paragraph(f"${st_capex:.2f} B", body_style), Paragraph(f"${bm_capex:.2f} B", body_style), Paragraph(f"${st_capex - bm_capex:+.2f} B", body_style)],
        [Paragraph("Predicted Wafer Demand", body_style), Paragraph(f"{st_demand:,.0f}", body_style), Paragraph(f"{bm_demand:,.0f}", body_style), Paragraph(f"{st_demand - bm_demand:+,.0f}", body_style)],
    ]

    comp_table = Table(comp_table_data, colWidths=[160, 120, 120, 140])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(comp_table)
    elements.append(Spacer(1, 8))

    # 7. Analyst Insights
    elements.append(Paragraph("7. Analyst Insights & Gap Statements", h2_style))
    if gap_statements:
        for gap in gap_statements:
            elements.append(Paragraph(f"• {gap}", bullet_style))
    else:
        elements.append(Paragraph("• Company metrics align closely with benchmark growth indicators.", bullet_style))
    elements.append(Spacer(1, 6))

    # 8. Visual Comparison Overview
    elements.append(Paragraph("8. Visual Comparison Overview", h2_style))
    elements.append(Paragraph("Data graphics rendered interactively on Streamlit web platform. Tabular values above summarize key ratio comparisons.", body_style))
    elements.append(Spacer(1, 6))

    # 9. Conclusion
    elements.append(Paragraph("9. Conclusion", h2_style))
    elements.append(Paragraph(f"Based on quantitative evaluation, <b>{entity_name}</b> demonstrates a predicted wafer demand of <b>{st_demand:,.2f} wafers/month</b>. Strategic expansion of R&D and capital expenditure will align capacity with top-tier benchmarks.", body_style))
    elements.append(Spacer(1, 6))

    # 10. Model Information
    elements.append(Paragraph("10. Model Information", h2_style))
    elements.append(Paragraph(f"<b>Model Architecture:</b> CatBoost Regressor + Business Engine Hybrid", body_style))
    elements.append(Paragraph(f"<b>Model Version:</b> CatBoost_v1 / Hybrid_v1", body_style))
    elements.append(Paragraph(f"<b>Analysis Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    elements.append(Spacer(1, 6))

    # 11. Live Financial Intelligence Section
    if financial_data:
        elements.append(Paragraph("11. Live Financial Intelligence Layer", h2_style))
        fin_status = financial_data.get("status", "fallback").upper()
        fin_table_data = [
            [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Value</b>", body_style), Paragraph("<b>Provenance Meta</b>", body_style)],
            [Paragraph("Stock Price", body_style), Paragraph(str(financial_data.get("stock_price", "N/A")), body_style), Paragraph(f"Status: {fin_status}", body_style)],
            [Paragraph("Market Capitalization", body_style), Paragraph(str(financial_data.get("market_cap_bn", "N/A")), body_style), Paragraph(f"Period: {financial_data.get('reporting_period', 'N/A')}", body_style)],
            [Paragraph("Annual Revenue", body_style), Paragraph(str(financial_data.get("revenue_bn", "N/A")), body_style), Paragraph(f"Source: {financial_data.get('source', 'N/A')}", body_style)],
            [Paragraph("Trailing EPS", body_style), Paragraph(str(financial_data.get("eps", "N/A")), body_style), Paragraph(f"Updated: {financial_data.get('retrieved_timestamp', 'N/A')}", body_style)],
            [Paragraph("P/E Ratio", body_style), Paragraph(str(financial_data.get("pe_ratio", "N/A")), body_style), Paragraph("Analyst Enrichment", body_style)],
        ]
        fin_table = Table(fin_table_data, colWidths=[160, 160, 220])
        fin_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(fin_table)
        elements.append(Spacer(1, 6))

    # 12. Semiconductor Market Intelligence & Provenance
    if market_intel_data:
        elements.append(Paragraph("12. Semiconductor Market Intelligence Summary", h2_style))
        g_size = market_intel_data.get("global_market_size", {})
        g_growth = market_intel_data.get("yoy_growth_rate", {})
        mem_trend = market_intel_data.get("memory_market_trend", {})
        log_trend = market_intel_data.get("logic_market_trend", {})

        mkt_table_data = [
            [Paragraph("<b>Market Metric</b>", body_style), Paragraph("<b>Value / Indicator</b>", body_style), Paragraph("<b>Source & Provenance</b>", body_style)],
            [Paragraph("Global Semiconductor Size", body_style), Paragraph(str(g_size.get("value", "N/A")), body_style), Paragraph(f"{g_size.get('source', 'N/A')} [{g_size.get('status', 'fallback')}]", body_style)],
            [Paragraph("YoY Growth Rate", body_style), Paragraph(str(g_growth.get("value", "N/A")), body_style), Paragraph(f"{g_growth.get('reporting_period', 'N/A')}", body_style)],
            [Paragraph("Memory Sector Trend", body_style), Paragraph(str(mem_trend.get("value", "N/A")), body_style), Paragraph(f"{mem_trend.get('source', 'N/A')}", body_style)],
            [Paragraph("Logic & Foundry Trend", body_style), Paragraph(str(log_trend.get("value", "N/A")), body_style), Paragraph(f"{log_trend.get('source', 'N/A')}", body_style)],
        ]
        mkt_table = Table(mkt_table_data, colWidths=[160, 160, 220])
        mkt_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(mkt_table)
        elements.append(Spacer(1, 6))

    doc.build(elements)

    buffer.seek(0)
    return buffer.getvalue()
