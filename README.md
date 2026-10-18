# SOCIAL MEDIA SENSE

A responsive digital-wellness check-in that helps people understand how social media fits into their day — without diagnosing, labeling, or treating screen time alone as a health score.

**Live demo:** https://social-media-sense.akhilsomaiya7.workers.dev/

## See SOCIAL MEDIA SENSE in Action

Actual browser captures using fictional check-ins and local storage. Research is shown in fallback mode; these screenshots do not claim a successful live search.

![Homepage with Start My Check-In and Explore My Tools](docs/screenshots/homepage.png)

Start a five-step check-in or explore the optional tools without an account.

<details>
<summary>Assessment, report and tools gallery</summary>

| Assessment and report | Optional tools |
| --- | --- |
| ![Step 2 per-app sliders](docs/screenshots/assessment-step-2.png) **Daily app use.** Set per-app time with a live combined total. This view is scrolled to the app controls. | ![My Tools hub](docs/screenshots/my-tools.png) **My Tools.** Open Sleep Shield, Reduction Goal or Progress. |
| ![Read-only personalized report](docs/screenshots/results-report.png) **Your report.** Review your time snapshot, personal insights and an optional next step. | ![Sleep Shield bedtime plan](docs/screenshots/sleep-shield.png) **Sleep Shield.** Create a bedtime cutoff and record nights separately from the assessment. |
| ![Reduction Goal projection](docs/screenshots/reduction-goal.png) **Reduction Goal.** Explore a target and projected time savings without changing reported usage. | ![Saved check-in comparison](docs/screenshots/progress.png) **Your Progress.** Save check-ins locally and compare reported values over time. |

</details>

[Capture instructions and screenshot CI workflow](docs/SCREENSHOTS.md)

## What it does

Social Media Sense turns a short five-step check-in into a practical snapshot of daily social media habits. It combines self-reported app usage with sleep, physical activity, and routine-disruption questions, then shows time calculations, personalized opportunities, reduction projections, Sleep Shield guidance, and current health resources.

## Key features

- Five-step guided assessment with field-specific validation
- Per-app social media sliders with a 24-hour combined daily limit
- Daily, weekly, and yearly usage calculations
- Read-only report with Your Social Media Snapshot, Your Personal Insights and personalized Your Next Steps
- Top-platform breakdown
- **My Tools** hub, accessible independently of the assessment
- Behavior-based interpretation instead of judging users by time alone
- **One Place to Start** within **Your Personal Insights**, using the existing routine-context rules
- Separate **Reduction Goal** tool for optional time-saving projections (available above 120 reported minutes/day)
- **Sleep Shield** with a personalized pre-bed plan and seven-night local tracker
- **Your Progress** for explicitly saved check-ins and comparisons using browser local storage
- Balanced-use celebration for users reporting little routine disruption
- Live, age-aware health research with source links and verified fallback guidance
- Responsive layout for desktop and mobile
- Accessibility details including keyboard focus, semantic controls, `aria-live`, and reduced-motion support

## Health and safety approach

This project is educational, not diagnostic. It does not label users as addicted, healthy, unhealthy, depressed, anxious, or otherwise make medical conclusions.

Social media time alone does not determine a result. The app uses self-reported routine context and clearly separates estimates for social media use, sleep, and physical activity.

Live health information is selected from credible sources such as government/public-health organizations, professional associations, universities, academic medical centers, and peer-reviewed research. If live retrieval is unavailable, the app falls back to previously verified educational guidance rather than inventing sources.

## How the assessment works

1. **About you** — optional name/nickname and age
2. **Social media time** — per-platform daily usage sliders
3. **Sleep** — usual sleep duration and pre-bed social media use
4. **Physical activity** — average daily activity
5. **Past-week routine check-in** — Never / Sometimes / Often routine-disruption questions

After a short loading transition, the assessment is hidden and a dedicated results screen is shown.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Cloudflare Workers + Static Assets
- Wrangler
- OpenAI SDK for server-side live research
- Browser `localStorage` for saved check-ins and Sleep Shield history
- GitHub for version control and deployment source

The repository also retains Netlify configuration and function files from the earlier deployment path.

## Project structure

```text
.
├── public/                 # Frontend HTML, CSS, and JavaScript
├── cloudflare/             # Cloudflare Worker
├── lib/                    # Shared server-side health research logic
├── netlify/                # Existing Netlify function
├── scripts/                # Validation and regression tests
├── package.json
├── package-lock.json
├── wrangler.jsonc
└── netlify.toml
```

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run build
npm test
npm run dev
```

Opening `public/index.html` directly can display the frontend, but server-side live health research requires the Worker/runtime environment.

## Cloudflare deployment

The production deployment uses Cloudflare Workers with Static Assets.

```text
Build command:  npm run build
Deploy command: npx wrangler deploy
Root directory: repository root
```

Runtime credentials for live research belong in Cloudflare secrets/environment variables and are never placed in frontend code or committed to GitHub.

## Privacy

- No login is required.
- Saved check-ins and Sleep Shield entries stay in the browser's local storage.
- The user's name, saved history, bedtime notes, and Sleep Shield tracking are not sent to live health research.
- Clearing browser data can remove locally saved history.

## Project evolution

This project was built iteratively: the first working assessment was tested, validation and calculation bugs were fixed, the experience was expanded with per-app tracking, personalized result features, Sleep Shield, live health research, and local progress comparisons, then migrated from Netlify to Cloudflare and cleaned into a production-ready GitHub structure.

## Creator

**Made with ❤️ by Akhil Somaiya**


## Report and optional tools

The homepage opens the five-step assessment or My Tools. Completed reports are read-only snapshots. Sleep Shield, Reduction Goal, and Progress are separate in-app views; returning to a report does not recalculate it. Saved records are shown as recorded fields, never reconstructed full reports. See [TOOLS-ARCHITECTURE.md](TOOLS-ARCHITECTURE.md) for navigation, storage compatibility, and testing.
