import time
from selenium.webdriver.common.by import By
import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, WashCustomizationModal


@pytest.mark.blackbox
class TestBookingCancellation:
    """TC08: Black Box State Transition Testing for Student Booking Cancellation."""

    def test_student_cancels_pending_booking(self, fresh_page):
        """Verify student can cancel a pending booking, returning to eligible state with full balance."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        wash_modal = WashCustomizationModal(fresh_page)

        login_page.login_as_alex_johnson()
        assert "₹150.00" in student_portal.get_wallet_balance_text()

        # Step 1: Book a slot
        student_portal.click_first_available_book_slot()
        wash_modal.confirm_booking()
        assert student_portal.has_ongoing_wash_in_progress()

        # Step 2: Cancel the booking in the overview table
        student_portal.cancel_first_booking()
        time.sleep(0.5)

        # Step 3: Verify booking is marked Cancelled
        cancelled_badge = (By.XPATH, "//table//span[contains(.,'Cancelled')]")
        assert student_portal.is_visible(*cancelled_badge, timeout=5)

        # Step 4: Verify student is freed to book again and wallet is intact
        assert student_portal.is_eligible_to_book(), "Student should be eligible to book again after cancellation."
        assert "₹150.00" in student_portal.get_wallet_balance_text()
