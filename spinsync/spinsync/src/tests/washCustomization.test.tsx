import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderAsStudent } from './testHelpers';

describe('Module: Wash Customization & Pricing (Excluding Login)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates price correctly for clothes count at ₹5/cloth', async () => {
    renderAsStudent();

    // Click Book Slot on first open slot
    const bookButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    fireEvent.click(bookButtons[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Customize Wash & Ironing')).toBeInTheDocument();
    });

    // Default: 5 clothes, cold water, no ironing = 5 * ₹5 = ₹25.00
    expect(screen.getAllByText('₹25.00').length).toBeGreaterThan(0);

    // Select 10 clothes preset
    fireEvent.click(screen.getByRole('button', { name: '10' }));

    // Price updates to 10 * ₹5 = ₹50.00
    expect(screen.getAllByText('₹50.00').length).toBeGreaterThan(0);
  });

  it('calculates extra charges for Hot Water (+₹5) and Ironing (+₹5/cloth)', async () => {
    renderAsStudent();

    // Open booking modal
    const bookButtons = screen.getAllByRole('button', { name: /Book Slot/i });
    fireEvent.click(bookButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Customize Wash & Ironing')).toBeInTheDocument();
    });

    // Choose 10 clothes
    fireEvent.click(screen.getByRole('button', { name: '10' })); // 10 clothes = ₹50

    // Select Hot Water Wash (+₹5.00)
    const hotWaterOption = screen.getByText('Hot Water Wash');
    fireEvent.click(hotWaterOption);

    // Select Ironing (+₹5.00 per cloth = +₹50.00)
    const ironingOption = screen.getByText('Add Professional Steam Ironing Service');
    fireEvent.click(ironingOption);

    // Total: ₹50 (wash) + ₹5 (hot water) + ₹50 (ironing) = ₹105.00
    expect(screen.getByText('₹105.00')).toBeInTheDocument();
  });
});
