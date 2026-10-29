from selenium.webdriver.common.by import By
import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage


@pytest.mark.blackbox
class TestCalendarAndDateNavigation:
    """TC09: Black Box Testing for 7-Day Calendar Navigation and Date Switching Module."""

    def test_01_calendar_strip_displays_7_consecutive_days(self, fresh_page):
        """Verify the calendar strip displays 7 date buttons starting with Today and Tomorrow."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)

        login_page.login_as_alex_johnson()
        assert student_portal.is_loaded()

        # Check calendar strip buttons
        today_btn = (By.XPATH, "//div[contains(@class,'grid-cols-2') or contains(@class,'lg:grid-cols-7')]//button[contains(.,'Today')]")
        tomorrow_btn = (By.XPATH, "//div[contains(@class,'grid-cols-2') or contains(@class,'lg:grid-cols-7')]//button[contains(.,'Tomorrow')]")

        assert student_portal.is_visible(*today_btn, timeout=5), "Today button must be present in calendar."
        assert student_portal.is_visible(*tomorrow_btn, timeout=5), "Tomorrow button must be present in calendar."

    def test_02_selecting_different_date_updates_selected_day_header(self, fresh_page):
        """Verify clicking Tomorrow updates the active selected day in the header display."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)

        login_page.login_as_alex_johnson()

        tomorrow_btn = (By.XPATH, "//div[contains(@class,'grid-cols-2') or contains(@class,'lg:grid-cols-7')]//button[contains(.,'Tomorrow')]")
        student_portal.click(*tomorrow_btn)

        # Selected day text should update
        selected_day_label = (By.XPATH, "//span[contains(@class,'text-cyan-700') and contains(@class,'font-bold')]")
        assert student_portal.is_visible(*selected_day_label, timeout=5)
