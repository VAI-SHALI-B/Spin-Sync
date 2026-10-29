import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class WashCustomizationModal(BasePage):
    """Page Object for Student Wash & Ironing Customization Modal."""

    MODAL_TITLE = (By.XPATH, "//h3[contains(.,'Customize Wash & Ironing')]")
    CLOTHES_INPUT = (By.XPATH, "//input[@type='number']")
    COLD_WATER_BTN = (By.XPATH, "//button[contains(.,'Cold Water Wash')]")
    HOT_WATER_BTN = (By.XPATH, "//button[contains(.,'Hot Water Wash')]")
    IRONING_TOGGLE = (By.XPATH, "//div[contains(.,'Add Professional Steam Ironing Service') and contains(@class,'cursor-pointer')]")
    TOTAL_PRICE = (By.XPATH, "//span[contains(@class,'text-cyan-700') and contains(@class,'font-extrabold')]")
    CONFIRM_BTN = (By.XPATH, "//button[contains(.,'Confirm & Book Slot')]")
    CANCEL_BTN = (By.XPATH, "//button[text()='Cancel']")

    def is_open(self, timeout=5):
        return self.is_visible(*self.MODAL_TITLE, timeout=timeout)

    def set_clothes_count(self, count: int):
        self.type_text(*self.CLOTHES_INPUT, str(count))
        time.sleep(0.3)

    def select_preset_clothes(self, count: int):
        preset_btn = (By.XPATH, f"//button[normalize-space(text())='{count}']")
        self.click(*preset_btn)
        time.sleep(0.3)

    def select_cold_water(self):
        self.click(*self.COLD_WATER_BTN)
        time.sleep(0.3)

    def select_hot_water(self):
        self.click(*self.HOT_WATER_BTN)
        time.sleep(0.3)

    def toggle_ironing(self):
        self.click(*self.IRONING_TOGGLE)
        time.sleep(0.3)

    def get_total_price_text(self):
        return self.get_text(*self.TOTAL_PRICE)

    def confirm_booking(self):
        self.click(*self.CONFIRM_BTN)

    def cancel(self):
        self.click(*self.CANCEL_BTN)
