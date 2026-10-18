# Screenshot showcase

## Capture locally

From the repository root, with Node 22 or later:

```sh
npm ci
npx playwright install chromium
npm run screenshots
```

Linux runners may need `npx playwright install --with-deps chromium`.
The script launches an isolated, non-persistent Chromium context and routes a local synthetic origin to this checkout's `public/` files. No web server, deployed site, API key, account, or production storage is used. All external requests are blocked. Research requests deliberately return 503, so the existing fallback path runs; these images do not claim successful live research.

Output defaults to `artifacts/screenshots/`. Override with `SCREENSHOT_DIR` (relative to the repository root or absolute). Existing files belonging to the capture are cleared first. A failed run exits nonzero and saves `failure.txt` and, if possible, `failure.png`; never publish partial captures. A successful run writes eight PNGs and a manifest containing viewport, browser version, framing, byte count and SHA-256 hashes. Dates, locale, timezone, device scale, example values and reduced motion are fixed. Animation frames and fonts settle before capture; capture waits for the actual loading/results state, not a guessed delay.

Development-only overrides `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` support the existing test infrastructure. Use the lockfile's Playwright Chromium on the same OS for repeatable review; font rendering can differ across OS/browser versions. The initial gallery was captured with an explicit Chromium executable in the review environment.

## Fixtures and framing

The fictional participant is named Demo, age 30. The first check-in is 240 minutes/day and the second 180, with dates fixed at January 15 and 22, 2026. Platforms: Facebook, Instagram and YouTube. Sleep is 7h 30m, activity 45m; bedtime and longer-scrolling disruptions are Sometimes, other disruptions Never. Sleep Shield uses an explicitly entered 11 PM bedtime, 30-minute window and Read activity. Reduction Goal displays a 30-minute projection. Progress compares the two synthetic records.

Desktop views are 1280×900 at 1×; mobile is 390×844. Most images are viewport captures, so long pages continue below the image. Step 2 intentionally scrolls to the first platform rows with the sticky total visible, not the entire assessment. The desktop report captures the complete report element. PNG uses lossless browser compression with no image-editing or fabricated content. The mobile example is a viewport, not a claim that the entire report fits on a phone screen.

## Review and publish manually

1. Run capture after a visible UI change. Inspect every image, especially report copy, fallback labeling, time values, responsive wrapping and saved dates.
2. Compare generated images to `docs/screenshots/`. Compare images visually as well as their manifest hashes; a browser/font change can alter bytes without meaningful product changes.
3. If nothing meaningful changed, do not create an image-update commit.
4. For meaningful changes, copy only reviewed PNGs and `manifest.json` into `docs/screenshots/`, update captions if needed, and open a normal reviewable PR. Never publish failure files or real user data.
5. No script writes the curated directory by default, commits, pushes, merges, or calls deployment tools.

## Screenshot CI

The approved workflow is in `.github/workflows/screenshots.yml`. It runs on relevant frontend/capture/dependency PR changes and manual dispatch. It runs build/tests, captures the local checkout and uploads artifacts for 14 days, including failure diagnostics. Errors remain failing job steps. It uses `pull_request`, not `pull_request_target`, read-only repository permissions and no secrets. Checkout does not persist credentials.

There is no push trigger, automatic screenshot commit, bot PR creation or deployment step. Documentation-only image changes do not retrigger capture. This prevents an image-update loop. The workflow has not yet run in GitHub Actions; local checks do not establish CI success. Manual dispatch becomes available after the workflow is on the default branch. Existing Cloudflare branch-preview automation is separate and may still run if a branch is published.
