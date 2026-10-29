from selenium.webdriver.common.by import By
from .base_page import BasePage


class LoginPage(BasePage):
    """Page Object for SpinSync Login / Account Selection screen."""

    HUB_HEADING = (By.XPATH, "//h1[contains(.,'SpinSync Hub')]")
    SUB_HEADING = (By.XPATH, "//*[contains(.,'Select Account to Login:')]")

    ALEX_JOHNSON_BTN = (By.XPATH, "//button[contains(.,'Alex Johnson')]")
    SARAH_MILLER_BTN = (By.XPATH, "//button[contains(.,'Sarah Miller')]")
    DAVID_CHEN_BTN = (By.XPATH, "//button[contains(.,'David Chen')]")
    ADMIN_BTN = (By.XPATH, "//button[contains(.,'Facility Admin (Manager)')]")

    def is_login_screen_displayed(self, timeout=5):
        return self.is_visible(*self.HUB_HEADING, timeout=timeout)

    def login_as_alex_johnson(self):
        self.click(*self.ALEX_JOHNSON_BTN)

    def login_as_sarah_miller(self):
        self.click(*self.SARAH_MILLER_BTN)

    def login_as_david_chen(self):
        self.click(*self.DAVID_CHEN_BTN)

    def login_as_admin(self):
        self.click(*self.ADMIN_BTN)

    def login_as_user(self, user_name: str):
        user_locator = (By.XPATH, f"//button[contains(.,'{user_name}')]")
        self.click(*user_locator)
