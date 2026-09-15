from predictor import predict_company

company = {

    "company": "Intel",
    "country_iso3": "USA",
    "fab_type": "logic_leading",
    "segment": "idm",

    "year": 2027,
    "process_node_nm": 3,
    "fab_age": 45,

    "revenue_usd_bn": 72,
    "operating_margin_pct": 22,
    "rd_spend_usd_bn": 18,
    "capex_usd_bn": 30,

    "operating_income_usd_bn": 18,

    "ai_chip_launches": 5,
    "total_ai_shipments": 17000000,
    "total_ai_revenue_m": 24000,

    "avg_memory_gb": 24,
    "avg_fp16_tflops": 1200,
    "avg_tdp": 380,

    "avg_chip_price": 18000,
    "highest_chip_price": 32000,
    "lowest_chip_price": 9000,

    "export_control_events": 1,
    "avg_severity_score": 0.25,

    "us_actions": 1,
    "china_actions": 1,
    "netherlands_actions": 0,

    "worldwide_sales": 520000000,
    "average_monthly_sales": 43000000,
    "max_monthly_sales": 69000000
}

prediction = predict_company(company)

print("\nPrediction")

print(f"{prediction:,.0f} wafers/month")
