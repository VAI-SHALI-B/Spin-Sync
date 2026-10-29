import time
from selenium.webdriver.common.by import By
import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, AdminPortalPage, WashCustomizationModal


@pytest.mark.blackbox
class TestAdminApprovalAndCompletionLifecycle:
    """TC07: Complete End-to-End Black Box Lifecycle: Booking -> Approval -> Financial Settlement -> Completion."""

    def test_full_wash_lifecycle_and_wallet_settlement(self, fresh_page):
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        admin_portal = AdminPortalPage(fresh_page)
        wash_modal = WashCustomizationModal(fresh_page)

        # 1. Student Alex Johnson initiates booking
        login_page.login_as_alex_johnson()
        assert "₹150.00" in student_portal.get_wallet_balance_text()

        student_portal.click_first_available_book_slot()
        # Default 5 clothes cold wash = ₹25.00
        wash_modal.confirm_booking()

        # Check zero premature debit
        assert "₹150.00" in student_portal.get_wallet_balance_text()
        assert student_portal.has_ongoing_wash_in_progress()

        # 2. Logout student and login Admin
        student_portal.logout()
        login_page.login_as_admin()
        assert "₹500.00" in admin_portal.get_revenue_balance_text()

        # 3. Admin approves booking
        admin_portal.approve_first_booking()
        time.sleep(0.5)

        # Revenue should increase by ₹25.00 -> ₹525.00
        new_admin_rev = admin_portal.get_revenue_balance_text()
        assert "₹525.00" in new_admin_rev, f"Admin revenue should increase to ₹525.00, got: {new_admin_rev}"

        # 4. Admin marks wash as Finished
        admin_portal.mark_finished_first_booking()
        time.sleep(0.5)

        # 5. Logout Admin and return as Alex Johnson
        admin_portal.logout()
        login_page.login_as_alex_johnson()

        # Verify Alex's wallet was debited by ₹25.00 -> ₹125.00
        final_student_bal = student_portal.get_wallet_balance_text()
        assert "₹125.00" in final_student_bal, f"Student wallet should reflect ₹125.00, got: {final_student_bal}"

        # Verify Alex is freed and eligible to book again
        assert student_portal.is_eligible_to_book(), "Student should be eligible to book after wash finishes."
