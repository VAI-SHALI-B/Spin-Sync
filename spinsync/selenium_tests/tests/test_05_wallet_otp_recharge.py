import time
import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, WalletOtpModal


@pytest.mark.blackbox
class TestWalletOtpRecharge:
    """TC05: Black Box Negative & Positive Testing for 2-Step OTP Wallet Recharge."""

    def test_01_invalid_otp_rejection_negative_test(self, fresh_page):
        """Verify entering an incorrect OTP rejects recharge and displays error message."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        wallet_modal = WalletOtpModal(fresh_page)

        login_page.login_as_alex_johnson()
        student_portal.open_wallet_modal()

        assert wallet_modal.is_open()
        wallet_modal.select_preset_amount(100)
        wallet_modal.proceed_to_otp_step()

        # Negative entry: purposefully wrong OTP code
        wallet_modal.enter_otp("0000")
        wallet_modal.submit_otp()

        err = wallet_modal.get_otp_error()
        assert err is not None, "Error message must be shown for incorrect OTP."
        assert "Invalid OTP" in err

        wallet_modal.close()
        # Verify wallet remains untouched
        assert "₹150.00" in student_portal.get_wallet_balance_text()

    def test_02_valid_otp_verification_credits_wallet(self, fresh_page):
        """Verify entering valid OTP successfully credits ₹100 to student wallet."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        wallet_modal = WalletOtpModal(fresh_page)

        login_page.login_as_alex_johnson()
        student_portal.open_wallet_modal()

        wallet_modal.select_preset_amount(100)
        wallet_modal.proceed_to_otp_step()

        # Positive entry: read simulated OTP code from screen
        otp_code = wallet_modal.get_simulated_otp()
        assert len(otp_code) == 4, f"Expected 4-digit code, got {otp_code}"
        wallet_modal.enter_otp(otp_code)
        wallet_modal.submit_otp()

        # Verify success screen
        assert wallet_modal.is_recharge_successful(), "Success confirmation must appear."

        wallet_modal.close()
        time.sleep(0.5)

        # Verify balance updated to ₹250.00
        new_balance = student_portal.get_wallet_balance_text()
        assert "₹250.00" in new_balance, f"Expected ₹250.00, got {new_balance}"
