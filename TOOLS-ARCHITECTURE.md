# Read-only report and optional tools

Home distinguishes first visits, in-memory assessment drafts, completed current reports, saved check-ins and saved Sleep Shield plans. My Tools opens Sleep Shield, Reduction Goal and Progress. Back to My Results appears only when a completed report exists in this session. Reloading never reconstructs a complete report from incomplete historical fields.

`navigation.js` controls visibility and focus/scroll restoration, not calculations. The original report DOM remains mounted while tools are open. Draft assessment edits do not mutate it; submitting a new completed assessment replaces it. Superseded research requests are still cancelled.

## Storage and drafts

- `room.saved-checkins.v1` keeps its schema. Existing IDs are not overwritten. Legacy optional fields and embedded reduction goals remain readable without migration.
- New `social-media-sense.reduction-goals.v1`: `{version:1, goals:[{checkinId, reduction, updatedAt}]}`. An explicit save requires an eligible saved baseline. Targets never change reported usage.
- Unsaved targets live in a session Map keyed by baseline ID. Progress round trips preserve them. New assessments get a new ID and zero target. Reloading loses unsaved drafts. Slider movement never saves a goal.
- Confirmed Clear Saved Check-Ins deletes linked goals too. Goals are removed first: if storage fails, history cannot be removed while goals remain. Partial failures are reported. Externally orphaned goals are explained with an explicit clear option.
- `social-media-sense.sleep-shield.v1` keeps its schema, nights, settings and activities. Check-in deletion never touches it. Night deletion remains a separate confirmed action. Malformed stored JSON is not silently overwritten.
- Data remains local to the browser. Clearing browser data can remove it.

## Sleep Shield

Sleep Shield initializes once without requiring an assessment. With no submitted answers it uses labeled general verified guidance; it does not invent age or bedtime for research. A current assessment updates context without rebuilding controls or changing recorded nights. A saved plan can be resumed without another assessment or storage write. Bedtime is required only for plan activation. Night validation, editing, comparisons and midnight calculations remain unchanged.

## Verification

Run `npm run build` and `npm test`. Browser regression requires an existing Playwright/Chromium installation, not an added app dependency:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/path/to/chromium SCREENSHOT_DIR=/existing/output/folder node scripts/test-results-layout.mjs
```

Coverage includes all six views at 320/390/768/1280px, overflow, report round trips, explicit saves, baseline drafts, legacy records, reloads, independent clearing, seven-night editing/resuming, midnight plans, research success/failure fixtures, low/zero usage, celebration, keyboard focus, emulated touch and reduced motion.

Production live retrieval is not tested by fixtures. Chromium emulation is not physical-device or screen-reader testing. No deployment configuration, server routes, credentials, classification thresholds or slider mappings change.
