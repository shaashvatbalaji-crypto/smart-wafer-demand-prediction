"""
company_lookup.py

Utility functions for looking up companies.

Allows searching using either:
1. Company ID
2. Company Name

Returns the complete company record.
"""

from database.company_repository import (
    find_company_by_id,
    find_company_by_name,
)


# ==========================================================
# Lookup Company
# ==========================================================

def lookup_company(keyword):
    """
    Search a company using either Company ID
    or Company Name.

    Parameters
    ----------
    keyword : str

    Returns
    -------
    dict | None
    """

    keyword = keyword.strip()

    if keyword == "":
        return None

    # ------------------------------------------------------
    # Try Company ID first
    # ------------------------------------------------------

    company = find_company_by_id(keyword)

    if company is not None:
        return company

    # ------------------------------------------------------
    # Try Company Name
    # ------------------------------------------------------

    company = find_company_by_name(keyword)

    if company is not None:
        return company

    return None


# ==========================================================
# Company Exists
# ==========================================================

def company_exists(keyword):
    """
    Returns True if company exists.
    """

    return lookup_company(keyword) is not None


# ==========================================================
# Get Company ID
# ==========================================================

def get_company_id(keyword):
    """
    Returns company_id from either
    Company Name or Company ID.

    Returns None if not found.
    """

    company = lookup_company(keyword)

    if company is None:
        return None

    return company["company_id"]


# ==========================================================
# Get Company Name
# ==========================================================

def get_company_name(keyword):
    """
    Returns company name.
    """

    company = lookup_company(keyword)

    if company is None:
        return None

    return company["company_name"]


# ==========================================================
# Quick Test
# ==========================================================

if __name__ == "__main__":

    value = input("Enter Company Name or ID : ")

    company = lookup_company(value)

    if company:

        print("\nCompany Found")

        print(f"Company ID   : {company['company_id']}")
        print(f"Company Name : {company['company_name']}")
        print(f"Type         : {company['company_type']}")
        print(f"Country      : {company['country']}")
        print(f"Fab Type     : {company['fab_type']}")
        print(f"Segment      : {company['segment']}")

    else:

        print("\nCompany Not Found")
