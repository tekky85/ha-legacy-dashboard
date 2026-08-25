"use strict";

const fs = require("node:fs");


function validateManifest(manifest) {
    if (!manifest || !Array.isArray(manifest.manifests)) {
        throw new Error("Multi-architecture manifest list is missing");
    }

    const platforms = manifest.manifests.map(function (entry) {
        return entry && entry.platform
            ? entry.platform.os + "/" + entry.platform.architecture
            : null;
    }).filter(Boolean);

    ["amd64", "arm64"].forEach(function (architecture) {
        if (platforms.indexOf("linux/" + architecture) === -1) {
            throw new Error(
                "Manifest is missing linux/" + architecture
            );
        }
    });
    return platforms.map(function (platform) {
        return platform.split("/")[1];
    });
}


if (require.main === module) {
    try {
        const input = process.argv[2]
            ? fs.readFileSync(process.argv[2], "utf8")
            : fs.readFileSync(0, "utf8");
        const architectures = validateManifest(JSON.parse(input));
        process.stdout.write(
            "Manifest platforms: " + architectures.join(", ") + "\n"
        );
    } catch (error) {
        process.stderr.write(error.message + "\n");
        process.exitCode = 1;
    }
}


module.exports = {
    validateManifest: validateManifest
};
