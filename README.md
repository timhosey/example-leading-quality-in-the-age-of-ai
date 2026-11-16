# Applitools Eyes + Playwright — baseline vs. changed demo

One visual test, run twice against two versions of the Applitools demo app. The second
run reports diffs because the test, app name and Ultrafast Grid settings are identical —
only the URL changes.

| Run | URL | Expectation |
| --- | --- | --- |
| 1 | `https://demo.applitools.com/` | Creates the baseline (new test, all checkpoints "New") |
| 2 | `https://demo.applitools.com/index_v2.html` | Compared to run 1 → **diffs** |

## Setup

Add your Applitools API key to `.env` (get it from the dashboard: top-right menu → *My API key*):

```
APPLITOOLS_API_KEY=your_api_key_here
```

## Run

```bash
npm run test:v1    # baseline
npm run test:v2    # same test, v2 URL -> diffs
```

Or both back to back:

```bash
npm run test:both
```

Accept the run 1 baseline in the Eyes dashboard before judging run 2's diffs.

## What differs in v2

- Logo swapped for a broken image (`logo-big.png` → `brokenImg.png`)
- "Sign in" link (`btn-primary`) replaced by a "Log in" button (`btn-secondary`)
- Login routes to `/app_v2.html` instead of `/app.html`, which has its own changes

## How the two runs stay identical

Everything that identifies the test to Eyes is pinned in `playwright.config.ts`:

- `appName: 'Applitools Demo App'`
- test name comes from the spec title — `Applitools demo app - login flow`
- `browsersInfo` — the same 4 desktop browsers + 2 mobile devices on the Ultrafast Grid

Only `DEMO_URL` changes between runs. The UFG renders all 6 configurations from a single
local Playwright run, so `projects` in the config is just `chromium`.

## Files

- `playwright.config.ts` — Eyes fixture, UFG browser set, batch naming, 5-minute timeout
- `tests/demo-app.spec.ts` — the test (2 checkpoints: login page, app page)
