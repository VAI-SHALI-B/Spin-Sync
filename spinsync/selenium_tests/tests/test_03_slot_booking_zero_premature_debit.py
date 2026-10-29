import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, WashCustomizationModal


@pytest.mark.blackbox
class TestSlotBookingZeroPrematureDebit:
    """TC03: Black Box Testing for Slot Booking Request and Zero Premature Debit Policy."""

    def test_slot_booking_submission_and_wallet_preservation(self, fresh_page):
        """Verify booking request updates status to waiting approval and debits ₹0 until admin approves."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        modal = WashCustomizationModal(fresh_page)

        login_page.login_as_alex_johnson()
        initial_balance = student_portal.get_wallet_balance_text()
        assert "₹150.00" in initial_balance

        student_portal.click_first_available_book_slot()
        assert modal.is_open()

        # Confirm 5-cloth booking
        modal.confirm_booking()

        # Verify toast notification or overview status
        post_booking_balance = student_portal.get_wallet_balance_text()
        assert "₹150.00" in post_booking_balance, (
            f"Zero Premature Debit Policy Violation: Expected ₹150.00, found '{post_booking_balance}'"
        )

        # Verify Student has an active booking indicator
        assert student_portal.has_ongoing_wash_in_progress(), (
            "Student status should immediately shift to 'Ongoing Wash in Progress'."
        )
