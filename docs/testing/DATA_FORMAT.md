# Test catalog and report contract

Both formats are versioned `1.0`. The machine-readable schemas live in
`schemas/test-catalog.schema.json` and `schemas/test-report.schema.json` in the
repository. The browser and CLI share the strict validator in
`testing/js/report.js`; it also enforces cross-field rules that JSON Schema
alone cannot express. No dependency or account is needed.

## Canonical source and regeneration

The only master definition list is `docs/audits/MANUAL_TEST_QUEUE.md`.
The bounded parser matches exact `## MT-NN` detail headings, the six-column
summary table and three-column execution table. `Test ID:` is retained as a
source alias; `MT-NN` is the stable result key. Summary and detail ID sets must
match exactly. Duplicate IDs or fields stop the build. Multiline metadata,
numbered steps, Expected sections, Fail If and Evidence are retained verbatim
as plain text. A `### Result` section is excluded: it contains observations,
not reusable test definitions. Other unrelated headings do not become tests.

The public build defaults to the **committed canonical queue at HEAD**:

```sh
node scripts/testing/build-test-catalog.js
node scripts/testing/build-test-catalog.js --check
```

This deliberately keeps uncommitted field observations/private notes out of a
public build. When changing definitions, regenerate from the working source
and commit the queue definition change and generated file together:

```sh
node scripts/testing/build-test-catalog.js --working-tree
node scripts/testing/build-test-catalog.js --working-tree --check
```

After committing, the normal `--check` must pass. CI checks the exact committed
queue and stops on drift. Do not stage unrelated real tester results merely to
make generation pass. An isolated checkout can be used to prepare a new
definition-only queue revision. The portal labels its own catalog version;
it is not a live view of local edits in a coordinator's checkout.

`catalogHash` is SHA256 of the ordered parsed definitions and diagnostics;
`catalogVersion` is `27.3-` plus its first 12 hex characters. `sourceHash`
binds the complete selected Markdown bytes, without publishing its Result
sections. `sourceCommit` records the known committed source revision. For a
new working definition revision it is explicitly null until a provenance
revision is deliberately regenerated; a known null/hash is retained when the
source hash stays identical. No generated timestamp or self-referencing Git
commit is included. Also locate the commit containing the generated file using
`git log -- testing/data/test-catalog.json`. This avoids changing catalog bytes
merely because a commit was created. Each test records the
source file, exact heading and line range. Hashes are integrity references,
not a signature or proof of manual execution.

Missing mandatory fields or nonsequential steps produce diagnostics with ID
and source line; the test is `NOT READY` and generation returns nonzero. No
steps are invented. Device/category/deployment filters are conservative
normalizations of source device/system text, not hardware detection and not
permission to skip prerequisites. Tests explicitly limited to LXC stay
Standalone; generic browser tests support both deployment modes; release
operations are coordinator-only. Repairs are references found in definitions
and the execution table; historical mentions are not automatically OPEN.

## Reports

See `test/fixtures/community-testing/all-statuses.json` for a synthetic
example. Required run fields: schema version, random `RUN-…` identifier,
tester alias, creation/update UTC timestamps, catalog version/hash,
environment, notes, optional Issue reference (empty string allowed), results.
Environment requires actual installed Dashboard SemVer, deployment (`ha-app`
or `standalone`), browser, device and OS. Unknown HA Core version/architecture
are empty strings. No automatic browser fingerprint or HA discovery occurs.

Each result has a unique `MT-NN`, exact status `PASS`, `FAIL`, `BLOCKED`,
`NOT_TESTED` or `N/A`, `testedAt` (UTC or null for not executed), expected,
actual, reproductionSteps, notes, issueUrl and evidence-reference strings.
FAIL requires all three structured fields. BLOCKED/N/A require notes.
Timestamps must be canonical ISO UTC milliseconds, ordered creation ≤ tested
≤ update. N/A never counts as PASS. Missing tests remain NOT_TESTED.

Limits: 2 MiB UTF-8 per import, 1000 results, 4000 characters per note field,
80 per alias, 160 per environment field and 150 per Issue reference. Only
this repository's `https://github.com/tekky85/ha-legacy-dashboard/issues/N`
or `#N` is accepted. Unknown fields, duplicate IDs, unsafe prototype keys,
excessive nesting, invalid timestamps/statuses and unsupported schemas are
rejected. Unknown test IDs and catalog mismatch are surfaced, never treated
as equivalent evidence. A mismatched imported catalog is read-only; re-export
retains all original results and catalog identity. The original file must be
kept. Schema 0.x/other versions receive a helpful error; no implicit migration.

## Import, conflict and aggregation rules

Import is preview → explicit confirmation; warnings require acknowledgement.
A different run is stored separately. A same-ID/same-content import resumes
the existing run. A same-ID/different-content conflict cannot overwrite it:
keep both files for coordinator triage. Results from another software version
require a new run once observations exist.

The CLI accepts regular `.json` files or a nonrecursive directory (max 500
files), rejects symlinks and bounds size before reading. Outputs are private
by default under ignored `test-results/`. Existing outputs are never
overwritten. Aggregation retains different software versions, catalog hashes,
tester observations and all conflicting run variants. Only identical run ID
and report content are deduplicated. Conflicts return a nonzero exit status
while still producing a review summary. Distinct aliases are not proof of
distinct physical people. Repeated failures require distinct run IDs;
conflicting variants of one ID are not independent confirmations.

JSON output includes input hashes, validity, unknown IDs/catalog warnings,
version groups, category/device coverage, status totals, observations, Issue
links and candidate RQ mappings. Markdown and CSV are escaped for their output
contexts; CSV formula prefixes are neutralized. Raw freeform evidence/notes
are not repeated in aggregate outputs. These safeguards cannot prove a
submission contains no secrets: manually review before any public sharing.
No aggregation updates Repair Queue or approves a final RC gate.
