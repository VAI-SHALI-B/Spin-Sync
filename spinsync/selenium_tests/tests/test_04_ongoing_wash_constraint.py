import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, WashCustomizationModal, BlockedModal


@pytest.mark.blackbox
class TestOngoingWashConstraint:
    """TC04: Negative Testing & State Constraint for Active Wash Double Booking Prevention."""

    def test_01_existing_active_wash_blocks_new_booking_attempt(self, fresh_page):
        """Sarah Miller (has ongoing booking) is blocked from booking a second slot."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        blocked_modal = BlockedModal(fresh_page)

        login_page.login_as_sarah_miller()
        assert student_portal.has_ongoing_wash_in_progress(), "Sarah Miller should have ongoing wash."

        # Attempt to click an open Book Slot button
        student_portal.click_first_available_book_slot()

        assert blocked_modal.is_open(), "Blocked alert modal must appear when double-booking is attempted."
        msg = blocked_modal.get_modal_message()
        assert "Sarah Miller has an active wash booking" in msg, f"Expected active booking explanation, got: {msg}"

        blocked_modal.dismiss()
        assert not blocked_modal.is_open(), "Modal should close upon clicking Understood."

    def test_02_dynamic_booking_transitions_to_blocked_state(self, fresh_page):
        """Alex Johnson books 1 slot, then immediately gets blocked on 2nd attempt."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        wash_modal = WashCustomizationModal(fresh_page)
        blocked_modal = BlockedModal(fresh_page)

        login_page.login_as_alex_johnson()
        assert student_portal.is_eligible_to_book()

        # Step 1: Book initial slot
        student_portal.click_first_available_book_slot()
        wash_modal.confirm_booking()

        # Step 2: Attempt 2nd booking
        student_portal.click_first_available_book_slot()
        assert blocked_modal.is_open(), "Second booking attempt must trigger blocker modal."

        blocked_modal.dismiss()
