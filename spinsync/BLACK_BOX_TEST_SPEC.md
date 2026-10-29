# SpinSync Black Box Test Automation Specification (Selenium WebDriver)

## 1. Executive Summary & Objective

This document defines the formal **Black Box Test Automation Suite** for the **SpinSync Dual Washer-Dryer & Laundry Management Portal**. 

Black box testing evaluates the system from an external end-user's perspective without inspecting underlying source code, component states, or internal database routines. All inputs, interactions, and assertions are performed strictly through the browser UI using **Selenium WebDriver**, **Python 3.13**, and **pytest**.

---

## 2. Testing Methodology & Techniques Applied

| Black Box Technique | Implementation in SpinSync | Applicable Test Cases |
| :--- | :--- | :--- |
| **Equivalence Partitioning (EP)** | Segmenting valid student accounts vs admin accounts; partitioning recharge options into presets (+₹50, +₹100, +₹200) and custom positive integers. | `TC01`, `TC05` |
| **Boundary Value Analysis (BVA)** | Minimum cloth count (1), standard loads (5, 10), and verifying price boundary points. | `TC02` |
| **Decision Table / Combinatorial** | Testing permutations of Wash Options (Cloth Count × Water Temperature × Steam Ironing) against dynamic price formulas. | `TC02` |
| **State Transition Testing** | Testing transitions between: <br>• Student: `Eligible` ➔ `Waiting Approval` ➔ `Approved` ➔ `Finished` ➔ `Eligible`.<br>• Machine: `Available` ⇄ `Under Maintenance`.<br>• Booking: `Waiting Approval` ➔ `Cancelled`. | `TC03`, `TC04`, `TC06`, `TC07`, `TC08` |
| **Negative Testing & Error Guessing** | Attempting double bookings while an active wash is running; entering an invalid 4-digit OTP during wallet recharge. | `TC04`, `TC05` |
| **End-to-End User Journeys** | Full multi-user flow from Student booking to Admin approval, wallet debit/credit settlement, and completion. | `TC07` |

---

## 3. Test Traceability Matrix

| Test Suite File | Test Scenario | Category / Technique | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `test_01_authentication_and_roles.py` | Hub Entrypoint & Account Rendering | Equivalence Partitioning / Smoke | SpinSync Hub renders all student accounts and admin account with current balances. |
| `test_01_authentication_and_roles.py` | Student Login (Alex Johnson) | RBAC / Profile Verification | Alex Johnson dashboard loads with Room 204, ₹150.00 wallet, and eligible status. |
| `test_01_authentication_and_roles.py` | Admin Login (Facility Admin) | RBAC / Privileges | Facility Admin Operations Center loads with ₹500.00 revenue and management buttons. |
| `test_01_authentication_and_roles.py` | Logout & Session Switching | Session Lifecycle | Logging out returns cleanly to Hub selection. |
| `test_02_wash_customization_pricing.py` | Default Wash Pricing | Decision Table | 5 clothes + Cold Water + No Ironing = **₹25.00**. |
| `test_02_wash_customization_pricing.py` | Hot Water + Steam Ironing Pricing | Combinatorial | 5 clothes + Hot Water (+₹5) + Ironing (+₹25) = **₹55.00**. |
| `test_02_wash_customization_pricing.py` | 10 Clothes Preset Calculation | Boundary Value Analysis | 10 clothes + Cold Water = **₹50.00**. |
| `test_02_wash_customization_pricing.py` | Heavy Duty Full Options Pricing | Combinatorial | 10 clothes + Hot Water (+₹5) + Ironing (+₹50) = **₹105.00**. |
| `test_03_slot_booking_zero_premature_debit.py` | Booking Request & Zero Debit | State Transition | Slot booked successfully; status becomes `Waiting for Approval`; wallet remains **₹150.00** (₹0 premature debit). |
| `test_04_ongoing_wash_constraint.py` | Active Wash Double Booking Blocker | Negative Testing | Sarah Miller (active booking) clicks Book Slot; warning modal pops up blocking double booking. |
| `test_04_ongoing_wash_constraint.py` | Dynamic State Transition to Blocked | State Transition | Alex books 1 slot, then 2nd attempt is immediately blocked with alert modal. |
| `test_05_wallet_otp_recharge.py` | Invalid OTP Rejection | Negative Security Flow | Entering wrong OTP ("0000") is rejected with inline error; wallet is not credited. |
| `test_05_wallet_otp_recharge.py` | Valid OTP Verification | Positive Verification Flow | Simulated SMS OTP entered; recharge succeeds and credits ₹100 to wallet (₹250.00). |
| `test_06_admin_machine_fleet_management.py` | Add Machine to Fleet | Functional Validation | Admin adds "Dual Combo Unit D-106"; machine card appears immediately in machine grid. |
| `test_06_admin_machine_fleet_management.py` | Maintenance Lockout Toggle | State Transition | Machine set to maintenance; student view shows maintenance badge and locks bookings. |
| `test_07_admin_approval_and_completion_lifecycle.py` | Full E2E Financial & Wash Lifecycle | End-to-End User Journey | Student books (₹25) ➔ Admin approves ➔ Student wallet debited to ₹125, Admin credited to ₹525 ➔ Admin marks Finished ➔ Student unblocked to book again. |
| `test_08_booking_cancellation.py` | Student Booking Cancellation | State Transition / Audit | Student cancels pending booking; status changes to Cancelled; student is freed to book again with intact wallet. |

---

## 4. Test Architecture & Design Pattern

The automation framework is built on the **Page Object Model (POM)**:
```
selenium_tests/
├── conftest.py                   # Pytest fixtures: WebDriver lifecycle, headless mode, storage reset
├── pytest.ini                    # Pytest configuration, test discovery, markers
├── requirements.txt              # Dependencies (selenium, pytest, pytest-html)
├── pages/                        # Page Object Model Layer
│   ├── base_page.py              # Common explicit waits, locator wrappers, clicks, toasts
│   ├── login_page.py             # Hub screen, student/admin account selection
│   ├── student_portal_page.py    # Student dashboard, wallet pill, calendar, booking slots
│   ├── admin_portal_page.py      # Admin control center, fleet toggles, approval queue
│   ├── wash_customization_modal.py # Wash options, temperature, ironing, dynamic price
│   ├── wallet_otp_modal.py       # 2-step OTP top-up modal, SMS extraction, verification
│   └── blocked_modal.py          # Active wash blocker warning modal
├── tests/                        # Test Execution Suites (TC01 - TC08)
│   ├── test_01_authentication_and_roles.py
│   ├── test_02_wash_customization_pricing.py
│   ├── test_03_slot_booking_zero_premature_debit.py
│   ├── test_04_ongoing_wash_constraint.py
│   ├── test_05_wallet_otp_recharge.py
│   ├── test_06_admin_machine_fleet_management.py
│   ├── test_07_admin_approval_and_completion_lifecycle.py
│   └── test_08_booking_cancellation.py
└── reports/                      # Generated HTML test reports and failure screenshots
    └── report.html
```

---

## 5. Execution Guide

### Option 1: Using the Python Test Runner
```powershell
# Headless Mode (Standard automated execution)
python run_selenium_tests.py

# Headed Mode (Watch tests run visibly in Google Chrome)
python run_selenium_tests.py --headed

# Run a specific test suite
python run_selenium_tests.py -k "test_07"
```

### Option 2: Using NPM Scripts
```powershell
# Headless run
npm run test:selenium

# Headed run
npm run test:selenium:headed
```

### Option 3: Direct Pytest Execution
```powershell
.venv\Scripts\python.exe -m pytest selenium_tests/tests -v --html=selenium_tests/reports/report.html --self-contained-html
```
