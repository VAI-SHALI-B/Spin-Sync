from selenium.webdriver.common.by import By
from .base_page import BasePage


class BlockedModal(BasePage):
    """Page Object for 'Booking Blocked - Ongoing Wash in Progress' Modal."""

    MODAL_TITLE = (By.XPATH, "//h3[contains(.,'Booking Blocked - Ongoing Wash in Progress')]")
    MODAL_MESSAGE = (By.XPATH, "//p[contains(@class,'text-xs') and contains(.,'active wash booking')]")
    UNDERSTOOD_BTN = (By.XPATH, "//button[contains(.,'Understood')]")

    def is_open(self, timeout=5):
        return self.is_visible(*self.MODAL_TITLE, timeout=timeout)

    def get_modal_message(self):
        return self.get_text(*self.MODAL_MESSAGE)

    def dismiss(self):
        self.click(*self.UNDERSTOOD_BTN)
