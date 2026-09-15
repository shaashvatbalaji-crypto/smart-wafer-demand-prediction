"""
startup_defaults.py

Default values used when the startup does not provide
hardware or geopolitical information.
"""

DEFAULTS = {

    # ============================================
    # Hardware Defaults
    # ============================================

    "avg_memory_gb": 32,
    "avg_fp16_tflops": 1000,
    "avg_tdp": 350,

    # ============================================
    # Chip Pricing
    # ============================================

    "avg_chip_price": 18000,
    "highest_chip_price": 30000,
    "lowest_chip_price": 8000,

    "price_index": 1.0,
    "price_volatility": 0.20,

    # ============================================
    # Export Restrictions
    # ============================================

    "export_control_events": 0,
    "avg_severity_score": 0.10,

    "export_risk_score": 0.10,
    "geo_risk": 0.15,

    # ============================================
    # AI Scores
    # ============================================

    "performance_score": 75,
    "performance_per_watt": 2.2,

    "innovation_score": 65,
    "investment_score": 60,
    "ai_market_score": 55
}
