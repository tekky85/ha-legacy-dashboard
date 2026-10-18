# Sprint 27.3 - Community Test-Center & Test Result Management

## Purpose

Implement a **public, independently accessible manual testing portal** for HA Legacy Dashboard. Multiple external testers run the product as a **Home Assistant App on their own Home Assistant installations**, follow the existing manual test cases, document outcomes consistently, and submit reusable machine-readable evidence for later aggregation, defect triage and RC decisions.

The portal must remain accessible even when a tester's Home Assistant App does not start.

**Primary delivery:** Static GitHub Pages test portal, versioned test catalog, locally retained progress, JSON import/export, GitHub Issue reporting, offline/CLI results validation and aggregation, instructions for test coordinators.

**Not part of this sprint:** Changes to production HA behavior, new HA endpoints, auto-collection of HA data, a central database, third-party SaaS, or public disclosure of private test data.

---

## Codex instruction - execute Sprint 27.3

```text
Execute Sprint 27.3 - Community Test-Center & Test Result Management.

Implement the deliverables in the existing tekky85/ha-legacy-dashboard repository.
Follow AGENTS.md and existing project conventions. Include automated tests,
documentation, and commit/push after the implementation acceptance gate.

Do not publish a Home Assistant App release or change the currently published
Public Test Release tag. Do not start further Sprint 27.1 repair batches.

READ BEFORE EDITING

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/MANUAL_TEST_QUEUE.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/REPAIR_QUEUE_CONSOLIDATION.md, if present
- docs/RC_AUDIT_SUMMARY.md or its current equivalent, if present
- README.md, README.de.md, README.en.md
- existing GitHub Pages workflows / docs publishing configuration
- existing .github/ISSUE_TEMPLATE files and issue-config conventions
- existing tooling, package.json scripts, tests and release workflows

First inspect current repository contents. Resolve actual paths and format;
never assume the manual queue is perfectly regular or already machine-readable.

PRE-FLIGHT REPORT

Show current branch, HEAD commit and git status. Determine:

1. Number of unique manual test IDs and how they are organized.
2. Which entries have exact steps, expected results and failure criteria.
3. Which entries are incomplete/ambiguous/duplicated.
4. Whether the queue identifies HA App, iPad, LXC or other execution targets.
5. Whether GitHub Pages is already configured and whether an existing site
   must be preserved.
6. Existing GitHub Issue forms, labels and workflow conventions.
7. Candidate files to create/change, and any permissions/settings requiring
   a repository maintainer rather than Codex.

If the working tree contains unrelated changes, preserve them; do not stage
or overwrite them. Stop only if this makes safe execution impossible.

============================================================
1. ARCHITECTURE AND DEPLOYMENT
============================================================

Use a static portal under the same repository, conceptually:

  https://tekky85.github.io/ha-legacy-dashboard/testing/

Treat the URL as expected, not proven. Obtain the actual Pages base path from
repository setup; support both project-site subpaths and root deployment.

Recommended layout (adapt to existing structure):

  testing/
    index.html
    css/
    js/
    data/test-catalog.json       (GENERATED, not hand-maintained)
  scripts/testing/
    build-test-catalog.*
    validate-test-report.*
    aggregate-test-reports.*
  schemas/
    test-catalog.schema.json
    test-report.schema.json
  tests/testing/
    ...
  docs/testing/
    TESTER_GUIDE.de.md
    TESTER_GUIDE.en.md
    TEST_COORDINATOR.md
    DATA_FORMAT.md
    PRIVACY_AND_SECURITY.md
  .github/ISSUE_TEMPLATE/
    ...
  .github/workflows/
    ... (only if necessary)

Use repository conventions; do not duplicate existing deployment workflows.
The test portal must be a standalone static site that does not rely on a
running Home Assistant or HA Legacy Dashboard instance.

A static GitHub Pages site has no private server-side storage. Do NOT pretend
that submitting a result to the portal stores it centrally or creates an
Issue automatically. Central submission requires a separate deliberate action
through GitHub or an alternative coordinator handoff.

The test portal may use modern browser APIs if appropriate because testers
typically access it through modern browsers; however the production HA Legacy
Dashboard must remain compatible with iPad mini 1 / iOS 9 / ES5. Do not bundle
modern portal runtime code into the production legacy UI. Keep dependency
footprint modest and avoid unnecessary external CDNs.

============================================================
2. CANONICAL TEST SOURCE AND CATALOG GENERATION
============================================================

The existing docs/audits/MANUAL_TEST_QUEUE.md is the SINGLE authoritative
source for test definitions. Do not create a second independently maintained
master test list.

Implement a deterministic build step that generates a versioned JSON catalog
from this Markdown source. Preserve:

- Test ID (stable and unique, never regenerated from display order)
- original Sprint ID / linked requirement
- category, device/system, deployment target
- title/description
- prerequisites and preparation
- exact route/page and required HA entity/capability where documented
- step-by-step actions, retaining original order
- expected visual and functional results
- failure criteria
- evidence to capture
- references to relevant repair items, if present
- blocked/unblocked status derived from source
- any existing warnings or limitations

Never invent missing source requirements or synthetic test steps. For
incomplete source entries:

- emit a clear catalog-build diagnostic with source location / Test ID
- preserve the original text in a safe read-only diagnostic when useful
- flag the test as NOT READY rather than silently making it actionable
- do not report catalog generation as a clean PASS if required fields lack
  reliable source content

Define a maintainable parser/format contract based on the actual Markdown
structure. Include tests using representative real entries. Prevent duplicate
IDs, accidental truncation and silent dropping of entries. Retain an audit
trail that maps generated catalog records back to Markdown heading/section.

Catalog metadata must include:

- schemaVersion
- catalogVersion or build identifier
- source file
- source commit when available
- deterministic source/content hash
- generatedAt only where appropriate (avoid nondeterministic source control
  diffs on every identical build)
- unique test count
- test IDs and tests themselves

Build output should be reproducible: repeated builds on identical source
produce identical committed catalog bytes. Validate against a JSON Schema or
an equivalently strict checked validator, using existing project tooling.

IMPORTANT: changing the test queue must regenerate the test catalog; enforce
this with a CI/build drift check.

============================================================
3. TEST-CENTER USER EXPERIENCE
============================================================

Primary tester: an external person who installed HA Legacy Dashboard as a
Home Assistant App on their own HAOS installation. No knowledge of Git, Codex,
Markdown, or the Repair Queue should be required.

Provide German as the primary interface language. Support English where
practical, and keep bilingual product documentation synchronized. Preserve
the original full test-step meaning when translated; do not fabricate source
details.

Minimum interface:

A. Welcome / preparation
   - explain independent test portal vs installed HA App
   - explain that tests run on the tester's own HA installation
   - quick preparation and security/privacy guidance
   - choose a test run, create a new one or import a previous result JSON

B. Test run details
   - pseudonym / tester identifier (avoid mandatory legal name or email)
   - HA Legacy Dashboard version (actual installed App version, REQUIRED)
   - Home Assistant Core version (when known)
   - installation: Home Assistant App (default), Standalone/LXC optional
   - system architecture (when known; avoid fabricated detection)
   - client browser/device/OS, as relevant
   - optional notes / timezone-independent UTC creation timestamp
   - catalog version/hash automatically included

C. Test selection
   - search by ID/title
   - filters by category/Sprint/platform/device and status
   - filters for HA App relevant test cases
   - show blocked / NOT READY test cases distinctly
   - show progress and counts for PASS/FAIL/BLOCKED/NOT TESTED/N/A
   - distinguish blocked by a product repair vs test not applicable
   - optionally group related steps into test sessions

D. Test detail
   - complete prerequisites
   - complete numbered steps
   - expected behavior and failure criteria
   - optional evidence instructions
   - clear readable UI on desktop/tablet/phone
   - do not require separate HA App screen embedding or CORS access

E. Result entry
   - exactly: PASS, FAIL, BLOCKED, NOT_TESTED, N/A
   - optional notes for PASS
   - mandatory explanation for FAIL / BLOCKED / N/A
   - structured expected/actual/reproduction notes for FAIL
   - optional reference to GitHub Issue URL/number
   - distinguish manual observation from assumptions
   - leave tests not executed as NOT_TESTED
   - optional per-test timestamps
   - optional per-test screenshots/evidence references, not binary embeds

F. Progress persistence
   - persist draft test runs locally on the tester's browser using suitable
     browser storage, with safe failure handling and clear disclosure
   - never claim local storage is a central backup
   - explicit new-run, resume-run, import, export and clear-local-data actions
   - warn before destructive clearing
   - allow multiple local runs without mixing results
   - handle storage unavailable/full/private mode gracefully

G. Export and import
   - downloadable UTF-8 .json report conforming to schema
   - filename includes safe version/run ID or timestamp, no sensitive data
   - import existing report after strict schema and size validation
   - show import summary, mismatched catalog hash and conflicts before merge
   - never silently discard recorded results
   - never silently overwrite a different test run
   - allow older supported report schemas via explicit migration or helpful
     error, not silent corruption

Do not add inert controls. Each visible interaction must work.

============================================================
4. REPORT CONTRACT
============================================================

Define and document a strict, extensible versioned JSON schema, e.g.:

{
  "schemaVersion": "1.0",
  "testRunId": "RUN-...",
  "testerId": "Tester-A",
  "createdAt": "2026-...Z",
  "updatedAt": "2026-...Z",
  "catalogVersion": "...",
  "catalogHash": "...",
  "environment": {
    "deployment": "ha-app",
    "dashboardVersion": "...",
    "homeAssistantVersion": "...",
    "architecture": "...",
    "browser": "...",
    "device": "..."
  },
  "results": [
    {
      "testId": "TEST-...",
      "status": "FAIL",
      "testedAt": "2026-...Z",
      "expected": "...",
      "actual": "...",
      "reproductionSteps": "...",
      "notes": "...",
      "issueUrl": "..."
    }
  ]
}

This is a conceptual example, not an exact existing format. Adjust fields
to the real test catalog and provide backward-compatible documentation.

Required validation:

- unique testRunId
- unique testId per run
- test IDs must exist in matched catalog version (or be flagged unknown)
- strict status enum
- no PASS/FAIL inferred from NOT_TESTED
- explicit N/A not counted as PASS
- consistent timestamps
- required contextual fields
- bounded text/file sizes and field lengths
- no executable payload / prototype pollution from imported data
- catalog mismatch never silently accepted as equivalent
- same Test ID across different software versions must be kept as different
  observations in analysis

Treat JSON/text inputs as untrusted. Render notes using textContent or a
trusted sanitizer: never inject untrusted Markdown/HTML directly as innerHTML.

Include test report fixtures with all statuses and known-invalid examples.

============================================================
5. GITHUB REPORTING AND ISSUE TEMPLATES
============================================================

Make it simple to send reports to the project's GitHub repository:

  https://github.com/tekky85/ha-legacy-dashboard/issues

Prefer two clear templates/forms:

- 'Manual Test Run Report' (one report/run: version, environment, totals,
  Test Run ID, attachment or pasted structured data, issues discovered)
- 'Bug Report' (individual defect: Test ID, version, reproduction, actual vs
  expected, sanitized logs/screenshots, link to test run)

Use existing .github/ISSUE_TEMPLATE structure and labels. Preserve existing
unrelated templates. Do not create duplicates.

Support a flow such as:

1. Validate report locally.
2. Download JSON report.
3. Provide copyable human-readable issue summary, including test run ID,
   version, PASS/FAIL/BLOCKED counts and failed Test IDs.
4. Open a normal GitHub new-issue page with the relevant template.
5. Tester signs in to GitHub to create the Issue, attaches report if GitHub
   allows the file type or pastes appropriate sanitized content.
6. Tester records the resulting Issue URL/number for correlation.

Do not assume arbitrary .json attachments are always accepted by GitHub
Issue forms. Validate current GitHub capabilities and document a practical
fallback (e.g. supported archive format or sanitized formatted code block).
Do not put full report JSON into query parameters or URLs.

GitHub Pages is static. Do NOT embed a personal-access token in frontend code,
ask testers to paste a privileged token into the portal, implement unsafe
client-side GitHub write calls, or claim authenticated Issue creation without
an explicit secure backend. Opening a normal issue form is sufficient.

Submission via GitHub generally requires a GitHub account. Preserve an
alternative: tester downloads the JSON and hands it to a coordinator who
submits it. The read-only portal itself must be usable without GitHub login.

Do not auto-create one Issue per PASS or per test. Avoid issue spam.

============================================================
6. OFFLINE VALIDATION, AGGREGATION AND ANALYSIS
============================================================

Create a documented, repeatable local-only command-line workflow that takes
one or many tester-submitted .json reports and produces a consolidated summary
without requiring browser authentication or a connected GitHub account.

Recommended:

  scripts/testing/validate-test-report.*
  scripts/testing/aggregate-test-reports.*

Input: a directory of downloaded reports or explicit file paths.

Outputs (choose formats matching project tooling):

- per-report validation result and actionable errors
- aggregate JSON with schema and source hashes
- CSV matrix by Test ID x Test Run (for spreadsheet tools)
- human-readable Markdown summary for audit review
- failures grouped by Test ID / app version / HA version / environment
- distinct tester/run counts and coverage
- linked GitHub Issues when present
- unknown test IDs, version mismatches and incomplete submissions
- recurring or conflicting findings for manual triage

Do not require publishing private reports to a public repository. By default,
input/output directories with raw results must be gitignored; provide safe
fixture directories that CAN be committed for tests.

Merging rules:

- never collapse observations from different software versions
- dedupe only truly identical reports (same run ID + content hash)
- if the same run ID contains differing content, flag a conflict; do not
  silently select one
- distinguish number of testers from number of test runs
- separate PASS/FAIL/BLOCKED/N/A/NOT_TESTED precisely
- never compute '100% passed' when coverage is incomplete
- keep multiple tester observations even if they disagree
- do not infer a root cause or auto-close Repair Queue items
- map Test IDs to Sprint/requirement and Repair ID(s) where documented
- produce candidates for human review: existing RQ issue vs new finding
- do not automatically mutate REPAIR_QUEUE.md from imported untrusted data

Support a stable output report with:

- input report inventory and validity
- test catalog version(s)
- app version group(s)
- coverage by category and by device/system
- PASS, FAIL, BLOCKED, N/A, NOT_TESTED totals
- test IDs failing in two or more independent runs
- unresolved or conflicting results
- GitHub Issue linkage
- prerequisites for final manual acceptance / RC gate

============================================================
7. SECURITY, DATA MINIMIZATION, PRIVACY
============================================================

External testers use their own HA installations. A public test submission may
accidentally reveal private entity names, dashboards, local network details,
photos, logs or credentials. Build privacy safeguards from the beginning.

Requirements:

- do NOT connect the public portal to HA APIs
- do NOT read HA tokens, SUPERVISOR_TOKEN, Admin token or production .env
- do NOT auto-collect entity IDs, IPs, logs, browser fingerprint or telemetry
- do NOT send form data to a server automatically
- no analytics/tracking without a separate explicit privacy design
- store drafts only in the user's own browser (with visible warning)
- make export and manual submission explicit user actions
- explain GitHub Issues in public repositories may be publicly visible
- display clear redaction checklist before copying/submitting reports
- allow tester aliases; avoid unnecessary PII
- sanitize the rendered test steps and imported notes
- no external image/script injection or untrusted JS evaluation
- validate all uploads/imported files and prohibit path traversal
- publish no real HA configuration, secrets or personal photos as demo data
- public aggregation must use synthetic or explicitly redacted reports only

If complete evidence is too sensitive for a public Issue, instruct testers to
submit only sanitized reproduction details and coordinate sensitive material
privately through an agreed channel, never with embedded tokens.

============================================================
8. TESTING AND QUALITY GATES
============================================================

Automated test matrix:

Catalog:
- actual source parsed correctly
- all unique IDs retained
- deterministic output
- missing steps/expected/failure criteria reported
- duplicate IDs fail build
- unrelated source content is not treated as a test
- CI detects stale generated catalog

Portal:
- filters/search work
- grouped counts correct
- status transitions correct
- required FAIL/BLOCKED/N/A explanations enforced
- resume/new-run/clear-local-data work
- export -> import round-trip preserves results
- malformed/oversized/unsupported JSON rejected safely
- mismatched catalog/version handled visibly
- no accidental merging between runs
- safe rendering of malicious strings
- paths/assets work from /ha-legacy-dashboard/testing/
- keyboard-accessible form controls, readable responsive layouts

Aggregator:
- one run and multiple runs
- different versions, same Test ID
- two reports with same run ID and different data
- duplicate identical report dedupe
- PASS/FAIL/BLOCKED/N/A/NOT_TESTED counts
- invalid/unknown IDs
- conflicting tester observations
- sanitized Markdown/CSV/JSON exports
- RQ/test mapping and Issue linkage

GitHub integration:
- YAML issue forms valid
- issue instructions match UI
- fallback for unsupported attachments
- no frontend GitHub token
- no automatic public upload

Regression:
- production HA Legacy Dashboard UI/backend unchanged except for intentional
  docs/build/test tooling integration
- no impact on Standalone/LXC or HA App runtime
- no regression of previous 27.1 repairs
- existing Public Test Release tags/digests not modified
- legacy ES5 frontend remains intact; modern test portal isolated

Run relevant repo test commands and newly added tests. If browser automation is
available, use local-only dev/test servers and fixture data. Do not connect to
real production Home Assistant. Report untestable runtime conditions honestly.

============================================================
9. GITHUB PAGES DEPLOYMENT
============================================================

Inspect whether Pages is already used in this repository. Do NOT overwrite an
existing site or switch publication mechanism without understanding impact.

If no Pages workflow exists, add the smallest least-privilege workflow that:

- builds and validates the catalog and static site
- publishes ONLY intended static site files
- does not expose .env, node_modules, audit raw results or private repository
  content as Pages artifacts
- uses a supported GitHub Pages publishing method
- limits permissions: contents read for build, pages write + id-token write
  only for deploy
- uses a predictable base path for the actual repository
- preserves workflow protections / existing build and release processes
- reports how to enable Pages in GitHub Settings if repository settings
  cannot be changed by Codex

Prefer deploy only from the repository's actual default/release branch and
manual workflow dispatch; do not deploy arbitrary untrusted pull request code.

Do not claim the public Pages URL is live until a successful deployment has
been observed. If publication is blocked by required GitHub settings or
permissions, finish safe implementation and clearly report the missing action.

============================================================
10. DOCS AND OPERATOR HANDOFF
============================================================

Add comprehensive documentation:

TESTER_GUIDE.de.md (primary)
- where to open Test-Center
- how to identify installed HA App version
- how to start and resume a test run
- how to choose HA App tests
- how to record PASS/FAIL/BLOCKED/N/A
- how to provide meaningful actual/expected/reproduction details
- how to export and locally back up JSON
- how to submit GitHub Issue / coordinator alternative
- privacy/redaction and screenshot guidance
- screenshots only from real running app or controlled demo, not mockups

TESTER_GUIDE.en.md:
- semantically equivalent English guidance

TEST_COORDINATOR.md
- how to distribute test portal link and current release test scope
- how to collect multiple tester reports and check versions
- how to run validator/aggregator
- how to interpret missing coverage and contradictory results
- how to map findings to existing RQ items or propose new ones
- how to feed summary back to manual acceptance / final RC gate
- how to handle redacted data and keep raw submissions private

DATA_FORMAT.md
- catalog/report schema, examples and compatibility
- testRunId, catalog hash, versioning and merge rules

PRIVACY_AND_SECURITY.md
- privacy model, no central portal storage, public GitHub visibility
- safe sharing/redaction checklist

Update README.de.md and README.en.md with matching links/instructions, where
relevant. Update docs/SPRINT_ROADMAP.md and docs/PROJECT_STATUS.md according
to repository conventions. Do not falsely mark manual tests completed.

============================================================
11. COMMIT AND PUSH
============================================================

Before committing:

- confirm catalog is generated from canonical Markdown with no dropped IDs
- run validation, targeted tests, static build and diff checks
- inspect generated Pages artifact for secrets/private/raw data
- inspect `git status`, `git diff --check`, and `git diff`
- stage only Sprint 27.3 implementation, docs and regression fixtures
- do not commit testers' real results, local caches or private exports

Recommended commit message:

  git commit -m "feat(testing): add community test center and JSON report workflow"

Push current branch:

  git push

If upstream is not set, use:

  git push -u origin <current-branch>

Do NOT force-push, rewrite release tags, or publish a new HA App release.

If tests or safety gates fail, do NOT claim a successful batch or perform a
success-marked commit. Report blockers and what remains.

============================================================
12. REQUIRED FINAL REPORT
============================================================

Report:

1. Starting branch/commit and final commit/branch.
2. Exact changed/new files.
3. Canonical input queue and number of extracted unique Test IDs.
4. Number of complete, incomplete, duplicate and blocked test definitions.
5. Catalog generation command, hash/version, and regeneration CI check.
6. Portal URL/path and whether public deployment actually succeeded.
7. Tester workflows implemented (start/resume/import/export).
8. Report schema and example fixture path.
9. GitHub Issue forms/templates and submission fallback.
10. Validator and aggregator commands and example output paths.
11. Validation results and test suite summary.
12. Sanitization and privacy controls.
13. Whether HA App and Standalone runtime code remained unchanged.
14. Legacy Safari/ES5 regression result.
15. Any GitHub Settings actions required to enable Pages.
16. Manual browser tests not performed (with reproducible steps).
17. Commit hash and push result.
18. Whether working tree is clean.
19. Sprint 27.3 result: COMPLETE / PARTIAL / BLOCKED.
20. Remaining requirements before external testers can begin.
21. Do not start new repair batch, manual acceptance, or final RC gate.
```

---

## Acceptance criteria for the owner

- Another tester can open the public portal without access to your HA system or a GitHub login.
- The tester can identify their actual HA App version, follow the complete manual steps, record each result and export a valid JSON report.
- The portal retains local drafts and restores them; it never suggests a draft was centrally saved.
- A tester can submit a documented result through GitHub Issues after signing in, or deliver the JSON to a coordinator instead.
- The coordinator can validate and aggregate reports from multiple independent testers with a single documented command.
- The summary separates HA App versions, reports contradictions and highlights repeated failures without automatically changing the Repair Queue.
- Reports do not expose secrets or private HA installation details by default.
- The existing HA Legacy Dashboard App/Standalone functionality, iPad Safari compatibility and published release history remain unchanged.

## Git commands (for reference)

Use actual filenames produced by Codex; do not literally run angle-bracket placeholders:

```bash
git status
git diff --check
git diff
git add <only-reviewed-Sprint-27.3-files>
git commit -m "feat(testing): add community test center and JSON report workflow"
git push
```

If current branch has no upstream:

```bash
git push -u origin <current-branch>
```

Never force-push.

## Useful GitHub references

- GitHub Pages workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Pages publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Issue forms: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms
