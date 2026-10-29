import time
from selenium.webdriver.common.by import By
import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, WashCustomizationModal, WalletOtpModal


@pytest.mark.blackbox
class TestInsufficientBalanceBoundary:
    """TC11: Black Box Boundary Value Testing for Insufficient Balance Blocker Module."""

    def test_insufficient_balance_disables_booking_and_prompts_recharge(self, fresh_page):
        """Verify that when customized price exceeds wallet balance, booking is blocked and top-up is prompted."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        wash_modal = WashCustomizationModal(fresh_page)
        wallet_modal = WalletOtpModal(fresh_page)

        login_page.login_as_alex_johnson()
        # Alex has ₹150.00
        student_portal.click_first_available_book_slot()
        assert wash_modal.is_open()

        # Set 30 clothes with hot water & ironing -> Price = ₹305.00 (> ₹150.00)
        wash_modal.set_clothes_count(30)
        wash_modal.select_hot_water()
        wash_modal.toggle_ironing()

        # Check total price > balance
        price_text = wash_modal.get_total_price_text()
        assert "₹305.00" in price_text

        # Verify insufficient balance warning appears
        warning_box = (By.XPATH, "//div[contains(.,'Insufficient balance') and contains(@class,'bg-rose-50')]")
        assert wash_modal.is_visible(*warning_box, timeout=5)

        # Verify confirm button is disabled
        confirm_btn = wash_modal.find(*wash_modal.CONFIRM_BTN)
        assert not confirm_btn.is_enabled() or "cursor-not-allowed" in confirm_btn.get_attribute("class")

        # Click "+ Recharge via OTP" inside the warning
        recharge_prompt_btn = (By.XPATH, "//button[contains(.,'Recharge via OTP')]")
        wash_modal.click(*recharge_prompt_btn)
        time.sleep(0.5)

        # Verify seamlessly routed to Wallet OTP modal
        assert wallet_modal.is_open(), "Recharge prompt should directly open the Wallet OTP modal."
