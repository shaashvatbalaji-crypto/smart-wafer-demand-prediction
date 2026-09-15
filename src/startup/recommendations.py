def generate_recommendations(startup):

    recommendations = []

    # Revenue
    if startup["expected_revenue"] < 0.1:
        recommendations.append(
            "Increase projected annual revenue through customer acquisition and partnerships."
        )

    # CapEx
    if startup["capex"] < 0.1:
        recommendations.append(
            "Increase capital expenditure to improve manufacturing capability."
        )

    # R&D
    if startup["rd_budget"] < 0.05:
        recommendations.append(
            "Allocate more budget for research and development to improve competitiveness."
        )

    # Shipments
    if startup["expected_shipments"] < 10000:
        recommendations.append(
            "Increase production and market reach to improve shipment volume."
        )

    # Technology
    if startup["process_node_nm"] > 14:
        recommendations.append(
            "Consider migrating to a more advanced semiconductor process node."
        )

    if len(recommendations) == 0:
        recommendations.append(
            "Business indicators are healthy. Continue scaling production."
        )

    return recommendations
