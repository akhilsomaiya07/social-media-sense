# Handshake readiness review, 22 October 2026

Reviewed main `8264f82464cb96f9775473c924c3939cc8f45a35`. Proposed changes remain separate, unmerged PRs. No production deployment, secret configuration, visibility change, or history rewrite was performed.

## Recommendation

Suitable for demonstrating an educational portfolio prototype, with the limitations below disclosed. Do not describe live research as working on the current deployment. Final submission readiness still needs review of the CI outcome and two or three first-time participants. This is not a clinical validation, a security certification, or evidence of improved health outcomes.

## Phase outcomes

| Phase | Status | Evidence and remaining work |
| --- | --- | --- |
| Testing reliability | Partially complete | [PR 39](https://github.com/akhilsomaiya07/social-media-sense/pull/39) separates incidental screenshot capture from behavioral assertions. All requested local commands passed. First CI passed motion but hit the 10-minute job limit after a 7-minute npm install. [Repeat run](https://github.com/akhilsomaiya07/social-media-sense/actions/runs/39714017315) uses a justified 15-minute job budget and must finish before CI stability is claimed. Exact original Chromium capture stall remains unproven. |
| Usability review | Requires manual review | [Participant plan](usability-test-plan.md) prepared; developer review and real local browser captures completed. No human usability sessions conducted. |
| Step 2 and report | Complete | [PR 40](https://github.com/akhilsomaiya07/social-media-sense/pull/40) clarifies navigation to saving. Eight browser cases passed. Step 2 wording and marker meanings preserved pending participant evidence. |
| Cloudflare verification | Partially complete | All 15 deployed frontend assets match main; live journeys at four widths succeeded. Research endpoint reports missing server configuration. Private deployment records and automation settings unavailable. |
| GitHub and Handshake presentation | Requires manual review | Humanized README retained; reviewed current homepage capture restored. Limited secret scan found no matching credential patterns. Full-history audit and participant feedback are outstanding. |

## Technical test evidence

Executed successfully before the report-label change: `npm ci`, `npm run build`, `npm test`, `npm run test:motion`, `npm run test:routing`, `npm run test:age`, `npm run screenshots`, `npm run check:cloudflare`, and `git diff --check`.

Local motion covered 320/390/768/1280px with normal and reduced motion; routing and age covered those four widths. Dedicated capture generated 25 real PNGs, including eight report preference/viewport stills. Screenshot fixtures deliberately return research 503; they do not demonstrate live retrieval. See PR 39 for the precise failure diagnosis and unchanged assertions.

After the report-label change: build, unit tests and `CHROMIUM_PATH=/tmp/chromium node scripts/test-save-navigation.mjs` passed. The new test checks both primary and secondary Progress navigation at all four widths, keyboard activation, no automatic saving, explicit saving, saved wording, unchanged snapshot, overflow and page errors. Two initial fixture attempts omitted required activity hours and correctly could not reach Step 5; supplying 0 hours fixed the test data, not application validation.

Local limitation: standard Chromium/system-dependency installation failed (apt identity restrictions and invalid browser archives). Executed browser checks used Chromium 153.0.8010.0; CI uses the lockfile's Playwright browser installation. Local success is not equivalent to completed CI, Safari, Firefox, screen-reader, or physical-device testing.

## Step 2 and report review

- Confirmed mismatch: “Save My Check-In in Progress” describes saving, but activates navigation. PR 40 changes only this unsaved report label to “Go to Progress to Save.” The actual save remains in Progress; saved wording stays “Review My Progress.”
- Potential overlap ambiguity: count-once wording lacks an allocation example. Assigning the shared period to one app is a reasonable estimate convention, but not necessarily how users expect a platform breakdown to work. Test it before changing copy.
- Marker wording explicitly identifies research and optional-cutback references, combined use, and no universal health recommendation. Keep that safeguard and both source links. Whether users misread repeated per-app markers requires human evidence.
- Step 2 has substantial introductory text and a long app list. No observed abandonment data supports deleting either. Keep calculations, nonlinear positions, tactile effects and validation unchanged.
- Report distinguishes reported estimates, questionnaire interpretation, general education and optional goals. Weekly/yearly assumptions and nonvalidated reflection rules are disclosed. Do not replace these with health scores.
- Advice may appear in insights and an optional tool, but those serve different purposes. No verified defect justifies removing content.

## Live Cloudflare verification

HTTP GET checks returned 200 for index.html and all 14 JavaScript/CSS assets; SHA-256 comparisons matched the inspected main snapshot. Homepage headers included `cache-control: no-cache` and `cf-cache-status: HIT`. Cached delivery alone does not prove stale content; the byte comparisons found no frontend discrepancy.

Actual deployed browser interactions completed at 390/1280px with normal motion and 320/768px with reduced motion. Tested homepage, underage rejection, all five steps, platform input, 3h daily/21h weekly report, and navigation through My Tools, Sleep Shield, Reduction Goal and Progress. Direct tool links, refresh and missing-report redirect guards also passed at 320/768px. Live input data was fictional and isolated; no user records were accessed.

Click-to-visible-report observations were approximately 3.38 seconds normal and 0.33 seconds reduced, including Playwright click/visibility overhead. These are not precise animation-duration measurements. Deployed flow.js matches main's 2800/200ms branches; precise duration and monotonicity assertions passed locally. Detailed plan/night editing and progress persistence were covered locally, not exhaustively repeated on the deployed site.

A real POST to `/api/health-information` returned **503**, code `cloudflare_research_not_configured`, stating that server-side provider configuration is required. This is genuine fallback mode, not successful live evidence retrieval. Worker source checks runtime `process.env.OPENAI_BASE_URL` and `process.env.OPENAI_API_KEY`; no credentials are sent by frontend code. No provider settings or secrets were changed. A repository owner must separately decide whether to configure this optional service or present the prototype explicitly with fallback education.

No authenticated Cloudflare deployment record was available. Asset equality cannot identify the deployed backend commit, account secret values, or prove whether external automatic deployment is configured. The repository's Cloudflare dry-run builds but does not establish production deployment success.

## Repository and screenshot review

README already explains purpose, audience, five steps, reports, optional tools, technology, privacy and AI assistance in first person. Avoid a broad rewrite. The restored homepage image is a fresh actual capture using the current introduction and age reassurance, with native aspect ratio. Other reviewed gallery images are retained, not automatically replaced. Existing age-review captures remain in the README. If PR 40 is merged, its tiny Next Steps label change will warrant a separately reviewed update of that affected capture; the current main screenshot remains accurate until then.

The capture uses synthetic Demo data, fixed UTC dates and fallback research. No private browser storage or personal information was used. Reviewed desktop homepage, Step 2 explanation and mobile report captures are legible; mobile live homepage was also inspected. This is not a claim that every existing published pixel was exhaustively re-audited.

Security review scope: 54 tracked source/config/document text files and patches for the six latest commits were checked for common OpenAI/GitHub/AWS credential and private-key patterns. No matching credentials were found. Runtime credential references were inspected and remain server-side. This limited scan cannot rule out arbitrary token formats, older history, deleted files or external account exposure. No full-history secret audit was performed. Current ignore rules did not protect `.env` and `.dev.vars`; the documentation-readiness PR adds ignore patterns while retaining example-file exceptions. Ignores do not remove already tracked secrets.

Before making the repository public: run a full-history secret scan, check account/deployment settings, review these PRs, and conduct the participant sessions. Do not publish credentials or rewrite history without explicit approval. The project owner should add any personal learning reflections in their own words rather than treating generated autobiographical statements as evidence.
