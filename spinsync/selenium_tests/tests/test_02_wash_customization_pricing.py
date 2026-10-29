import pytest
from selenium_tests.pages import LoginPage, StudentPortalPage, WashCustomizationModal


@pytest.mark.blackbox
class TestWashCustomizationPricing:
    """TC02: Black Box Combinatorial & Boundary Testing for Dynamic Wash Pricing."""

    def test_01_default_wash_pricing(self, fresh_page):
        """Verify default customization (5 clothes, cold water, no ironing) evaluates to ₹25.00."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        modal = WashCustomizationModal(fresh_page)

        login_page.login_as_alex_johnson()
        student_portal.click_first_available_book_slot()

        assert modal.is_open(), "Customization modal should open."
        price_text = modal.get_total_price_text()
        assert "₹25.00" in price_text, f"Expected default price ₹25.00, got '{price_text}'"

        modal.cancel()

    def test_02_hot_water_and_ironing_combined_pricing(self, fresh_page):
        """Verify 5 clothes with Hot Water (+₹5) and Steam Ironing (+₹25) evaluates to ₹55.00."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        modal = WashCustomizationModal(fresh_page)

        login_page.login_as_alex_johnson()
        student_portal.click_first_available_book_slot()

        modal.select_hot_water()
        modal.toggle_ironing()

        price_text = modal.get_total_price_text()
        assert "₹55.00" in price_text, f"Expected combined price ₹55.00, got '{price_text}'"

        modal.cancel()

    def test_03_cloth_count_boundary_and_preset_calculation(self, fresh_page):
        """Verify selecting 10 clothes preset with cold water calculates to ₹50.00."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        modal = WashCustomizationModal(fresh_page)

        login_page.login_as_alex_johnson()
        student_portal.click_first_available_book_slot()

        modal.select_preset_clothes(10)
        price_text = modal.get_total_price_text()
        assert "₹50.00" in price_text, f"Expected ₹50.00 for 10 clothes, got '{price_text}'"

        modal.cancel()

    def test_04_full_heavy_duty_customization_pricing(self, fresh_page):
        """Verify 10 clothes + Hot Water (+₹5) + Ironing (+₹50) calculates dynamically to ₹105.00."""
        login_page = LoginPage(fresh_page)
        student_portal = StudentPortalPage(fresh_page)
        modal = WashCustomizationModal(fresh_page)

        login_page.login_as_alex_johnson()
        student_portal.click_first_available_book_slot()

        modal.select_preset_clothes(10)
        modal.select_hot_water()
        modal.toggle_ironing()

        price_text = modal.get_total_price_text()
        assert "₹105.00" in price_text, f"Expected ₹105.00 for 10 clothes + Hot + Ironing, got '{price_text}'"

        modal.cancel()
