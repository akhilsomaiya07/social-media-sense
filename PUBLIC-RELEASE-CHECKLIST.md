# Public release checklist

Social Media Sense is a small Handshake portfolio prototype, not a medical assessment. The repository was already Public when checked on November 22, 2026. Keep the remaining checks as an ongoing review; public visibility does not mean they have passed. See [the follow-up verification](docs/VERIFICATION-FOLLOWUP.md).

## Source and deployment

- [ ] Review this pull request and merge only after the screenshots and text agree with the production interface.
- [x] Confirm the reviewed target commit has finished deploying: Cloudflare version `c0b55146`, main `53512b3`, Ready with 100% traffic. Recheck after future changes.
- [ ] Open the live URL in a new private browser window, finish one synthetic check-in, and verify the read-only report.
- [ ] At 320px, confirm a 200-character unbroken nickname wraps without horizontal overflow.
- [ ] Run `npm ci`, `npm run build`, `npm test`, and the available Playwright browser checks.

## Screenshot gallery

The checked gallery items were rechecked during the current refresh. See [capture evidence and remaining limitations](docs/REPOSITORY-REFRESH.md).

- [x] Install Chromium with `npx playwright install chromium`, then run `npm run screenshots` for the current reviewed gallery.
- [x] Examine the output in `artifacts/screenshots/`; it is generated from isolated synthetic data, **not** the production site's saved visitor records.
- [x] Compare the captures with `docs/screenshots/` and update curated assets only where the newer view is accurate and worth publishing.
- [x] Confirm the capture script and curated gallery include the synthetic **Seven-Night Sleep Summary** at `docs/screenshots/sleep-tracker-seven-night-summary.png`.
- [x] The current README uses Sleep Tracker captures. Older `sleep-shield*.png` assets remain historical; they are not current gallery images.
- [x] Recheck the README on GitHub desktop and at a mobile width (1366px and 390px): no cropped headings, stretched images, broken relative links or truncated steps.
- [x] Review `docs/screenshots/manifest.json` to ensure file hashes, sizes and dates describe actual reviewed images; do not change metadata without recapturing.

## Public and privacy checks

- [ ] Confirm no API keys, `.dev.vars`, real `.env` files, personal check-ins, real browser exports, logins or private screenshots appear in the **full Git history**, not just the current tree.
- [ ] Review committed test fixtures, historic `docs/review/` assets and old PRs for private content before publishing.
- [x] Confirm the README distinguishes optional free-model selection from local educational content; do not imply successful live retrieval without testing it.
- [x] Update the GitHub **About** description: `An educational web app for reflecting on social media use, sleep, physical activity, and everyday routines.`
- [x] Set the repository website to `https://social-media-sense.akhilsomaiya7.workers.dev/`.
- [ ] Decide on a license deliberately. Public visibility alone does not grant an open-source license.
- Repository visibility was already Public. This review did not change it; unfinished checks above remain unfinished.

The image refresh is a separate, review-required action: the capture workflow uploads artifacts rather than automatically committing them. A passing documentation review alone does not certify screenshot freshness.
