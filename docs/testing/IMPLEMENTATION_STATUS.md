# Sprint 27.3 – implementation and handoff

Date: 2026-10-18. Start: `main`, `028b718` (also origin/main at preflight).
Implementation commit: `2558af1fb0e773369804f6ab69860ac496ff63f1`, successfully
pushed to origin/main as `tky <mbp@tky.cloud>`. A subsequent evidence-only
documentation commit records the observed CI/publication results below.
Scope: independent Community Test-Center only. No 27.1-K repair, physical
acceptance, new App release, tag, image, LXC rollout or final RC gate.

## Source inventory

- Canonical file: `docs/audits/MANUAL_TEST_QUEUE.md`.
- Public catalog selects the committed source snapshot, source commit
  `ea293c1343cf26a7320619db9f4aafc7cc9d483b`.
- 72 unique summary/detail IDs; 72 complete, 0 incomplete, 0 duplicate,
  0 blocked definitions in that selected snapshot.
- The owner has local uncommitted MT-01 results and repair references in six
  audit/release/status documents. They are preserved and excluded from this
  commit and public catalog. The local definition snapshot contains a blocked
  MT-01; that is not silently presented as a published catalog update.
- Catalog `27.3-1c6d7088096c`, SHA256
  `1c6d7088096c68bfd4758fb85e882ec06b56131ad68f7ca7c8683beea9a2976a`.
- Source SHA256
  `e6ec859d2e31437f04ef347d4b8c1f0aa64bb871d22b7a4ecae92aab573d2265`.
- All original detail aliases, requirements, preparation, steps, expected,
  failure, evidence and repair references retained with source line ranges.
  Observed Result sections are never published as reusable definitions.

## Delivery

German portal at `/testing/`, expected public URL
https://tekky85.github.io/ha-legacy-dashboard/testing/.
DE/EN guides are semantically synchronized; source steps remain German.
Tests use the tester's own installation. Environment is entered manually;
installed App version is mandatory. Separate local runs, resume, filters,
five exact statuses, structured FAIL fields, required BLOCKED/N/A notes,
safe storage failure, validated download/import and privacy-gated summary/
normal Issue-form links are implemented. No login needed to read the portal;
GitHub submission needs an account or coordinator handoff.

Report schema `1.0`: `schemas/test-report.schema.json` and shared strict
validator `testing/js/report.js`. Synthetic all-status example:
`test/fixtures/community-testing/all-statuses.json`. Invalid examples are
separate. Catalog mismatch imports read-only after acknowledgement. Same-ID
conflicts cannot overwrite recorded results. New versions require new runs
after observations have been recorded. Local drafts are not central backups.

Offline commands:

```sh
node scripts/testing/build-test-catalog.js
node scripts/testing/build-test-catalog.js --check
node scripts/testing/validate-test-report.js test/fixtures/community-testing/all-statuses.json
node scripts/testing/aggregate-test-reports.js test/fixtures/community-testing/all-statuses.json --out test-results/example-001
node scripts/testing/build-site.js dist/community-site
```

The example fixture intentionally has a synthetic/mismatched catalog and
incomplete coverage; validation surfaces both, without inventing PASS.
Aggregation produces `summary.json`, `summary.md`, `matrix.csv` privately,
preserves software versions/catalogs, flags conflicts/repeated failures,
links Issues and RQ candidates, and never mutates the Repair Queue.

## Files

- `.gitignore`: private report/cache directories.
- `.github/ISSUE_TEMPLATE/bug_report.yml`: existing form extended, not duplicated.
- `.github/ISSUE_TEMPLATE/manual_test_run.yml`: one run per submission; JSON,
  ZIP/TXT or fenced redacted JSON fallback.
- `.github/workflows/testing-pages.yml`: deterministic catalog gate, unit and
  local browser tests, allowlisted build and main-only Pages deploy.
- `testing/index.html`, `testing/css/testing.css`, `testing/js/portal.js`,
  `testing/js/report.js`, `testing/data/test-catalog.json`.
- `scripts/testing/build-test-catalog.js`, `build-site.js`,
  `validate-test-report.js`, `aggregate-test-reports.js`.
- `schemas/test-catalog.schema.json`, `test-report.schema.json`.
- `test/community-testing.test.js`, `test/community-testing-browser.js`;
  three JSON fixtures under `test/fixtures/community-testing/`.
- `docs/testing/TESTER_GUIDE.de.md`, `TESTER_GUIDE.en.md`,
  `TEST_COORDINATOR.md`, `DATA_FORMAT.md`, `PRIVACY_AND_SECURITY.md`, this handoff.
- `README.md`, `README.de.md`, `README.en.md`, `docs/SPRINT_ROADMAP.md`,
  new Sprint 27.3 section of `docs/PROJECT_STATUS.md`, Sprint 27.3 specification.

## Verification and privacy

- Focused Node tests: 15/15 PASS, including catalog completeness/drift,
  strict catalog/report rejection, parser diagnostics, unknown IDs, exact
  statuses, conflicts, aggregation/version separation and safe static build.
- Local Chromium 134.0.6998.35: 14/14 scenario groups PASS; root/project paths,
  full steps, all statuses, reload/resume, separate runs, real download/import,
  mismatch acknowledgement/read-only, conflict rejection, malicious strings,
  quota failure, clear/cancel, keyboard, 390/768/1280 px, no external requests.
- Full final regression: 409/409 PASS (31 seconds). Earlier baseline run:
  408/408 PASS before the additional strict catalog-validator case.
- JavaScript syntax and YAML parsing: PASS. Secret scan: PASS.
- Production `src/`, deploy/App packaging, package/lockfile and release tools
  unchanged. Existing legacy/security regressions passed; no new modern code
  enters the iOS-9 runtime. Physical iPad/HAOS checks are NOT TESTED.
- Static artifact uses an explicit file allowlist; no production `.env`,
  credentials, node_modules, raw reports or whole repository upload.
- Notes use textContent; JSON is size/schema/prototype checked; no HA access,
  telemetry, generic service proxy, automatic upload or GitHub API write.
- Product screenshots do not need updating: product UI is unchanged. A local
  screenshot of the real portal was visually inspected; no generated mockup.

## Publication / remaining gate

Preflight public API: repository public, default branch main, `has_pages: false`.
No existing site/workflow was overwritten. The initial configuration blocker
has been resolved by the owner. Workflow `39155337796` on commit
`306ea3e316589a8ce9088a13459edbe934ac1e2f` completed both build and deploy
successfully. The public portal and catalog both returned HTTP 200; catalog
version/hash and all 72 tests match the local generated artifact. The portal
is **LIVE**. No HA App release is required.

Implementation and public publication are verified. Sprint result remains
**PARTIAL** because the separate existing product dependency audit is red;
the Pages blocker is closed. Test coordination still requires an explicit
runtime version/device scope and the product security follow-up below.
Current macOS Safari, another modern browser and physical phone/tablet
validation remain manual; exact nine-step instructions are in
`TEST_COORDINATOR.md`. No dummy public Issue was submitted.

Commit message: `feat(testing): add community test center and JSON report workflow`.
Final commit/push result can be resolved via `git log -- testing/index.html`;
pre-existing owner documents and Sprint 27.1-K specification stay unstaged.

## Observed GitHub results after push

- [Community Test-Center workflow 39154225107](https://github.com/tekky85/ha-legacy-dashboard/actions/runs/39154225107):
  catalog drift, 15 unit tests, allowlisted site build, real-browser test and
  Pages artifact upload **PASS**. Deploy **BLOCKED** at Configure Pages:
  `Get Pages site failed` / `Not Found`. GitHub's annotation explicitly asks
  to enable Pages and configure GitHub Actions. The deploy step was skipped;
  the portal was not live at that point. This historical failure was resolved
  by the later successful run documented below; the workflow did not silently
  change settings.
- [Normal CI 39154225108](https://github.com/tekky85/ha-legacy-dashboard/actions/runs/39154225108):
  release test gate and production card browser matrix **PASS**. The existing
  production dependency audit **FAIL**; container-build is consequently skipped.
- A fresh local `npm audit --omit=dev --audit-level=moderate --json` confirms
  the existing lockfile now has **1 high (`axios`) and 1 critical (`proxy-addr`)
  package finding**. This sprint changed neither dependency nor lockfile.
  Axios advisory ranges include the locked 1.18.1; fixed range starts at
  1.20.0. The proxy-addr advisory affects versions below 2.0.8
  ([GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h)).
  This is register evidence, not a demonstrated exploit of this application.
  Triage/update with security regressions is a separate required follow-up
  before the next product release. No dependency gate was disabled and no
  27.1 repair batch was started.
- Existing RC.7 tag/image/bundle were not altered. The static portal has no
  production runtime dependencies. The separate product security gate remains
  FAIL even though portal publication now passes.

Final Sprint 27.3 result: **PARTIAL – PORTAL LIVE**. The Pages requirement is
satisfied; explicitly resolve the product dependency-audit blocker when
selecting the runtime candidate to distribute.
Working tree retains the six pre-existing manual-result documentation edits
and untracked 27.1-K specification; no Sprint 27.3 implementation is left unstaged.

## Verified public deployment

- [Workflow 39155337796](https://github.com/tekky85/ha-legacy-dashboard/actions/runs/39155337796):
  build PASS, deploy PASS, commit `306ea3e316589a8ce9088a13459edbe934ac1e2f`.
- [Public portal](https://tekky85.github.io/ha-legacy-dashboard/testing/): HTTP 200.
- Public `testing/data/test-catalog.json`: HTTP 200, 72 tests,
  `27.3-1c6d7088096c`, hash matches the source inventory above.
- Verified on 2026-10-18 after the owner's successful manual workflow start.
- This closes public Pages availability only. No physical product tests,
  dependency repairs, new runtime release or final RC acceptance were performed.
