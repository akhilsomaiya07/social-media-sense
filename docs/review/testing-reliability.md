# Browser testing reliability review

Base: main `8264f82464cb96f9775473c924c3939cc8f45a35`, including merged PRs 37 (directional steps) and 38 (2.8-second final loading). This change affects test infrastructure only.

## Evidence and diagnosis

[Failed run 39709893195](https://github.com/akhilsomaiya07/social-media-sense/actions/runs/39709893195/job/119598458476) passed build, unit tests, and normal-motion functional checks through the 768px final loading case. That loading case measured 2864ms. It then failed at the report `page.screenshot` with a 15000ms timeout. The log explicitly says fonts loaded. Routing and gallery capture were subsequently skipped by default Actions success gating.

Confirmed failure mechanism: an incidental still capture inside the behavior suite prevented remaining behavior cases and downstream stages from executing. The exact Chromium screenshot/compositor stall is not proven by the available log. Continuous atmospheric transforms and forced software rendering are possible contributors, not established causes. This is not evidence that PR 37 or 38 broke assessment behavior. Local runs of the former suite had passed; the original CI stall was not reproduced locally in this review.

The screenshot was a bounded viewport, not an oversized full-page capture. The suite already closes each context and the browser in `finally`. The CI log reached font completion, so adding font waits is not supported as a fix. The failing runner used Ubuntu 24.04, Node 22.23.3, and the lockfile's Playwright 1.62.1.

## Small fix

- Remove the incidental report PNG capture from `test-motion.mjs`. All behavior, duration, focus, reduced-motion, overflow, errors and single-completion assertions remain.
- Preserve eight report stills (320/390/768/1280, normal/reduced preference) in the existing dedicated capture script and manifest. Pause animations only while taking stills via Playwright's capture option. This is not used by behavioral tests or production.
- CI continues independent routing, age, Cloudflare dry-run and capture stages after a failed test, provided setup/build succeeded. Any failed stage still fails the job. No retries, blanket timeout increase, or `continue-on-error` were added.
- Include age validation in CI and upload age artifacts. Ignore installed dependencies and generated age captures.

## Local execution

Passed: `npm ci`, `npm run build`, `npm test`, `npm run test:motion`, `npm run test:routing`, `npm run test:age`, `npm run screenshots`, `npm run check:cloudflare`, and `git diff --check`.

Motion covered all four widths under both motion preferences and the unavailable optional motion-script case. Routing and age covered all four widths. Dedicated capture produced 25 images: 17 existing showcase views plus eight report preference reviews. Synthetic data and explicit research fallback only. No documentation gallery was overwritten by this phase.

Environment limitation: `npx playwright install --with-deps chromium` failed because the local host cannot perform apt identity changes. The browser-only install also failed with invalid downloaded archives. Local checks used available Chromium 153.0.8010.0 through `CHROMIUM_PATH`; CI uses the standard pinned Playwright browser installer. CI verification is therefore necessary and is recorded in the PR, separately from local passes.

The Cloudflare command was a dry-run only. No production deployment, secret changes, merges, or repository visibility changes were performed.
