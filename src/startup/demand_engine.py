import math


def technology_score(node_nm):
    """
    Smaller process node -> higher technology score
    """

    if node_nm <= 2:
        return 1.00
    elif node_nm <= 3:
        return 0.95
    elif node_nm <= 5:
        return 0.85
    elif node_nm <= 7:
        return 0.75
    elif node_nm <= 10:
        return 0.65
    elif node_nm <= 14:
        return 0.50
    elif node_nm <= 28:
        return 0.30
    else:
        return 0.15


def normalize_log(value, maximum):
    """
    Logarithmic normalization between 0 and 1.
    Handles very large differences more naturally.
    """

    value = max(value, 1e-6)

    return min(math.log10(value + 1) / math.log10(maximum + 1), 1.0)


def estimate_monthly_demand(startup):

    # -------------------------------------------------
    # Normalize inputs
    # -------------------------------------------------

    revenue_score = normalize_log(
        startup["expected_revenue"],
        200        # $200 Billion
    )

    capex_score = normalize_log(
        startup["capex"],
        80         # $80 Billion
    )

    rd_score = normalize_log(
        startup["rd_budget"],
        50         # $50 Billion
    )

    shipment_score = normalize_log(
        startup["expected_shipments"],
        1_000_000_000
    )

    tech_score = technology_score(
        startup["process_node_nm"]
    )

    # -------------------------------------------------
    # Weighted demand score
    # -------------------------------------------------

    demand_score = (

        revenue_score * 0.30 +

        capex_score * 0.25 +

        rd_score * 0.20 +

        shipment_score * 0.15 +

        tech_score * 0.10

    )

    # -------------------------------------------------
    # Convert score into monthly wafer demand
    # -------------------------------------------------

    BASE_CAPACITY = 5_000

    MAX_EXTRA_CAPACITY = 295_000

    monthly_demand = (
        BASE_CAPACITY +
        demand_score * MAX_EXTRA_CAPACITY
    )

    return round(monthly_demand)
