# Repository refresh review — November 22, 2026

## Scope and evidence

Reviewed main at `e41b4d69b7da1871152a923fc28c77a641ceefb0`. GitHub records PRs #67–78 as merged. Source inspection covered the assessment, report, education, tools, Worker, provider selection, configuration, current documentation, capture script and screenshot workflow. Historical review records were retained.

Production homepage and read-only DOM inspection confirmed required name/age fields, the sleep-warning element, no pre-bed field in Step 3, and the separate pre-bed field in Step 5 immediately after bedtime disruption. This was not a full assessment test, an isolated saved-tools test, or a byte-for-byte production comparison. The active deployment SHA/Worker version remains unverified. No assessment was submitted and no research-provider call was triggered.

## Feature inventory

| Area | Confirmed implementation / documentation correction |
| --- | --- |
| Step 1 | Required name and age, Unicode name validation, 200-code-unit limit, 15–100 whole-year range; removed optional-name descriptions. |
| Step 2 | Fifteen fixed platforms plus custom entries; 5-minute increments, 0–12h per slider, combined 24h limit, self-reported overlapping-time guidance. |
| Step 3 | Sleep duration, CDC bands, non-blocking warning below 480 minutes for teens and 420 for adults; no pre-bed question. |
| Step 4 | Whole-minute activity duration, context only. |
| Step 5 | Five disruption questions plus separate required prebed; same answer key and no additional disruption scoring. |
| Report | Your Time, Your Everyday Balance, Make Room for What Matters; immutable completed report and always-visible answer note. |
| Education | Local reviewed library first; risks optional below 120 minutes with no disruptions, otherwise visible. All source text and age scope remain available. |
| Optional AI | Free-only exact-copy selection, ZDR, zero-price restrictions, no paid fallback/search; safe diagnostics and manual redirect rejection. No production AI-success claim. |
| Sleep Tracker | Separate plan and seven-night records; browser-local storage, no automatic recovered-sleep claim. |
| Reduction Goal | More than 120 minutes required, explicit saved-baseline goal save, draft protection and projected savings. |
| Progress | Explicit summary saves/comparisons, confirmed clearing with linked goals, independent sleep records. |

## Gallery inventory and pending capture

No image was replaced or added in this review. Chromium could not launch: `socket() failed: Operation not permitted`. The existing curated manifest is unchanged and still describes its original images. Image paths were checked against the GitHub tree; image bytes and rendered GitHub presentation were not visually reverified. Do not describe this gallery as refreshed.

| README image | Refresh status / reason |
| --- | --- |
| `docs/screenshots/homepage.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/assessment-step-1.png` | Required name/age labels and name feedback changed. |
| `docs/screenshots/assessment-age-validation-mobile.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/assessment-step-2.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/assessment-step-2-sliders.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/assessment-step-3.png` | Pre-bed question moved; age-specific warning added. |
| `docs/screenshots/assessment-step-4.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/assessment-step-5.png` | Six fields now include the separate pre-bed question. |
| `docs/screenshots/results-report.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/results-insights.png` | Always-visible answer-explanation note added. |
| `docs/screenshots/results-next-steps.png` | Health-information presentation changed. |
| `docs/screenshots/health-education.png` | Personalized risk toggle, separate guidance and full source-list layout changed. |
| `docs/screenshots/my-tools.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/sleep-tracker.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/sleep-tracker-tracking.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/sleep-tracker-seven-night-summary.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/reduction-goal.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/reduction-savings.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/progress.png` | Retained pending visual comparison; freshness not certified. |
| `docs/screenshots/progress-comparison.png` | Retained pending visual comparison; freshness not certified. |

The capture script now requests additional `assessment-name-validation-mobile.png` and `assessment-sleep-warning-mobile.png` examples at 390px, restores valid inputs afterward, and stops copying a stale production version into future manifests. These are unexecuted capture additions, not published images. Desktop framing remains 1280px; the report-review matrix remains 320/390/768/1280px. All use synthetic data and block external requests.

Still pending: execute the complete capture, review every image, add the two new examples to README only after publication, confirm custom-platform and celebration coverage, compare all tool views, and inspect the actual GitHub README at desktop/mobile widths. Do not change old manifest hashes or dates to imply a new capture.

## Checks actually run

- PASS: `npm run build`.
- PASS: `npm test` (complete unit suite, including name, sleep thresholds and relocated pre-bed validation).
- PASS: `node --check scripts/capture-showcase.mjs`.
- PASS: all 20 README image targets exist in the GitHub tree; local relative links in current README/docs resolve after adding this review file.
- BLOCKED: `npm run screenshots` with installed Playwright/Chromium override, before the first image. No browser/layout pass or fresh screenshot is claimed.
- NOT VERIFIED: production deployment identity, complete production journey, saved-tool browser scenarios, external source-link availability, actual GitHub Markdown rendering, image decoding/visual freshness and successful OpenRouter access.

Application files, dependencies, workflow, deployment configuration, source claims, storage behavior and approved README disclaimer were not changed. The only executable change is the documentation capture script. Historical QA statements are not fresh test results.

## Repository metadata

The About description still mentions “Sleep Shield,” “per-app tracking” and “live health resources.” No supported metadata-edit operation was available. Recommended exact description:

> An educational web app for reflecting on social media use, sleep, physical activity, and everyday routines.

Keep the website URL as `https://social-media-sense.akhilsomaiya7.workers.dev/`. The README identifies the educational prototype and self-reported estimates. No visibility, license, ownership or settings changes were made.
