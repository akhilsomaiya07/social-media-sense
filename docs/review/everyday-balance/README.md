# Results report: Your Time. Your Balance. Your Choice.

Real Chromium captures from the local Worker test harness using synthetic check-ins. No personal browser storage or production user data. The research endpoint intentionally returns HTTP 503, so expanded research screenshots show the existing verified fallback rather than pretending a live search succeeded.

## Review images

| State | Mobile (390px) | Desktop (1280px) |
| --- | --- | --- |
| Age 21, 1h daily, all five Sometimes | [Mobile](sometimes-390.webp) | [Desktop](sometimes-1280.webp) |
| Age 30, 3h daily, all Never | [Mobile](never-390.webp) | [Desktop](never-1280.webp) |
| Age 40, 3h daily, all Often | [Mobile](often-390.webp) | [Desktop](often-1280.webp) |
| Age 100, 2h daily, people Often | [Mobile](people-390.webp) | [Desktop](people-1280.webp) |
| Expanded supporting context, age 21 | [Mobile](details-390.webp) | [Desktop](details-1280.webp) |

Images retain their original proportions and are encoded as WebP. All are actual browser-rendered states. The main README gallery is unchanged.

## Reproduction

Run `node scripts/test-report-clarity.mjs` with the project's Playwright Chromium installed, or set `CHROMIUM_PATH` to a compatible executable. Raw captures are written to `artifacts/everyday-balance/`. This exercises ten check-ins at 320, 390, 768 and 1280px using reduced motion; the existing motion suite separately covers normal and reduced motion.

## Review boundaries

The 15–20 second reading target requires human usability review. Browser tests do not establish medical validity, real-world usability, physical-device compatibility or screen-reader experience. No production research request or deployment is part of this change.

The existing validation rejects zero reported usage combined with reported interruptions. That rule is preserved; zero usage with all Never is tested through the normal flow. The report also handles a defensive inconsistent submitted snapshot without inferring time savings.

Additional width checks: [320px](sometimes-320.webp) and [768px](sometimes-768.webp).

The temporary Linux Chromium environment lacks a color emoji font: existing celebration emoji may appear as a missing-glyph box in captures. Application emoji text and celebration behavior were not changed.

Completed checks: build, unit suite, motion suite (normal/reduced motion), routing suite, age suite, Cloudflare deploy dry-run, 40 report scenarios (ten cases × four widths), two extra width captures, and diff whitespace validation. The initial browser launch failed because the temporary Chromium binary was absent; it passed after restoring Chromium 153. Routing initially failed on the stale pre-PR45 homepage-copy assertion; only that assertion was corrected to the already-merged exact text, and routing passed at all four widths.
