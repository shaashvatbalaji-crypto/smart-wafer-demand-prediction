"""
business_engine.py

Business Rule Engine for Startup Wafer Demand Prediction
"""

def technology_score(node_nm):
    """
    Smaller process node gets a higher score.
    """

    if node_nm <= 2:
        return 1.00
    elif node_nm <= 3:
        return 0.95
    elif node_nm <= 5:
        return 0.90
    elif node_nm <= 7:
        return 0.80
    elif node_nm <= 10:
        return 0.70
    elif node_nm <= 14:
        return 0.60
    elif node_nm <= 28:
        return 0.45
    else:
        return 0.25


def revenue_score(revenue):
    """
    Revenue is in USD Billion.
    """

    return min(revenue / 5.0, 1.0)


def capex_score(capex):
    """
    Capital investment score.
    """

    return min(capex / 3.0, 1.0)


def rd_score(rd_budget):
    """
    R&D investment score.
    """

    return min(rd_budget / 1.5, 1.0)


def shipment_score(shipments):
    """
    Shipment score.
    """

    return min(shipments / 5_000_000, 1.0)


def launch_score(launches):
    """
    Product launch score.
    """

    return min(launches / 10, 1.0)


def estimate_monthly_demand(startup):
    """
    Estimate wafer demand using business rules.
    """

    rev = revenue_score(startup["expected_revenue"])
    cap = capex_score(startup["capex"])
    rd = rd_score(startup["rd_budget"])
    ship = shipment_score(startup["expected_shipments"])
    tech = technology_score(startup["process_node_nm"])
    launch = launch_score(startup["ai_chip_launches"])

    demand_score = (

        rev * 0.30 +

        cap * 0.20 +

        rd * 0.15 +

        ship * 0.20 +

        tech * 0.10 +

        launch * 0.05

    )

    # Minimum startup production
    base_demand = 5000

    # Maximum additional demand
    scaling = 250000

    monthly_demand = base_demand + demand_score * scaling

    return round(monthly_demand)
