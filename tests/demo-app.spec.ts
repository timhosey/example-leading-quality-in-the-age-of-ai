import { test } from '@applitools/eyes-playwright/fixture';
import { DEMO_URL } from '../playwright.config';

/**
 * One test, run twice against two URLs.
 *
 *   Run 1 (baseline):  npm run test:v1   ->  https://demo.applitools.com/
 *   Run 2 (diffs):     npm run test:v2   ->  https://demo.applitools.com/index_v2.html
 *
 * The test name, app name and UFG browser set are identical across both runs, so
 * run 2 is compared against the baseline accepted in run 1 and reports visual diffs
 * (broken logo image, restyled "Sign in" -> "Log in" button, and a changed app page).
 */
test('Applitools demo app - login flow', async ({ page, eyes }) => {
  await page.goto(DEMO_URL);

  // Checkpoint 1: the login page as it loads.
  await eyes.check('Login page');

  await page.locator('#username').fill('tim');
  await page.locator('#password').fill('applitools');
  await page.locator('#log-in').click();

  // v1 lands on /app.html, v2 lands on /app_v2.html.
  await page.waitForURL(/app(_v2)?\.html/);
  await page.locator('.element-wrapper').first().waitFor();

  // Checkpoint 2: the logged-in dashboard.
  await eyes.check('App page');
});
