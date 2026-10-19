# Browser URL routing — review

This is a navigation-only change based on main `1898643b744553aac58f07d0da59a263904d6679`, including the merged motion improvements. No CSS, calculations, research providers, storage formats, tool behavior or README gallery changes.

## Routes

| Screen | Canonical path |
| --- | --- |
| Homepage | `/` |
| About You | `/check-in/about-you` |
| Social Media Time | `/check-in/social-media-time` |
| Sleep | `/check-in/sleep` |
| Physical Activity | `/check-in/physical-activity` |
| Daily Routine | `/check-in/daily-routine` |
| Current completed report | `/results` |
| My Tools | `/tools` |
| Sleep Shield | `/tools/sleep-shield` |
| Reduction Goal | `/tools/reduction-goal` |
| Progress | `/tools/progress` |

## Navigation and safeguards

`routing.js` is the only History API writer. It observes existing view and step changes, suppresses duplicate URLs, and uses replaceState while restoring Back/Forward entries. `appViews` still controls visibility; the assessment controller still validates and changes steps.

- Next validates before changing the URL. Back/Forward preserves the current draft and rechecks prerequisites if an earlier answer has changed. A visited-step ceiling prevents skipping unvisited steps.
- In-memory session/generation markers distinguish assessment drafts; history contains no answers or personal data. No new localStorage or sessionStorage keys exist.
- Completed assessments cannot be edited by revisiting their old step entries: those entries resolve to the current read-only report. Starting a new check-in explicitly creates a fresh draft. Returning to the previous report while that draft is active leaves the report unchanged.
- The route identifies the current in-memory report, not a collection of historical full reports. Saving remains an explicit action in Progress.
- During the existing loading sequence, in-app navigation is held and in-document Back/Forward requests are canonicalized to the final step URL. The original timer completes once, then navigation advances to `/results`. No extra loading route, timer or research request is added.
- Refresh/direct access to assessment steps starts at Step 1 with a neutral explanation. There is no persistent unfinished-draft system.
- Refresh/direct access to `/results` without an in-memory full report returns home with guidance. Saved summary records are never reconstructed into reports.
- All tools open directly. Saved Sleep Shield plans retain the explicit Resume My Plan action; Progress shows saved records; Reduction Goal retains its baseline and greater-than-120-minute eligibility requirements.
- Focus moves into the visible screen. Hidden prior triggers are not reused. The brand link returns home without reloading the app.

## Worker behavior

Only allowlisted paths with HTML GET/HEAD requests use the Static Assets root document. Requesting `/` from the binding avoids its `/index.html` canonical redirect. Browser assets use root-relative URLs, so nested paths load the same JavaScript/CSS. Existing cache and security headers remain in place.

The health endpoint is untouched. Unknown API paths still return JSON 404. Unknown assets/routes and unrelated POST requests are not rewritten into successful HTML responses. Wrangler configuration is unchanged; no secrets or provider settings were modified.

## Files changed

- `public/routing.js`: route mapping, history and safe restoration.
- `public/flow.js`: exposes guarded in-memory step navigation, visited-step tracking and completion/loading state; emits step changes.
- `public/navigation.js`: initializes routing, tracks resumed route drafts, prevents navigation while loading and avoids hidden focus targets.
- `public/index.html`: root-relative assets, client-side home link, neutral route notice and routing script.
- `cloudflare/worker.mjs`: allowlisted HTML fallback.
- `scripts/routing-server.mjs`: local HTTP harness using the actual Worker handler with a filesystem Static Assets stand-in.
- `scripts/test-routing-worker.mjs`, `scripts/test-routing.mjs`: direct-request and browser regressions.
- `package.json`: `npm run test:routing`.
- `.github/workflows/screenshots.yml`: runs route tests and uploads artifacts; no automatic documentation publication.
- `.gitignore`: excludes local routing artifacts, dry-run bundle and Wrangler state.
- This review directory: test details and synthetic browser captures.

## Verification

- `npm run build`: passed.
- `npm test`: all seven existing test scripts passed.
- `npm run test:motion`: normal/reduced motion at 320/390/768/1280px and optional motion-script failure passed.
- `npm run screenshots`: 17 deterministic captures passed; curated gallery files unchanged.
- `npm run test:routing`: Worker direct-request checks and browser scenarios at 320/390/768/1280px passed.
- `npm run check:cloudflare`: dry-run bundle passed; nothing uploaded.
- Browser assertions cover all five routes, validation, retained answers, history entry counts, loading, exact 3h/21h/1,095h totals, unchanged report round trips, no repeat reveal/calculation, new drafts, refresh, direct tool routes, saved history, explicit plan resume, eligibility, keyboard focus, no new storage, no console errors and no horizontal overflow.
- Worker tests issue actual HTTP GET/HEAD requests through the imported Worker handler, including all 11 routes, unknown paths/assets/APIs, non-HTML requests and POSTs. They assert deep links remain at their requested URL rather than redirecting to `/`.

Local commands used Chromium with `CHROMIUM_PATH=/tmp/chromium` and `PLAYWRIGHT_MODULE` pointing to the installed runtime. Standard checkouts can use installed Playwright Chromium. `ROUTING_CAPTURE=1 npm run test:routing` additionally creates review images and a URL manifest under `artifacts/routing/`.

## Browser evidence

These are actual local browser renders with synthetic data and controlled research-unavailable responses. URLs recorded by Playwright are in [urls.json](urls.json). The images capture page content, not browser chrome; the path labels below are the corresponding tested browser URLs.

| Observed URL path | Desktop | Mobile |
| --- | --- | --- |
| `/check-in/social-media-time` | [1280px](social-media-time-1280.jpg) | [390px](social-media-time-390.jpg) |
| `/results` | [1280px](results-1280.jpg) | [390px](results-390.jpg) |
| `/tools/sleep-shield` | [1280px](sleep-shield-1280.jpg) | [390px](sleep-shield-390.jpg) |

## Limitations and follow-up review

Wrangler's local emulator could not start because the host returned `uv_interface_addresses` permission/system errors. Direct-route tests therefore exercise the real Worker handler with a filesystem asset binding, not workerd or a deployed Cloudflare edge. The dry-run bundle passed; verify deep-link refreshes on the branch preview before merging.

Browser tests used Chromium with emulated mobile touch/media settings, not physical devices, Safari/Firefox or a real screen reader. Live provider retrieval is unchanged and was not retested against an external provider. Early test attempts corrected timing and fixture assumptions (loading advances immediately; Sleep Shield has its own existing research request and requires explicit resume); no production behavior was altered to satisfy those assumptions.

No merge or production deployment was performed.
