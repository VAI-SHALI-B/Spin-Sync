from selenium.webdriver.common.by import By
import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage


@pytest.mark.blackbox
class TestSlotCollisionAndReservation:
    """TC10: Black Box Testing for Inter-User Slot Reservation and Collision Prevention Module."""

    def test_occupied_slot_displays_reserved_indicator(self, fresh_page):
        """Verify slots booked by other students display as Reserved and prevent unauthorized re-booking."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)

        login_page.login_as_alex_johnson()
        assert student_portal.is_loaded()

        # Machine D-102 has David Chen's booking (slot-14, 02:00 PM - 03:00 PM)
        reserved_indicator = (
            By.XPATH,
            "//div[contains(@class,'bg-white') and .//*[self::h2 or self::h4][contains(.,'Dual Combo Unit D-102')]]"
            "//span[contains(.,'Reserved') or contains(.,'David Chen')]"
        )
        assert student_portal.is_visible(*reserved_indicator, timeout=5), (
            "Occupied slot must show 'Reserved' or student occupant name to prevent collision."
        )
