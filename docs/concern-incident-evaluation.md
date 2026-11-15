# Evaluating incident matching and the concern workflow

The example dataset in [concern-incident-cases.json](../tests/Fixtures/concern-incident-cases.json) contains synthetic regression examples. It has not been reviewed by barangay staff and is not evidence of accuracy on real reports.

Run the examples without changing reports or calling an external AI service:

```sh
php artisan concerns:evaluate-incidents
php artisan concerns:evaluate-incidents --json
```

For the capstone evaluation, copy the dataset format and replace the examples with deidentified report pairs that barangay reviewers have labeled as the same incident or different incidents. Include English, Filipino and Taglish, nearby unrelated issues, recurring incidents on different dates, and reports from different categories. Record who reviewed the labels in your research records; the dataset's reviewer flag is a supplied declaration, not an independent verification.

```sh
php artisan concerns:evaluate-incidents path/to/reviewed-cases.json --json
```

The command reports true/false positives, true/false negatives, precision, recall and F1. An undefined score is returned as null. False positives deserve specific review because incorrect duplicate matches can raise report-count severity. Review mismatched case IDs without printing report bodies or identifying residents. Run the command against a separate set of reviewed pairs after tuning the matching windows and vocabulary.

## What the application counts

- Severity uses matched unique reporters under the existing report-count policy. A suggested duplicate still needs staff confirmation before merging.
- Hotspot reports count eligible submissions in the selected date range. Hotspot incidents combine only confirmed merges, including parents outside that date range. Suggested matches remain separate incidents.
- Location labels use existing street/landmark names, normalize common road abbreviations and omit leading house numbers. Coordinates without a usable name are shown as an unnamed location. The analytics do not invent purok boundaries.
- Hotspots exclude pending submissions, rejected reports, spam and private/sensitive cases. These counts can therefore differ from the overall reports-received summary.
- Incident matching uses the recorded incident time where supplied, otherwise the submission time. Default distance and topic windows are in [concerns.php](../config/concerns.php); confirm these operational settings with barangay reviewers.
- Resident clarification replies are private. Staff-requested reanalysis processes those replies locally, preserves the original description and analysis history, and does not overwrite confirmed severity.

## Checking the complete workflow

1. Have a reviewer establish the expected category, severity and incident grouping for each sample before using the system.
2. Submit the samples, including a recurring issue at the same location on a different date. Confirm that proposed matches explain distance, time and shared terms.
3. Request clarification, reply as the original resident, and request local reanalysis as an admin. Confirm that other residents cannot see the exchange and that history remains available.
4. Confirm a merge and compare the hotspot report and incident counts before and after. Check category, concern-type and date filters.
5. Record the review time, staff corrections, missed critical reports and incorrect severity increases. Report these observations separately from automated matching metrics. Do not treat a model's confidence number as measured accuracy.

Queue workers must load the updated job code. The reanalysis panel refreshes while a request is queued and notifies its requesting admin when processing completes or fails.
