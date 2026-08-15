"""
main.py

Smart Wafer Demand Prediction System
Main Application
"""

import os

from src.company_prediction import main as existing_company
from src.startup_prediction import main as startup_company
from src.dashboard import main as dashboard
from src.history import main as history
from src.compare_predictions import main as compare_predictions
from src.search_company import main as search_company
from src.delete_prediction import main as delete_prediction


# ==========================================================
# Helper Functions
# ==========================================================

def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def pause():
    input("\nPress Enter to Continue...")


# ==========================================================
# Menu
# ==========================================================

def show_menu():

    clear_screen()

    print("=" * 70)
    print("SMART WAFER DEMAND PREDICTION SYSTEM")
    print("=" * 70)

    print("1. Existing Company Prediction")
    print("2. Startup Company Prediction")
    print("3. Company Dashboard")
    print("4. Prediction History")
    print("5. Compare Predictions")
    print("6. Search Company")
    print("7. Delete Prediction")
    print("8. Exit")

    print("=" * 70)


# ==========================================================
# Main Loop
# ==========================================================

def main():

    while True:

        show_menu()

        choice = input("Select Option : ").strip()

        clear_screen()

        try:

            # ==================================================
            # Existing Company Prediction
            # ==================================================

            if choice == "1":

                existing_company()
                pause()

            # ==================================================
            # Startup Company Prediction
            # ==================================================

            elif choice == "2":

                startup_company()
                pause()

            # ==================================================
            # Company Dashboard
            # ==================================================

            elif choice == "3":

                dashboard()
                pause()

            # ==================================================
            # Prediction History
            # ==================================================

            elif choice == "4":

                history()
                pause()

            # ==================================================
            # Compare Predictions
            # ==================================================

            elif choice == "5":

                compare_predictions()
                pause()

            # ==================================================
            # Search Company
            # ==================================================

            elif choice == "6":

                search_company()
                pause()

            # ==================================================
            # Delete Prediction
            # ==================================================

            elif choice == "7":

                delete_prediction()
                pause()

            # ==================================================
            # Exit
            # ==================================================

            elif choice == "8":

                print("\nThank you for using Smart Wafer Demand Prediction System.")
                print("Goodbye! Have a nice Day")
                break

            # ==================================================
            # Invalid Choice
            # ==================================================

            else:

                print("\n❌ Invalid Choice.")
                pause()

        except KeyboardInterrupt:

            print("\n\nProgram Interrupted by User.")
            break

        except Exception as e:

            print("\n❌ ERROR")
            print("-" * 70)
            print(type(e).__name__)
            print(e)
            pause()


# ==========================================================

if __name__ == "__main__":
    main()