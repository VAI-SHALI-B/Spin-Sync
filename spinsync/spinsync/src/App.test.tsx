import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('SpinSync Application Test Suite (Vitest + React Testing Library)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ----------------------------------------------------
  // TEST 1: Login Unit & Role Switching
  // ----------------------------------------------------
  it('renders Login Unit initially and allows Student login', async () => {
    render(<App />);

    expect(screen.getByText('SpinSync Hub')).toBeInTheDocument();
    expect(screen.getByText('Select Account to Login:')).toBeInTheDocument();

    // Click Alex Johnson (Student)
    const alexBtn = screen.getByText('Alex Johnson');
    fireEvent.click(alexBtn);

    // Verify Student Portal loads
    await waitFor(() => {
      expect(screen.getByText(/Logged in: Alex Johnson/i)).toBeInTheDocument();
      expect(screen.getByText('7-Day Booking Calendar')).toBeInTheDocument();
    });
  });

  it('allows Admin login and renders Admin Master Portal', async () => {
    render(<App />);

    // Click Facility Admin
    const adminBtn = screen.getByText('Facility Admin (Manager)');
    fireEvent.click(adminBtn);

    // Verify Admin Portal loads
    await waitFor(() => {
      expect(screen.getAllByText('Facility Admin Master Portal').length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------
  // TEST 2: Student Slot Request (Booked and Waiting for Approval)
  // ----------------------------------------------------
  it('allows a student without active wash to request a slot', async () => {
    render(<App />);

    // Login as Alex Johnson (No active wash initially)
    fireEvent.click(screen.getByText('Alex Johnson'));

    await waitFor(() => {
      expect(screen.getByText(/Logged in: Alex Johnson/i)).toBeInTheDocument();
    });

    // Click an available "Book Slot" button
    const bookSlotButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    expect(bookSlotButtons.length).toBeGreaterThan(0);
    fireEvent.click(bookSlotButtons[0]);

    // Customization modal opens
    await waitFor(() => {
      expect(screen.getByText('Customize Wash & Ironing')).toBeInTheDocument();
    });

    // Click confirm in the modal
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Book Slot/i });
    fireEvent.click(confirmBtn);

    // Verify booking status is updated to Booked and Waiting for Approval
    await waitFor(() => {
      expect(
        screen.getByText('Booked and Waiting for Approval')
      ).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // TEST 3: Ongoing Wash Restriction Rule
  // ----------------------------------------------------
  it('blocks a student from booking a second slot when an ongoing wash is in progress', async () => {
    render(<App />);

    // Sarah Miller has an initial booking in mockData
    fireEvent.click(screen.getByText('Sarah Miller'));

    await waitFor(() => {
      expect(screen.getByText(/Ongoing Wash in Progress/i)).toBeInTheDocument();
    });

    // Sarah tries to book another slot
    const bookSlotButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    if (bookSlotButtons.length > 0) {
      fireEvent.click(bookSlotButtons[0]);

      // Expect Alert Modal blocking the attempt
      await waitFor(() => {
        expect(
          screen.getByText('Booking Blocked - Ongoing Wash in Progress')
        ).toBeInTheDocument();
      });
    }
  });

  // ----------------------------------------------------
  // TEST 4: Admin Approval Workflow
  // ----------------------------------------------------
  it('allows Admin to approve a student booking request', async () => {
    render(<App />);

    // Login as Admin
    fireEvent.click(screen.getByText('Facility Admin (Manager)'));

    await waitFor(() => {
      expect(screen.getAllByText('Facility Admin Master Portal').length).toBeGreaterThan(0);
    });

    // Check for Approve button on Sarah Miller's pending wash
    const approveButtons = screen.getAllByRole('button', { name: 'Approve' });
    expect(approveButtons.length).toBeGreaterThan(0);
    fireEvent.click(approveButtons[0]);

    // Verify status changes to Approved
    await waitFor(() => {
      expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------
  // TEST 5: Admin Mark Finished & Student Re-booking Workflow
  // ----------------------------------------------------
  it('allows Admin to mark wash finished, enabling student to re-book', async () => {
    render(<App />);

    // Step 1: Admin logs in
    fireEvent.click(screen.getByText('Facility Admin (Manager)'));
    await waitFor(() => expect(screen.getAllByText('Facility Admin Master Portal').length).toBeGreaterThan(0));

    // Step 2: Approve Sarah's wash if pending
    const approveButtons = screen.queryAllByRole('button', { name: 'Approve' });
    if (approveButtons.length > 0) {
      fireEvent.click(approveButtons[0]);
    }

    // Step 3: Mark Sarah's wash finished
    await waitFor(() => {
      const markFinishedBtns = screen.getAllByRole('button', { name: 'Mark Finished' });
      expect(markFinishedBtns.length).toBeGreaterThan(0);
      fireEvent.click(markFinishedBtns[0]);
    });

    // Step 4: Logout and login as Sarah Miller
    const logoutBtn = screen.getByTitle('Logout / Switch Account');
    fireEvent.click(logoutBtn);

    await waitFor(() => expect(screen.getByText('Sarah Miller')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sarah Miller'));

    // Step 5: Verify Sarah is now eligible to book a new slot
    await waitFor(() => {
      expect(screen.getByText('Eligible to book 1 wash slot')).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // TEST 6: Wash Customization (₹5 Washing, ₹5 Ironing, Hot Water) & Debit on Approval
  // ----------------------------------------------------
  it('calculates ₹5/cloth wash + ₹5/cloth ironing, books without premature debit, and debits upon Admin approval', async () => {
    render(<App />);

    // Login as Alex Johnson (₹150.00 initial balance)
    fireEvent.click(screen.getByText('Alex Johnson'));

    await waitFor(() => {
      expect(screen.getByText(/Logged in: Alex Johnson/i)).toBeInTheDocument();
    });

    // Click Book Slot
    const bookSlotButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    fireEvent.click(bookSlotButtons[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Customize Wash & Ironing')).toBeInTheDocument();
    });

    // Select Hot Water Wash (+₹5.00)
    const hotWaterBtn = screen.getByText('Hot Water Wash');
    fireEvent.click(hotWaterBtn);

    // Toggle Ironing Service (5 clothes * ₹5.00 = +₹25.00)
    const ironingOption = screen.getByText('Add Professional Steam Ironing Service');
    fireEvent.click(ironingOption);

    // Check price calculation: 5 clothes * ₹5 (₹25) + ₹5 hot water + 5 * ₹5 (₹25) ironing = ₹55.00
    expect(screen.getByText('₹55.00')).toBeInTheDocument();

    // Confirm booking
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Book Slot/i });
    fireEvent.click(confirmBtn);

    // Verify booking is reserved and waiting approval
    await waitFor(() => {
      expect(screen.getByText('Booked and Waiting for Approval')).toBeInTheDocument();
    });

    // Verify money is NOT debited yet while waiting for approval (Alex still has ₹150.00)
    expect(screen.getByText('₹150.00')).toBeInTheDocument();

    // Now switch to Admin to approve the wash ("gets it done")
    const logoutBtn = screen.getByTitle('Logout / Switch Account');
    fireEvent.click(logoutBtn);

    await waitFor(() => expect(screen.getByText('Facility Admin (Manager)')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Facility Admin (Manager)'));

    // Admin sees the pending booking and clicks Approve
    await waitFor(() => {
      expect(screen.getAllByText('Dual Combo Unit D-101').length).toBeGreaterThan(0);
    });
    const approveBtn = screen.getAllByRole('button', { name: 'Approve' })[0];
    fireEvent.click(approveBtn);

    // Admin approves it -> Status changes to Approved
    await waitFor(() => {
      expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    });

    // Logout Admin and login back as Alex Johnson
    const adminLogoutBtn = screen.getByTitle('Logout / Switch Account');
    fireEvent.click(adminLogoutBtn);

    await waitFor(() => expect(screen.getByText('Alex Johnson')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Alex Johnson'));

    // Verify Alex's wallet is NOW debited: ₹150.00 - ₹55.00 = ₹95.00!
    await waitFor(() => {
      expect(screen.getByText('₹95.00')).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // TEST 7: Admin Machine Management (Add Machine)
  // ----------------------------------------------------
  it('allows Admin to add a new machine to the facility fleet', async () => {
    render(<App />);

    // Login as Admin
    fireEvent.click(screen.getByText('Facility Admin (Manager)'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Machine/i })).toBeInTheDocument();
    });

    // Click Add Machine
    fireEvent.click(screen.getByRole('button', { name: /Add Machine/i }));

    // Modal appears
    await waitFor(() => {
      expect(screen.getByText('Add New Dual Machine')).toBeInTheDocument();
    });

    // Fill in machine details
    const nameInput = screen.getByPlaceholderText('e.g. Dual Combo Unit D-106');
    fireEvent.change(nameInput, { target: { value: 'Dual Combo Unit D-106' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create Machine' }));

    // Verify new machine appears in schedule
    await waitFor(() => {
      expect(screen.getByText('Dual Combo Unit D-106')).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // TEST 8: Admin Machine Maintenance Toggle
  // ----------------------------------------------------
  it('allows Admin to mark a machine under maintenance and back to available', async () => {
    render(<App />);

    // Login as Admin
    fireEvent.click(screen.getByText('Facility Admin (Manager)'));

    await waitFor(() => {
      expect(screen.getAllByText('Dual Combo Unit D-101').length).toBeGreaterThan(0);
    });

    // Find and click Set Under Maintenance on D-101
    const maintenanceButtons = screen.getAllByRole('button', { name: /Set Under Maintenance/i });
    expect(maintenanceButtons.length).toBeGreaterThan(0);
    fireEvent.click(maintenanceButtons[0]);

    // Verify unit shows Under Maintenance message
    await waitFor(() => {
      expect(screen.getAllByText(/This unit is currently under maintenance/i).length).toBeGreaterThan(1);
    });

    // Set back to available
    const setAvailableBtn = screen.getAllByRole('button', { name: /Set Available/i })[0];
    fireEvent.click(setAvailableBtn);

    // Verify machine maintenance count decreases
    await waitFor(() => {
      expect(screen.getAllByText(/This unit is currently under maintenance/i).length).toBe(1);
    });
  });

  // ----------------------------------------------------
  // TEST 9: Student Wallet Top-up with OTP Verification
  // ----------------------------------------------------
  it('allows student to recharge wallet using secure OTP verification', async () => {
    render(<App />);

    // Login as Alex Johnson (₹150.00 initial balance)
    fireEvent.click(screen.getByText('Alex Johnson'));

    await waitFor(() => {
      expect(screen.getByTitle('View & Recharge Student Wallet with OTP')).toBeInTheDocument();
    });

    // Click wallet pill to open OTP wallet recharge modal
    fireEvent.click(screen.getByTitle('View & Recharge Student Wallet with OTP'));

    await waitFor(() => {
      expect(screen.getByText('Student Laundry Wallet')).toBeInTheDocument();
      expect(screen.getByText(/Recharge Wallet with OTP Verification/i)).toBeInTheDocument();
    });

    // Click "+₹100" preset
    const recharge100Btn = screen.getByRole('button', { name: '+₹100' });
    fireEvent.click(recharge100Btn);

    // Click Proceed & Send OTP
    const proceedBtn = screen.getByRole('button', { name: /Proceed to Pay ₹100.00 & Send OTP/i });
    fireEvent.click(proceedBtn);

    // Modal transitions to OTP entry screen
    await waitFor(() => {
      expect(screen.getByText(/Enter 4-Digit OTP Verification Code/i)).toBeInTheDocument();
    });

    // Click Auto-fill OTP helper
    const autoFillBtn = screen.getByRole('button', { name: /Auto-fill OTP/i });
    fireEvent.click(autoFillBtn);

    // Submit OTP verification
    const verifyBtn = screen.getByRole('button', { name: /Verify OTP & Add ₹100.00/i });
    fireEvent.click(verifyBtn);

    // Verify success confirmation
    await waitFor(() => {
      expect(screen.getByText(/OTP Verified & Recharge Successful!/i)).toBeInTheDocument();
      expect(screen.getAllByText('₹250.00').length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------
  // TEST 10: Admin Approval Credits Revenue to Admin Wallet
  // ----------------------------------------------------
  it('credits the booking price to Admin Revenue Wallet in Rupees when Admin approves', async () => {
    render(<App />);

    // Admin starts with ₹500.00 initial revenue
    fireEvent.click(screen.getByText('Facility Admin (Manager)'));

    await waitFor(() => {
      expect(screen.getByText('₹500.00')).toBeInTheDocument();
    });

    // Approve Sarah's booking (₹60.00)
    const approveBtn = screen.getAllByRole('button', { name: 'Approve' })[0];
    fireEvent.click(approveBtn);

    // Admin revenue becomes ₹500.00 + ₹60.00 = ₹560.00
    await waitFor(() => {
      expect(screen.getByText('₹560.00')).toBeInTheDocument();
    });
  });
});
