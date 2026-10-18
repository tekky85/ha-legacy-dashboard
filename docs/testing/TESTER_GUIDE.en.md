# Community Test-Center – tester guide

The public portal address is
https://tekky85.github.io/ha-legacy-dashboard/testing/.
Project status records the successful deployment evidence. Reading/testing
needs neither a GitHub login nor access to
the project owner's Home Assistant. The portal runs independently of your
installed App. Use a modern browser for the portal; test iOS 9 on the real iPad.

## Prepare and start

For Sprint 27.4, read the [pilot plan](PILOT_PLAN.de.md): eleven existing Test IDs,
safe prerequisites and duration categories. The coordinator confirms the
candidate; publication does not prove your installed version. Enable “Pilot
27.4: 11 ausgewählte bestehende Tests”; full canonical instructions remain authoritative.
Choose “Echte manuelle Beobachtungen” for real tests. Mark reporting-only
exercises “Synthetischer Übungslauf”, especially an intentional FAIL.
Practice reports are not real acceptance evidence.

1. Back up App data and prepare a separate test dashboard and safe test devices.
   Do not use dangerous devices or production safety/security processes for
   deliberate error/outage tests.
2. Read the installed **HA Legacy Dashboard App version** on its information
   page in Home Assistant. Do not confuse it with HA Core or an offered update.
   For Standalone, identify the installed release. If the App cannot start,
   the independent portal remains available to record that failure.
3. Enter an alias, actual Dashboard version, deployment, test device, OS and
   browser. Enter HA Core version and architecture only when known; no
   detection is claimed. Add optional run notes and start the run.
4. “HA App relevant” is selected initially. Filter by Sprint, category, device,
   result or ID/title. Always read full prerequisites; filtering does not turn
   an iPad test into a desktop test. Only the coordinator performs authorized
   release/Stable operations; the portal never performs those actions.
5. Open a test and follow its original steps on your own system. The full
   canonical instructions remain in German to preserve meaning. Deliberately
   replace technical placeholders with safe test-system values.

## Record and resume

- PASS: actually observed expected behavior; notes are optional.
- FAIL: expected behavior, actual observation and exact reproduction required.
  Example: “increase target with Plus” / “both buttons disabled with power on
  and off” / “open Compact Climate, power on, tap Plus, power off, tap again”.
  This records an observation, not an inferred root cause.
- BLOCKED: explain the missing device/prerequisite or known product repair.
  Keep already passed subchecks in notes. Do not label unexecuted later steps FAIL.
- N/A: explain why this test does not apply to this run. N/A is not PASS.
- NOT_TESTED: not executed; no positive result is inferred.

Save each result. Catalog BLOCKED/NOT READY is shown separately from your
observation. Catalog-blocked tests cannot be recorded PASS. Optional evidence
references are redacted filenames/notes, not embedded binary data. Record the
eventual GitHub Issue number when available.

Drafts exist only in this browser/profile. Select a saved run and resume it.
Preparing a new run preserves earlier saved runs. Start a new run for another
software version. If storage is full, disabled or private, a warning appears:
export JSON before closing the page. Unsaved form entries are not saved drafts.
Clearing all local runs requires confirmation; first export every needed run.

## Export, import and submit

1. Export the validated UTF-8 JSON report. Keep the downloaded file as your
   backup; there is no central portal database.
2. Import JSON (up to 2 MiB), inspect the preview and confirm. Catalog mismatch
   is visible and imports read-only. A different report with the same run ID
   cannot overwrite the stored report: retain both files for coordinator review.
3. Review privacy before public sharing: redact tokens, passwords, `.env`,
   keys, private entity/person names, addresses, photos, media, locations and
   logs. Share only sanitized reproduction publicly when evidence is sensitive;
   agree a private channel with the coordinator beforehand.
4. Confirm the privacy checklist, create/copy the summary and open the GitHub
   run form. Creating the public Issue requires a GitHub account. The portal
   does not create Issues automatically. Send one report per run, not per PASS.
5. Paste the summary and attach JSON. GitHub now documents `.json` for comments;
   if the form rejects it, use `.zip`/`.txt` or paste sanitized JSON in a fenced
   code block. Never put an entire report into a URL.
6. Link individual defects through the existing bug form with Test ID, version,
   run ID/Issue, reproduction, expected and actual behavior. Save the resulting
   Issue number on the run/result and export again.
7. Without a GitHub account, give the JSON to your coordinator through an agreed
   channel. Reading, testing and exporting remain available without login.

Use screenshots/photos from the real product or controlled demo only. Inspect
private details before sharing; generated product mockups are not evidence.
An empty/incomplete run is neither acceptance nor “100% passed”.

## If a service is unavailable

If the App fails, do not invent downstream observations: record a reproduced
startup failure as FAIL and leave dependent tests BLOCKED with reasons. If
Pages is unavailable, retain existing JSON backups, note the time/error and
contact the coordinator through the agreed channel. Without a loaded portal
there is no guaranteed offline app. If GitHub fails, local export remains
available: save JSON privately and hand it over later. No additional account,
password or token is required for this fallback.

New exports contain Test-Center version, catalog identity and export time.
Older 1.0 reports without the additive metadata remain importable: review
warnings and retain the original file. Neither a local draft nor a file is a
shared server backup. Receipt and real outcomes go in [pilot status](PILOT_STATUS.md);
all real slots start NOT TESTED.
