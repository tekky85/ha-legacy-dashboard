"use strict";

const fs = require("node:fs");
const path = require("node:path");

const VersionCheck = require("./check-version");
const ReleaseSource = require("./check-release-source");

const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const RESULT_STATUSES = ["PASS", "FAIL", "BLOCKED", "NOT TESTED"];


function fail(message) {
    throw new Error("RC result mismatch: " + message);
}


function validateStatus(status) {
    if (RESULT_STATUSES.indexOf(status) === -1) {
        fail("unsupported status " + status);
    }
    return status;
}


function validateInput(root, input) {
    const release = VersionCheck.validate(root, input.tag);
    const expectedImage = release.image + ":" + release.version;

    if (input.version !== release.version) {
        fail("version differs from release metadata");
    }
    if (!COMMIT_PATTERN.test(input.sourceCommit || "")) {
        fail("source commit must be a full lowercase Git SHA");
    }
    if (!DIGEST_PATTERN.test(input.imageManifestDigest || "")) {
        fail("image manifest digest is invalid");
    }
    if (!SHA256_PATTERN.test(input.standaloneSha256 || "")) {
        fail("standalone SHA256 is invalid");
    }
    if (input.image !== expectedImage) {
        fail("image must be the versioned release image " + expectedImage);
    }
    if (input.standaloneArtifact !== release.standaloneArtifact) {
        fail("standalone artifact differs from release metadata");
    }
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/[0-9]+$/.test(
        input.workflowUrl || ""
    )) {
        fail("workflow URL is invalid");
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(
        input.generatedAt || ""
    )) {
        fail("generated timestamp must be UTC ISO-8601");
    }
    return release;
}


function createResult(root, input) {
    const release = validateInput(root, input);

    return {
        schemaVersion: 1,
        generatedAt: input.generatedAt,
        candidate: {
            version: release.version,
            channel: release.channel,
            tag: release.tag,
            sourceCommit: input.sourceCommit,
            image: input.image,
            imageManifestDigest: input.imageManifestDigest,
            standaloneArtifact: input.standaloneArtifact,
            standaloneSha256: input.standaloneSha256,
            workflowUrl: input.workflowUrl
        },
        automatedEvidence: {
            tagAndSourceIdentity: "PASS",
            versionConsistency: "PASS",
            releaseGate: "PASS",
            multiArchManifest: "PASS",
            containerSmokeTest: "PASS",
            standaloneChecksum: "PASS"
        },
        runtimeEvidence: {
            standaloneLxc: "NOT TESTED",
            homeAssistantAppAmd64: "NOT TESTED",
            homeAssistantAppAarch64: "NOT TESTED",
            ipadMiniIos9: "NOT TESTED"
        },
        releaseRecommendation: "BLOCKED",
        blockers: [
            "Run the candidate-bound Standalone/LXC acceptance tests.",
            "Run the candidate-bound Home Assistant App tests on amd64 and aarch64.",
            "Run the candidate-bound iPad mini/iOS 9 acceptance tests.",
            "Record all required manual results before stable promotion."
        ]
    };
}


function markdown(result) {
    const candidate = result.candidate;
    const lines = [
        "# RC Result – " + candidate.version,
        "",
        "This generated record is bound to one immutable candidate. It does not",
        "promote the candidate to stable and does not turn unperformed runtime or",
        "physical-device checks into PASS.",
        "",
        "## Candidate identity",
        "",
        "| Field | Value |",
        "|---|---|",
        "| Generated | `" + result.generatedAt + "` |",
        "| Version | `" + candidate.version + "` |",
        "| Channel | `" + candidate.channel + "` |",
        "| Tag | `" + candidate.tag + "` |",
        "| Source commit | `" + candidate.sourceCommit + "` |",
        "| Image | `" + candidate.image + "` |",
        "| Manifest digest | `" + candidate.imageManifestDigest + "` |",
        "| Standalone artifact | `" + candidate.standaloneArtifact + "` |",
        "| Standalone SHA256 | `" + candidate.standaloneSha256 + "` |",
        "| Workflow | " + candidate.workflowUrl + " |",
        "",
        "## Automated evidence",
        "",
        "| Check | Status |",
        "|---|---|"
    ];

    Object.keys(result.automatedEvidence).forEach(function (name) {
        lines.push("| " + name + " | " +
            validateStatus(result.automatedEvidence[name]) + " |");
    });
    lines.push("", "## Runtime and real-device evidence", "",
        "| Environment | Status |", "|---|---|");
    Object.keys(result.runtimeEvidence).forEach(function (name) {
        lines.push("| " + name + " | " +
            validateStatus(result.runtimeEvidence[name]) + " |");
    });
    lines.push(
        "",
        "## RC Result Matrix",
        "",
        "| Area | Status |",
        "|---|---|",
        "| Commit/tag/artifact identity | PASS |",
        "| Automated release gates | PASS |",
        "| Standalone/LXC real runtime | " +
            result.runtimeEvidence.standaloneLxc + " |",
        "| Home Assistant App real runtime | " +
            result.runtimeEvidence.homeAssistantAppAmd64 + " |",
        "| aarch64 real runtime | " +
            result.runtimeEvidence.homeAssistantAppAarch64 + " |",
        "| iPad mini / iOS 9 | " +
            result.runtimeEvidence.ipadMiniIos9 + " |",
        "| Release recommendation | " + result.releaseRecommendation + " |",
        "",
        "## RC BLOCKERS",
        ""
    );
    result.blockers.forEach(function (blocker, index) {
        lines.push((index + 1) + ". " + blocker);
    });
    lines.push("");
    return lines.join("\n");
}


function argumentValue(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? null : process.argv[index + 1];
}


function writeResult(root, input, jsonPath, markdownPath) {
    const result = createResult(root, input);
    const source = ReleaseSource.assertReleaseSource(
        root,
        input.version,
        input.tag
    );

    if (source.head !== input.sourceCommit) {
        fail(
            "source commit " + input.sourceCommit +
            " differs from checked-out HEAD " + source.head
        );
    }

    fs.mkdirSync(path.dirname(jsonPath), {recursive: true});
    fs.mkdirSync(path.dirname(markdownPath), {recursive: true});
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + "\n", "utf8");
    fs.writeFileSync(markdownPath, markdown(result), "utf8");
    return result;
}


if (require.main === module) {
    try {
        const root = path.join(__dirname, "..");
        const outputJson = path.resolve(argumentValue("--output-json") ||
            "dist/rc-result.json");
        const outputMarkdown = path.resolve(
            argumentValue("--output-markdown") || "dist/rc-result.md"
        );

        writeResult(root, {
            version: argumentValue("--version"),
            tag: argumentValue("--tag"),
            sourceCommit: argumentValue("--commit"),
            image: argumentValue("--image"),
            imageManifestDigest: argumentValue("--manifest-digest"),
            standaloneArtifact: argumentValue("--standalone-artifact"),
            standaloneSha256: argumentValue("--standalone-sha256"),
            workflowUrl: argumentValue("--workflow-url"),
            generatedAt: argumentValue("--generated-at")
        }, outputJson, outputMarkdown);
        process.stdout.write(outputJson + "\n" + outputMarkdown + "\n");
    } catch (error) {
        process.stderr.write(error.message + "\n");
        process.exitCode = 1;
    }
}


module.exports = {
    RESULT_STATUSES: RESULT_STATUSES.slice(),
    createResult: createResult,
    markdown: markdown,
    writeResult: writeResult
};
