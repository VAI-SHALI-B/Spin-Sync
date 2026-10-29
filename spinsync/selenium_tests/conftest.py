import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions


def pytest_addoption(parser):
    parser.addoption(
        "--headed",
        action="store_true",
        default=False,
        help="Run browser in visible (headed) mode instead of headless.",
    )
    parser.addoption(
        "--base-url",
        action="store",
        default="http://localhost:5173",
        help="Base URL of the running SpinSync web application.",
    )
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        help="Browser type to use: chrome or edge.",
    )


@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url")


@pytest.fixture(scope="function")
def driver(request):
    headed = request.config.getoption("--headed")
    browser_type = request.config.getoption("--browser").lower()

    if browser_type == "edge":
        options = EdgeOptions()
        if not headed:
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1440,900")
        options.add_argument("--disable-gpu")
        driver_instance = webdriver.Edge(options=options)
    else:
        options = ChromeOptions()
        if not headed:
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1440,900")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        driver_instance = webdriver.Chrome(options=options)

    driver_instance.implicitly_wait(2)

    yield driver_instance

    # Capture screenshot if test failed
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        screenshots_dir = os.path.join(os.path.dirname(__file__), "reports", "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        screenshot_path = os.path.join(screenshots_dir, f"{request.node.name}.png")
        try:
            driver_instance.save_screenshot(screenshot_path)
        except Exception:
            pass

    driver_instance.quit()


@pytest.fixture(scope="function")
def fresh_page(driver, base_url):
    """
    Opens the base URL and clears client storage (localStorage & sessionStorage)
    so every black-box test begins with an isolated, clean state.
    """
    driver.get(base_url)
    try:
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
    except Exception:
        pass
    driver.get(base_url)
    time.sleep(0.5)
    return driver


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)


def pytest_html_report_title(report):
    report.title = "SpinSync Black Box Test Automation Report (Selenium)"
