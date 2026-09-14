"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const RcResult = require("../release/create-rc-result");
const ReleaseSource = require("../release/check-release-source");
const VersionCheck = require("../release/check-version");

const ROOT = path.join(__dirname, "..");
const CURRENT_VERSION = require("../package.json").version;


function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}


function git(root, argumentsList) {
    return childProcess.execFileSync(
        "git",
        argumentsList,
        {cwd: root, encoding: "utf8"}
    ).trim();
}


function gitFixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "release-source-"));

    git(root, ["init", "-q"]);
    git(root, ["config", "user.name", "Release Test"]);
    git(root, ["config", "user.email", "release-test@example.invalid"]);
    fs.mkdirSync(path.join(root, "src"), {recursive: true});
    fs.mkdirSync(path.join(root, "docs", "audits"), {recursive: true});
    fs.writeFileSync(path.join(root, "src", "runtime.js"), "old\n", "utf8");
    git(root, ["add", "."]);
    git(root, ["commit", "-qm", "initial"]);
    git(root, ["tag", "v1.0.0-rc.3"]);
    return root;
}


test("Source-Gate erkennt release-relevante Änderungen und exakte Tag-Identität", function (t) {
    const root = gitFixture();

    t.after(function () {
        fs.rmSync(root, {recursive: true, force: true});
    });
    fs.writeFileSync(path.join(root, "docs", "audits", "note.md"), "audit\n", "utf8");
    git(root, ["add", "."]);
    git(root, ["commit", "-qm", "audit only"]);
    assert.equal(
        ReleaseSource.inspect(root, "1.0.0-rc.3", null).sourceDrift,
        false
    );

    fs.writeFileSync(path.join(root, "src", "runtime.js"), "new\n", "utf8");
    git(root, ["add", "."]);
    git(root, ["commit", "-qm", "runtime change"]);
    const drift = ReleaseSource.inspect(root, "1.0.0-rc.3", null);

    assert.equal(drift.sourceDrift, true);
    assert.deepEqual(drift.changedPaths, ["src/runtime.js"]);
    assert.throws(function () {
        ReleaseSource.assertReleaseSource(root, "1.0.0-rc.3", null);
    }, /Assign a new version before publishing/);
    assert.throws(function () {
        ReleaseSource.assertReleaseSource(
            root,
            "1.0.0-rc.3",
            "v1.0.0-rc.3"
        );
    }, /resolves to .* but HEAD is/);

    const next = ReleaseSource.assertReleaseSource(
        root,
        "1.0.0-rc.4",
        null
    );
    assert.equal(next.expectedTagCommit, null);
    assert.equal(next.previousTag, "v1.0.0-rc.3");
    assert.equal(next.sourceDrift, false);
    assert.throws(function () {
        ReleaseSource.assertReleaseSource(root, "1.0.0-rc.2", null);
    }, /must be greater than previous tag/);
});


test("Aktueller Entwicklungsstand kann den veröffentlichten RC-Tag nicht wiederverwenden", function () {
    const state = ReleaseSource.inspect(ROOT, CURRENT_VERSION, null);

    assert.equal(state.expectedTag, "v1.0.0-rc.3");
    assert.notEqual(state.expectedTagCommit, state.head);
    assert.equal(state.sourceDrift, true);
    assert.ok(state.changedPaths.length > 0);
    assert.throws(function () {
        VersionCheck.validate(
            ROOT,
            "v" + CURRENT_VERSION,
            {checkSource: true}
        );
    }, /tag .* resolves to .* but HEAD is/);
});


test("RC-Nachweis bindet genau einen Commit, Tag, Digest und Bundle-Hash", function (t) {
    const output = fs.mkdtempSync(path.join(os.tmpdir(), "rc-result-"));
    const input = {
        version: CURRENT_VERSION,
        tag: "v" + CURRENT_VERSION,
        sourceCommit: "1".repeat(40),
        image: "ghcr.io/tekky85/ha-legacy-dashboard:" + CURRENT_VERSION,
        imageManifestDigest: "sha256:" + "2".repeat(64),
        standaloneArtifact: "ha-legacy-dashboard-" + CURRENT_VERSION + ".tar.gz",
        standaloneSha256: "3".repeat(64),
        workflowUrl: "https://github.com/tekky85/ha-legacy-dashboard/actions/runs/123456",
        generatedAt: "2026-09-14T12:00:00.000Z"
    };

    t.after(function () {
        fs.rmSync(output, {recursive: true, force: true});
    });
    const result = RcResult.createResult(ROOT, input);
    const markdown = RcResult.markdown(result);

    assert.equal(result.candidate.sourceCommit, "1".repeat(40));
    assert.equal(result.candidate.imageManifestDigest, "sha256:" + "2".repeat(64));
    assert.equal(result.candidate.standaloneSha256, "3".repeat(64));
    assert.equal(result.runtimeEvidence.standaloneLxc, "NOT TESTED");
    assert.equal(result.runtimeEvidence.homeAssistantAppAmd64, "NOT TESTED");
    assert.equal(result.runtimeEvidence.ipadMiniIos9, "NOT TESTED");
    assert.equal(result.releaseRecommendation, "BLOCKED");
    assert.match(markdown, /## RC Result Matrix/);
    assert.match(markdown, /## RC BLOCKERS/);
    assert.doesNotMatch(markdown, /undefined|null/);
    assert.throws(function () {
        RcResult.writeResult(
            ROOT,
            input,
            path.join(output, "rc-result.json"),
            path.join(output, "rc-result.md")
        );
    }, /tag .* resolves to .* but HEAD is/);
    assert.equal(fs.readdirSync(output).length, 0);
    assert.throws(function () {
        RcResult.createResult(ROOT, {
            version: CURRENT_VERSION,
            tag: "v" + CURRENT_VERSION,
            sourceCommit: "1".repeat(40),
            image: "ghcr.io/tekky85/ha-legacy-dashboard:" + CURRENT_VERSION,
            imageManifestDigest: "sha256:invalid",
            standaloneArtifact: "ha-legacy-dashboard-" + CURRENT_VERSION + ".tar.gz",
            standaloneSha256: "3".repeat(64),
            workflowUrl: "https://github.com/tekky85/ha-legacy-dashboard/actions/runs/123456",
            generatedAt: "2026-09-14T12:00:00.000Z"
        });
    }, /manifest digest is invalid/);
});


test("Releaseworkflow verhindert Wiederverwendung und veröffentlicht Kandidatenevidenz", function () {
    const workflow = read(".github/workflows/release.yml");

    assert.match(workflow, /--check-source/);
    assert.match(workflow, /Reject reuse of published release targets/);
    assert.match(workflow, /gh release view "\$GITHUB_REF_NAME"/);
    assert.match(workflow, /imagetools inspect "\$RELEASE_IMAGE"/);
    assert.match(workflow, /candidate-evidence:/);
    assert.match(workflow, /release\/create-rc-result\.js/);
    assert.match(workflow, /release-manifest-digest\.txt/);
    assert.match(workflow, /dist\/rc-result\.json/);
    assert.match(workflow, /dist\/rc-result\.md/);
    assert.match(workflow, /file: ha_legacy_dashboard\/Dockerfile/);
    assert.match(workflow, /npm audit --omit=dev --audit-level=moderate/);
    assert.doesNotMatch(workflow, /secrets\.[A-Za-z_]+|HA_TOKEN|SUPERVISOR_TOKEN/);
});


test("RC-Checkliste trennt historische Evidenz vom nächsten Kandidaten", function () {
    const checklist = read("docs/RC_CHECKLIST.md");

    assert.match(checklist, /Historische RC\.1-Evidenz/);
    assert.match(checklist, /741bba41d8ffc34cba4c7643f2e2b777f2e6501e/);
    assert.match(checklist, /ha_legacy_dashboard\/Dockerfile/);
    assert.match(checklist, /Commit- und artefaktgebundener/);
    assert.match(checklist, /NOT TESTED/);
    assert.match(checklist, /## RC BLOCKERS/);
    assert.doesNotMatch(checklist, /Root-`Dockerfile`/);
    assert.doesNotMatch(checklist, /0 bekannte npm-Schwachstellen.*rc\.1/i);
});
