import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class WalletOtpModal(BasePage):
    """Page Object for Student Wallet and 2-Step OTP Recharge Modal."""

    MODAL_TITLE = (By.XPATH, "//h3[contains(.,'Student Laundry Wallet')]")
    WALLET_BALANCE = (By.XPATH, "//div[contains(@class,'from-emerald-600')]//div[contains(@class,'font-mono')]")
    CLOSE_BTN = (By.XPATH, "//div[contains(@class,'fixed')]//button[contains(@class,'rounded-lg') and .//*[name()='svg']]")

    # Step 1: Amount Selection
    PRESET_50 = (By.XPATH, "//button[contains(.,'+₹50')]")
    PRESET_100 = (By.XPATH, "//button[contains(.,'+₹100')]")
    PRESET_200 = (By.XPATH, "//button[contains(.,'+₹200')]")
    PRESET_500 = (By.XPATH, "//button[contains(.,'+₹500')]")
    CUSTOM_AMOUNT_INPUT = (By.XPATH, "//input[@placeholder='Or enter custom amount in Rupees']")
    PROCEED_PAY_BTN = (By.XPATH, "//button[contains(.,'Proceed to Pay') or contains(.,'Proceed & Send OTP')]")

    # Step 2: OTP Verification
    OTP_SCREEN_HEADING = (By.XPATH, "//h4[contains(.,'Enter 4-Digit OTP')]")
    SIMULATED_OTP_CODE = (By.XPATH, "//div[contains(@class,'bg-cyan-50')]//strong")
    OTP_INPUT = (By.XPATH, "//input[@placeholder='••••']")
    AUTOFILL_OTP_BTN = (By.XPATH, "//button[contains(.,'Auto-fill OTP')]")
    VERIFY_OTP_BTN = (By.XPATH, "//button[@type='submit']")
    OTP_ERROR_MSG = (By.XPATH, "//p[contains(@class,'text-rose-600')]")

    # Step 3: Success Screen
    SUCCESS_HEADING = (By.XPATH, "//h4[contains(.,'Recharge Successful')]")
    DONE_BTN = (By.XPATH, "//button[contains(.,'Done / Recharge Again')]")

    def is_open(self, timeout=5):
        return self.is_visible(*self.MODAL_TITLE, timeout=timeout)

    def get_current_balance_text(self):
        return self.get_text(*self.WALLET_BALANCE)

    def select_preset_amount(self, amount: int):
        preset_btn = (By.XPATH, f"//button[contains(.,'+₹{amount}')]")
        self.click(*preset_btn)

    def enter_custom_amount(self, amount: float):
        self.type_text(*self.CUSTOM_AMOUNT_INPUT, str(amount))

    def proceed_to_otp_step(self):
        self.click(*self.PROCEED_PAY_BTN)
        self.find_visible(*self.OTP_SCREEN_HEADING, timeout=5)

    def get_simulated_otp(self):
        return self.get_text(*self.SIMULATED_OTP_CODE)

    def enter_otp(self, otp_code: str):
        self.type_text(*self.OTP_INPUT, otp_code)

    def click_autofill_otp(self):
        self.click(*self.AUTOFILL_OTP_BTN)

    def submit_otp(self):
        self.click(*self.VERIFY_OTP_BTN)

    def get_otp_error(self, timeout=3):
        if self.is_visible(*self.OTP_ERROR_MSG, timeout=timeout):
            return self.get_text(*self.OTP_ERROR_MSG)
        return None

    def is_recharge_successful(self, timeout=5):
        return self.is_visible(*self.SUCCESS_HEADING, timeout=timeout)

    def close(self):
        self.click(*self.CLOSE_BTN)
