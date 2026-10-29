import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderAsStudent, renderAsAdmin } from './testHelpers';

describe('Module: Booking & Debit Lifecycle (Excluding Login)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reserves slot without deducting money before Admin approval', async () => {
    renderAsStudent('usr-1'); // Alex (₹150.00)

    // Book slot
    const bookButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    fireEvent.click(bookButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Customize Wash & Ironing')).toBeInTheDocument();
    });

    // Confirm booking (default 5 clothes = ₹25.00)
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Book Slot/i }));

    // Verify booking is pending approval
    await waitFor(() => {
      expect(screen.getByText('Booked and Waiting for Approval')).toBeInTheDocument();
    });

    // Balance must STILL be ₹150.00 (not debited prematurely!)
    expect(screen.getByText('₹150.00')).toBeInTheDocument();
  });

  it('debits student wallet and credits admin wallet when Admin approves', async () => {
    // Sarah Miller (usr-2) has a pending booking bk-101 (6 clothes + Ironing = ₹60.00)
    renderAsAdmin();

    // Verify Admin initial revenue is ₹500.00
    expect(screen.getByText('₹500.00')).toBeInTheDocument();

    // Find and click Approve on Sarah's pending wash
    const approveButtons = screen.getAllByRole('button', { name: 'Approve' });
    fireEvent.click(approveButtons[0]);

    // Admin revenue is credited: ₹500.00 + ₹60.00 = ₹560.00
    await waitFor(() => {
      expect(screen.getByText('₹560.00')).toBeInTheDocument();
    });
  });

  it('cancels unapproved booking without unnecessary refund transactions', async () => {
    renderAsStudent('usr-1');

    // Alex books a slot
    const bookButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    fireEvent.click(bookButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Customize Wash & Ironing')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm & Book Slot/i }));

    await waitFor(() => {
      expect(screen.getByText('Booked and Waiting for Approval')).toBeInTheDocument();
    });

    // Alex cancels the pending booking
    const cancelBtn = screen.getByRole('button', { name: /Cancel Booking/i });
    fireEvent.click(cancelBtn);

    // Status is cancelled
    await waitFor(() => {
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    // Balance remains intact at ₹150.00
    expect(screen.getByText('₹150.00')).toBeInTheDocument();
  });

  it('refunds student wallet automatically when an approved booking is cancelled', async () => {
    // Sarah Miller (usr-2, ₹100.00) has a pending booking bk-101 (6 clothes + Ironing = ₹60.00).
    // Admin approves it, debiting Sarah's wallet.
    renderAsAdmin();

    const approveButtons = screen.getAllByRole('button', { name: 'Approve' });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    });

    // Logout Admin and login as Sarah Miller
    const logoutBtn = screen.getByTitle('Logout / Switch Account');
    fireEvent.click(logoutBtn);

    await waitFor(() => expect(screen.getByText('Sarah Miller')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sarah Miller'));

    // Sarah's balance after ₹60 debit: ₹100.00 - ₹60.00 = ₹40.00
    await waitFor(() => {
      expect(screen.getByText('₹40.00')).toBeInTheDocument();
    });

    // Sarah cancels the approved booking
    const cancelBtn = screen.getByRole('button', { name: /Cancel Booking/i });
    fireEvent.click(cancelBtn);

    // Status changes to Cancelled
    await waitFor(() => {
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    // Wallet is refunded by ₹60.00, returning to ₹100.00
    await waitFor(() => {
      expect(screen.getByText('₹100.00')).toBeInTheDocument();
    });
  });
});
