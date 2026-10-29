import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class BasePage:
    """Base class for all Page Objects providing common browser operations and explicit waits."""

    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(driver, timeout)

    def find(self, by, locator, timeout=None):
        wait = WebDriverWait(self.driver, timeout or self.timeout)
        return wait.until(EC.presence_of_element_located((by, locator)))

    def find_visible(self, by, locator, timeout=None):
        wait = WebDriverWait(self.driver, timeout or self.timeout)
        return wait.until(EC.visibility_of_element_located((by, locator)))

    def find_all(self, by, locator):
        return self.driver.find_elements(by, locator)

    def click(self, by, locator, timeout=None):
        element = WebDriverWait(self.driver, timeout or self.timeout).until(
            EC.element_to_be_clickable((by, locator))
        )
        try:
            element.click()
        except Exception:
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.2)
            try:
                element.click()
            except Exception:
                self.driver.execute_script("arguments[0].click();", element)

    def type_text(self, by, locator, text, clear_first=True, timeout=None):
        element = self.find_visible(by, locator, timeout)
        if clear_first:
            element.clear()
        element.send_keys(text)

    def get_text(self, by, locator, timeout=None):
        element = self.find_visible(by, locator, timeout)
        return element.text.strip()

    def is_visible(self, by, locator, timeout=3):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, locator))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def is_present(self, by, locator, timeout=3):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, locator))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def wait_for_text(self, by, locator, expected_text, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.text_to_be_present_in_element((by, locator), expected_text)
        )

    def wait_for_disappear(self, by, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.invisibility_of_element_located((by, locator))
        )

    def get_toast_message(self, timeout=5):
        """Captures any floating toast notification text (success/error/info)."""
        toast_locator = (By.XPATH, "//div[contains(@class,'fixed') and contains(@class,'z-50') and contains(@class,'rounded-xl')]")
        try:
            toast = WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(toast_locator)
            )
            return toast.text.strip()
        except TimeoutException:
            return None
