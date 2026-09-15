"""
company_repository.py

Repository for managing all companies
(Existing + Startup)
"""

from database.db import get_connection


# ==========================================================
# Generate Company ID
# ==========================================================

def generate_company_id(company_type):
    """
    Generates IDs like:

    Existing -> EC0001
    Startup  -> ST0001
    """

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor()

    try:

        prefix = "EC" if company_type == "Existing" else "ST"

        query = """
        SELECT company_id
        FROM companies
        WHERE company_type = %s
        ORDER BY company_id DESC
        LIMIT 1
        """

        cursor.execute(query, (company_type,))

        result = cursor.fetchone()

        if result:

            last_id = result[0]

            number = int(last_id[2:]) + 1

        else:

            number = 1

        return f"{prefix}{number:04d}"

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Find Company by Name
# ==========================================================

def find_company_by_name(company_name):
    """
    Returns company details if found.
    Otherwise returns None.
    """

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT *
        FROM companies
        WHERE company_name = %s
        """

        cursor.execute(query, (company_name,))

        return cursor.fetchone()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Find Company by ID
# ==========================================================

def find_company_by_id(company_id):
    """
    Returns company details using company_id.
    """

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT *
        FROM companies
        WHERE company_id = %s
        """

        cursor.execute(query, (company_id,))

        return cursor.fetchone()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# Check Company Exists
# ==========================================================

def company_exists(company_name):
    """
    Returns True if company exists.
    """

    return find_company_by_name(company_name) is not None

# ==========================================================
# Create Company
# ==========================================================

def create_company(company):
    """
    Creates a new company if it does not already exist.

    Returns:
        company_id
    """

    # Already exists?
    existing = find_company_by_name(company["company_name"])

    if existing:
        return existing["company_id"]

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor()

    try:

        company_id = generate_company_id(
            company["company_type"]
        )

        query = """
        INSERT INTO companies
        (
            company_id,
            company_name,
            company_type,
            country,
            fab_type,
            segment
        )
        VALUES
        (
            %s,%s,%s,%s,%s,%s
        )
        """

        values = (

            company_id,

            company["company_name"],

            company["company_type"],

            company["country"],

            company["fab_type"],

            company["segment"]

        )

        cursor.execute(query, values)

        conn.commit()

        return company_id

    finally:

        cursor.close()
        conn.close()

# ==========================================================
# Search Company
# ==========================================================

def search_company(keyword):
    """
    Searches companies by Company ID or Company Name.

    Returns
    -------
    list
        List of matching companies.
    """

    conn = get_connection()

    if conn is None:
        return []

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
        SELECT *
        FROM companies
        WHERE
            company_id LIKE %s
            OR company_name LIKE %s
        ORDER BY company_name
        """

        search_text = f"%{keyword}%"

        cursor.execute(
            query,
            (search_text, search_text)
        )

        return cursor.fetchall()

    finally:

        cursor.close()
        conn.close()
