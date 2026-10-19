# SOCIAL MEDIA SENSE

**A clearer picture of how social media fits into your day.**

I built Social Media Sense to make it easier to reflect on social media habits without turning screen time into a score or labeling anyone. It starts with a short check-in, then puts your answers into perspective: how much time you reported, what parts of your routine may be affected, and what you might want to explore next.

[Try the live website](https://social-media-sense.akhilsomaiya7.workers.dev/)

## See SOCIAL MEDIA SENSE in Action

These are real screenshots from the application, using fictional example answers rather than anyone's personal data.

### Start here

<a href="docs/screenshots/homepage.png"><img src="docs/screenshots/homepage.png" alt="Social Media Sense homepage inviting visitors to start a check-in" width="420"></a>

A short check-in to put your social media time in perspective.

### Follow the five steps

| Step 1 — About you | Step 2 — Social media time |
| :--- | :--- |
| <a href="docs/screenshots/assessment-step-1.png"><img src="docs/screenshots/assessment-step-1.png" alt="Step 1 with example nickname and age entered" width="420"></a> | <a href="docs/screenshots/assessment-step-2.png"><img src="docs/screenshots/assessment-step-2.png" alt="Step 2 showing total social media time and app sliders" width="420"></a> |
| Tell the app a little about yourself. | Estimate time spent on each social media platform. |

| Step 3 — Sleep | Step 4 — Physical activity |
| :--- | :--- |
| <a href="docs/screenshots/assessment-step-3.png"><img src="docs/screenshots/assessment-step-3.png" alt="Step 3 showing a sample sleep duration and bedtime usage answer" width="420"></a> | <a href="docs/screenshots/assessment-step-4.png"><img src="docs/screenshots/assessment-step-4.png" alt="Step 4 showing a sample daily physical activity duration" width="420"></a> |
| Reflect on your sleep and scrolling before bed. | Add your usual daily activity time. |

| Step 5 — Your routine | Your results |
| :--- | :--- |
| <a href="docs/screenshots/assessment-step-5.png"><img src="docs/screenshots/assessment-step-5.png" alt="Step 5 with answers to routine disruption questions" width="420"></a> | <a href="docs/screenshots/results-report.png"><img src="docs/screenshots/results-report.png" alt="Read-only report showing an example social media snapshot and personalized insight" width="420"></a> |
| Think about the past week. | See your time snapshot and personal insights. |

### Explore the optional tools

| My Tools | Sleep Shield |
| :--- | :--- |
| <a href="docs/screenshots/my-tools.png"><img src="docs/screenshots/my-tools.png" alt="My Tools hub for Sleep Shield, Reduction Goal and Progress" width="420"></a> | <a href="docs/screenshots/sleep-shield.png"><img src="docs/screenshots/sleep-shield.png" alt="Optional Sleep Shield bedtime plan and night tracking" width="420"></a> |
| Choose the tool that fits your needs. | Make a bedtime plan and track your nights. |

| Reduction Goal | Your Progress |
| :--- | :--- |
| <a href="docs/screenshots/reduction-goal.png"><img src="docs/screenshots/reduction-goal.png" alt="Reduction Goal showing a hypothetical daily reduction and time projections" width="420"></a> | <a href="docs/screenshots/progress.png"><img src="docs/screenshots/progress.png" alt="Progress screen comparing two saved example check-ins" width="420"></a> |
| Explore possible time savings, without changing your results. | Save and compare check-ins on your device. |

Every screenshot comes from a browser-rendered example of the actual app. Research is shown in its offline fallback state rather than a fabricated live search.

## Take a five-step check-in

The assessment moves through five short sections:

1. **About you:** enter your age and, if you like, a name or nickname.
2. **Your social media time:** estimate daily time on each platform and see the combined total update.
3. **Sleep:** report your usual nighttime sleep and whether you use social media before bed.
4. **Physical activity:** add your average daily activity time.
5. **Your routine:** reflect on whether scrolling affected bedtime, responsibilities, activity, time with people, or how long you intended to stay online.

After the fifth step, the app shows a **read-only report**. It includes your reported daily, weekly and yearly time, your most-used platforms, and a personal observation drawn from your routine answers. You can read the reasoning and source links without changing the original check-in.

## What you can do afterward

The report is only one part of Social Media Sense. The optional **My Tools** area is separate, so making a plan doesn't rewrite your answers.

**Sleep Shield** helps you choose a scrolling cutoff before bedtime and record how seven nights went. **Reduction Goal** lets you explore a daily time target and projected savings when your reported use exceeds two hours; it doesn't claim you've already changed your habits. **Progress** lets you save check-ins in your browser and compare what you reported over time.

None of these tools is a diagnosis or a requirement.

## Why the app works this way

An hour count doesn't tell the whole story. Someone can spend a lot of time on social media without reporting disruption, while someone with less time might say scrolling keeps them up later than planned. The app therefore asks about routines instead of declaring a universal healthy or unhealthy screen-time limit.

The educational information is age-aware where the evidence supports it, with links to sources. When live research can't be retrieved, the app uses its existing verified fallback guidance rather than inventing new claims.

## Built with

- HTML, CSS, and JavaScript for the interface
- Node.js and Cloudflare Workers for the application and live-research endpoint
- Playwright for browser testing and reproducible example screenshots
- Browser local storage for saved check-ins, optional goals, and Sleep Shield history

I use GitHub to track changes and keep the project improving. The repository includes automated tests for calculations, validation, tool behavior, and several responsive layouts.

### Run it locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run build
npm test
npm run dev
```

Live research requires the Worker environment and its server-side configuration. Keep credentials in environment secrets, never in frontend code or GitHub.

### Privacy

No account is required. Saved check-ins, goals, and Sleep Shield entries stay in the browser's local storage; other people using that browser profile may be able to see them, and clearing browser data may remove them. The app does not send names or saved histories in requests for health information.

## Project notes

I originally focused on a straightforward daily-time check-in and gradually expanded it after testing the assessment and its results. I separated the report from optional tools so users can explore goals or track nights without changing their original answers.

The app is still evolving. I'm continuing to improve the clarity of the results, navigation, and presentation as I test more situations and screen sizes.

**Made with ❤️ by Akhil Somaiya**
