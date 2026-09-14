"use strict";

const childProcess = require("node:child_process");
const path = require("node:path");

const VERSION_TAG_PATTERN = /^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-rc\.([1-9][0-9]*))?$/;
const RELEASE_RELEVANT_PATHS = [
    ".dockerignore",
    ".env.example",
    ".github/workflows/release.yml",
    ".github/workflows/test.yml",
    "CHANGELOG.md",
    "LICENSE",
    "deploy",
    "ha_legacy_dashboard",
    "package-lock.json",
    "package.json",
    "release",
    "repository.yaml",
    "src"
];


function runGit(root, argumentsList) {
    return childProcess.execFileSync(
        "git",
        argumentsList,
        {
            cwd: root,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
        }
    ).trim();
}


function resolveCommit(root, revision) {
    try {
        return runGit(root, ["rev-parse", revision + "^{commit}"]);
    } catch (error) {
        return null;
    }
}


function listVersionTags(root, head) {
    const output = runGit(root, [
        "tag",
        "--merged",
        head,
        "--list",
        "v*",
        "--sort=-version:refname"
    ]);

    if (!output) {
        return [];
    }
    return output.split(/\r?\n/).filter(function (tag) {
        return VERSION_TAG_PATTERN.test(tag);
    });
}


function changedReleasePaths(root, fromCommit, toCommit) {
    const argumentsList = [
        "diff",
        "--name-only",
        fromCommit + ".." + toCommit,
        "--"
    ].concat(RELEASE_RELEVANT_PATHS);
    const output = runGit(root, argumentsList);

    return output ? output.split(/\r?\n/).filter(Boolean) : [];
}


function compareVersionTags(left, right) {
    const leftMatch = left.match(VERSION_TAG_PATTERN);
    const rightMatch = right.match(VERSION_TAG_PATTERN);
    const componentIndexes = [1, 2, 3];

    if (!leftMatch || !rightMatch) {
        throw new Error("Release source mismatch: invalid version tag comparison");
    }
    for (let index = 0; index < componentIndexes.length; index += 1) {
        const component = componentIndexes[index];
        const difference = Number(leftMatch[component]) -
            Number(rightMatch[component]);

        if (difference !== 0) {
            return difference;
        }
    }
    if (!leftMatch[4] && rightMatch[4]) {
        return 1;
    }
    if (leftMatch[4] && !rightMatch[4]) {
        return -1;
    }
    return Number(leftMatch[4] || 0) - Number(rightMatch[4] || 0);
}


function inspect(root, version, requestedTag) {
    const repositoryRoot = path.resolve(root);
    const head = resolveCommit(repositoryRoot, "HEAD");
    const expectedTag = "v" + version;

    if (!head) {
        throw new Error("Release source check requires a Git worktree");
    }
    const expectedTagCommit = resolveCommit(repositoryRoot, expectedTag);
    const tags = listVersionTags(repositoryRoot, head);
    const previousTag = tags.filter(function (tag) {
        return tag !== expectedTag;
    })[0] || null;
    let changedPaths = [];
    if (requestedTag) {
        if (requestedTag !== expectedTag) {
            throw new Error(
                "Release source mismatch: requested tag " + requestedTag +
                " must be " + expectedTag
            );
        }
        if (!expectedTagCommit) {
            throw new Error(
                "Release source mismatch: tag " + expectedTag +
                " does not resolve"
            );
        }
        if (expectedTagCommit !== head) {
            throw new Error(
                "Release source mismatch: tag " + expectedTag +
                " resolves to " + expectedTagCommit +
                " but HEAD is " + head
            );
        }
    }

    if (expectedTagCommit && expectedTagCommit !== head) {
        changedPaths = changedReleasePaths(
            repositoryRoot,
            expectedTagCommit,
            head
        );
    }

    return {
        version: version,
        expectedTag: expectedTag,
        head: head,
        expectedTagCommit: expectedTagCommit,
        previousTag: previousTag,
        changedPaths: changedPaths,
        sourceDrift: changedPaths.length > 0
    };
}


function assertReleaseSource(root, version, requestedTag) {
    const result = inspect(root, version, requestedTag);

    if (!result.expectedTagCommit && result.previousTag &&
        compareVersionTags(result.expectedTag, result.previousTag) <= 0) {
        throw new Error(
            "Release source mismatch: new version " + result.expectedTag +
            " must be greater than previous tag " + result.previousTag
        );
    }
    if (!requestedTag && result.sourceDrift) {
        throw new Error(
            "Release source mismatch: " + result.expectedTag +
            " is already bound to " + result.expectedTagCommit +
            ", but release-relevant files changed at " + result.head +
            ". Assign a new version before publishing. Changed paths: " +
            result.changedPaths.join(", ")
        );
    }
    return result;
}


module.exports = {
    RELEASE_RELEVANT_PATHS: RELEASE_RELEVANT_PATHS.slice(),
    assertReleaseSource: assertReleaseSource,
    compareVersionTags: compareVersionTags,
    inspect: inspect
};
