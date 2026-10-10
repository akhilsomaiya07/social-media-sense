# Sleep Shield update

Added automatically for every assessment, with two required Step 3 questions and no extra assessment step. Includes editable cutoff, protected-time projections, one wind-down activity, phone placement suggestions, seven saved nights, and personal comparisons. Existing celebration, health-card presentation, goals, and creator credit remain.

Validation completed:
- Build and existing health tests pass.
- New calculation tests cover midnight, 15/30/45/60-minute windows, invalid values, 24-hour bounds, averages, and age-scoped request sanitization.
- Headless browser completed Steps 1–5, loading, dedicated results, balanced and disrupted paths, local saving/reloading, restart, existing goals and celebration.
- Browser widths 320, 390, and 1280 pixels checked for horizontal overflow. Phone and desktop screenshots inspected.
- Research failure and mocked success both tested. Actual production AI Gateway retrieval remains to be verified after redeployment; no live successful retrieval is claimed.

Run `npm ci`, `npm run build`, and `npm test`. Deploy the whole project with its Netlify Function using the existing deployment instructions.

## Compact presentation update

The initial card now shows a short summary, one suggestion, bedtime timeline, replacement-activity selector, and Track My Sleep Tonight. Research, wind-down adjustment, completed nights, full comparisons, and time projections live in collapsed disclosures. Phone placement is a conditional one-line suggestion using an existing saved answer.

The tracker renders one unfinished night on demand. Saving closes it and updates progress; returning resumes the first unfinished night. Completed nights can be edited from the progress disclosure. Existing notes, activities, settings, and saved nights remain compatible.

Browser checks passed at 320, 390, and 1280 pixels, including save, edit, resume, invalid sleep hours, persistent activity choice, and research fallback. Calculation helpers and live research request code are unchanged.
