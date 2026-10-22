# First-time usability review

Prepared 22 October 2026 against main `8264f82464cb96f9775473c924c3939cc8f45a35`.

## Run with 2–3 people

Recruit people aged 15–100 who have not seen the app. Include at least one phone and one desktop user. Use fictional answers and a fresh browser profile. Do not collect health histories, names, account credentials, or personal device screenshots. Explain that this tests the interface, not the participant.

Task: **Complete a typical five-step check-in without assistance.** Ask the person to say what they expect before pressing a button. Do not explain the markers or saving behavior first. Record any help you provide. Then ask them to find where they would save the check-in and explore an optional tool. Explain how to clear fictional records afterwards.

## Follow-up questions

1. What do you think this website is trying to help you understand?
2. Was it clear how to enter social media time?
3. What did you think the 30-minute and two-hour slider markers meant?
4. Did you understand how to handle using two social media apps at the same time?
5. What was the main message you took from your results?
6. Did you understand whether your check-in was saved automatically?
7. Did any step feel too long, confusing, or unnecessary?
8. Was anything difficult to read or use on your device?

## Observation sheet (copy per participant)

| Observation | Notes |
| --- | --- |
| Anonymous participant ID; device/browser; viewport if known | Not yet tested |
| Task completed, partially completed, or abandoned | |
| Assistance needed and exact prompt given | |
| Hesitation: screen, action, and participant's words | |
| Invalid-entry recovery, if encountered naturally | |
| Interpretation of results and estimates | |
| Back/Next difficulties or lost answers | |
| Saving expectation before clicking; actual outcome understood? | |
| Overlap allocation and marker interpretation | |
| Optional tools understood as optional? | |
| Readability/touch/keyboard difficulties | |
| Completion time, only if actually measured | |

Distinguish observed behavior from an interpretation. Do not generalize two or three observations into population-wide conclusions. Prioritize repeated misunderstandings or inability to complete a task over aesthetic preferences.

## Preliminary developer review, not participant findings

- **Confirmed behavior/copy mismatch:** the report's “Save My Check-In in Progress” action navigates to Progress; it does not save. Proposed wording: “Go to Progress to Save.” Saving remains a separate action.
- **Potential usability issue:** Step 2 says to count overlapping time once, but does not give an allocation example. The proposed assignment-to-one-app wording would clarify allocation while changing the meaning of each platform estimate. Test comprehension before replacing it.
- **Requires real-user validation:** markers are repeated on individual sliders although their written explanation explicitly says combined use, not individual limits or universal health recommendations. Verify what people remember rather than assuming the disclaimer solves confusion.
- **Requires real-user validation:** the long platform list and explanation may feel slow on a phone. Automated completion cannot measure that experience.
- **Personal design preference:** whether the introduction or sources should occupy less space. No change justified by preference alone.
- Report source review confirms explicit self-reported estimates, a simple nonvalidated reflection rule, optional tools, and an unsaved-report notice. These safeguards should stay.

No human participants have been tested. Automated browser regressions and screenshot inspection are separate evidence, not a usability study.
