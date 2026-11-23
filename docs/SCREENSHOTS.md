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

Output defaults to `artifacts/screenshots/`. Override with `SCREENSHOT_DIR` (relative to the repository root or absolute). Existing files belonging to the capture are cleared first. A failed run exits nonzero and saves `failure.txt` and, if possible, `failure.png`; never publish partial captures. A successful run writes the primary PNG gallery frames listed in the script, eight additional report-review PNGs at different viewport/motion settings, and a manifest containing viewport information, framing selectors, byte count and SHA-256 hashes. Dates, locale, timezone, device scale, example values and reduced motion are fixed. Animation frames and fonts settle before capture; capture waits for the actual loading/results state, not a guessed delay.

Development-only overrides `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` support the existing test infrastructure. Use the lockfile's Playwright Chromium on the same OS for repeatable review; font rendering can differ across OS/browser versions. The initial gallery was captured with an explicit Chromium executable in the review environment.

## Fixtures and framing

The fictional participant is Test User, age 25. The first check-in is 270 minutes/day and the second 210, with dates fixed at January 15 and 22, 2026. Current platform times are Instagram 2h, YouTube 1h and TikTok 30m; the earlier Instagram time is 3h. Sleep is 7h 30m, activity 45m; bedtime, responsibilities, time with people and longer-scrolling responses are Sometimes, physical-activity displacement Never. Pre-bed use is Sometimes. A separate 390px capture intentionally submits age 14 to show validation, then restores age 25. Sleep Tracker uses an explicitly entered 11 PM bedtime, 30-minute window and Read activity. Reduction Goal displays a 30-minute projection. Progress compares the two synthetic records.

Desktop captures use a 1280px-wide browser at 1×; the age-validation example uses 390px. The viewport height grows to fit the selected content; screenshots frame complete DOM sections with small margins. No application styling or content is changed for capture. Steps 1, 3, 4 and 5 include the complete form and navigation. Step 2 has an overview and four complete example platform rows. The report is split into Your Time, Your Everyday Balance and Make Room for What Matters. The gallery captures the current **Sleep Tracker** name, its plan, a nightly form and the newer **Seven-Night Sleep Summary**. For the summary, the script completes seven fictional night entries in the isolated browser context. Internal JavaScript filenames and local-storage keys may retain the old `sleep-shield` spelling for compatibility; image filenames show the public product name. Reduction Goal and Progress each have an overview and an expanded detail capture. Disclosures are opened using actual UI clicks. The five disruption questions and separate pre-bed answer in Step 5 are filled before capture.

README previews use a single column and width-only sizing, preserving aspect ratios. Click any preview for the original. The eight report-review captures cover 320, 390, 768 and 1280px in two motion settings but are not part of the curated README gallery. The 390px age-validation example is included in the README; the eight additional report reviews are not. Screenshots use Chromium's lossless PNG encoding; nothing is stretched, composited or generated. The manifest records dimensions and hashes. Captures render the local checkout. The manifest records the source commit; production equivalence must be verified separately and must not be inferred from capture success. They are not captures of production visitor data.

## Earlier gallery provenance

The November 2026 refresh uses the ordinary artifact-only Screenshot review workflow on PR #71. Production was checked at commit `4f2b0428995a746b3c1dac5a405ce6dc3e8ed85e`, Worker version `c085db03`, including the browser-storage wording from PR #70. The capture script changes only synthetic fixture/framing/provenance, not application files. Reviewed artifacts are copied into `docs/screenshots/` through a normal PR; no publishing workflow is added. Historical `docs/review/age/` images remain unchanged; the README now uses current captures instead.

## Current refresh status

The gallery has not yet been refreshed for PRs #72–78. Chromium launch was blocked in the review environment. The updated script includes invalid-name and low-sleep examples but those images are not published until successfully captured and visually reviewed. See [the file inventory](REPOSITORY-REFRESH.md). The existing curated manifest remains historical and unchanged.

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

An earlier gallery used a one-time publishing workflow, which was subsequently removed. The current gallery was captured by the ordinary artifact-only `screenshots.yml` workflow, run [42751593373](https://github.com/akhilsomaiya07/social-media-sense/actions/runs/42751593373). Its reviewed images were committed separately. Refreshing screenshots in the future still requires a reviewed PR. Production visitors and real saved browser records are never included in the synthetic fixtures.
