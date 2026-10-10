# SOCIAL MEDIA SENSE

Complete current application source, including the compact Sleep Shield update. This is a consolidated current version, not a collection of old versions. No current app feature was rebuilt or removed for this export.

## Start here

For GitHub and Cloudflare, follow **DEPLOY-TO-CLOUDFLARE.md**. Upload this folder's contents so `package.json` and `wrangler.jsonc` are at your repository root. The archive contains the actual HTML, CSS, JavaScript, backend, configuration, dependency lockfile, and tests.

The existing Netlify deployment remains supported; see **DEPLOY-TO-NETLIFY.md**. Its function and configuration are included unchanged.

## Current features

- SOCIAL MEDIA SENSE corner branding and creator credit.
- Five-step assessment with per-app sliders, custom platforms, live totals, and field-specific validation.
- A 24-hour combined social-media limit; sleep and activity are separate estimates.
- Sleep hours/minutes, planned bedtime, and before-bed social media question.
- Four routine-disruption questions and the existing 1–100 loading transition.
- Dedicated results screen, daily/weekly/yearly totals, and top platforms.
- Biggest Opportunity, What if I cut back?, saved check-in comparisons, and balanced-use celebration.
- Personalized benefits and risks in compact cards; shorter maintenance information for balanced check-ins.
- Fresh server-side health retrieval, credible-source filtering, citations, and verified fallback education.
- Automatic compact Sleep Shield: bedtime action, cutoff, replacement activity, one-night-at-a-time tracker, expandable progress/research/projections, local saving, and personal comparisons.
- Responsive layout and current background/colors.

## Project folders

| File/folder | Purpose |
| --- | --- |
| `public/index.html` | Actual app page and assessment/results structure |
| `public/style.css` | Current styles and responsive layouts |
| `public/*.js` | Calculations, sliders, flow, health rendering, goals, celebration, Sleep Shield |
| `lib/health.mjs` | Shared server-only live research and source validation |
| `netlify/functions/health-information.mjs` | Existing Netlify Function |
| `netlify.toml` | Existing Netlify configuration |
| `cloudflare/worker.mjs` | Cloudflare adapter serving the same app and API |
| `wrangler.jsonc` | Cloudflare deployment and static asset configuration |
| `package.json`, `package-lock.json` | Dependencies and commands |
| `scripts/` | Build validation and regression tests |
| `.gitignore` | Excludes dependencies, generated files, and local secrets |
| `.env.example`, `.dev.vars.example` | Hosting-specific configuration guidance without credentials |
| `SHA256SUMS.json` | Checksums for the packaged files |

Images/icons are inline or text; the app does not depend on an omitted image folder. Dependencies are restored with `npm ci`; `node_modules` is intentionally not packaged.

## Run and check

Requires Node.js 22 or newer.

```sh
npm ci
npm run build
npm test
npm run check:cloudflare
npm run dev
```

Opening the HTML file directly cannot run server-side live research.

## Live research and privacy

All AI calls stay server-side. No credentials are included in the download. Netlify's automatic Gateway credentials do not transfer to Cloudflare; Cloudflare needs its own runtime provider settings, described in the deployment guide. Both hosting paths use the same official OpenAI SDK and research logic.

The app is educational and non-diagnostic. Its saved check-ins and Sleep Shield nights use browser local storage. They are not packaged into this source export and do not automatically move between site addresses. Names and personal tracker notes are not sent to live research.

See EXPORT-NOTES.md for this export's scope and verification. See SLEEP-SHIELD-NOTES.md for the sleep feature's implementation and test notes.
