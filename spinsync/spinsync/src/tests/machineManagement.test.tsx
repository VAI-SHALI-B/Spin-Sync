import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderAsAdmin, renderAsStudent } from './testHelpers';

describe('Module: Machine Management (Excluding Login)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows Admin to add a new machine to the fleet', async () => {
    renderAsAdmin();

    // Verify directly on Admin portal
    expect(screen.getByRole('button', { name: /Add Machine/i })).toBeInTheDocument();

    // Click Add Machine
    fireEvent.click(screen.getByRole('button', { name: /Add Machine/i }));

    // Fill form
    await waitFor(() => {
      expect(screen.getByText('Add New Dual Machine')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('e.g. Dual Combo Unit D-106');
    fireEvent.change(nameInput, { target: { value: 'Dual Turbo Unit T-201' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create Machine' }));

    // Verify new machine appears in schedule list
    await waitFor(() => {
      expect(screen.getByText('Dual Turbo Unit T-201')).toBeInTheDocument();
    });
  });

  it('allows Admin to toggle machine maintenance status', async () => {
    renderAsAdmin();

    // Toggle D-101 into maintenance
    const maintenanceButtons = screen.getAllByRole('button', { name: /Set Under Maintenance/i });
    expect(maintenanceButtons.length).toBeGreaterThan(0);
    fireEvent.click(maintenanceButtons[0]);

    // Verify machine shows maintenance message
    await waitFor(() => {
      expect(screen.getAllByText(/This unit is currently under maintenance/i).length).toBeGreaterThan(1);
    });

    // Re-activate machine to available
    const setAvailableBtn = screen.getAllByRole('button', { name: /Set Available/i })[0];
    fireEvent.click(setAvailableBtn);

    // Verify maintenance count decreases
    await waitFor(() => {
      expect(screen.getAllByText(/This unit is currently under maintenance/i).length).toBe(1);
    });
  });

  it('prevents students from booking slots on machines under maintenance', async () => {
    // Machine D-105 is under maintenance by default in mockData
    renderAsStudent();

    // Verify D-105 is displayed
    expect(screen.getByText('Dual Combo Unit D-105')).toBeInTheDocument();

    // Find maintenance notice on D-105
    const maintenanceAlerts = screen.getAllByText(/This unit is currently under maintenance. Slot bookings are disabled/i);
    expect(maintenanceAlerts.length).toBeGreaterThan(0);
  });
});
