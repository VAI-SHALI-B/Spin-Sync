import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderAsStudent } from './testHelpers';

describe('Module: Wallet & OTP Recharge (Excluding Login)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('displays current wallet balance in Rupees', async () => {
    renderAsStudent();

    // Alex Johnson starts with ₹150.00
    expect(screen.getByText('₹150.00')).toBeInTheDocument();
  });

  it('validates incorrect OTP and displays error message', async () => {
    renderAsStudent();

    // Open wallet modal
    fireEvent.click(screen.getByTitle('View & Recharge Student Wallet with OTP'));

    await waitFor(() => {
      expect(screen.getByText('Student Laundry Wallet')).toBeInTheDocument();
    });

    // Select +₹50
    fireEvent.click(screen.getByRole('button', { name: '+₹50' }));

    // Proceed to OTP
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Pay ₹50.00 & Send OTP/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter 4-Digit OTP Verification Code/i)).toBeInTheDocument();
    });

    // Enter wrong OTP "0000"
    const otpInput = screen.getByPlaceholderText('••••');
    fireEvent.change(otpInput, { target: { value: '0000' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Verify OTP & Add ₹50.00/i }));

    // Error is shown
    await waitFor(() => {
      expect(screen.getByText(/Invalid OTP!/i)).toBeInTheDocument();
    });
  });

  it('successfully credits wallet when correct OTP is entered', async () => {
    renderAsStudent();

    // Open wallet modal
    fireEvent.click(screen.getByTitle('View & Recharge Student Wallet with OTP'));

    await waitFor(() => {
      expect(screen.getByText('Student Laundry Wallet')).toBeInTheDocument();
    });

    // Select +₹200
    fireEvent.click(screen.getByRole('button', { name: '+₹200' }));

    // Proceed to OTP
    const proceedBtn = screen.getByRole('button', { name: /Proceed to Pay ₹200.00 & Send OTP/i });
    fireEvent.click(proceedBtn);

    await waitFor(() => {
      expect(screen.getByText(/Enter 4-Digit OTP Verification Code/i)).toBeInTheDocument();
    });

    // Click Auto-fill OTP
    fireEvent.click(screen.getByRole('button', { name: /Auto-fill OTP/i }));

    // Click verify
    fireEvent.click(screen.getByRole('button', { name: /Verify OTP & Add ₹200.00/i }));

    // Balance should increase by ₹200 (₹150 + ₹200 = ₹350.00)
    await waitFor(() => {
      expect(screen.getByText(/OTP Verified & Recharge Successful!/i)).toBeInTheDocument();
      expect(screen.getAllByText('₹350.00').length).toBeGreaterThan(0);
    });
  });
});
