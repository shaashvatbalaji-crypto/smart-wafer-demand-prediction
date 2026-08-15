"""
startup_classifier.py

Classifies the startup maturity level and
evaluates its investment readiness.
"""


def classify_startup(startup):
    """
    Classify startup based on projected annual revenue.
    Revenue is in USD Billions.
    """

    revenue = startup["expected_revenue"]

    if revenue < 0.05:
        return "Prototype Stage"

    elif revenue < 0.20:
        return "Early Stage"

    elif revenue < 1.00:
        return "Growth Stage"

    elif revenue < 5.00:
        return "Scale-up"

    else:
        return "Enterprise"


def investment_rating(startup):
    """
    Evaluate overall investment readiness.
    """

    score = 0

    # Revenue
    if startup["expected_revenue"] >= 1:
        score += 25

    # Capital Investment
    if startup["capex"] >= 0.5:
        score += 25

    # R&D Investment
    if startup["rd_budget"] >= 0.2:
        score += 25

    # Production Capacity
    if startup["expected_shipments"] >= 100000:
        score += 25

    if score >= 90:
        return "Excellent"

    elif score >= 70:
        return "Good"

    elif score >= 50:
        return "Average"

    else:
        return "Needs Improvement"


def startup_summary(startup):
    """
    Returns a summary containing both the
    startup stage and investment rating.
    """

    return {
        "startup_stage": classify_startup(startup),
        "investment_rating": investment_rating(startup)
    }