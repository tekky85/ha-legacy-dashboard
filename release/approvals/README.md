# Stable release approvals

Stable releases require a versioned approval file named
`release/approvals/<stable-version>.json`. Release Candidates do not use this
directory and remain publishable as prereleases.

The approval is created only after all manual tests from
`release/stable-gate-policy.json` have been recorded as `PASS` in
`docs/audits/MANUAL_TEST_QUEUE.md`. It references the immutable RC artifacts
that were used for the physical/runtime acceptance:

```json
{
  "schemaVersion": 1,
  "version": "1.0.0",
  "approvedAt": "2026-09-30T18:00:00.000Z",
  "approvedBy": "github-user",
  "releaseCandidate": {
    "version": "1.0.0-rc.4",
    "tag": "v1.0.0-rc.4",
    "commit": "0123456789abcdef0123456789abcdef01234567",
    "imageDigest": "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "standaloneArtifact": "ha-legacy-dashboard-1.0.0-rc.4.tar.gz",
    "standaloneSha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  },
  "manualTests": {
    "MT-13": {
      "result": "PASS",
      "evidence": "Result record with device, version and date"
    }
  }
}
```

Every policy test must appear exactly once with `result: "PASS"` and a
non-empty evidence reference. The complete file must not contain credentials,
tokens, private URLs or private device data.

The workflow additionally runs in the protected GitHub Environment
`stable-release`. Configure required reviewers and prevent self-review in the
repository settings. That environment approval is tied to the exact workflow
run and Git commit. The gate then emits `stable-gate-result.json`, containing
the exact stable tag/commit, approval-file checksum, RC artifact digests,
manual-test IDs and the verified empty P0/P1 blocker list. The result is
attached to the Stable GitHub Release.
