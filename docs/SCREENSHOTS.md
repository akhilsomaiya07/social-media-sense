# How I capture the project screenshots

I use Playwright to take real screenshots of the app with made-up answers. That keeps the README gallery consistent without collecting or displaying anyone's personal data.

## Capture locally

From the repository root, with Node 22 or later:

```sh
npm ci
npx playwright install chromium
npm run screenshots
```

Linux runners may need `npx playwright install --with-deps chromium`.
The script launches an isolated, non-persistent Chromium context and routes a local synthetic origin to this checkout's `public/` files. No web server, deployed site, API key, account, or production storage is used. All external requests are blocked. Research requests deliberately return 503, so the existing fallback path runs; these images do not claim successful live research.

Output defaults to `artifacts/screenshots/`. Override with `SCREENSHOT_DIR` (relative to the repository root or absolute). Existing files belonging to the capture are cleared first. A failed run exits nonzero and saves `failure.txt` and, if possible, `failure.png`; never publish partial captures. A successful run writes 18 primary PNG gallery frames, eight additional report-review PNGs at different viewport/motion settings, and a manifest containing viewport information, framing selectors, byte count and SHA-256 hashes. Dates, locale, timezone, device scale, example values and reduced motion are fixed. Animation frames and fonts settle before capture; capture waits for the actual loading/results state, not a guessed delay.

Development-only overrides `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` support the existing test infrastructure. Use the lockfile's Playwright Chromium on the same OS for repeatable review; font rendering can differ across OS/browser versions. The initial gallery was captured with an explicit Chromium executable in the review environment.

## Fixtures and framing

The fictional participant is named Demo, age 30. The first check-in is 240 minutes/day and the second 180, with dates fixed at January 15 and 22, 2026. Platforms: Facebook, Instagram and YouTube. Sleep is 7h 30m, activity 45m; bedtime and longer-scrolling disruptions are Sometimes, other disruptions Never. Sleep Tracker uses an explicitly entered 11 PM bedtime, 30-minute window and Read activity. Reduction Goal displays a 30-minute projection. Progress compares the two synthetic records.

Captures use a 1280px-wide browser at 1×. The viewport height grows to fit the selected content; screenshots frame complete DOM sections with small margins. No application styling or content is changed for capture. Steps 1, 3, 4 and 5 include the complete form and navigation. Step 2 has an overview and four complete example platform rows. The report is split into Snapshot, Personal Insights and Next Steps. The gallery captures the current **Sleep Tracker** name, its plan, a nightly form and the newer **Seven-Night Sleep Summary**. For the summary, the script completes seven fictional night entries in the isolated browser context. Internal JavaScript filenames and local-storage keys may retain the old `sleep-shield` spelling for compatibility; image filenames show the public product name. Reduction Goal and Progress each have an overview and an expanded detail capture. Disclosures are opened using actual UI clicks. The five questions and sample values are filled before capture.

README previews use a single column and width-only sizing, preserving aspect ratios. Click any preview for the original. The eight report-review captures cover 320, 390, 768 and 1280px in two motion settings but are not part of the curated README gallery. A mobile example is not currently published. Screenshots use Chromium's lossless PNG encoding; nothing is stretched, composited or generated. The manifest records dimensions and hashes. The local source remains the only capture source, even when checking the deployed site for version parity.

## Current gallery freshness

The current gallery was generated from the source checkout for its screenshot-refresh PR, using a one-time, branch-restricted GitHub Actions run. The run copied complete synthetic browser captures to `docs/screenshots/` for review. The temporary publishing workflow was removed after the images were committed. These captures are not from real visitors' browsers and do not prove successful live research. Recheck representative images and the generated manifest before approval.

## Review and publish manually

1. Run capture after a visible UI change. Inspect every image, especially report copy, fallback labeling, time values, responsive wrapping and saved dates.
2. Compare generated images to `docs/screenshots/`. Compare images visually as well as their manifest hashes; a browser/font change can alter bytes without meaningful product changes.
3. If nothing meaningful changed, do not create an unnecessary image-update commit.
4. For meaningful changes, copy only reviewed PNGs and `manifest.json` into `docs/screenshots/`, update captions if needed, and open a normal reviewable PR. Never publish failure files or real user data.
5. No script writes the curated directory by default, commits, pushes, merges, or calls deployment tools.

## Screenshot CI

The approved workflow is in `.github/workflows/screenshots.yml`. It runs on relevant frontend/capture/dependency PR changes and manual dispatch. It runs build/tests, captures the local checkout and uploads artifacts for 14 days, including failure diagnostics. Errors remain failing job steps. It uses `pull_request`, not `pull_request_target`, read-only repository permissions and no secrets. Checkout does not persist credentials.

There is no push trigger, automatic screenshot commit, bot PR creation or deployment step. Documentation-only image changes do not retrigger capture. This prevents an image-update loop. Local checks do not establish CI success; review the run attached to each PR. Manual dispatch is available from the workflow on the default branch. Existing Cloudflare branch-preview automation is separate and may still run if a branch is published.

## Screenshot refresh provenance

A one-time GitHub Actions run on the screenshot review branch generated the current gallery. Its publishing workflow was removed after capturing and committing the images; the ordinary read-only `screenshots.yml` check remains. Refreshing screenshots in the future still requires a reviewed PR. Production visitors and real saved browser records are never included in the synthetic fixtures.
