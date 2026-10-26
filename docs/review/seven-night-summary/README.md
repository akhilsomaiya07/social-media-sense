# Seven-night sleep summary review

This adds one compact section to the current seven-slot Sleep Shield. It does not add a diary, calendar, dashboard, chart, required question or storage format.

| View | Mobile | Desktop |
| --- | --- | --- |
| Seven sufficient durations, mixed wind-down adherence | [390px](positive-390.webp) | [1280px](positive-1280.webp) |
| One night edited shorter | [390px](advice-390.webp) | [1280px](advice-1280.webp) |

Additional width captures: [320px](positive-320.webp), [768px](positive-768.webp).

These are actual local Chromium screenshots using synthetic records. All screenshots keep their original proportions. Research is deliberately unavailable in the browser fixture, so existing fallback guidance is used without claiming successful live retrieval. The main README gallery is unchanged.

## Evaluation

`sevenNightSleepSummary(nights, age, persisted)` is pure and checks exactly the seven existing slots with `validateShieldNight` and the existing `sleepReference(age)`.

- Incomplete/invalid slots or unavailable age: neutral feedback, no inferred failure.
- Complete set: each duration must meet the age-based minimum; an average cannot mask a shorter night. Any Not very rested response prevents congratulations. An explicit interruption flag, if present in a historical record, also prevents it. Free-text notes are not interpreted as structured evidence.
- Seven qualifying saved entries: a restrained, text-only acknowledgment of reported duration. Wind-down adherence and recommended upper ranges do not determine eligibility.
- No new clinical classification, timing-consistency rule or score. Seven slots do not establish consecutive calendar dates or measured sleep quality.
- Teen guidance covers a full 24 hours; the summary notes that nighttime-only records do not include naps.

Age comes only from the current completed assessment. It is not read from saved check-ins, persisted in Sleep Shield, or assumed after refresh. Starting a new assessment clears the summary's age context without changing stored nights. Completing another assessment supplies fresh context through the existing renderer.

The summary is recalculated after successful saves/edits/clear and assessment-context updates. Failed writes retain the previous saved state. No summary state or achievement is independently cached. Storage key, record format, plan snapshots, notes, legacy interpretation and unreadable-data protection are unchanged.

## Reproduce

- `npm run build`
- `npm test`
- `CHROMIUM_PATH=/path/to/chromium node scripts/test-seven-night-summary.mjs`
- `CHROMIUM_PATH=/path/to/chromium node scripts/test-sleep-shield-progress.mjs`
- Existing `test:motion`, `test:routing`, `test:age` and `check:cloudflare` commands.

Omit CHROMIUM_PATH when Playwright's Chromium is installed. New raw captures are written under `artifacts/seven-night-summary/`. The old progress browser assertions that still expected the removed single-Yes/seven-Yes celebration were corrected; all chart, editing, storage and validation assertions are retained.

## Limits for review

Chromium emulation is not physical-device, Safari/Firefox or screen-reader testing. The temporary Linux browser lacks an emoji font, so the unchanged requested celebration emoji may appear as a missing-glyph box in captures. No new animation, sound or confetti was added. No production research request, deployment or merge is part of this task.
