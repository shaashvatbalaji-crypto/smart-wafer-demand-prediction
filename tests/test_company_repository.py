from database.company_repository import *

print("=" * 60)
print("CREATE COMPANY TEST")
print("=" * 60)

company = {

    "company_name": "Tiny FAB",

    "company_type": "Startup",

    "country": "IND",

    "fab_type": "logic_leading",

    "segment": "foundry"

}

company_id = create_company(company)

print()

print("Company ID:", company_id)

print()

print(find_company_by_name("Tiny FAB"))
