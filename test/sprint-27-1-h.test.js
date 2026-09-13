"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const StableGate = require("../release/check-stable-gate");
const Matrix = require("../release/sprint-25-test-matrix.json");

const ROOT = path.join(__dirname, "..");
const REQUIRED_MANUAL_TESTS = [
    "MT-13", "MT-34", "MT-40", "MT-42", "MT-50", "MT-51", "MT-52",
    "MT-54", "MT-55", "MT-56", "MT-58", "MT-59", "MT-60"
];


function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}


function writeJson(root, relativePath, value) {
    const target = path.join(root, relativePath);

    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n", "utf8");
}


function manualQueue(resultById) {
    const rows = REQUIRED_MANUAL_TESTS.map(function (id) {
        return "| " + id + " | Sprint | Requirement | Device | Steps | " +
            (resultById[id] || "PASS") + " |";
    });

    return "| Test | Sprint | Requirement | Device | Steps | Result |\n" +
        "|---|---|---|---|---|---|\n" + rows.join("\n") + "\n";
}


function approval(version) {
    const tests = {};

    REQUIRED_MANUAL_TESTS.forEach(function (id) {
        tests[id] = {
            result: "PASS",
            evidence: id + " result record for candidate artifacts"
        };
    });
    return {
        schemaVersion: 1,
        version: version,
        approvedAt: "2026-09-30T18:00:00.000Z",
        approvedBy: "release-reviewer",
        releaseCandidate: {
            version: "1.0.0-rc.4",
            tag: "v1.0.0-rc.4",
            commit: "1".repeat(40),
            imageDigest: "sha256:" + "2".repeat(64),
            standaloneArtifact: "ha-legacy-dashboard-1.0.0-rc.4.tar.gz",
            standaloneSha256: "3".repeat(64)
        },
        manualTests: tests
    };
}


function fixture(options) {
    const settings = options || {};
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stable-gate-"));
    const version = "1.0.0";
    const results = {};

    if (settings.manualFailure) {
        results[settings.manualFailure] = "NOT TESTED";
    }
    writeJson(root, "release/stable-gate-policy.json", {
        schemaVersion: 1,
        protectedEnvironment: "stable-release",
        blockingRepairPriorities: ["P0", "P1"],
        requiredManualTests: REQUIRED_MANUAL_TESTS
    });
    writeJson(root, "release/metadata.json", {
        version: version,
        channel: "stable",
        image: "ghcr.io/tekky85/ha-legacy-dashboard",
        standaloneArtifact: "ha-legacy-dashboard-1.0.0.tar.gz"
    });
    fs.mkdirSync(path.join(root, "docs/audits"), {recursive: true});
    fs.writeFileSync(
        path.join(root, "docs/audits/MANUAL_TEST_QUEUE.md"),
        manualQueue(results),
        "utf8"
    );
    fs.writeFileSync(
        path.join(root, "docs/audits/REPAIR_QUEUE.md"),
        "| Repair | Sprints | Finding | State | Priority | Evidence | Repair | RC | Status |\n" +
            "|---|---|---|---|---|---|---|---|---|\n" +
            "| RQ-01-01 | 1 | Demo | PARTIAL | " +
            (settings.openPriority || "P1") +
            " | Evidence | Fix | Gate | " +
            (settings.openPriority ? "offen" : "CODE CLOSED") + " |\n",
        "utf8"
    );
    if (!settings.missingApproval) {
        writeJson(
            root,
            "release/approvals/" + version + ".json",
            approval(version)
        );
    }
    return root;
}


function validateFixture(root) {
    return StableGate.validate({
        root: root,
        version: "1.0.0",
        tag: "v1.0.0",
        commit: "4".repeat(40)
    });
}


test("Stable Gate bindet Approval, Pflichtresultate, Repairs und Workflow-Commit", function (t) {
    const root = fixture();
    const result = validateFixture(root);

    t.after(function () {
        fs.rmSync(root, {recursive: true, force: true});
    });
    assert.equal(result.status, "PASS");
    assert.equal(result.version, "1.0.0");
    assert.equal(result.tag, "v1.0.0");
    assert.equal(result.commit, "4".repeat(40));
    assert.equal(result.protectedEnvironment, "stable-release");
    assert.equal(result.requiredManualTests.length, REQUIRED_MANUAL_TESTS.length);
    assert.deepEqual(result.repairGate.openRepairs, []);
    assert.match(result.approvalSha256, /^[0-9a-f]{64}$/);
    assert.equal(
        result.stableArtifacts.image,
        "ghcr.io/tekky85/ha-legacy-dashboard:1.0.0"
    );
});


test("Stable Gate blockiert fehlendes Approval, offene P0/P1 und fehlende Manuellabnahme", function (t) {
    const missing = fixture({missingApproval: true});
    const p0Blocker = fixture({openPriority: "P0"});
    const p1Blocker = fixture({openPriority: "P1"});
    const manual = fixture({manualFailure: "MT-40"});

    t.after(function () {
        [missing, p0Blocker, p1Blocker, manual].forEach(function (root) {
            fs.rmSync(root, {recursive: true, force: true});
        });
    });
    assert.throws(function () {
        validateFixture(missing);
    }, /versioned approval is missing/);
    assert.throws(function () {
        validateFixture(p0Blocker);
    }, /open P0\/P1 repairs: RQ-01-01/);
    assert.throws(function () {
        validateFixture(p1Blocker);
    }, /open P0\/P1 repairs: RQ-01-01/);
    assert.throws(function () {
        validateFixture(manual);
    }, /MT-40 is not recorded as PASS/);
});


test("Stable Gate weist falsche Version, RC-Digest und Approval-Evidenz ab", function (t) {
    const root = fixture();
    const approvalPath = path.join(root, "release/approvals/1.0.0.json");
    const value = JSON.parse(fs.readFileSync(approvalPath, "utf8"));

    t.after(function () {
        fs.rmSync(root, {recursive: true, force: true});
    });
    value.releaseCandidate.imageDigest = "sha256:invalid";
    writeJson(root, "release/approvals/1.0.0.json", value);
    assert.throws(function () {
        validateFixture(root);
    }, /image digest is invalid/);

    value.releaseCandidate.imageDigest = "sha256:" + "2".repeat(64);
    value.manualTests["MT-13"].evidence = "";
    writeJson(root, "release/approvals/1.0.0.json", value);
    assert.throws(function () {
        validateFixture(root);
    }, /MT-13 has no usable evidence/);

    assert.throws(function () {
        StableGate.validate({
            root: root,
            version: "1.0.0-rc.4",
            tag: "v1.0.0-rc.4",
            commit: "4".repeat(40)
        });
    }, /version must be stable SemVer/);
});


test("Release Workflow gate Stable vor Image-Push und lässt RCs getrennt", function () {
    const workflow = read(".github/workflows/release.yml");
    const stableGate = workflow.indexOf("  stable-gate:");
    const buildImages = workflow.indexOf("  build-images:");

    assert.ok(stableGate > 0);
    assert.ok(buildImages > stableGate);
    assert.match(workflow, /stable-gate:[\s\S]*environment:[\s\S]*name: stable-release/);
    assert.match(workflow, /stable-gate:[\s\S]*check-stable-gate\.js/);
    assert.match(workflow, /build-images:[\s\S]*- release-gate/);
    assert.match(workflow, /release-candidate-gate:[\s\S]*stable != 'true'/);
    assert.match(workflow, /stable-gate-result\.json/);
    assert.match(workflow, /Publish latest only after stable validation[\s\S]*stable == 'true'/);
    assert.doesNotMatch(workflow, /secrets\.[A-Za-z_]+/);
});


test("Stable Policy enthält die verbindlichen iPad-, HAOS- und Standalone-Gates", function () {
    const policy = require("../release/stable-gate-policy.json");

    assert.deepEqual(policy.requiredManualTests, REQUIRED_MANUAL_TESTS);
    assert.deepEqual(policy.blockingRepairPriorities, ["P0", "P1"]);
    assert.equal(policy.protectedEnvironment, "stable-release");
    assert.equal(
        fs.existsSync(path.join(ROOT, "release/approvals/1.0.0-rc.3.json")),
        false
    );
});


test("Alle 60 Sprint-25-Releasefälle sind einzeln und commitbezogen zugeordnet", function () {
    const specification = read("docs/sprints/SPRINT-25.md");
    const start = specification.indexOf("# Teil AV – Release Tests");
    const scoped = specification.slice(start);
    const matches = Array.from(scoped.matchAll(/^(\d+)\.\s+(.+)$/gm)).slice(0, 60);
    const manualQueue = read("docs/audits/MANUAL_TEST_QUEUE.md");
    const seen = Object.create(null);

    assert.equal(Matrix.schemaVersion, 1);
    assert.equal(Matrix.requirementCount, 60);
    assert.equal(matches.length, 60);
    assert.equal(Matrix.requirements.length, 60);

    Matrix.requirements.forEach(function (requirement, index) {
        assert.equal(requirement.number, index + 1);
        assert.equal(Number(matches[index][1]), requirement.number);
        assert.ok(["direct", "workflow", "manual"].includes(requirement.coverage));
        assert.ok(requirement.evidence.length > 0);
        assert.equal(seen[requirement.number], undefined);
        seen[requirement.number] = true;

        requirement.evidence.forEach(function (reference) {
            if (/^MT-[0-9]+$/.test(reference)) {
                assert.match(manualQueue, new RegExp("^## " + reference + "$", "m"));
                assert.match(
                    manualQueue.slice(manualQueue.indexOf("## " + reference + "\n")),
                    /Exact version\/tag\/artifact under test:|Exact route\/page:/
                );
                return;
            }

            const parts = reference.split("#");
            const content = read(parts[0]);
            assert.ok(parts.length === 2 && parts[1].length > 0, reference);
            assert.ok(content.indexOf(parts[1]) !== -1, reference);
        });
    });
    assert.equal(Object.keys(seen).length, 60);
});


test("Batch H verändert keine Runtime-, Credential- oder Home-Assistant-Writefläche", function () {
    const workflow = read(".github/workflows/release.yml");
    const gate = read("release/check-stable-gate.js");

    assert.doesNotMatch(workflow, /HA_TOKEN|SUPERVISOR_TOKEN|ADMIN_TOKEN/);
    assert.doesNotMatch(workflow, /secrets\.[A-Za-z_]+/);
    assert.doesNotMatch(gate, /axios|https?:\/\/|child_process|exec|spawn/);
    assert.doesNotMatch(gate, /src\/public|src\/routes|Home Assistant service/);
});
