"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SEMVER_PATTERN =
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;


function readJson(root, fileName) {
    return JSON.parse(fs.readFileSync(
        path.join(root, fileName),
        "utf8"
    ));
}


function readText(root, fileName) {
    return fs.readFileSync(
        path.join(root, fileName),
        "utf8"
    );
}


function fail(message) {
    throw new Error("Release version mismatch: " + message);
}


function headingContainsVersion(content, version) {
    return content.split(/\r?\n/).some(function (line) {
        return line === "## " + version ||
            line.indexOf("## " + version + " ") === 0;
    });
}


function validate(root, requestedTag) {
    const packageConfiguration = readJson(root, "package.json");
    const lock = readJson(root, "package-lock.json");
    const metadata = readJson(root, "release/metadata.json");
    const appConfiguration = readText(
        root,
        "ha_legacy_dashboard/config.yaml"
    );
    const appVersionMatch = appConfiguration.match(
        /^version:\s*["']([^"']+)["']\s*$/m
    );
    const imageMatch = appConfiguration.match(
        /^image:\s*["']([^"']+)["']\s*$/m
    );
    const version = packageConfiguration.version;
    const expectedChannel = version.indexOf("-") === -1
        ? "stable"
        : "release-candidate";
    const expectedTag = "v" + version;

    if (!SEMVER_PATTERN.test(version)) {
        fail("package.json is not valid SemVer");
    }
    if (version.indexOf("-") !== -1 && !/-rc\.[1-9][0-9]*$/.test(version)) {
        fail("prereleases must use the -rc.N form");
    }
    if (lock.version !== version) {
        fail("package-lock.json root version differs");
    }
    if (!lock.packages || !lock.packages[""] ||
        lock.packages[""].version !== version) {
        fail("package-lock.json package version differs");
    }
    if (!appVersionMatch || appVersionMatch[1] !== version) {
        fail("Home Assistant App version differs");
    }
    if (metadata.version !== version) {
        fail("release metadata version differs");
    }
    if (metadata.channel !== expectedChannel) {
        fail("release channel does not match the SemVer prerelease state");
    }
    if (!imageMatch || imageMatch[1] !== metadata.image) {
        fail("App image differs from release metadata");
    }
    if (metadata.image !== "ghcr.io/tekky85/ha-legacy-dashboard") {
        fail("unexpected public image name");
    }
    if (metadata.standaloneArtifact !==
        "ha-legacy-dashboard-" + version + ".tar.gz") {
        fail("standalone artifact name differs");
    }
    if (metadata.releaseNotes !==
        "release/notes/" + version + ".md") {
        fail("release notes path differs");
    }
    if (!fs.existsSync(path.join(root, metadata.releaseNotes))) {
        fail("release notes file is missing");
    }
    if (!headingContainsVersion(
        readText(root, "CHANGELOG.md"),
        version
    )) {
        fail("root changelog heading is missing");
    }
    if (!headingContainsVersion(
        readText(root, "ha_legacy_dashboard/CHANGELOG.md"),
        version
    )) {
        fail("App changelog heading is missing");
    }
    if (requestedTag && requestedTag !== expectedTag) {
        fail("Git tag " + requestedTag + " must be " + expectedTag);
    }

    return {
        version: version,
        tag: expectedTag,
        channel: expectedChannel,
        stable: expectedChannel === "stable",
        image: metadata.image,
        standaloneArtifact: metadata.standaloneArtifact,
        releaseNotes: metadata.releaseNotes
    };
}


function argumentValue(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? null : process.argv[index + 1];
}


function appendGitHubOutput(fileName, result) {
    const values = [
        "version=" + result.version,
        "tag=" + result.tag,
        "channel=" + result.channel,
        "stable=" + (result.stable ? "true" : "false"),
        "image=" + result.image,
        "standalone_artifact=" + result.standaloneArtifact,
        "release_notes=" + result.releaseNotes
    ];
    fs.appendFileSync(fileName, values.join("\n") + "\n");
}


if (require.main === module) {
    try {
        const result = validate(
            ROOT,
            argumentValue("--tag") || process.env.RELEASE_TAG || null
        );
        const outputFile = argumentValue("--github-output");

        if (outputFile) {
            appendGitHubOutput(outputFile, result);
        }
        process.stdout.write(
            "Release version check passed: " + result.tag + "\n"
        );
    } catch (error) {
        process.stderr.write(error.message + "\n");
        process.exitCode = 1;
    }
}


module.exports = {
    SEMVER_PATTERN: SEMVER_PATTERN,
    validate: validate
};
