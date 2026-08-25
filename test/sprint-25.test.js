"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const DashboardConfig = require("../src/config/dashboard");
const Bundle = require("../release/create-standalone-bundle");
const Manifest = require("../release/validate-manifest");
const VersionCheck = require("../release/check-version");

const ROOT = path.join(__dirname, "..");


function readProjectFile(fileName) {
    return fs.readFileSync(path.join(ROOT, fileName), "utf8");
}


function sha256(fileName) {
    return crypto.createHash("sha256")
        .update(fs.readFileSync(fileName))
        .digest("hex");
}


function verifyPersistentUpgrade(configPath) {
    DashboardConfig.initialize({configPath: configPath});
    const configured = DashboardConfig.getConfiguration();

    configured.systemDashboards.summary.ignoredEntities = [
        "sensor.release_test"
    ];
    configured.systemDashboards.summary.showMediaTitles = true;
    configured.systemDashboards.errors.securityEntities = [
        "binary_sensor.release_test"
    ];
    configured.systemDashboards.errors.ignoredEntities = [
        "sensor.release_ignored"
    ];
    configured.systemDashboards.errors.criticalDetectionMode = "ha_label";
    configured.systemDashboards.errors.criticalLabelId = "release_test";
    configured.systemDashboards.errors.rules.defaults.unknownGraceMs = 1234;
    configured.systemDashboards.errors.rules.entities[
        "sensor.release_test"
    ] = {
        expectedOffline: true
    };

    DashboardConfig.replaceConfiguration(configured);
    const beforeUpgrade = fs.readFileSync(configPath, "utf8");

    DashboardConfig.initialize({configPath: configPath});
    const afterUpgrade = fs.readFileSync(configPath, "utf8");
    const reloaded = DashboardConfig.getConfiguration();

    assert.equal(afterUpgrade, beforeUpgrade);
    assert.deepEqual(
        reloaded.systemDashboards.summary.ignoredEntities,
        ["sensor.release_test"]
    );
    assert.equal(
        reloaded.systemDashboards.summary.showMediaTitles,
        true
    );
    assert.deepEqual(
        reloaded.systemDashboards.errors.securityEntities,
        ["binary_sensor.release_test"]
    );
    assert.equal(
        reloaded.systemDashboards.errors.criticalDetectionMode,
        "ha_label"
    );
    assert.equal(
        reloaded.systemDashboards.errors.criticalLabelId,
        "release_test"
    );
    assert.equal(
        reloaded.systemDashboards.errors.rules.defaults.unknownGraceMs,
        1234
    );
    assert.equal(
        reloaded.systemDashboards.errors.rules.entities[
            "sensor.release_test"
        ].expectedOffline,
        true
    );
}


test("Release-Version ist in Tag, Paket, App, Metadaten und Changelogs konsistent", function (t) {
    const release = VersionCheck.validate(ROOT, "v1.0.0-rc.1");
    const fixture = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-release-version-")
    );

    t.after(function () {
        fs.rmSync(fixture, {recursive: true, force: true});
    });

    [
        "package.json",
        "package-lock.json",
        "CHANGELOG.md",
        "ha_legacy_dashboard/config.yaml",
        "ha_legacy_dashboard/CHANGELOG.md",
        "release/metadata.json",
        "release/notes/1.0.0-rc.1.md"
    ].forEach(function (fileName) {
        const target = path.join(fixture, fileName);
        fs.mkdirSync(path.dirname(target), {recursive: true});
        fs.copyFileSync(path.join(ROOT, fileName), target);
    });

    assert.equal(release.version, "1.0.0-rc.1");
    assert.equal(release.channel, "release-candidate");
    assert.equal(release.stable, false);
    assert.throws(function () {
        VersionCheck.validate(ROOT, "v1.0.0");
    }, /Git tag/);
    fs.writeFileSync(
        path.join(fixture, "ha_legacy_dashboard/config.yaml"),
        readProjectFile("ha_legacy_dashboard/config.yaml")
            .replace("1.0.0-rc.1", "1.0.0"),
        "utf8"
    );
    assert.throws(function () {
        VersionCheck.validate(fixture, "v1.0.0-rc.1");
    }, /App version differs/);
});


test("Home Assistant App verwendet das generische GHCR-Multi-Arch-Image", function () {
    const config = readProjectFile("ha_legacy_dashboard/config.yaml");
    const dockerfile = readProjectFile("ha_legacy_dashboard/Dockerfile");

    assert.match(
        config,
        /^image: "ghcr\.io\/tekky85\/ha-legacy-dashboard"$/m
    );
    assert.match(config, /^  - amd64$/m);
    assert.match(config, /^  - aarch64$/m);
    assert.equal(
        fs.existsSync(path.join(
            ROOT,
            "ha_legacy_dashboard/build.yaml"
        )),
        false
    );
    assert.match(dockerfile, /npm ci --omit=dev/);
    assert.match(dockerfile, /org\.opencontainers\.image\.version/);
    assert.match(dockerfile, /org\.opencontainers\.image\.revision/);
    assert.doesNotMatch(dockerfile, /COPY\s+\.\s+\./);
});


test("CI und Release trennen Builds, Manifest, Smoke Test und latest atomar", function () {
    const ci = readProjectFile(".github/workflows/test.yml");
    const workflow = readProjectFile(".github/workflows/release.yml");

    assert.match(ci, /docker\/setup-buildx-action@v3/);
    assert.match(ci, /platforms: linux\/amd64,linux\/arm64/);
    assert.match(workflow, /docker_arch: amd64/);
    assert.match(workflow, /docker_arch: arm64/);
    assert.match(workflow, /needs:[\s\S]*build-images/);
    assert.match(workflow, /imagetools create/);
    assert.match(workflow, /release\/validate-manifest\.js/);
    assert.match(workflow, /release\/smoke-container\.sh/);
    assert.doesNotMatch(
        ci + workflow,
        /home-assistant\/builder|build\.yaml/
    );
    assert.match(
        workflow,
        /Publish latest only after stable validation[\s\S]*stable == 'true'/
    );
    assert.match(workflow, /password: \$\{\{ github\.token \}\}/);
    assert.doesNotMatch(workflow, /secrets\.[A-Za-z_]+/);
    assert.doesNotMatch(workflow, /HA_TOKEN|homeassistant\.local|192\.168\./);
});


test("Multi-Arch-Manifestprüfung verlangt amd64 und arm64", function () {
    assert.deepEqual(
        Manifest.validateManifest({
            manifests: [
                {platform: {architecture: "amd64", os: "linux"}},
                {platform: {architecture: "arm64", os: "linux"}}
            ]
        }),
        ["amd64", "arm64"]
    );
    assert.throws(function () {
        Manifest.validateManifest({
            manifests: [
                {platform: {architecture: "amd64", os: "linux"}}
            ]
        });
    }, /arm64/);
});


test("Standalone-Bundle ist reproduzierbar, vollständig und secret-frei", function (t) {
    const firstDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-release-first-")
    );
    const secondDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-release-second-")
    );

    t.after(function () {
        fs.rmSync(firstDirectory, {recursive: true, force: true});
        fs.rmSync(secondDirectory, {recursive: true, force: true});
    });

    const first = Bundle.createBundle(firstDirectory);
    const second = Bundle.createBundle(secondDirectory);
    const entries = childProcess.execFileSync(
        "tar",
        ["-tzf", first.archivePath]
    ).toString("utf8").trim().split(/\r?\n/);

    assert.equal(sha256(first.archivePath), sha256(second.archivePath));
    assert.match(
        fs.readFileSync(first.checksumPath, "utf8"),
        new RegExp("^" + first.digest + "  ha-legacy-dashboard-")
    );
    assert.ok(entries.some(function (entry) {
        return /\/src\/server\.js$/.test(entry);
    }));
    assert.ok(entries.some(function (entry) {
        return /\/VERSION$/.test(entry);
    }));
    [
        /(^|\/)\.env$/,
        /\/node_modules\//,
        /\/test\//,
        /\/\.git\//,
        /\/data\//,
        /\.pem$/,
        /\.key$/
    ].forEach(function (forbidden) {
        assert.equal(
            entries.some(function (entry) {
                return forbidden.test(entry);
            }),
            false,
            "Unexpected release entry: " + String(forbidden)
        );
    });
});


test("Standalone- und App-Daten bleiben über ein Release-Upgrade erhalten", function (t) {
    const root = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-release-upgrade-")
    );
    t.after(function () {
        fs.rmSync(root, {recursive: true, force: true});
    });

    const standalonePath = path.join(
        root,
        "standalone",
        "data",
        "dashboards.json"
    );
    const appDataPath = path.join(
        root,
        "app-data",
        "dashboards.json"
    );

    verifyPersistentUpgrade(standalonePath);
    verifyPersistentUpgrade(appDataPath);
});


test("Release-Quellen enthalten keine Credentials oder privaten Schlüssel", function () {
    const findings = require("../release/secret-scan").scan(ROOT);
    const dockerIgnore = readProjectFile(".dockerignore");

    assert.deepEqual(findings, []);
    assert.match(dockerIgnore, /^\.env$/m);
    assert.match(dockerIgnore, /^\*\.pem$/m);
    assert.match(dockerIgnore, /^\*\.key$/m);
    assert.doesNotMatch(
        readProjectFile("release/mock-home-assistant.js"),
        /eyJ[A-Za-z0-9._-]{20,}/
    );
});
