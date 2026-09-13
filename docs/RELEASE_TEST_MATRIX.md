# Sprint 25 release test matrix

This is the maintained traceability index for the 60 numbered release tests in
`docs/sprints/SPRINT-25.md`. The machine-readable source is
`release/sprint-25-test-matrix.json`; `test/sprint-27-1-h.test.js` verifies that
all numbers occur exactly once and that every referenced source marker or
manual test exists.

Coverage means:

- `direct`: an automated repository test or static release assertion;
- `workflow`: a repository assertion plus evidence from the exact tagged
  GitHub workflow/artifact;
- `manual`: a complete version-/commit-/artifact-specific instruction in
  `docs/audits/MANUAL_TEST_QUEUE.md`.

A mapped requirement is not automatically a passed requirement. Manual and
real-runtime cases retain their recorded `NOT TESTED`, `BLOCKED`, `FAIL` or
`PASS` result. CI evidence is inherently bound to `GITHUB_SHA`; MT-55 and
MT-57 additionally require the exact tag, commit and artifact digests.

| Range | Sprint-25 tests | Primary evidence |
|---|---|---|
| 1–4 | version, mismatch, lockfile, complete suite | version and release-gate tests |
| 5–10 | amd64/arm64, manifest, image, RC/latest/Stable | tagged workflow, MT-55, MT-57 |
| 11–20 | App metadata, repository, bundle, checksum, smoke, isolation | package/bundle/smoke tests and MT-55 |
| 21–28 | Standalone/App update and persisted settings | cross-version process test, MT-52/56 |
| 29–38 | tokens, artifacts, logs, permissions and CI isolation | secret/bundle/workflow tests, MT-50/55 |
| 39–48 | German/English install, update, rollback, notes and links | versioned documentation plus MT-55 |
| 49–60 | product and legacy-browser regression | exact MT-40/42/43/45/46/48/54/58/59/63/72 instructions |

For Stable, the stricter policy in `release/stable-gate-policy.json` applies.
The workflow refuses to build or publish Stable images until all policy tests
are recorded as `PASS`, the approval references immutable RC artifacts, no
P0/P1 repair is open, and the exact workflow commit is approved through the
`stable-release` Environment. MT-57 then verifies the actual promotion and
`latest` update; it is deliberately not a circular precondition of itself.
