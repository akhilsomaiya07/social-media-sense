# Why Sleep Tracker is separate from the check-in

I wanted the finished report to stay a record of someone's answers. That's why I kept Sleep Tracker as an optional tool in My Tools, instead of adding another assessment step.

Sleep Tracker is an optional dedicated tool opened from My Tools, not an assessment step. It does not alter a completed report. Step 3 retains duration, age-related context and pre-bed social-media questions; clock time is required only to activate a plan.

Existing wind-down choices, midnight calculations, replacement/custom activities, one-night forms, notes, saved-night editing, comparisons and confirmed clearing remain. Saved plans can be resumed without a new assessment. Research and projections remain collapsed disclosures.

Version-1 Sleep Tracker storage is retained, including settings, activities, bedtime and nights. Older assessment bedtimes remain supported. Missing bedtime is never invented. Clearing check-ins and goals does not touch Sleep Tracker records.

See [TOOLS-ARCHITECTURE.md](TOOLS-ARCHITECTURE.md) for storage details, regression commands and limitations. Production retrieval is not claimed by controlled browser fixtures.

## Seven-night feedback

The tool now includes a compact **Seven-Night Sleep Summary** based on up to seven user-entered night records. Its congratulatory or practical text is conditional on those entries and is not a health diagnosis. The seven slots do not verify consecutive calendar nights. Preserve the existing internal `sleep-shield` storage key and implementation filenames for backward compatibility; renaming the visible feature does not require a data migration.
