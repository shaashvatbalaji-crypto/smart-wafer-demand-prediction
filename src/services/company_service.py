"""
company_service.py

Business logic for managing companies.
"""

from database.company_repository import (
    find_company_by_name,
    create_company,
)


def get_or_create_company(startup):
    """
    Returns the existing company if found.
    Otherwise creates a new startup company.
    """

    # Search by company name
    company = find_company_by_name(startup["company"])

    if company:

        print(f"\n✓ Existing Company Found ({company['company_id']})")

        return company

    # Build company object
    company_data = {

        "company_name": startup["company"],

        "company_type": "Startup",

        "country": startup["country"],

        "fab_type": startup["fab_type"],

        "segment": startup["segment"]

    }

    company_id = create_company(company_data)

    print(f"\n✓ New Company Created ({company_id})")

    # Return the newly created company
    return find_company_by_name(startup["company"])