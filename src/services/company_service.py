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
    Find an existing startup company or create a new one.

    Returns
    -------
    dict
        {
            "company": company_record,
            "is_new": True / False
        }
    """

    company_name = startup["company"].strip()

    # ==========================================================
    # CHECK IF COMPANY ALREADY EXISTS
    # ==========================================================

    existing_company = find_company_by_name(
        company_name
    )

    if existing_company:

        print(
            f"\n✓ Existing Company Found "
            f"({existing_company['company_id']})"
        )

        return {
            "company": existing_company,
            "is_new": False
        }

    # ==========================================================
    # CREATE NEW STARTUP COMPANY
    # ==========================================================

    company_data = {

        "company_name": company_name,

        "company_type": "Startup",

        "country": startup["country"],

        "fab_type": startup["fab_type"],

        "segment": startup["segment"]

    }

    company_id = create_company(
        company_data
    )

    if company_id is None:

        raise Exception(
            "Unable to create startup company."
        )

    print(
        f"\n✓ New Company Created "
        f"({company_id})"
    )

    # ==========================================================
    # GET THE NEWLY CREATED COMPANY
    # ==========================================================

    new_company = find_company_by_name(
        company_name
    )

    if new_company is None:

        raise Exception(
            "Company was created but could not "
            "be retrieved from database."
        )

    return {
        "company": new_company,
        "is_new": True
    }