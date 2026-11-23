# SOCIAL MEDIA SENSE

**A simple way to look at how social media fits into everyday life.**

[Try the project](https://social-media-sense.akhilsomaiya7.workers.dev/) · [See what it looks like](#see-the-project-in-action) · [Run it locally](#run-it-locally)

<table>
<tr>
<td>
<h3 align="center">NOTE: Educational Purpose &amp; Important Disclaimer</h3>
<p align="left">Social Media Sense is an educational project designed for personal reflection and awareness. This application helps users explore their self-reported social media habits and consider how those habits fit into everyday routines, including sleep and physical activity. The results and suggestions are for educational and informational purposes only. They are not medical diagnoses, clinically validated assessments, or substitutes for professional health advice. The goal is to encourage thoughtful reflection, not to judge, diagnose, or determine whether someone's social media habits are healthy or unhealthy.</p>
</td>
</tr>
</table>

## What I built

I made Social Media Sense as a small project for Handshake. I wanted to create something people could actually try, not just a presentation of an idea.

The question behind it is pretty straightforward: **how does the time I spend on social media fit into the rest of my day?** Just knowing that someone spends two or three hours online doesn't say much about their experience. They might be catching up with friends, learning something new, or finding themselves scrolling when they meant to go to bed.

My project asks people to estimate their social media time and think about a few parts of their routine. After five steps, it gives them a summary of what they entered, points out any interruptions they reported, and offers optional tools if they want to explore a change.

I designed the check-in for **ages 15 to 100**. It doesn't read someone's phone data, give them a health score, or diagnose social media addiction. People can use it without creating an account.

## Why I wanted to make it

I kept coming back to the idea that two people can spend the same amount of time online and have very different experiences. That's why I didn't want to build another calculator that simply multiplies daily screen time by seven.

I wanted people to think about **what that time means to them**. Does it affect bedtime? Are they putting off something they planned to do? Does it get in the way of time with other people? Or does it fit into their routine without any of those issues?

I also wanted the results to feel fair. Someone who reports more time online shouldn't automatically be told they have a problem. Likewise, someone with a smaller total can still have a habit they'd like to work on.

<table>
  <tr>
    <td>
      <strong>Note: About This Project</strong>
      <p>
        Social Media Sense is an independent, non-commercial prototype created as a Handshake portfolio project. It is not a company, commercial product, or medical assessment. It is intended for educational use and personal reflection.
      </p>
    </td>
  </tr>
</table>

## What you can do with it

The check-in lets someone see their estimated daily and weekly social media use, find their most-used platforms, and reflect on habits they noticed during the past week. The results explain which answers shaped the summary.

For example, someone who reports **90 minutes a day** but says scrolling sometimes delays their bedtime might see a suggestion to explore a bedtime plan. Someone reporting **three hours a day** with no disruptions across the five questions won't automatically be labelled unhealthy.

These are examples of how I wrote the app's rules, not medical conclusions or research findings.

## How the five steps work

I designed the assessment for **ages 15 to 100**, including both endpoints. Both name or nickname and age are required. People can go back to correct their answers, and the completed report does not become an editable goal-setting screen.

| Step | What you enter | Why it matters |
| --- | --- | --- |
| **1. About you** | Required name or nickname and age | Selects relevant educational context. Ages outside 15 to 100 cannot continue. |
| **2. Social media time** | Estimated time for each platform on an average day | Shows a combined total and the platforms contributing to it. |
| **3. Sleep** | Typical nighttime sleep and age-related sleep context | Provides age-relevant sleep context without assuming social media caused a sleep pattern. |
| **4. Physical activity** | Typical daily activity in hours and minutes | Adds routine context, rather than a fitness grade. |
| **5. Everyday routine** | Five routine-disruption answers plus a separate pre-bed social media use question | Determines which reported habits, if any, may be worth reviewing. |

Names accept Unicode letters and accents, with spaces, hyphens and apostrophes between name parts, including one-letter names. Numbers, emojis, markup and unsupported punctuation produce inline feedback. Surrounding whitespace is trimmed and extra spaces are normalized. Names are limited to 200 UTF-16 code units; age must be a whole number from 15 to 100. Both labels show an asterisk, and invalid entries prevent progression.

### Why I ask for age

Step 1 has an accessible, field-level warning when someone enters an age under 15 or over 100. Under-15 entries receive **"Age requirement not met"** and an explanation of the supported range; invalid entries cannot advance to Step 2.

Age-relevant educational material distinguishes **teens (15 to 17), young adults (18 to 29), adults (30 to 64) and older adults (65 to 100)**. Teen and young-adult experiences receive specific attention, while adults 30+ remain important. Published medical-source age ranges are preserved as written; they are not rewritten to match the app's eligibility rule.

### How the sliders work

Each built-in platform slider supports **0 to 12 hours** in **five-minute increments**. The fixed platforms are Facebook, Instagram, WhatsApp, Messenger, LinkedIn, X (Twitter), Threads, YouTube, TikTok, Snapchat, Twitch, Telegram, Discord, Reddit and Pinterest. Unused platforms can remain at zero. People can add and remove custom platforms. The combined reported total updates live and cannot exceed **24 hours per day**.

When apps are used simultaneously, the person is asked to count the overlapping time only once so the combined total represents their best estimate of time spent. This means the platform-by-platform breakdown is an allocation estimate, **not an exact device measurement**.

The **30-minute marker** describes a research study's combined-use reduction target, and the **two-hour marker** provides context for an optional reduction tool. The markers are **not per-platform limits or universal medical thresholds**. The interface links to explanatory APA and AAP resources.

### Sleep and everyday routines

Step 3 accepts sleep hours and minutes, validates minutes from 0 to 59 and a combined duration of 0 to 24 hours, and links to [CDC About Sleep](https://www.cdc.gov/sleep/about/). Its red informational warning appears below 8 hours for ages 15–17 and below 7 hours for ages 18–100. The displayed recommendations are 8–10 hours, at least 7 hours, 7–9 hours and 7–8 hours for ages 15–17, 18–60, 61–64 and 65–100 respectively. Empty or invalid input does not receive this warning. Valid lower amounts still allow Next. The teen guidance retains the distinction between nighttime sleep and total sleep over 24 hours, which may include naps.

Step 4 accepts activity hours and minutes, with the same whole-minute and 24-hour total bounds. It adds context, not a fitness score.

Step 5 asks about five interruptions: later bedtimes, responsibilities, physical activity, time with people and scrolling longer than planned. Immediately after the bedtime question, it separately asks **“Do you usually use social media during the hour before you try to sleep?”** All six require Never, Sometimes or Often. Pre-bed use alone does not count as disruption. Answers remain selected when navigating Back and Next.

## What happens after the check-in

After Step 5, the app displays a short loading transition, followed by **only the completed, read-only report**. The report has three primary sections:

**1. Your Time.** Estimated daily and weekly totals, plus top platforms. The yearly projection and assumptions are available in expandable details. Calculations use the entered daily average: **weekly = daily × 7** and **yearly = daily × 365**. They do not represent measured historical usage.

**2. Your Everyday Balance.** A summary of the person's reported routine, with conditional positive feedback. General sleep context remains available under the report's expandable details. A **Sometimes** or **Often** answer flags an observation for reflection. If every routine answer is **Never**, the report acknowledges that no disruption was reported within these questions; it does not certify that the behavior is risk-free. A conditional balance celebration is available for eligible results.

**3. Make Room for What Matters.** One optional suggestion based on the actual answers, along with ways to save the check-in, explore tools and inspect educational sources. Reported bedtime interference takes priority for **Sleep Tracker**. Other disruption may lead to **Reduction Goal** when the usage-based eligibility rule is met; otherwise **Progress** remains an option. The two-hour reference alone is not used to diagnose or label someone.

The always-visible **Note: Understanding Your Answers** explains Never as no interruption reported, Sometimes as occasional interruptions and Often as frequent interruptions. It states that results are not a medical diagnosis or health score.

I kept the report read-only. Moving a goal slider or tracking a night of sleep doesn't change the original answers. A new assessment creates a new report.

### Health Information and Sources

The report presents **What You Can Keep in Mind** when applicable, **Potential Benefits of Social Media**, **Potential Risks of Social Media**, and **Sources and Further Reading**. Cards keep reviewed explanations, personal relevance and age scope available. Compact citations link directly to sources; the reading list retains full titles, organizations, available dates and reviewed summaries. Show more/less controls keep longer lists manageable without removing their content.

| Reported daily use | Reported routine disruption | Default presentation |
| --- | --- | --- |
| Under 120 minutes | All five Never | Benefits; general risks available through View potential risks |
| 120 minutes or more | All five Never | Benefits and general risk education |
| Any valid total | At least one Sometimes or Often | Benefits and risks relevant to the reported interruptions |

The risk control changes to **Hide potential risks** when expanded. The 30-minute and two-hour markers are reflection references, not clinical safety cutoffs. These display rules are the same for local resources and optional AI-assisted selection. Pre-bed use is separate from the five disruption answers.

## The optional tools

These tools can be opened from **My Tools** without first completing the assessment. They are separate from the report.

### Sleep Tracker — plan a bedtime wind-down

Set a planned bedtime, choose a **15-, 30-, 45- or 60-minute** social media wind-down window, and select a replacement activity. The tool displays the planned cutoff and lets people record up to **seven self-reported night check-ins**, including whether they followed the wind-down, sleep duration, how rested they felt, and an optional note. Nights can be edited or cleared. A **Seven-Night Sleep Summary** appears when records are available, with encouraging or practical, non-diagnostic feedback based on what was entered. These are seven numbered check-ins, not a verified sequence of seven calendar nights. Saved plans and night entries remain in the browser. **It does not promise better sleep or prove causation.**

The storage notice says: **Saved in this browser**. “Your sleep check-ins are saved in this browser. They won't appear on other devices and may be lost if you clear your browser data.” Projected wind-down totals describe protected bedtime opportunity, not guaranteed additional sleep.

### Reduction Goal — explore a hypothetical target

For a current or saved baseline reporting **more than 120 minutes per day**, explore a target reduction and view **before-versus-after time projections** for a day, week, 30-day month and 365-day year. I use the 120-minute rule only to decide when the optional calculator is available. It's not a health limit. Changing the slider does not mean time has actually been recovered, and saving a goal is a separate action. Saving requires the matching eligible check-in in Progress. Unsaved goal targets stay attached to that baseline during the current visit; starting a new check-in does not transfer the old draft.

### Progress — save and compare check-ins

Explicitly save summary values and compare later entries for estimated usage, platforms, sleep, activity and routine responses. Saved check-ins are **summaries, not historical copies of the entire report or its research**. Clearing saved check-ins also removes their linked reduction goals; Sleep Tracker records remain separate.

## See the project in action

These are real browser captures of the current checkout, using fictional answers and isolated browser storage. Desktop views use a 1280px viewport; the mobile validation and sleep-warning examples use 390px. Each image keeps its natural proportions and can be opened at full size. Educational content comes from the bundled local library, with external requests blocked during capture. See the [capture inventory and verification limits](docs/REPOSITORY-REFRESH.md). These are local-checkout captures, not evidence of a production deployment version.

### Homepage

[![Social Media Sense homepage](docs/screenshots/homepage.png)](docs/screenshots/homepage.png)

### Step 1: Required name, age and validation

[![Required name and age fields with valid fictional entries](docs/screenshots/assessment-step-1.png)](docs/screenshots/assessment-step-1.png)

[![Mobile inline error for an unsupported character in a nickname](docs/screenshots/assessment-name-validation-mobile.png)](docs/screenshots/assessment-name-validation-mobile.png)

[![Mobile underage warning for a submitted age of 14](docs/screenshots/assessment-age-validation-mobile.png)](docs/screenshots/assessment-age-validation-mobile.png)

The red warning explains the requirement and keeps the user on Step 1. It is a validation message, not a medical or emergency alert.

### Step 2: Estimating social media time

[![Step 2 daily total, slider guidance and evidence links](docs/screenshots/assessment-step-2.png)](docs/screenshots/assessment-step-2.png)

[![Platform sliders showing reported durations and reference markers](docs/screenshots/assessment-step-2-sliders.png)](docs/screenshots/assessment-step-2-sliders.png)

[![Custom platform fields, sliders, Remove and Add controls](docs/screenshots/assessment-custom-platform.png)](docs/screenshots/assessment-custom-platform.png)

### Steps 3 to 5: Thinking about your routine

**Step 3: Sleep duration and age-specific guidance**

[![Sleep duration and age context without the separate pre-bed question](docs/screenshots/assessment-step-3.png)](docs/screenshots/assessment-step-3.png)

[![Mobile non-blocking sleep warning for a fictional adult reporting 6 hours 30 minutes](docs/screenshots/assessment-sleep-warning-mobile.png)](docs/screenshots/assessment-sleep-warning-mobile.png)

The warning provides general CDC guidance. A valid lower sleep duration still allows the user to continue.

**Step 4: Physical activity**

[![Activity duration entry](docs/screenshots/assessment-step-4.png)](docs/screenshots/assessment-step-4.png)

**Step 5: Five interruptions and a separate pre-bed habit**

[![Five routine-disruption questions, separate pre-bed use and completion action](docs/screenshots/assessment-step-5.png)](docs/screenshots/assessment-step-5.png)

### What the results look like

**Your Time**

[![Daily and weekly estimates and top platforms](docs/screenshots/results-report.png)](docs/screenshots/results-report.png)

**Your Everyday Balance**

[![Reported everyday-routine interruptions](docs/screenshots/results-insights.png)](docs/screenshots/results-insights.png)

**An eligible no-disruption example**

[![Positive feedback and optional celebration for a fictional all-Never check-in](docs/screenshots/results-balance.png)](docs/screenshots/results-balance.png)

**Make Room for What Matters**

[![Suggested next step, save link and educational sources](docs/screenshots/results-next-steps.png)](docs/screenshots/results-next-steps.png)

**Health Information and Sources**

[![Age-relevant local educational benefits, risks and linked sources](docs/screenshots/health-education.png)](docs/screenshots/health-education.png)

For a fictional 30-minute check-in with all five interruption answers set to Never, general risks are available through a smaller optional control:

[![Benefits and the View potential risks control for a no-disruption check-in](docs/screenshots/health-education-optional-risks.png)](docs/screenshots/health-education-optional-risks.png)

### My Tools

**My Tools**

[![My Tools overview](docs/screenshots/my-tools.png)](docs/screenshots/my-tools.png)

**Sleep Tracker — the wind-down plan and seven-night check-ins**

[![Sleep Tracker bedtime plan](docs/screenshots/sleep-tracker.png)](docs/screenshots/sleep-tracker.png)

[![Sleep Tracker night-tracking form](docs/screenshots/sleep-tracker-tracking.png)](docs/screenshots/sleep-tracker-tracking.png)

**Seven-Night Sleep Summary**

[![The seven-night Sleep Tracker summary with fictional completed check-ins](docs/screenshots/sleep-tracker-seven-night-summary.png)](docs/screenshots/sleep-tracker-seven-night-summary.png)

**Reduction Goal**

[![Before and after hypothetical reduction](docs/screenshots/reduction-goal.png)](docs/screenshots/reduction-goal.png)

[![Expanded projected time savings](docs/screenshots/reduction-savings.png)](docs/screenshots/reduction-savings.png)

**Progress**

[![Saved check-in overview](docs/screenshots/progress.png)](docs/screenshots/progress.png)

[![Comparison of two self-reported check-ins](docs/screenshots/progress-comparison.png)](docs/screenshots/progress-comparison.png)

I took these screenshots with fictional data and the regular offline research fallback. They don't represent a successful live search. For reproduction and capture standards, see [screenshot documentation](docs/SCREENSHOTS.md).

## Privacy and a few important limits

**Social Media Sense is not a medically validated questionnaire and does not diagnose addiction, anxiety, depression, sleep disorders or other conditions.** It cannot automatically read phone usage, validate that estimates are accurate, or determine that social media caused a reported routine difficulty.

**No account is necessary.** Check-ins, goals and Sleep Tracker data that a visitor chooses to save are stored in the **current browser's local storage**. They can be visible to someone else using the same browser profile and may disappear if browser data is cleared. There is no cross-device sync or account backup.

**Educational resources come from a reviewed local library.** The report filters CDC, HHS, AAP, NIH and peer-reviewed resources by age and reported routines. Optional server-side OpenRouter free-model selection can arrange those reviewed explanations; it cannot add claims or citations. Limited age-band, rounded-duration and routine context may be sent, without names, platform details or saved records. Local education remains available without a key or AI access. Sleep Tracker retains its existing guidance and fallback behavior. See [optional AI setup and limitations](docs/OPENROUTER.md).

Health sources are selected for **educational relevance**, with age scope, source dates and clickable citations. Both potential benefits and possible risks remain available. The label “Evidence-based educational resources” describes reviewed educational material, not a live search or clinical validation. The library needs periodic manual review; publication dates are not assessment timestamps. Sources do not imply endorsement of the project.

The screenshots show the current locally curated educational resources. The current version renders local resources first and may request free-model selection at the same-origin endpoint; it does not use the retired paid search provider.

**Unsaved full reports are temporary.** Browser navigation can preserve an in-progress assessment during the current visit, but refreshing can return a person to Step 1, and opening `/results` without an active completed report will not recreate one. Only deliberately saved summary check-ins remain available through Progress.

## How I built it

The frontend uses **HTML, CSS and vanilla JavaScript**. A **Cloudflare Worker** serves the static files, supports readable URLs via the History API and provides an optional free-model selection endpoint. Health education renders locally first, without paid OpenAI requests. **Node.js, Wrangler and Playwright** support local development, validation, browser tests and screenshot reviews.

The project uses explicit client-side validation, accessible error messages, reduced-motion support, browser route guards, immutable report presentation and local-storage boundaries. These decisions support the scope of a working prototype without adding an account system or a frontend framework.

### Run it locally

Node.js **22+** is required.

```bash
npm ci
npm run build
npm test
npm run dev
```

Open the URL displayed by Wrangler. Assessment, tools and curated health education work without API credentials. The `/api/health-information` endpoint returns local mode unless an explicit free OpenRouter model and runtime key are configured. No paid model or live web search is used.

### Additional checks and real screenshots

```bash
npx playwright install chromium
npm run test:motion
npm run test:routing
npm run test:age
npm run screenshots
npm run check:cloudflare
node scripts/test-nickname-overflow.mjs
node scripts/test-seven-night-summary.mjs
```

`npm run screenshots` creates real captures from isolated, synthetic browser sessions under `artifacts/screenshots/`. It deliberately does **not** overwrite the reviewed images shown in this README. Images should be compared with the current UI before publication; do not stretch, fabricate or silently replace them.

A [reviewed screenshot workflow](.github/workflows/screenshots.yml) generates isolated synthetic browser captures for inspection. The curated images in this README are updated only after visual review; the workflow does not silently overwrite them. The earlier [screenshot review notes](docs/SHOWCASE-REVIEW.md) and [readiness notes](docs/review/readiness-2026-10-22.md) record prior QA and should be read as dated evidence.

For developers, the main files are:

| Area | Files |
| --- | --- |
| Assessment and platform controls | `public/app.js`, `public/flow.js`, `public/platforms.js` |
| Interface and navigation | `public/index.html`, `public/style.css`, `public/navigation.js`, `public/routing.js` |
| Report and educational context | `public/results-report.js`, `public/education.js`, `public/sleep-context.js` |
| Optional tools | `public/goals.js`, `public/sleep-shield.js` |
| Hosting and educational resources | `cloudflare/worker.mjs`, `lib/health.mjs`, `public/health-fallback.js`, `public/education.js`, `wrangler.jsonc` |
| Tests and reviewed screenshots | `scripts/`, `docs/screenshots/`, `docs/review/` |

The repository retains a Netlify adapter, but **Cloudflare Workers is the current deployment target**.

## Current verification and what's still limited

The latest review passed the build, unit suite, age browser checks at 320/390/768/1280px, Cloudflare bundle dry run and screenshot capture in GitHub Actions. Motion and routing browser checks stopped at older assertions that expect Age to receive focus when both required fields are empty; the current form focuses Name first. Those suites are not reported as passing. Production DOM inspection confirmed required name/age, the sleep-warning element and the Step 5 pre-bed placement, and the follow-up verified Cloudflare version `c0b55146` serving main `53512b3` at 100% traffic. A complete isolated production assessment remains unverified. See [the original review record](docs/REPOSITORY-REFRESH.md) and [follow-up verification](docs/VERIFICATION-FOLLOWUP.md).

In October 2026, the core five-step assessment, validation, custom platform removal, results calculations and normal mobile layouts were tested with synthetic answers. A 200-character nickname originally caused horizontal overflow; the fix was verified on the deployed Cloudflare version at **320, 375, 390 and 1366 pixels** after deployment completed. Both ordinary and empty nicknames also passed at that time; empty names are now rejected by Step 1. The source build and unit tests passed. These are targeted QA results, not a certification of every device or flow.

Isolated saved-history and seven-night Sleep Tracker browser scenarios were not exhaustively covered during that live QA session, because an existing browser profile might contain personal records. Screenshots and tests must use synthetic data and an isolated profile when modifying local storage. See [screenshot policy](docs/SCREENSHOTS.md) for recapture and review instructions.

## Where the project stands

**I built Social Media Sense as a small, non-commercial Handshake prototype.** My focus is on explaining the idea clearly, checking that it works, and being upfront about what it cannot tell someone.

I used AI-assisted coding tools and ChatGPT Work for implementation reviews and browser QA while building this project. I also made decisions about its purpose, questions, layout, and boundaries. I've kept the test notes and screenshots so anyone looking at the repo can see how it works and what I checked.

**Made with ❤️ by Akhil Somaiya**

