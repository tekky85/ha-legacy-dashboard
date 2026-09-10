"use strict";

const fs = require("node:fs");
const path = require("node:path");

const action = process.argv[2];
const dataDirectory = path.resolve(process.argv[3]);
const sourcePath = path.join(__dirname, "dashboards.json");
const configPath = path.join(dataDirectory, "dashboards.json");

if (action === "initialize") {
    fs.mkdirSync(path.join(dataDirectory, "backgrounds"), {
        recursive: true,
        mode: 0o700
    });
    fs.copyFileSync(sourcePath, configPath);
    fs.chmodSync(configPath, 0o600);
    fs.writeFileSync(
        path.join(dataDirectory, "backgrounds", "release-fixture.jpg"),
        "release-fixture-background",
        {mode: 0o600}
    );
} else if (action === "verify") {
    const configuration = JSON.parse(
        fs.readFileSync(configPath, "utf8")
    );

    if (
        configuration.schemaVersion !== 4 ||
        configuration.defaultDashboardId !== "legacy" ||
        configuration.dashboards[0].title !== "Release 0.9 Fixture"
    ) {
        throw new Error("Release 0.9 fixture state is incompatible");
    }
} else {
    throw new Error("Unknown fixture action");
}
