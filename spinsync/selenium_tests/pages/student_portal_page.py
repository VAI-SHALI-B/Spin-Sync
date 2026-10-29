from selenium.webdriver.common.by import By
from .base_page import BasePage


class StudentPortalPage(BasePage):
    """Page Object for Student Portal view and interactions."""

    PORTAL_SUBTITLE = (By.XPATH, "//p[contains(.,'Smart Laundry & Ironing Booking Facility')]")
    LOGGED_IN_BANNER = (By.XPATH, "//p[contains(.,'Logged in:')]")
    WALLET_NAV_PILL = (By.XPATH, "//button[@title='View & Recharge Student Wallet with OTP']")
    WALLET_NAV_BALANCE = (By.XPATH, "//button[@title='View & Recharge Student Wallet with OTP']//span[contains(@class,'font-mono')]")
    ELIGIBILITY_BADGE = (By.XPATH, "//div[contains(.,'Eligible to book 1 wash slot') or contains(.,'Ongoing Wash in Progress')]")
    LOGOUT_BTN = (By.XPATH, "//button[@title='Logout / Switch Account']")

    BOOK_SLOT_BTNS = (By.XPATH, "//button[contains(.,'Book Slot')]")
    OVERVIEW_TABLE = (By.XPATH, "//table")

    def is_loaded(self, timeout=5):
        return self.is_visible(*self.PORTAL_SUBTITLE, timeout=timeout)

    def get_logged_in_text(self):
        return self.get_text(*self.LOGGED_IN_BANNER)

    def get_wallet_balance_text(self):
        return self.get_text(*self.WALLET_NAV_BALANCE)

    def open_wallet_modal(self):
        self.click(*self.WALLET_NAV_PILL)

    def is_eligible_to_book(self):
        badge = (By.XPATH, "//span[contains(.,'Eligible to book 1 wash slot')]")
        return self.is_visible(*badge, timeout=3)

    def has_ongoing_wash_in_progress(self):
        badge = (By.XPATH, "//span[contains(.,'Ongoing Wash in Progress')]")
        return self.is_visible(*badge, timeout=3)

    def get_available_book_slot_buttons(self):
        return self.find_all(*self.BOOK_SLOT_BTNS)

    def click_first_available_book_slot(self):
        self.click(*self.BOOK_SLOT_BTNS)

    def click_book_slot_by_machine_and_slot(self, machine_name: str, slot_label: str):
        locator = (
            By.XPATH,
            f"//div[contains(@class,'bg-white') and .//h3[contains(.,'{machine_name}')]]"
            f"//div[contains(.,'{slot_label}')]//button[contains(.,'Book Slot')]"
        )
        self.click(*locator)

    def cancel_first_booking(self):
        cancel_btn = (By.XPATH, "//button[contains(.,'Cancel Booking')]")
        self.click(*cancel_btn)

    def logout(self):
        self.click(*self.LOGOUT_BTN)
