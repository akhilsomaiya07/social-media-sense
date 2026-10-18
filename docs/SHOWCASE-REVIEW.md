# Initial showcase review

Prepared from main at 3d1a6b890b836f742b47142f933fe0bfa239c2a0 on local feature branch codex/project-showcase. No application source files were changed.

## Checks executed
- npm run build: passed.
- npm test: passed (all existing suites).
- Existing scripts/test-results-layout.mjs Chromium regression: passed.
- Capture: eight actual browser screenshots, desktop 1280×900 and mobile 390×844, plus the full report element. No horizontal overflow.
- Repeat capture: all eight PNG hashes identical.
- Clean npm ci from the modified package/lock files: passed. Capture with the default playwright import also passed and matched all eight hashes.
- README image paths: all resolve to curated files.
- Approved workflow YAML parses and uses read-only contents permission. GitHub Actions execution has not yet been tested.
- Images visually inspected; synthetic Demo data, fixed dates, no real account/storage. Eight lossless PNGs total 2,698,533 bytes.

## Files
README.md; package.json; package-lock.json; .gitignore; scripts/capture-showcase.mjs; docs/SCREENSHOTS.md; docs/SHOWCASE-REVIEW.md; .github/workflows/screenshots.yml; eight docs/screenshots PNGs and manifest.json.

## Approved showcase
Review all eight images and the README captions. Pay particular attention to Step 2's scrolled framing, the tall full-report image, and the mobile viewport which shows only the top of the report. This bundle includes showcase-preview.html for convenient local image review; it is not a GitHub-rendering test or a new application page.

The owner approved the showcase and workflow; the workflow is now placed in .github/workflows for the feature-branch review. It generates artifacts only: no commits, pushes, automated documentation edits, merges or deployments. Documentation publication remains manual and reviewable. The owner subsequently authorized publishing the feature branch and its automatic Cloudflare preview build. Merging and production deployment still require approval.

## Limitations
The local capture used Chromium 153 through the documented executable override. Different OS/browser fonts may produce different pixels. No physical-device testing or production live research success is claimed. Research requests deliberately fail into the application's existing verified fallback. The review ZIP contains documentation/tooling changes, not a complete deployable app.
