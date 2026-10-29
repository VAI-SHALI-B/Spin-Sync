from selenium.webdriver.common.by import By
import pytest
from selenium_tests.pages import LoginPage, AdminPortalPage, StudentPortalPage


@pytest.mark.blackbox
class TestAdminMachineFleetManagement:
    """TC06: Black Box Testing for Admin Fleet Management and Maintenance Lockout Mode."""

    def test_01_admin_adds_new_machine_to_fleet(self, fresh_page):
        """Verify Admin can create a new machine and have it instantly added to the active fleet."""
        login_page = LoginPage(fresh_page)
        admin_portal = AdminPortalPage(fresh_page)

        login_page.login_as_admin()
        assert admin_portal.is_loaded()

        new_machine_name = "Dual Combo Unit D-106"
        admin_portal.add_new_machine(new_machine_name)

        # Verify new machine card is displayed in machine grid
        machine_heading = (By.XPATH, f"//*[self::h2 or self::h3 or self::h4][contains(.,'{new_machine_name}')]")
        assert admin_portal.is_visible(*machine_heading, timeout=5), (
            f"New machine '{new_machine_name}' must be visible in machine list."
        )

    def test_02_machine_maintenance_lockout_toggle(self, fresh_page):
        """Verify toggling a machine into maintenance pauses booking capability."""
        login_page = LoginPage(fresh_page)
        admin_portal = AdminPortalPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)

        # Step 1: Admin sets Unit D-101 to maintenance
        login_page.login_as_admin()
        admin_portal.toggle_machines_view()
        admin_portal.toggle_maintenance_for_machine("Dual Combo Unit D-101")
        assert admin_portal.is_machine_under_maintenance("Dual Combo Unit D-101")

        # Step 2: Switch to student and verify machine is locked
        admin_portal.logout()
        login_page.login_as_alex_johnson()

        maintenance_badge = (
            By.XPATH,
            "//div[contains(@class,'bg-white') and .//*[self::h2 or self::h3 or self::h4][contains(.,'Dual Combo Unit D-101')]]"
            "//*[contains(.,'Under Maintenance') or contains(.,'Maintenance') or contains(.,'MAINTENANCE')]"
        )
        assert student_portal.is_visible(*maintenance_badge, timeout=5), (
            "Machine under maintenance must show maintenance warning badge to students."
        )
