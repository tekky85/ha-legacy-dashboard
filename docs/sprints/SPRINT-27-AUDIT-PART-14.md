# Sprint 27 – Audit Part 14 Codex Prompt

```text
Execute Sprint 27 Audit Part 14 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–13
- all sprint specification files assigned to Audit Part 14 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:
- The exact Sprint scope for Part 14 is defined in docs/audits/AUDIT_INDEX.md.
- Use that definition as authoritative.
- According to the current Sprint 27 plan, Part 14 starts the Sprint 25 / 25.x audit phase.
- If AUDIT_INDEX.md differs, use AUDIT_INDEX.md as source of truth and report the discrepancy.
- Do NOT silently expand the scope.
- Do NOT start Part 15.
- Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 14:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify repository state, release/distribution logic, packaging, build files,
   versioning, artifacts, documentation, tests and runtime assumptions where relevant.
4. Do not rely only on PROJECT_STATUS or previous Codex summaries.

Classify individual requirements only as:
PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

For overall Sprint result use:
PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED

Every PASS/PARTIAL/BROKEN result should include concrete evidence where practical:
- source file
- workflow/build file
- Dockerfile
- package.json
- release script
- version file
- documentation path
- test file / test name
- manual-test reference

SUPERSEDED REQUIREMENTS

If a later Sprint intentionally replaced an earlier implementation, do not mark
the earlier requirement BROKEN merely because the old implementation no longer exists.

Instead document:
- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:
PASS – superseded by Sprint X
or:
N/A – replaced by Sprint X

Do not use "superseded" to hide a current regression.

PART 14 FOCUS – SPRINT 25 / RELEASE & DISTRIBUTION

Where Sprint 25 is in scope, audit:
- source-of-truth build path
- Docker/BuildKit usage
- retired/obsolete build paths
- version consistency
- GHCR image naming/tagging
- multi-arch intent
- Standalone distribution bundle
- SHA256/checksum handling
- RC vs final release separation
- release notes/changelog expectations
- no telemetry
- release gate requirements
- documentation consistency
- security of release artifacts

Do not audit later Sprint 25.x UX/runtime specifics unless directly relevant
to Sprint 25 end-state or they superseded Sprint 25 release behavior.

BUILD SOURCE OF TRUTH

Verify one clearly current build path.

Audit:
- active Dockerfile
- build workflow/scripts
- BuildKit/buildx usage where required
- image context
- included/excluded files
- obsolete/retired builders
- duplicate release scripts
- duplicate Dockerfiles
- stale documentation pointing to retired build logic

VERSION CONSISTENCY

Inspect where applicable:
- package.json
- Home Assistant App config.yaml
- release metadata
- Docker image tags
- changelog/release docs
- UI/Admin version display
- build arguments
- standalone archive filenames

Verify:
- one RC version maps consistently across artifacts
- no accidental mismatch between App and package version
- no stale version strings in current release path
- RC suffixes are handled consistently where required

Do NOT change versions during this baseline audit.
Record mismatches in REPAIR_QUEUE.md.

GHCR / IMAGE DISTRIBUTION

Where Sprint 25 defines GHCR distribution, inspect:
- image repository/name
- tag conventions
- RC tag handling
- final tag handling
- latest tag policy
- amd64
- aarch64
- multi-arch manifest intent
- authentication assumptions
- safe secret references

Do NOT publish an image.
Do NOT push to GHCR.
Do NOT create a release.

If current CI/workflow cannot be executed without secrets, mark real publish
steps NOT TESTED and queue exact manual/runtime tests.

RC VS FINAL RELEASE SEPARATION

Verify:
- RC does not silently become latest
- RC does not overwrite final release tags
- final release requires explicit promotion/approval where specified
- release notes identify RC status
- App version/tag expectations remain coherent

If later Sprint 25.4 refined this, document the superseding relationship without
auditing Sprint 25.4 in full.

STANDALONE RELEASE BUNDLE

Audit:
- included files
- excluded files
- README/install docs
- example env/config
- no production credentials
- no .env secrets
- no logs
- no uploaded user data
- no runtime DATA_DIR contents
- no temp/test artifacts

Where tar/zip bundle is expected, verify the build path can produce a safe artifact.

CHECKSUMS

Where Sprint 25 requires SHA256:
- verify checksum generation path
- verify checksum filename/reference conventions
- verify checksum covers intended final artifact
- verify docs explain usage where required
- ensure checksum is generated after final artifact creation

RELEASE ARTIFACT SECURITY

Audit for accidental inclusion of:
- .env
- HA token
- SUPERVISOR_TOKEN
- Admin token
- logs with secrets
- uploaded backgrounds/user data
- test credentials
- temp files
- production config
- local machine paths
- private SSH material

NO TELEMETRY

Inspect current code/build/docs for:
- analytics SDKs
- usage beacons
- crash-reporting services
- third-party telemetry
- automatic external callbacks unrelated to HA operation

RELEASE GATES

Where specified, verify gates cover:
- tests
- security checks
- version consistency
- packaging
- Standalone
- HA App
- legacy iPad
- documentation
- known blockers
- manual runtime checks

Do not mark real runtime gates PASS without evidence.
Use NOT TESTED and MANUAL_TEST_QUEUE.md where needed.

DOCUMENTATION

Verify:
- README.de.md / README.en.md semantic synchronization
- current release/install paths
- current Standalone release instructions
- current HA App distribution wording
- no obsolete image names/tags
- no retired builder references
- no false claims of complete RC validation
- no real-looking secrets in examples

SHARED ASSET / CACHE VERSION FOLLOW-UP

The known shared-cache inconsistency from earlier audit parts must remain tracked.

Known evidence:
- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 14.

Because Sprint 25 is release-oriented, assess whether this issue is an RC blocker.

If the existing Repair ID already tracks it:
- preserve that Repair ID
- append release-readiness evidence if Part 14 adds context
- do not duplicate it

MANUAL TEST POLICY

No production release, GHCR publish, GitHub Release, HAOS install/update or
physical iPad test is being performed during Audit Part 14.

All remaining real-runtime/manual tests will be executed only after ALL Audit Parts
have completed.

Therefore:
- do NOT mark publish/install/update requirements PASS without evidence
- classify them as NOT TESTED where appropriate
- add required tests to docs/audits/MANUAL_TEST_QUEUE.md

Use suitable IDs:
TEST-RELEASE-XXX
TEST-GHCR-XXX
TEST-HAOS-XXX
TEST-STANDALONE-XXX
TEST-IPAD-XXX

For EVERY queued manual test include:
- Test ID
- related Sprint
- Requirement
- System
- Preconditions
- exact version/tag/artifact under test
- exact step-by-step actions
- expected result
- failure criteria
- evidence to capture
- result field

REPAIR QUEUE

Any actionable PARTIAL / MISSING / BROKEN finding must be represented in:
docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 14 must contain:
- Repair ID
- Sprint
- Priority
- Finding
- Evidence
- Required Repair
- RC relevance

Use priorities:
P0 – RC Blocker
P1 – must fix before RC
P2 – should fix before/around RC
P3 – may be deferred after RC

Do not duplicate existing Repair IDs.

Before finishing Part 14, ensure every actionable finding is tracked.

AUDIT FILES

Create/update:
docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Expected if current plan matches AUDIT_INDEX.md:
docs/audits/sprints/SPRINT-25-AUDIT.md

Do not overwrite or remove audit history from Parts 01–13.

Update:
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

AUTOMATED / LOCAL TESTS

Run relevant bounded local tests for Part 14.

Where possible verify:
- version consistency
- packaging config syntax
- Docker build path
- architecture metadata
- release script syntax
- Standalone bundle generation
- checksum generation
- archive contents
- no obvious secret inclusion
- package/test suite
- documentation references

Do NOT publish.
Do NOT contact production Home Assistant.
Do NOT use production credentials.
Do NOT claim real GitHub/GHCR/HAOS publication PASS from local-only tests.

SECURITY

Explicitly verify:
- no credentials in release artifacts
- no HA token in frontend/release bundle
- no SUPERVISOR_TOKEN in frontend/release bundle
- no production .env
- no private user data
- no telemetry
- no secret leakage in workflows/log examples
- release scripts do not echo secrets
- Docker context does not accidentally include DATA_DIR/user uploads
- generated Standalone artifacts are safe to distribute

FINAL REPORT

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 14
3. overall result for each audited Sprint
4. PASS findings
5. PARTIAL findings
6. MISSING findings
7. BROKEN findings
8. NOT TESTED requirements
9. superseded requirements and replacement Sprints
10. source/test evidence
11. automated/local tests run and results
12. manual tests added
13. for each new manual test: Test ID + short description
14. confirmation that every new manual test contains complete step-by-step instructions,
    expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item: Repair ID, Sprint, Priority, Finding
17. existing Repair Queue items receiving additional evidence
18. build-source-of-truth findings
19. version-consistency findings
20. GHCR/tagging findings
21. RC-vs-final-release findings
22. multi-arch findings
23. Standalone bundle findings
24. checksum findings
25. release-artifact security findings
26. no-telemetry findings
27. release-gate findings
28. documentation findings
29. explicit RC relevance of the shared asset/cache Repair item
30. security findings
31. Standalone relevance
32. Home Assistant App relevance
33. Legacy iPad relevance
34. whether Audit Part 14 is COMPLETE
35. exact scope planned for Part 15 according to AUDIT_INDEX.md
36. recommended audit-doc commit message

Do NOT start Part 15.
Do NOT perform repair work from REPAIR_QUEUE.md.
Do NOT publish images/releases/artifacts.
Do NOT perform production HAOS/iPad manual tests in this run.
Do NOT commit or push until I review the result.
```
