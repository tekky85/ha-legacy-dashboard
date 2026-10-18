# Community test coordination

Distribute the portal URL and an explicit requested App version, deployment,
architecture/device scope and catalog version/hash. Do not assume “latest” is
the installed version. The portal remains independent of an unhealthy App.
Testers choose relevant tests; release/Stable actions remain coordinator-only.
Local drafts are not submissions. Ask for reviewed JSON plus necessary
sanitized screenshots, not production configuration or credentials.

## Validate and aggregate privately

Use Node.js 22+, no HA, GitHub login or account connection required:

```sh
node scripts/testing/validate-test-report.js test-results/incoming
node scripts/testing/aggregate-test-reports.js test-results/incoming --out test-results/review-001
```

Explicit file arguments are supported instead of a directory. Incoming/output
directories are gitignored. Create a new output directory for every review;
prior summaries are never overwritten. Safe example:

```sh
node scripts/testing/validate-test-report.js test/fixtures/community-testing/all-statuses.json
node scripts/testing/aggregate-test-reports.js test/fixtures/community-testing/all-statuses.json --out test-results/example-001
```

Review `summary.json`, `summary.md` and `matrix.csv`. JSON contains input
validity/hashes, version/catalog groups, precise status totals, category/system
coverage, repeated failures, conflicts, per-test Sprint/requirement/RQ mapping
and Issue linkage. CSV is Test ID × run/version/catalog; conflicting variants
remain visible. Summary omits raw notes. Do not publish raw submissions or
aggregate exports without manual privacy review. Published examples use only
synthetic or explicitly reviewed/redacted data.

Invalid files or same-ID/different-content conflicts cause a nonzero exit
while producing actionable diagnostics. Identical files with the same run ID
are deduplicated; neither software-version differences nor disagreeing testers
are collapsed. Count aliases and run IDs separately; aliases alone do not
prove independent people. Inspect catalog mismatch/unknown IDs and incomplete
coverage before comparing. No result is inferred for a missing test, and N/A
is never PASS. Compare HA Core/environment groups as well as App version.

Map each FAIL to the canonical queue manually. Existing RQ references are
triage candidates, not proof of common root cause. If no existing defect fits,
propose a new finding with concrete observations, priority, version and Test ID.
Do not automatically close repairs, import community PASS as owner acceptance,
or change `MANUAL_TEST_QUEUE.md` from untrusted JSON. Re-audit fixes and rerun
the applicable physical tests against one exact immutable candidate. Final
RC/Stable approval still requires all repository gates and explicit evidence.

## Pages build and publication

```sh
node scripts/testing/build-test-catalog.js --check
node --test test/community-testing.test.js
node scripts/testing/build-site.js dist/community-site
node test/community-testing-browser.js
```

The browser command requires test-only Playwright 1.51.1 and its Chromium.
Install them outside the product dependency tree (the Pages workflow uses
`$RUNNER_TEMP/community-tools`) and set `NODE_PATH` to that `node_modules`
directory. `PLAYWRIGHT_BROWSERS_PATH` may point to an isolated cache. On Linux,
run its CLI `install --with-deps chromium`; on macOS, `install chromium`.
The older pinned browser supports the maintainer's macOS 13 test host and is
used only against localhost fixtures, never for arbitrary Internet browsing.

The artifact contains only the allowlisted static portal/catalog/guides, never
the repository tree, `.env`, node_modules, raw results or private exports.
Relative URLs support `/ha-legacy-dashboard/testing/` and `/testing/` at a root
site. `.github/workflows/testing-pages.yml` builds on scoped changes and PRs;
only `main` push/manual dispatch deploys. Deploy permissions are pages write
and id-token write; build has contents read. PRs cannot deploy.

At sprint preflight the public API reported `has_pages: false`; no existing
site was overwritten. A maintainer must enable Settings → Pages → Build and
deployment → Source: GitHub Actions, then run “Community Test-Center” on main
if needed. Preserve the `github-pages` environment's main-branch restriction.
Observe successful deploy and open the exact `/testing/` URL before announcing
availability. Repository settings cannot be assumed configured by a commit.
This workflow publishes no HA App image, tag, GitHub Release or LXC runtime.

## Browser/manual validation

On current macOS Safari, a second modern browser, tablet and phone:

1. Open the deployed project-subpath URL; verify catalog loads and labels fit.
2. Create a synthetic run, select HA App tests, search MT-50 and read all steps.
3. Save PASS/FAIL/BLOCKED/N/A and verify required explanations, counts and filters.
4. Reload, resume, create a second run and confirm no mixing.
5. Export/import JSON; preview mismatch and same-ID conflict; verify no overwrite.
6. Test blocked/full storage: warning visible, export still available.
7. Cancel clear, then clear synthetic local drafts only after export.
8. Use keyboard focus through fields/buttons; verify no clipped mobile content.
9. Review privacy, copy summary and open the normal GitHub form. Do not submit
   a dummy public Issue. Confirm the form supports file or documented fallback.

These are portal checks, not physical iPad/HAOS/product acceptance. Product
screenshots remain governed by Sprint D1; this sprint changes no product UI.
