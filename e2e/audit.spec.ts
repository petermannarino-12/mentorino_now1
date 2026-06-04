import { test, expect } from '@playwright/test';

test.describe('Application Audit', () => {

  test('1. Homepage loads and displays key elements', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');

    await expect(page).toHaveTitle(/Mentorino/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });

  test('2. Navigation links are present', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a:has-text("Mentorship"), a:has-text("Apply"), a:has-text("About")');
    await expect(links.first()).toBeVisible();
  });

  test('3. Apply page loads and shows the form', async ({ page }) => {
    await page.goto('/apply');
    await expect(page).toHaveTitle(/Application|Apply|Mentorino/);
    await expect(page.locator('text=PROFILE & GOALS')).toBeVisible();
  });

  test('4. Programs page loads', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.locator('body')).not.toHaveText(/404/);
  });

  test('5. Apply form — mentor type selection works', async ({ page }) => {
    await page.goto('/apply');
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    const options = await select.locator('option').all();
    expect(options.length).toBeGreaterThan(1);
  });

  test('6. Auth page loads', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('body')).not.toHaveText(/404/);
  });

  test('7. Homepage has no 500 errors or crashes', async ({ page }) => {
    const errors: string[] = [];
    page.on('response', resp => {
      if (resp.status() >= 500) errors.push(`${resp.url()} — ${resp.status()}`);
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('8. Apply page — form validation prevents empty submission', async ({ page }) => {
    await page.goto('/apply');
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=PROFILE & GOALS')).toBeVisible();
  });

  test('9. Apply page — full step navigation with valid data', async ({ page }) => {
    await page.goto('/apply');

    await page.locator('select').first().selectOption('Career Strategist');
    await page.locator('input[type="text"]').first().fill('John Doe');
    await page.locator('input[type="tel"]').fill('5550001234');
    await page.locator('input[type="email"]').fill('john@example.com');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(300);

    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(300);

    const goalsArea = page.locator('textarea');
    await goalsArea.fill('I want to develop my career in technology and leadership over the next year.');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=COMMITMENT')).toBeVisible();
  });

  test('10. Pricing page loads', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.locator('body')).not.toHaveText(/404/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('11. FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('body')).not.toHaveText(/404/);
  });
});
