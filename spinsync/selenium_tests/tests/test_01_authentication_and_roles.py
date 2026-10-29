import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, AdminPortalPage


@pytest.mark.blackbox
@pytest.mark.smoke
class TestAuthenticationAndRoles:
    """TC01: Black Box Testing for Authentication, User Profiles, and RBAC."""

    def test_01_hub_entrypoint_rendering(self, fresh_page):
        """Verify the SpinSync Hub entrypoint renders all student and admin options."""
        login_page = LoginPage(fresh_page)
        assert login_page.is_login_screen_displayed(), "SpinSync Hub heading should be visible."
        assert login_page.is_present(*login_page.ALEX_JOHNSON_BTN), "Alex Johnson should be available."
        assert login_page.is_present(*login_page.ADMIN_BTN), "Facility Admin should be available."

    def test_02_student_login_and_dashboard_verification(self, fresh_page):
        """Verify Student login loads student portal with room number and wallet balance."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)

        login_page.login_as_alex_johnson()
        assert student_portal.is_loaded(), "Student portal should be displayed."

        logged_in_text = student_portal.get_logged_in_text()
        assert "Alex Johnson" in logged_in_text, f"Expected Alex Johnson in '{logged_in_text}'"
        assert "Room 204" in logged_in_text, f"Expected Room 204 in '{logged_in_text}'"

        balance_text = student_portal.get_wallet_balance_text()
        assert "₹150.00" in balance_text, f"Expected ₹150.00 initial balance, got '{balance_text}'"
        assert student_portal.is_eligible_to_book(), "Alex Johnson should initially be eligible to book."

    def test_03_facility_admin_login_and_dashboard_verification(self, fresh_page):
        """Verify Admin login loads operations center with revenue wallet and management tools."""
        login_page = LoginPage(fresh_page)
        admin_portal = AdminPortalPage(fresh_page)

        login_page.login_as_admin()
        assert admin_portal.is_loaded(), "Admin master portal should be displayed."

        revenue_text = admin_portal.get_revenue_balance_text()
        assert "₹500.00" in revenue_text, f"Expected ₹500.00 opening revenue balance, got '{revenue_text}'"

        assert admin_portal.is_visible(*admin_portal.ADD_MACHINE_BTN), "Admin should have Add Machine button."
        assert admin_portal.is_visible(*admin_portal.MANAGE_MACHINES_TOGGLE_BTN), "Admin should have Manage Machines button."

    def test_04_logout_and_session_switching(self, fresh_page):
        """Verify logging out returns cleanly to the SpinSync Hub account selection."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)

        login_page.login_as_alex_johnson()
        assert student_portal.is_loaded()

        student_portal.logout()
        assert login_page.is_login_screen_displayed(), "Logout should navigate back to Login Hub."
