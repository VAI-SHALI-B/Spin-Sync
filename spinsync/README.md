# SpinSync — Dual Laundry System & Selenium Black Box Automation Suite

SpinSync is a dual washer-dryer laundry management web application equipped with an automated **Black Box Test Suite** powered by **Python**, **Selenium WebDriver (Chrome)**, and **pytest** utilizing the **Page Object Model (POM)**.

---

## 🚀 Quick Start Guide

### 1. Open in VS Code
Open VS Code, press `Ctrl + K, Ctrl + O` (or **File > Open Folder...**), and select this extracted `spinsync` folder.

Or from your terminal:
```bash
code .
```

---

## 🧪 Running the Selenium Black Box Tests

### Prerequisites
Make sure Python (3.10+) and Google Chrome are installed.

### Option A: Via Python Test Runner (Recommended)
From the project root:

1. **Install test dependencies (first time only):**
   ```bash
   python -m venv .venv
   .\.venv\Scripts\pip install -r selenium_tests\requirements.txt
   ```

2. **Run All Tests (Headless Mode):**
   ```bash
   python run_selenium_tests.py
   ```

3. **Run All Tests (Headed Mode — Watch Chrome run live):**
   ```bash
   python run_selenium_tests.py --headed
   ```

---

### Option B: Via NPM Scripts
From the project root:
```bash
# Run headless
npm run test:selenium

# Run headed (visible browser)
npm run test:selenium:headed
```

---

## 📊 Viewing the Test Report

After running the tests, an interactive HTML report is automatically generated at:
```
selenium_tests/reports/report.html
```
Double-click `report.html` to open it in any web browser.

---

## 💻 Running the Web Application (Development)

To run the SpinSync frontend web application independently:

```bash
# Navigate to the frontend app directory
cd spinsync

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
spinsync/
├── selenium_tests/                  # Selenium Black Box Testing Framework
│   ├── conftest.py                  # Pytest fixtures, browser options, clean state reset
│   ├── pytest.ini                   # Pytest configuration & markers
│   ├── requirements.txt             # Python dependencies (selenium, pytest, pytest-html)
│   ├── pages/                       # Page Object Model Layer
│   │   ├── base_page.py             # Explicit waits, element interactions, toast detection
│   │   ├── login_page.py            # SpinSync Hub account selection
│   │   ├── student_portal_page.py   # Student dashboard, wallet, calendar, slots
│   │   ├── admin_portal_page.py     # Admin operations center, fleet management, approvals
│   │   ├── wash_customization_modal.py # Customization options, dynamic pricing
│   │   ├── wallet_otp_modal.py      # 2-step OTP wallet recharge
│   │   └── blocked_modal.py         # Ongoing wash double booking warning modal
│   ├── tests/                       # 8 Test Suites (17 Test Cases)
│   │   ├── test_01_authentication_and_roles.py
│   │   ├── test_02_wash_customization_pricing.py
│   │   ├── test_03_slot_booking_zero_premature_debit.py
│   │   ├── test_04_ongoing_wash_constraint.py
│   │   ├── test_05_wallet_otp_recharge.py
│   │   ├── test_06_admin_machine_fleet_management.py
│   │   ├── test_07_admin_approval_and_completion_lifecycle.py
│   │   └── test_08_booking_cancellation.py
│   └── reports/
│       └── report.html              # Self-contained HTML execution report
├── spinsync/                        # SpinSync Web Application (React + Vite + Tailwind)
│   ├── src/                         # Application source code
│   ├── dist/                        # Production build
│   └── package.json                 # Web app scripts and dependencies
├── run_selenium_tests.py            # One-click test runner (starts Vite, runs pytest, generates report)
├── package.json                     # Root npm script runner
├── BLACK_BOX_TEST_SPEC.md           # Formal Test Specification & Traceability Matrix
└── README.md                        # This setup guide
```
