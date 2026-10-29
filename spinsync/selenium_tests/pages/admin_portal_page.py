from selenium.webdriver.common.by import By
from .base_page import BasePage


class AdminPortalPage(BasePage):
    """Page Object for Facility Admin Master Operations Center."""

    ADMIN_SUBTITLE = (By.XPATH, "//p[contains(.,'Facility Admin Master Portal')]")
    ADMIN_HEADER = (By.XPATH, "//h3[contains(.,'Facility Admin Operations & Control Center')]")
    REVENUE_WALLET_BTN = (By.XPATH, "//button[@title='View Admin Revenue Wallet']")
    REVENUE_WALLET_TEXT = (By.XPATH, "//button[@title='View Admin Revenue Wallet']//span[contains(@class,'font-mono')]")
    LOGOUT_BTN = (By.XPATH, "//button[@title='Logout / Switch Account']")

    ADD_MACHINE_BTN = (By.XPATH, "//button[contains(.,'Add Machine')]")
    MANAGE_MACHINES_TOGGLE_BTN = (By.XPATH, "//button[contains(.,'Manage All Machines') or contains(.,'Hide Machines View')]")

    # Add Machine Modal Locators
    MACHINE_NAME_INPUT = (By.XPATH, "//input[@placeholder='e.g. Dual Combo Unit D-106']")
    CREATE_MACHINE_BTN = (By.XPATH, "//button[contains(.,'Create Machine')]")
    CANCEL_ADD_MACHINE_BTN = (By.XPATH, "//button[contains(.,'Cancel')]")

    # Booking Actions
    APPROVE_BTN = (By.XPATH, "//button[contains(.,'Approve')]")
    REJECT_BTN = (By.XPATH, "//button[@title='Reject Booking']")
    MARK_FINISHED_BTN = (By.XPATH, "//button[contains(.,'Mark Finished')]")

    def is_loaded(self, timeout=5):
        return self.is_visible(*self.ADMIN_SUBTITLE, timeout=timeout) or self.is_visible(*self.ADMIN_HEADER, timeout=timeout)

    def get_revenue_balance_text(self):
        return self.get_text(*self.REVENUE_WALLET_TEXT)

    def open_add_machine_modal(self):
        self.click(*self.ADD_MACHINE_BTN)

    def add_new_machine(self, machine_name: str):
        self.open_add_machine_modal()
        self.type_text(*self.MACHINE_NAME_INPUT, machine_name)
        self.click(*self.CREATE_MACHINE_BTN)

    def toggle_machines_view(self):
        self.click(*self.MANAGE_MACHINES_TOGGLE_BTN)

    def toggle_maintenance_for_machine(self, machine_name: str):
        toggle_btn = (
            By.XPATH,
            f"//div[(contains(@class,'rounded-xl') or contains(@class,'rounded-2xl')) and (.//*[self::h2 or self::h4][contains(.,'{machine_name}')])]"
            f"//button[contains(.,'Mark Maintenance') or contains(.,'Set Under Maintenance') or contains(.,'Set Available')]"
        )
        self.click(*toggle_btn)

    def is_machine_under_maintenance(self, machine_name: str):
        status_text = (
            By.XPATH,
            f"//div[(contains(@class,'rounded-xl') or contains(@class,'rounded-2xl')) and (.//*[self::h2 or self::h4][contains(.,'{machine_name}')])]"
            f"//*[contains(.,'Maintenance') or contains(.,'MAINTENANCE')]"
        )
        return self.is_visible(*status_text, timeout=3)

    def approve_first_booking(self):
        self.click(*self.APPROVE_BTN)

    def reject_first_booking(self):
        self.click(*self.REJECT_BTN)

    def mark_finished_first_booking(self):
        self.click(*self.MARK_FINISHED_BTN)

    def logout(self):
        self.click(*self.LOGOUT_BTN)
