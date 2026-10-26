# Testing together – no developer knowledge needed

Open the [Test-Center](https://tekky85.github.io/ha-legacy-dashboard/testing/).
The [German browser help with a worked example](https://tekky85.github.io/ha-legacy-dashboard/testing/help.html)
explains the whole process. No Git, Codex or GitHub account is needed to test.
Use a current browser for the Test-Center and try your own dashboard on the
device required by the selected test. The portal interface and twelve detailed
community explanations are German; this guide explains their meaning in English.

## Before your first test

1. Agree on the installed App version, required device and tests with your
   contact. Read the installed dashboard version on the App information page
   in Home Assistant or at the bottom of dashboard administration. Do not enter
   the offered update or Home Assistant version instead. Ask rather than guess.
2. Use harmless devices and a separate prepared dashboard. A visible light or
   thermostat is not automatically authorized for control: your contact sets
   that permission explicitly. Deliberate failures, artificial states and
   backups need technical assistance in a safe test environment, never your
   everyday system.
3. Enter a nickname, actual App version, installation type, test device,
   operating system and browser. No real name is needed. Other versions and
   host architecture are optional if known. Begin the report to save.
4. The default selection shows twelve explained checks: the eleven existing
   pilot tests plus MT-01. All other technical tests remain available through
   the all-tests filter with assistance. There are still 72 unchanged test
   IDs, not new partial tests.
5. Read the preparation/help paragraph, then follow the numbered steps in
   your own dashboard. A Mac cannot replace a specified iPad. You need not
   perform every test. The pilot filter selects only the eleven agreed tests.

## Which result should I choose?

- **Hat wie erwartet funktioniert** (worked as expected): All required steps
  and outcomes checked, including technical checks by your contact. Tick the
  confirmation and justify conditional steps that were not applicable. Partial
  success is not a fully successful test.
- **Etwas stimmt nicht** (something is wrong): You observed a problem. Explain
  what should happen, what actually happened and your sequence of actions.
  You need not diagnose the cause. List unexecuted later steps in the notes.
- **Ich komme nicht weiter** (cannot continue): A device, test card, preparation
  or understandable instruction is missing. Give test number, step and obstacle.
- **Passt nicht zu meinem System** (not applicable): Agreed as outside the
  scope of this system/run. Explain why. Missing preparation is an obstacle.
- **Noch nicht ausprobiert** (not tried yet): Not performed, never counted as passed.

Example for MT-01, step 3 (an example, not a new observation):

- Expected: “One tap on Plus increases the target by one temperature step.”
- Actual: “Plus and Minus stay grey, whether the thermostat is on or off.”
- Actions: “Started from the iPad icon, found the heating card, tried Minus
  and Plus while the thermostat was on and off.”
- Notes: “Steps 4–7 not executed afterwards. Rapid tapping also zooms the page.”

Choose something-is-wrong for that observation, not cannot-continue: you saw
a product defect. If the prepared test card is simply absent, it is an obstacle.
Save the result explicitly; unsaved form input is not part of the report.

## Resume, back up and submit

1. Results stay only in this browser/profile. Download the report regularly.
   The .json file is your backup, not an upload; you need not open or edit it.
2. Expand the existing-report section to resume a saved report or load a file.
   Review and confirm its preview. Different test definitions are imported
   read-only; conflicting files with the same report ID never overwrite one
   another. Keep originals.
3. Start a new report for a different App version; existing reports remain.
   Label invented practice results as an exercise under optional settings:
   these are not genuine manual observations.
4. Review reports and images for private names, addresses, photos, credentials
   and unreviewed logs. No passwords, keys or .env files. Sensitive evidence
   needs an agreed private channel. Image references do not upload images;
   attach sanitized pictures separately.
5. Confirm privacy review, copy the summary and open the GitHub report form.
   Paste the summary and attach the reviewed file. If .json is rejected,
   attach .txt/.zip or paste sanitized content as a code block. One report
   may contain many tests; do not create an Issue for each success.
6. Without a GitHub account, or during an outage, send the file through the
   agreed channel to your contact. Nothing is transmitted automatically.

If storage is blocked/full, download immediately before closing the page.
Delete old reports only deliberately after backing up. Report an App startup
failure as observed; do not invent dependent tests. During a Test-Center outage,
keep existing files, record time/error and contact your coordinator. Offline
availability is not guaranteed.

Original technical requirements remain expandable and the page has a glossary.
File format, internal IDs and existing reports remain compatible; untested
results never count as passes. The [pilot plan](PILOT_PLAN.de.md) and
[pilot status](PILOT_STATUS.md) record preparation and actual receipt. This wording
revision does not prove real iPad/HAOS validation or community comprehension.
