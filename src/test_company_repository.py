from database.company_repository import *

print(generate_company_id("Existing"))
print(generate_company_id("Startup"))

print()

print(find_company_by_name("Intel"))

print()

print(company_exists("TSMC"))

print(company_exists("Tiny FAB"))