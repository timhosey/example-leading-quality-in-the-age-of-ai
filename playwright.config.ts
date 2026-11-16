import { defineConfig, devices } from '@playwright/test';
import type { EyesFixture } from '@applitools/eyes-playwright/fixture';
import { BrowserType, DeviceName, ScreenOrientation } from '@applitools/eyes-playwright';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * The page under test. Defaults to the v1 (baseline) page.
 * Override with DEMO_URL to point the identical test at the v2 page:
 *   DEMO_URL=https://demo.applitools.com/index_v2.html npx playwright test
 */
export const DEMO_URL = process.env.DEMO_URL ?? 'https://demo.applitools.com/';

export default defineConfig<EyesFixture>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Visual tests can queue behind the UFG concurrency limit — give them room.
  timeout: 5 * 60 * 1000,

  reporter: [
    ['./reporters/webinar.ts'],
    ['html', { open: 'never' }],
    ['@applitools/eyes-playwright/reporter'],
  ],

  use: {
    trace: 'on-first-retry',

    eyesConfig: {
      apiKey: process.env.APPLITOOLS_API_KEY,
      serverUrl: process.env.APPLITOOLS_SERVER_URL,

      // App name is fixed so the v1 run and the v2 run land on the same baseline.
      appName: 'Applitools Demo App',

      // Each run gets its own batch, labelled with the URL being exercised.
      batch: {
        name: `Demo App - ${DEMO_URL.endsWith('index_v2.html') ? 'v2 (changed)' : 'v1 (baseline)'}`,
      },

      // --- Ultrafast Grid ---
      // One Playwright run, rendered across every browser/device below.
      type: 'ufg',
      browsersInfo: [
        { name: BrowserType.CHROME, width: 1200, height: 800 },
        { name: BrowserType.FIREFOX, width: 1200, height: 800 },
        { name: BrowserType.SAFARI, width: 1200, height: 800 },
        { name: BrowserType.EDGE_CHROMIUM, width: 1200, height: 800 },
        { chromeEmulationInfo: { deviceName: DeviceName.Pixel_5, screenOrientation: ScreenOrientation.PORTRAIT } },
        { iosDeviceInfo: { deviceName: DeviceName.iPhone_15, screenOrientation: ScreenOrientation.PORTRAIT } },
      ],

      // Suppresses the "[nlp] NLP is enabled for this account" banner at run start.
      nlpOptions: { enabled: false },

      // Diffs fail the run by default, which is the point of the demo.
      // Set DEMO_SOFT=1 to report diffs without a non-zero exit.
      failTestsOnDiff: process.env.DEMO_SOFT ? false : 'afterEach',
    },
  },

  // UFG does the cross-browser work, so Playwright itself only needs to drive once.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
