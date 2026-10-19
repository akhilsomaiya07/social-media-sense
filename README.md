# SOCIAL MEDIA SENSE

**A clearer picture of how social media fits into your day.**

I built Social Media Sense to make it easier to reflect on social media habits without turning screen time into a score or labeling anyone. It starts with a short check-in, then puts your answers into perspective: how much time you reported, what parts of your routine may be affected, and what you might want to explore next.

[Try the live website](https://social-media-sense.akhilsomaiya7.workers.dev/)

## See SOCIAL MEDIA SENSE in Action

These are real captures of the application using example answers, not anyone's personal records. The research panels use the app's offline fallback state.

**Homepage**

<a href="docs/screenshots/homepage.png"><img src="docs/screenshots/homepage.png" alt="Homepage" width="640"></a>

Start a five-step check-in or explore optional tools without an account.

**Daily app use**

<a href="docs/screenshots/assessment-step-2.png"><img src="docs/screenshots/assessment-step-2.png" alt="Daily app use" width="640"></a>

Set per-app time with a live combined total. This view is scrolled to the app controls.

**Your report**

<a href="docs/screenshots/results-report.png"><img src="docs/screenshots/results-report.png" alt="Your report" width="640"></a>

Review your time snapshot, personal insights and an optional next step. More content continues below this viewport.

**My Tools**

<a href="docs/screenshots/my-tools.png"><img src="docs/screenshots/my-tools.png" alt="My Tools" width="640"></a>

Open Sleep Shield, Reduction Goal or Progress.

**Sleep Shield**

<a href="docs/screenshots/sleep-shield.png"><img src="docs/screenshots/sleep-shield.png" alt="Sleep Shield" width="640"></a>

Create a bedtime cutoff and record nights separately from the assessment.

**Reduction Goal**

<a href="docs/screenshots/reduction-goal.png"><img src="docs/screenshots/reduction-goal.png" alt="Reduction Goal" width="640"></a>

Explore a target and projected time savings without changing reported usage.

**Your Progress**

<a href="docs/screenshots/progress.png"><img src="docs/screenshots/progress.png" alt="Your Progress" width="640"></a>

Save check-ins locally and compare reported values over time.




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
