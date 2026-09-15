"""
test_company_db.py

Test searching for a company in the MySQL database.
"""

from database.company_repository import find_company


def main():

    print("=" * 60)
    print("SMART WAFER DEMAND PREDICTION")
    print("COMPANY DATABASE SEARCH")
    print("=" * 60)

    company_name = input("\nEnter Company Name: ").strip()

    company = find_company(company_name)

    if company:

        print("\n" + "=" * 60)
        print("✅ COMPANY FOUND")
        print("=" * 60)

        for key, value in company.items():
            print(f"{key:<20}: {value}")

        print("=" * 60)

    else:

        print("\n❌ Company Not Found.")


if __name__ == "__main__":
    main()
