# Applitools Eyes + Playwright — baseline vs. changed demo

One visual test, run twice against two versions of the Applitools demo app. The second
run reports diffs because the test, app name and Ultrafast Grid settings are identical —
only the URL changes.

| Run | URL | Expectation |
| --- | --- | --- |
| 1 | `https://demo.applitools.com/` | Creates the baseline (new test, all checkpoints "New") |
| 2 | `https://demo.applitools.com/index_v2.html` | Compared to run 1 → **diffs** |

## Prerequisites

| | Version | Notes |
| --- | --- | --- |
| **Node.js** | 20 or newer | Required by Playwright. `node -v` to check. |
| **npm** | Ships with Node | `npm -v` to check. |
| **Applitools account** | Free tier is fine | Sign up at [applitools.com/users/register](https://applitools.com/users/register) |

No local browser install beyond Chromium is needed — the Ultrafast Grid renders
Firefox, Safari, Edge and the mobile devices in the cloud.

## Setup

**1. Clone and install dependencies**

```bash
git clone https://github.com/timhosey/example-leading-quality-in-the-age-of-ai.git
```

```bash
cd example-leading-quality-in-the-age-of-ai && npm install
```

**2. Install the Chromium browser binary**

Playwright downloads its browsers separately from npm. This config drives only
Chromium locally, so that is all you need:

```bash
npx playwright install chromium
```

**3. Set your Applitools API key**

Find it in the Eyes dashboard under the top-right account menu → **My API key**.

Either export it in your shell:

```bash
export APPLITOOLS_API_KEY="your_api_key_here"
```

...or copy `.env.example` to `.env` and fill it in (`.env` is gitignored):

```bash
cp .env.example .env
```

An exported shell variable wins over `.env`, so if a run reports
`apiKey must be an alphanumeric string`, check that whichever one you are using
actually holds the key.

**4. Verify the setup**

```bash
npx playwright test --list
```

That should print one test, `Applitools demo app - login flow`, without
contacting Applitools.

## Run

```bash
npm run test:v1    # baseline
npm run test:v2    # same test, v2 URL -> diffs
```

Or both back to back:

```bash
npm run test:both
```

Accept the run 1 baseline in the Eyes dashboard before judging run 2's diffs —
otherwise run 2's checkpoints come back as *New* rather than *Unresolved*.

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
- `reporters/webinar.ts` — terminal output: renders a visual diff as a finding
  with a dashboard link rather than a stack trace
- `.env.example` — template for the API key

## Troubleshooting

**`apiKey must be an alphanumeric string`** — the key is unset or still a
placeholder. An exported shell variable takes precedence over `.env`.

**Run 2 shows "New" instead of diffs** — the run 1 baseline has not been accepted
in the dashboard yet, so there is nothing to compare against.

**The run takes a few minutes** — expected. Each checkpoint renders across six grid
configurations, and jobs queue against your account's concurrency limit. The
config allows 5 minutes per test.

**Adding `--reporter=list` hides the results link** — a `--reporter` flag replaces
the configured reporters, including the Eyes one, which is what prints the batch
URL. Run `npx playwright test` with no reporter flag.
