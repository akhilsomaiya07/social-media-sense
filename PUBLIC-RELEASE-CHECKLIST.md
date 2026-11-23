# Public release checklist

Social Media Sense is a small Handshake portfolio prototype, not a medical assessment. Use this checklist before changing the GitHub repository visibility to public.

## Source and deployment

- [ ] Review this pull request and merge only after the screenshots and text agree with the production interface.
- [ ] Confirm the target commit has finished deploying to Cloudflare (**Ready**, not merely **In progress**).
- [ ] Open the live URL in a new private browser window, finish one synthetic check-in, and verify the read-only report.
- [ ] At 320px, confirm a 200-character unbroken nickname wraps without horizontal overflow.
- [ ] Run `npm ci`, `npm run build`, `npm test`, and the available Playwright browser checks.

## Screenshot gallery

The checked items below record the earlier gallery review, not completion of the current refresh. See [current pending captures](docs/REPOSITORY-REFRESH.md).

- [x] Install Chromium with `npx playwright install chromium`, then run `npm run screenshots` for the current reviewed gallery.
- [x] Examine the output in `artifacts/screenshots/`; it is generated from isolated synthetic data, **not** the production site's saved visitor records.
- [x] Compare the captures with `docs/screenshots/` and update curated assets only where the newer view is accurate and worth publishing.
- [x] Confirm the capture script and curated gallery include the synthetic **Seven-Night Sleep Summary** at `docs/screenshots/sleep-tracker-seven-night-summary.png`.
- [ ] Refresh old `sleep-shield*.png` frames if they show an obsolete visible feature name; keeping historical filenames is fine if captions are current.
- [ ] Recheck the README on GitHub desktop and at a mobile width: no cropped headings, stretched images, broken relative links or truncated steps.
- [ ] Review `docs/screenshots/manifest.json` to ensure file hashes, sizes and dates describe actual reviewed images; do not change metadata without recapturing.

## Public and privacy checks

- [ ] Confirm no API keys, `.dev.vars`, real `.env` files, personal check-ins, real browser exports, logins or private screenshots appear in the **full Git history**, not just the current tree.
- [ ] Review committed test fixtures, historic `docs/review/` assets and old PRs for private content before publishing.
- [ ] Confirm the README distinguishes optional free-model selection from local educational content; do not imply successful live retrieval without testing it.
- [ ] Update the GitHub **About** description: `Social media wellness check-in with five guided steps, personalized reflections, a seven-night Sleep Tracker, optional reduction goals, and progress comparisons. No account required.`
- [ ] Set the repository website to `https://social-media-sense.akhilsomaiya7.workers.dev/`.
- [ ] Decide on a license deliberately. Public visibility alone does not grant an open-source license.
- [ ] After all checks, change visibility yourself under GitHub repository Settings. This documentation PR does **not** make the repository public.

The image refresh is a separate, review-required action: the capture workflow uploads artifacts rather than automatically committing them. A passing documentation review alone does not certify screenshot freshness.
