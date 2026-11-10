# How I improved the screenshot gallery

I reviewed the original captures and noticed that some images cut off the parts I wanted people to see. These notes record what I changed and how I checked the revised gallery.

Base: `fda21b1dd38066d3e9ffa48e4d049fa94608a611` (main, merged PR #27).

## Before and after

The old captures were 1280 × 900 viewports. Most of each assessment image showed the repeated header and introduction, leaving too little room for the form. Step 5 stopped at the third question. The README then reduced these images into two table columns. Both capture framing and display size contributed to missing or unreadable information.

| Example | Before (fixed base commit) | After |
| --- | --- | --- |
| Step 5 | [Three questions visible; no submit button](https://github.com/akhilsomaiya07/social-media-sense/blob/fda21b1dd38066d3e9ffa48e4d049fa94608a611/docs/screenshots/assessment-step-5.png) | [All five questions and navigation](screenshots/assessment-step-5.png) |
| Report | [Top of report only](https://github.com/akhilsomaiya07/social-media-sense/blob/fda21b1dd38066d3e9ffa48e4d049fa94608a611/docs/screenshots/results-report.png) | [Snapshot](screenshots/results-report.png), [insights](screenshots/results-insights.png), [next steps](screenshots/results-next-steps.png) |
| Reduction Goal | [Incomplete viewport](https://github.com/akhilsomaiya07/social-media-sense/blob/fda21b1dd38066d3e9ffa48e4d049fa94608a611/docs/screenshots/reduction-goal.png) | [Complete overview](screenshots/reduction-goal.png) and [expanded projections](screenshots/reduction-savings.png) |
| Progress | [Incomplete viewport](https://github.com/akhilsomaiya07/social-media-sense/blob/fda21b1dd38066d3e9ffa48e4d049fa94608a611/docs/screenshots/progress.png) | [Saved check-in](screenshots/progress.png) and [actual comparison](screenshots/progress-comparison.png) |

Capture now measures DOM sections, expands the viewport to include them and takes browser screenshots of those regions. No UI elements are hidden, moved or fabricated. Each image has its own natural height. The README uses single-column, width-only previews linked to their originals, with no expandable gallery.

## Image inventory

Replaced:
- `homepage.png`
- `assessment-step-1.png`
- `assessment-step-2.png`
- `assessment-step-3.png`
- `assessment-step-4.png`
- `assessment-step-5.png`
- `results-report.png`
- `my-tools.png`
- `sleep-shield.png`
- `reduction-goal.png`
- `progress.png`

Added:
- `assessment-step-2-sliders.png`
- `results-insights.png`
- `results-next-steps.png`
- `sleep-shield-tracking.png`
- `reduction-savings.png`
- `progress-comparison.png`

Removed the unused `mobile-results.png`; no Mobile example section is reintroduced.

GitHub-rendered review captures: `docs/review/gallery/github-desktop.jpg` and `docs/review/gallery/github-mobile.jpg`. These are review evidence, not additional README gallery entries.

Other changed files: `README.md`, `scripts/capture-showcase.mjs`, `docs/SCREENSHOTS.md`, this review file and `docs/screenshots/manifest.json`.

## Verification

Executed successfully:
- `npm run build`
- `npm test` (all seven test scripts)
- `npm run screenshots` (17 captures, no page errors or horizontal overflow)
- `node scripts/test-results-layout.mjs` (existing browser regression suite, including 320/390/768/1280px views, immutable report, baseline-bound drafts, history, Sleep Shield, research fixtures and tool navigation)
- Local Markdown-rendered README preview at 320, 390, 768 and 1280px: all 17 image sources load, original-image links match, aspect ratios are preserved and there is no horizontal overflow.
- Image manifest hashes/dimensions and README paths checked; all application, dependency, deployment and workflow files compared with main and unchanged.
- All generated images visually inspected. Five assessment steps, all five routine questions, navigation, report sections and expanded tool details are present.

The actual branch README was also opened in GitHub and visually inspected at desktop and 390px mobile widths. All 17 images loaded and fit without horizontal overflow. [Desktop render](review/gallery/github-desktop.jpg) · [Mobile render](review/gallery/github-mobile.jpg).

The deployed homepage HTML and all 12 linked CSS/JavaScript assets were downloaded and compared byte-for-byte with main. They matched. Screenshots nevertheless use only the local main checkout, not a mix of deployment versions.

Capture uses Chromium 153 in this environment via the existing executable override. CI installs the lockfile Playwright browser; font rasterization can differ slightly. Research deliberately uses a 503 fixture to exercise existing fallback guidance; no successful live retrieval is claimed. Only fictional Demo data in isolated storage is used.

## Review limits

The README is longer because it now covers complete forms and separate report/tool sections. On narrow phones, screenshot text necessarily becomes smaller; each preview links to the original for zooming. Step 2 intentionally shows four representative platform rows, not every platform. Advanced disclosures remain collapsed unless the screenshot specifically shows their expanded details. These images are examples, not documentation of every possible result state.

The screenshot workflow remains artifact-only. No automatic documentation publishing, merging or deployment has been added.


## November 2026 gallery refresh (PR #71)

Production was checked against main commit `4f2b0428995a746b3c1dac5a405ce6dc3e8ed85e`, active Worker `c085db03`. The screenshots render the matching local application in isolated Chromium, not production visitor records. [Capture run 42751593373](https://github.com/akhilsomaiya07/social-media-sense/actions/runs/42751593373) passed build, unit, motion, routing, age, Cloudflare bundle and screenshot checks.

All 19 previously displayed gallery images have current replacements. The two historical age-review references now point to current Step 1 and 390px validation captures; historical files remain unchanged. One additional health-education image makes the current locally curated benefits, risks and citations visible, for 20 gallery images total. Desktop capture width is 1280px; mobile validation width is 390px. Complete sections retain natural proportions. The manifest records exact viewports, image dimensions and SHA-256 hashes.

The fixture uses Test User, age 25, current social media use 210 minutes/day, prior use 270 minutes/day, sleep 7h 30m and activity 45m. Seven fictional sleep entries and two synthetic saved check-ins populate the tool comparisons. External requests are blocked; health content uses the bundled educational fallback. No AI success or production research is claimed. All 20 PNG files were decoded and checked against manifest hashes, then visually reviewed for clipping, labels and figures. Eight responsive report-review frames remain in the CI artifact rather than the curated gallery.
