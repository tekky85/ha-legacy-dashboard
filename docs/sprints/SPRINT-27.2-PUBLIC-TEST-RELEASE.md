# Sprint 27.2 – Public Test Release

## Ziel

Einen klar gekennzeichneten, installierbaren **Public Test Release / Release Candidate**
erzeugen, damit der aktuelle reparierte Stand:

- auf GitHub eindeutig versioniert und referenzierbar ist,
- als Home Assistant App installiert bzw. aktualisiert werden kann,
- auf dem Standalone/LXC betrieben werden kann,
- über GHCR für die unterstützten Architekturen verfügbar ist,
- von weiteren Testern verwendet werden kann,
- und Fehler reproduzierbar gegen einen festen Versionsstand als GitHub Issue gemeldet werden können.

Dieser Sprint ist ausdrücklich **kein Final Release**.

Der Release muss als **Pre-Release / Release Candidate / Public Test Release**
gekennzeichnet werden.

---

# Codex-Ausführungsanweisung

```text
Execute Sprint 27.2 – Public Test Release.

Goal:

Publish one reproducible intermediate Release Candidate from the CURRENT
repository state so the same version can be tested on:

- GitHub
- GHCR
- Home Assistant App
- Standalone/LXC

This is a PUBLIC TEST RELEASE, not the final production release.

Do NOT mark it as final/stable/latest unless the existing release policy
explicitly requires a non-stable compatibility tag.

Do NOT continue with another Repair Queue batch in this run.

READ FIRST

Read:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/REPAIR_QUEUE_CONSOLIDATION.md
- docs/audits/MANUAL_TEST_QUEUE.md
- current Sprint 27.1 repair/re-audit documentation
- repository release/build documentation
- Home Assistant App packaging files
- Docker/GHCR workflow files
- package.json
- app/config.yaml
- repository.yaml
- changelog/release-note files
- README.de.md
- README.en.md

Inspect the CURRENT repository state before making any change.

Do not assume a version number from this prompt.

Determine the current version and existing release/tag convention from the
repository and Git history.

PRE-FLIGHT

Before changing files:

1. Show current branch.
2. Show current commit.
3. Show git status.
4. Confirm working tree is clean.
5. Identify:
   - current package/application version
   - current Home Assistant App version
   - latest Git tag
   - existing RC/pre-release naming convention
   - GHCR image name
   - supported architectures
   - release workflow/build entry point
   - current Standalone release artifact convention
6. Read current Repair Queue status.
7. Count remaining:
   - P0
   - P1
   - P2
   - P3
8. Determine whether any OPEN P0 item prevents publication.

PUBLIC TEST RELEASE GATE

The intermediate release may proceed only if:

- working tree starts clean
- no unresolved P0 security/data-integrity blocker makes public testing unsafe
- current Sprint 27.1 repairs already intended for this test build are committed
- relevant automated regression tests pass
- Home Assistant App packaging is syntactically valid
- release metadata can be made version-consistent
- no known credential/secret is included in release artifacts
- release is clearly marked as pre-release/test release

Open P1/P2/manual validation items may remain.

If an unresolved P0 makes publication unsafe:

STOP.

Do not create/push a release.

Report the blocker.

VERSION SELECTION

Determine the next appropriate pre-release version from the repository's
existing version convention.

Examples only:

1.2.0-rc.1
1.2.0-rc.2
1.2.0-rc.3

Do NOT blindly use one of these examples.

Rules:

- do not reuse an existing tag
- do not overwrite an existing RC
- do not jump to a new stable/final version without reason
- maintain semantic ordering
- use the same logical release version across all relevant release metadata

Before writing changes, report:

Current version:
Proposed Public Test Release version:
Proposed Git tag:

VERSION CONSISTENCY

Update all CURRENT release-version locations required by the repository.

Inspect and update where applicable:

- package.json
- package-lock.json
- app/config.yaml
- release metadata
- changelog
- version module/file
- Admin/version display source if version-backed
- Standalone artifact naming
- Docker image tag references
- documentation that explicitly states the current release version

Do not replace historical release references.

After the change, run a repository-wide check for conflicting active version strings.

RELEASE NOTES

Create release notes for this Public Test Release.

Use the repository's existing changelog/release-note convention.

The notes must clearly state:

- this is a Public Test Release / Release Candidate
- not yet final/stable
- intended for community testing
- which major repair batches are included
- remaining known limitations/open repair areas
- manual validation still pending
- testers should report reproducible defects through GitHub Issues

Do not claim a manual test has passed unless documented evidence exists.

Recommended test areas:

- Home Assistant App installation
- Home Assistant App update
- Standalone/LXC
- default dashboard
- custom dashboards
- Summary Dashboard
- Error Dashboard
- Light/Dark theme
- HomeScreen navigation
- background images
- sections
- Room Cards
- Room Card collapse/expand
- Room Card backgrounds
- Light controls
- Climate controls
- target temperature while Climate is off
- Focus mode
- responsive card layouts
- iPad mini 1 / iOS 9.3.5
- Guided Access / kiosk use

GITHUB ISSUE REPORTING INFORMATION

Ensure testers have a clear issue-reporting template or release-note section.

At minimum request:

- HA Legacy Dashboard version
- installation/deployment type:
  - Home Assistant App
  - Standalone/LXC
- Home Assistant version
- browser/device
- iOS/browser version where applicable
- dashboard/card affected
- expected behavior
- actual behavior
- reproduction steps
- screenshots
- relevant sanitized logs

If an Issue Template already exists:

- reuse/update it rather than creating a duplicate competing template.

Do not request users to publish:

- HA access token
- SUPERVISOR_TOKEN
- Admin token
- secrets
- unredacted sensitive logs

SECURITY / RELEASE ARTIFACT CHECK

Before building/publishing inspect for accidental inclusion of:

- .env
- production HA token
- SUPERVISOR_TOKEN
- Admin token
- runtime logs
- uploaded user backgrounds/data
- persistent DATA_DIR contents
- local test credentials
- SSH keys
- local machine paths
- temporary test artifacts

Verify:

- .gitignore
- .dockerignore
- Standalone release include/exclude rules
- build context

The frontend must still never receive:

- HA token
- SUPERVISOR_TOKEN

Do not weaken any existing security boundary for test convenience.

LEGACY COMPATIBILITY GATE

Before release, run the repository's existing legacy/browser compatibility
checks where available.

At minimum verify current production frontend still does not require:

- fetch
- Promise
- arrow functions
- let
- const
- async/await
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox gap as a required layout primitive
- ResizeObserver
- Container Queries

Do not introduce modern syntax through release/version changes.

AUTOMATED TEST GATE

Run:

- targeted tests for recently repaired Sprint 27.1 areas
- full bounded automated regression suite if practical
- packaging/config validation
- release/version consistency checks
- security-sensitive regression tests
- Standalone build/startup tests where locally possible
- Home Assistant App mock/startup tests where locally possible

Do NOT use:

- production .env
- real HA credentials
- real SUPERVISOR_TOKEN
- production Home Assistant

Do not claim real HAOS/iPad runtime validation from mocks.

Record exact commands and results.

HOME ASSISTANT APP PACKAGE

Validate the Home Assistant App packaging.

Verify:

- app/config.yaml valid
- version matches Public Test Release version
- supported architectures remain correct
- ports remain correct
- web UI remains correct
- direct LAN access remains possible
- homeassistant_api permissions remain minimal
- SUPERVISOR_TOKEN remains backend-only
- /data remains persistent
- no unnecessary /config mount
- no unnecessary privileged/host access

Do not alter permission boundaries unless required for a known repair.

GHCR BUILD / MULTI-ARCH

Use the repository's existing release/build source of truth.

Build/publish the image for all supported architectures defined by the project,
expected where current project policy requires:

- amd64
- aarch64

Use the current GHCR repository/image name.

Create the version-specific tag for the Public Test Release.

Do NOT overwrite a stable/final release tag.

Do NOT automatically move a stable `latest` tag to this RC unless the repository
explicitly defines a separate RC-compatible latest policy.

Where supported by current release workflow, publish a multi-architecture manifest.

After publication verify:

- version tag exists
- expected architectures are present
- image metadata/version is coherent

Record the final immutable image reference/digest where available.

STANDALONE RELEASE ARTIFACT

Build the Standalone/LXC artifact according to the repository's existing
release convention.

Verify the archive does NOT include:

- .env
- credentials
- logs
- DATA_DIR/user data
- local test files
- development-only artifacts

Generate SHA256 according to existing Sprint 25 release requirements.

Verify the checksum against the generated final artifact.

Record:

- artifact filename
- size
- SHA256

COMMIT RELEASE PREPARATION

Before commit:

git status
git diff --check
git diff

Stage only Public Test Release preparation changes.

Commit message:

git commit -m "chore(release): prepare public test release <VERSION>"

Replace <VERSION> with the actual selected version.

Push:

git push

If upstream is not configured:

git push -u origin <current-branch>

Do not force-push.

Record commit hash.

GIT TAG

After the release-preparation commit is pushed and all release gates still pass:

Create the release tag according to repository convention.

Preferred only if consistent with the repository:

git tag -a <TAG> -m "HA Legacy Dashboard <VERSION> public test release"

Push only that tag:

git push origin <TAG>

Do not force-update any existing tag.

Verify the pushed tag points to the intended release commit.

GITHUB PRE-RELEASE

Create a GitHub Release from the pushed tag.

Requirements:

- mark as Pre-release / Release Candidate
- do NOT mark as final stable release
- release title clearly identifies Public Test Release / RC
- include release notes
- attach Standalone artifact where project convention expects it
- attach SHA256 file where appropriate
- reference GHCR image/tag
- include testing focus
- include known limitations
- include GitHub Issue reporting instructions

If GitHub CLI is already available/authenticated and project policy permits it,
it may be used.

Otherwise use the repository's existing release workflow/process.

Do not expose credentials in command output.

HOME ASSISTANT APP UPDATE AVAILABILITY

Verify the repository state necessary for Home Assistant users to:

- add/use the repository
- see the new App version
- install the App
- update an existing App installation

Ensure the App version points to/pulls the intended Public Test Release image
according to current repository architecture.

If live HAOS validation requires a real system, add/update the exact test in:

docs/audits/MANUAL_TEST_QUEUE.md

Keep Result = NOT TESTED until actually executed.

LXC / STANDALONE DEPLOYMENT TARGET

The Public Test Release must be reproducibly deployable to the existing
Standalone/LXC environment.

Do NOT directly modify the user's production LXC unless the current Codex
environment has explicit authorization and access.

Instead:

1. document the exact immutable release target:
   - Git tag
   - commit hash
   - artifact/image version
2. provide the exact repository-based update procedure for the LXC
3. ensure rollback to the previous tag/commit is documented

Use the existing deployment convention from repository documentation.

Do not invent service names or paths if current repo/docs provide them.

LXC UPDATE PROCEDURE

Create/update documentation for a safe LXC release switch.

Conceptual flow:

cd <repository-path>
git fetch --tags
git checkout <PUBLIC-TEST-TAG>
<install/update dependencies if required>
<restart existing service>
<verify service>
<verify /health>
<verify dashboard>

Use actual repository/systemd conventions from current docs.

Include rollback:

git checkout <PREVIOUS-KNOWN-GOOD-TAG-OR-COMMIT>
<restore dependencies if required>
<restart service>
<verify health>

Do not hardcode guessed commands if repository docs define different steps.

SMOKE TEST PLAN

After publication define a short smoke-test sequence for both deployment modes.

HOME ASSISTANT APP:

1. App repository recognizes new version.
2. Existing installation shows Update or fresh install shows current RC.
3. Install/update completes.
4. App starts.
5. Logs contain no startup error/secrets.
6. /health responds.
7. /admin opens.
8. default dashboard loads.
9. custom dashboard loads.
10. HA states load.
11. representative Light control works.
12. representative Climate control works.
13. Summary opens.
14. Errors opens.
15. background image loads.

STANDALONE/LXC:

1. checkout exact release tag.
2. service starts/restarts.
3. /health responds.
4. /admin opens.
5. default dashboard loads.
6. custom dashboard loads.
7. HA states load.
8. representative control works.
9. system dashboards load.
10. logs contain no new errors/secrets.

IPAD:

Do NOT execute physical iPad tests in this Codex run unless explicitly authorized.

Ensure relevant tests remain in MANUAL_TEST_QUEUE.md.

ROLLBACK

Document rollback for both deployment modes.

Standalone/LXC:

- previous known-good tag/commit
- checkout/redeploy
- restart service
- verify health

Home Assistant App:

Document the rollback strategy supported by the current project/repository
release architecture.

Do not claim HA App UI supports arbitrary downgrade if that has not been validated.

At minimum retain:

- previous image tag
- previous Git tag
- previous App version metadata
- instructions for repository-level rollback/rebuild if needed

PROJECT / AUDIT STATUS

Update docs/PROJECT_STATUS.md.

Record:

Sprint 27.2 Public Test Release:
- version
- tag
- release commit
- GitHub Pre-release status
- GHCR status
- Standalone artifact status
- HA App package status
- manual smoke tests pending/completed
- iPad manual tests pending

Do NOT mark:

- final RC gate passed
- all manual acceptance complete
- final release ready

unless actually true.

Update docs/audits/AUDIT_INDEX.md only if the project convention tracks this release phase there.

Do not modify unrelated Repair Queue statuses.

PUBLIC TEST RELEASE NOTES – TESTER MESSAGE

Prepare a concise tester-facing section equivalent to:

This version is a public test release.

Please report reproducible defects through GitHub Issues and include:

- version
- deployment mode
- Home Assistant version
- device/browser
- steps to reproduce
- expected result
- actual result
- screenshots
- sanitized logs

Never include passwords, tokens or secrets in an issue.

Do not call this version stable/final.

FINAL CONSISTENCY CHECK

Before considering Sprint 27.2 complete verify:

- release commit pushed
- tag pushed
- tag points to correct commit
- GitHub release exists
- GitHub release marked pre-release
- version metadata consistent
- GHCR version tag available
- expected architectures available
- Standalone artifact created if required
- SHA256 created and verified if required
- HA App metadata references intended release
- no production secrets included
- manual tests remain honestly represented
- rollback instructions exist
- working tree clean

FINAL REPORT

At the end report:

1. starting commit
2. branch
3. previous version
4. selected Public Test Release version
5. Git tag
6. release preparation files changed
7. automated tests run
8. test results
9. legacy compatibility gate result
10. security/release-artifact gate result
11. Home Assistant App packaging result
12. GHCR image name
13. GHCR version tag
14. architectures published
15. image digest/manifest evidence where available
16. Standalone artifact filename
17. Standalone artifact SHA256
18. release preparation commit hash
19. commit push result
20. tag push result
21. GitHub Pre-release result
22. release URL/reference if available
23. HA App update/install readiness
24. LXC exact deployment target
25. LXC update instructions location
26. rollback instructions location
27. manual HAOS smoke tests still pending
28. manual LXC smoke tests still pending
29. manual iPad tests still pending
30. open P0 count
31. open P1 count
32. known limitations included in release notes
33. Issue-reporting guidance included
34. working tree clean: YES/NO
35. Sprint 27.2 result:
    COMPLETE / PARTIAL / BLOCKED
36. whether Sprint 27.1 repairs may continue after this release
37. recommended next repair batch from current REPAIR_QUEUE.md

Do NOT start the next repair batch automatically.
```

---

# Git-Ablauf

Die tatsächliche Version wird von Codex aus dem aktuellen Repositoryzustand
ermittelt.

## Release-Vorbereitung

```bash
git status
git diff --check
git diff

git add <nur Release-/Versions-/Dokumentationsdateien>
git commit -m "chore(release): prepare public test release <VERSION>"
git push
```

Falls kein Upstream gesetzt ist:

```bash
git push -u origin <current-branch>
```

## Tag

```bash
git tag -a <TAG> -m "HA Legacy Dashboard <VERSION> public test release"
git push origin <TAG>
```

Kein bestehendes Tag überschreiben und kein Force-Push.

---

# Zielzustand

Nach erfolgreichem Sprint 27.2:

```text
aktueller reparierter Repository-Stand
        |
        +-- Git Commit
        +-- Git Tag / Public Test Release
        +-- GitHub Pre-Release
        +-- GHCR amd64
        +-- GHCR aarch64
        +-- HA App installierbar/aktualisierbar
        +-- Standalone/LXC reproduzierbar deploybar
                |
                v
        öffentliche Testphase
                |
                +-- bestehende RQ-Findings
                +-- neue GitHub Issues
```

Danach können die nächsten Sprint-27.1-Repair-Batches weiterlaufen. Der Public
Test Release bleibt als fester Referenzstand für externe Tests erhalten.
