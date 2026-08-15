def explain_prediction(startup):

    reasons = []

    # Revenue
    if startup["expected_revenue"] >= 5:
        reasons.append("High projected annual revenue")
    elif startup["expected_revenue"] >= 1:
        reasons.append("Moderate projected annual revenue")
    else:
        reasons.append("Early-stage startup with limited revenue")

    # CapEx
    if startup["capex"] >= 2:
        reasons.append("Strong capital investment")
    elif startup["capex"] >= 0.5:
        reasons.append("Moderate capital investment")
    else:
        reasons.append("Limited manufacturing investment")

    # R&D
    if startup["rd_budget"] >= 1:
        reasons.append("Significant R&D spending")
    elif startup["rd_budget"] >= 0.3:
        reasons.append("Moderate R&D investment")
    else:
        reasons.append("Limited R&D budget")

    # Technology Node
    if startup["process_node_nm"] <= 3:
        reasons.append("Cutting-edge semiconductor technology")
    elif startup["process_node_nm"] <= 7:
        reasons.append("Advanced semiconductor process node")
    elif startup["process_node_nm"] <= 14:
        reasons.append("Modern semiconductor process node")
    else:
        reasons.append("Mature semiconductor process node")

    # Shipments
    if startup["expected_shipments"] >= 1_000_000:
        reasons.append("Very large expected shipment volume")
    elif startup["expected_shipments"] >= 100_000:
        reasons.append("Large expected shipment volume")
    elif startup["expected_shipments"] >= 20_000:
        reasons.append("Moderate shipment expectations")
    else:
        reasons.append("Low expected shipment volume")

    return reasons