import { test, expect } from '@playwright/test';

test.describe('SpinSync End-to-End Browser Workflow Suite', () => {

  test('Complete End-to-End User & Admin Lifecycle', async ({ page }) => {
    // 1. Open SpinSync Web App
    await page.goto('http://localhost:5173');
    await expect(page.locator('h1')).toContainText('SpinSync Hub');

    // 2. Log in as Student (Alex Johnson)
    await page.click('text=Alex Johnson');
    await expect(page.locator('body')).toContainText('Logged in: Alex Johnson');

    // 3. Request an available laundry slot
    const bookButtons = page.locator('button:has-text("Book Slot")');
    await expect(bookButtons.first()).toBeVisible();
    await bookButtons.first().click();

    // 4. Verify booking status updates to "Booked and Waiting for Approval"
    await expect(page.locator('body')).toContainText('Booked and Waiting for Approval');

    // 5. Test Ongoing Wash Constraint (attempt second booking)
    if (await bookButtons.count() > 0) {
      await bookButtons.first().click();
      await expect(page.locator('body')).toContainText('Booking Blocked - Ongoing Wash in Progress');
      await page.click('button:has-text("Understood")');
    }

    // 6. Log out and Log in as Facility Admin
    await page.click('button[title="Logout / Switch Account"]');
    await page.click('text=Facility Admin (Manager)');
    await expect(page.locator('body')).toContainText('Facility Admin Master Portal');

    // 7. Approve student booking request
    const approveBtn = page.locator('button:has-text("Approve")').first();
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();
    await expect(page.locator('body')).toContainText('Approved');

    // 8. Mark wash cycle finished
    const finishBtn = page.locator('button:has-text("Mark Finished")').first();
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();
    await expect(page.locator('body')).toContainText('Finished');

    // 9. Log out Admin and Log back in as Alex Johnson
    await page.click('button[title="Logout / Switch Account"]');
    await page.click('text=Alex Johnson');

    // 10. Verify student is freed to book again
    await expect(page.locator('body')).toContainText('Eligible to book 1 wash slot');
  });

});
