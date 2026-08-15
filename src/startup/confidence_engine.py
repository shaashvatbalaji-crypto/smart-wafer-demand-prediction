def calculate_confidence(startup):
    """
    Estimate confidence (0-100%) based on the maturity
    and completeness of the startup profile.
    """

    score = 30  # Base confidence

    # -------------------------------------------------
    # Revenue
    # -------------------------------------------------
    revenue = startup["expected_revenue"]

    if revenue >= 10:
        score += 20
    elif revenue >= 1:
        score += 15
    elif revenue >= 0.1:
        score += 10
    elif revenue >= 0.01:
        score += 5

    # -------------------------------------------------
    # CapEx
    # -------------------------------------------------
    capex = startup["capex"]

    if capex >= 5:
        score += 15
    elif capex >= 1:
        score += 10
    elif capex >= 0.1:
        score += 5

    # -------------------------------------------------
    # R&D Budget
    # -------------------------------------------------
    rd = startup["rd_budget"]

    if rd >= 2:
        score += 15
    elif rd >= 0.5:
        score += 10
    elif rd >= 0.05:
        score += 5

    # -------------------------------------------------
    # Expected Shipments
    # -------------------------------------------------
    shipments = startup["expected_shipments"]

    if shipments >= 10_000_000:
        score += 20
    elif shipments >= 1_000_000:
        score += 15
    elif shipments >= 100_000:
        score += 10
    elif shipments >= 10_000:
        score += 5

    # -------------------------------------------------
    # Technology Node
    # -------------------------------------------------
    node = startup["process_node_nm"]

    if node <= 3:
        score += 10
    elif node <= 5:
        score += 8
    elif node <= 7:
        score += 6
    elif node <= 14:
        score += 4
    elif node <= 28:
        score += 2

    return min(round(score), 100)