# Sleep Shield visual progress review

Real Chromium captures of the local app with synthetic records and isolated browser storage. No production user data. The main README gallery is unchanged.

| State | Mobile | Desktop |
| --- | --- | --- |
| Before, three mixed records | [390px](before-390.webp) | [1280px](before-1280.webp) |
| After, Yes / Partly / No with zero and 24h sleep | [390px](mixed-390.webp) | [1280px](mixed-1280.webp) |
| After, all seven Yes with different plan windows | [390px](seven-390.webp) | [1280px](seven-1280.webp) |

Additional responsive captures: [320px](mixed-320.webp), [768px](mixed-768.webp).

## Behavior and storage

The storage key remains `social-media-sense.sleep-shield.v1`. New entries add optional `adherenceQuestion: "wind-down-v1"`; edited entries keep their original question meaning, recorded date, notes and plan snapshot, with an optional updatedAt timestamp. Legacy entries keep their broader plan-following interpretation, explicitly labeled in progress and any seven-Yes acknowledgment. No date streak is inferred.

Raw invalid slots are retained on unrelated writes but excluded from statistics and displayed as unrecorded; a notice explains this. Explicit replacement or clearing is required to remove them. Unreadable storage is never overwritten. On a failed night save, the previous records and charts remain intact, the entered form stays open, and an error explains that nothing was saved. No new achievement or congratulatory message is awarded for that failed save.

Charts use seven valid saved slots and the existing sleep-minute values. Zero is shown as 0m; missing is Not recorded. Duration bars scale to the largest valid value (up to the existing 1440-minute limit). Text values and status names accompany every visual.

The seven-Yes acknowledgment requires seven complete, persisted Yes records. Editing one to Partly/No or successfully clearing records removes it. Prior plan snapshots are not rewritten when the current plan changes. Feedback about next time uses current supported settings, so a 15-minute plan is never advised to use an unsupported shorter window.

Celebrations are text-only: no confetti, sound, timers or animation. They remain readable with reduced motion and do not replay on tool visits. The original app's separate balanced-use celebration is unchanged.

## Reproduce

- `npm run build`
- `npm test`
- `CHROMIUM_PATH=/path/to/chromium node scripts/test-sleep-shield-progress.mjs`
- Existing `test:motion`, `test:routing`, `test:age`, `check:cloudflare` and `screenshots` commands remain available.

The new browser test writes raw captures under `artifacts/shield-progress/`. Use Playwright's installed Chromium by omitting CHROMIUM_PATH. The documentation images are encoded as WebP without changing proportions.

## Review limitations

Chromium emulation is not physical-device or screen-reader testing. The temporary Linux browser lacks an emoji font, so existing/new celebration emoji can appear as missing-glyph boxes in captures. No app emoji text was removed. Research is unchanged; these standalone-tool screenshots show existing general fallback guidance, not successful live research retrieval. No production deployment was performed.

## Completed validation

Build, unit suite, motion suite, routing suite, age suite, Cloudflare dry-run and standard screenshot capture all passed. The standard capture workflow produced 25 screenshots without changing the repository's main gallery. New browser tests passed at 320, 390, 768 and 1280px, plus legacy/invalid/unreadable/unavailable-storage fixtures. Before captures use the main-branch Sleep Shield and CSS; after captures use the implementation in this PR.

The first new browser test run was interrupted after finding a test-navigation issue on reload. The test was corrected to use the application's existing direct tool route; the complete reruns passed. The first mobile screenshot review found narrow four-column tiles; the final two-column mobile arrangement was captured and retested.
