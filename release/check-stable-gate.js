"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const STABLE_VERSION = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
const RC_VERSION = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)-rc\.[1-9][0-9]*$/;
const COMMIT = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const IMAGE_DIGEST = /^sha256:[0-9a-f]{64}$/;
const MANUAL_RESULT = /^(PASS|FAIL|BLOCKED|NOT TESTED)$/;


function readJson(fileName) {
    return JSON.parse(fs.readFileSync(fileName, "utf8"));
}


function sha256(fileName) {
    return crypto.createHash("sha256")
        .update(fs.readFileSync(fileName))
        .digest("hex");
}


function fail(message) {
    throw new Error("Stable release gate failed: " + message);
}


function markdownCells(line) {
    return line.split("|").slice(1, -1).map(function (cell) {
        return cell.trim();
    });
}


function manualResults(content) {
    const results = Object.create(null);

    content.split(/\r?\n/).forEach(function (line) {
        const cells = markdownCells(line);
        const id = cells[0] || "";
        const result = cells[cells.length - 1] || "";

        if (
            cells.length >= 6 &&
            /^MT-[0-9]+$/.test(id) &&
            MANUAL_RESULT.test(result)
        ) {
            if (results[id]) {
                fail("duplicate manual result row for " + id);
            }
            results[id] = result;
        }
    });
    return results;
}


function openBlockingRepairs(content, priorities) {
    const repairs = [];
    const known = Object.create(null);

    content.split(/\r?\n/).forEach(function (line) {
        const cells = markdownCells(line);
        const id = cells[0] || "";
        const priority = cells[4] || "";
        const status = cells[8] || "";

        if (
            cells.length >= 9 &&
            /^RQ-[0-9]+-[0-9]+$/.test(id) &&
            /^P[0-3]$/.test(priority)
        ) {
            if (known[id]) {
                fail("duplicate canonical repair row for " + id);
            }
            known[id] = true;
            if (
                priorities.indexOf(priority) !== -1 &&
                status.toLowerCase() === "offen"
            ) {
                repairs.push({id: id, priority: priority});
            }
        }
    });

    if (Object.keys(known).length === 0) {
        fail("canonical repair queue could not be parsed");
    }
    return repairs;
}


function validateApproval(approval, version, requiredTests) {
    const candidate = approval.releaseCandidate || {};
    const tests = approval.manualTests || {};
    const seen = Object.create(null);

    if (approval.schemaVersion !== 1) {
        fail("approval schema version must be 1");
    }
    if (approval.version !== version) {
        fail("approval version must match the stable version");
    }
    if (
        typeof approval.approvedBy !== "string" ||
        approval.approvedBy.trim().length < 2 ||
        approval.approvedBy.length > 100
    ) {
        fail("approvedBy is missing or invalid");
    }
    if (
        typeof approval.approvedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(approval.approvedAt) ||
        !Number.isFinite(Date.parse(approval.approvedAt))
    ) {
        fail("approvedAt must be a valid UTC timestamp");
    }
    if (!RC_VERSION.test(candidate.version || "")) {
        fail("approved release candidate version is invalid");
    }
    if (candidate.tag !== "v" + candidate.version) {
        fail("approved release candidate tag is invalid");
    }
    if (!COMMIT.test(candidate.commit || "")) {
        fail("approved release candidate commit is invalid");
    }
    if (!IMAGE_DIGEST.test(candidate.imageDigest || "")) {
        fail("approved release candidate image digest is invalid");
    }
    if (
        candidate.standaloneArtifact !==
        "ha-legacy-dashboard-" + candidate.version + ".tar.gz"
    ) {
        fail("approved standalone artifact name is invalid");
    }
    if (!SHA256.test(candidate.standaloneSha256 || "")) {
        fail("approved standalone checksum is invalid");
    }

    Object.keys(tests).forEach(function (id) {
        if (seen[id]) {
            fail("duplicate approval test " + id);
        }
        seen[id] = true;
    });

    requiredTests.forEach(function (id) {
        const entry = tests[id];

        if (!entry || entry.result !== "PASS") {
            fail(id + " is not approved as PASS");
        }
        if (
            typeof entry.evidence !== "string" ||
            entry.evidence.trim().length < 4 ||
            entry.evidence.length > 500
        ) {
            fail(id + " has no usable evidence reference");
        }
    });
}


function validate(options) {
    const root = options.root || ROOT;
    const version = options.version;
    const tag = options.tag;
    const commit = options.commit;
    const policyPath = path.join(root, "release/stable-gate-policy.json");
    const policy = readJson(policyPath);
    const approvalRelative = "release/approvals/" + version + ".json";
    const approvalPath = path.join(root, approvalRelative);
    const manualPath = path.join(root, "docs/audits/MANUAL_TEST_QUEUE.md");
    const repairPath = path.join(root, "docs/audits/REPAIR_QUEUE.md");
    const metadata = readJson(path.join(root, "release/metadata.json"));
    let approval;
    let recordedResults;
    let blockers;

    if (!STABLE_VERSION.test(version || "")) {
        fail("version must be stable SemVer without a prerelease suffix");
    }
    if (tag !== "v" + version) {
        fail("tag must match the stable version");
    }
    if (!COMMIT.test(commit || "")) {
        fail("workflow commit must be a full lowercase Git SHA");
    }
    if (
        policy.schemaVersion !== 1 ||
        policy.protectedEnvironment !== "stable-release" ||
        !Array.isArray(policy.blockingRepairPriorities) ||
        !Array.isArray(policy.requiredManualTests) ||
        policy.requiredManualTests.length === 0
    ) {
        fail("stable gate policy is invalid");
    }
    if (!fs.existsSync(approvalPath)) {
        fail("versioned approval is missing: " + approvalRelative);
    }

    approval = readJson(approvalPath);
    validateApproval(approval, version, policy.requiredManualTests);
    recordedResults = manualResults(fs.readFileSync(manualPath, "utf8"));
    policy.requiredManualTests.forEach(function (id) {
        if (recordedResults[id] !== "PASS") {
            fail(id + " is not recorded as PASS in the manual test queue");
        }
    });

    blockers = openBlockingRepairs(
        fs.readFileSync(repairPath, "utf8"),
        policy.blockingRepairPriorities
    );
    if (blockers.length > 0) {
        fail("open P0/P1 repairs: " + blockers.map(function (repair) {
            return repair.id;
        }).join(", "));
    }
    if (
        metadata.version !== version ||
        metadata.channel !== "stable"
    ) {
        fail("release metadata is not the requested stable version");
    }

    return {
        schemaVersion: 1,
        status: "PASS",
        version: version,
        tag: tag,
        commit: commit,
        protectedEnvironment: policy.protectedEnvironment,
        approvalDocument: approvalRelative,
        approvalSha256: sha256(approvalPath),
        releaseCandidate: approval.releaseCandidate,
        stableArtifacts: {
            image: metadata.image + ":" + version,
            standaloneArtifact: metadata.standaloneArtifact
        },
        requiredManualTests: policy.requiredManualTests.map(function (id) {
            return {
                id: id,
                result: recordedResults[id],
                evidence: approval.manualTests[id].evidence
            };
        }),
        repairGate: {
            blockingPriorities: policy.blockingRepairPriorities,
            openRepairs: []
        }
    };
}


function argumentValue(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? null : process.argv[index + 1];
}


if (require.main === module) {
    try {
        const result = validate({
            root: ROOT,
            version: argumentValue("--version"),
            tag: argumentValue("--tag"),
            commit: argumentValue("--commit")
        });
        const outputFile = argumentValue("--output");
        const output = JSON.stringify(result, null, 2) + "\n";

        if (outputFile) {
            fs.writeFileSync(outputFile, output, {mode: 0o600});
        } else {
            process.stdout.write(output);
        }
    } catch (error) {
        process.stderr.write(error.message + "\n");
        process.exitCode = 1;
    }
}


module.exports = {
    manualResults: manualResults,
    openBlockingRepairs: openBlockingRepairs,
    validate: validate
};
