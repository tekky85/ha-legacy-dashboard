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
const CURRENT_VERSION = require("../package.json").version;
const PREVIOUS_RELEASE_RUNTIME = path.join(
    ROOT,
    "test",
    "fixtures",
    "releases",
    "0.9.0",
    "runtime.js"
);


function readProjectFile(fileName) {
    return fs.readFileSync(path.join(ROOT, fileName), "utf8");
}


function sha256(fileName) {
    return crypto.createHash("sha256")
        .update(fs.readFileSync(fileName))
        .digest("hex");
}


function extractBundle(bundle, directory) {
    childProcess.execFileSync(
        "tar",
        ["-xzf", bundle.archivePath, "-C", directory]
    );
    return path.join(
        directory,
        "ha-legacy-dashboard-" +
            require("../package.json").version
    );
}


function currentReleaseProcess(releaseDirectory, dataDirectory, mode) {
    const source = [
        "const DashboardConfig = require('./src/config/dashboard');",
        "const result = DashboardConfig.initialize();",
        "const configured = DashboardConfig.getConfiguration();",
        "configured.systemDashboards.summary.ignoredEntities = ['sensor.release_test'];",
        "configured.systemDashboards.summary.showMediaTitles = true;",
        "configured.systemDashboards.errors.securityEntities = ['binary_sensor.release_test'];",
        "configured.systemDashboards.errors.ignoredEntities = ['sensor.release_ignored'];",
        "configured.systemDashboards.errors.criticalDetectionMode = 'ha_label';",
        "configured.systemDashboards.errors.criticalLabelId = 'release_test';",
        "configured.systemDashboards.errors.rules.defaults.unknownGraceMs = 1234;",
        "configured.systemDashboards.errors.rules.entities['sensor.release_test'] = {expectedOffline: true};",
        "DashboardConfig.replaceConfiguration(configured);",
        "process.stdout.write(JSON.stringify({migrated: result.migrated, configuration: DashboardConfig.getConfiguration()}));"
    ].join("\n");

    return JSON.parse(childProcess.execFileSync(
        process.execPath,
        ["-e", source],
        {
            cwd: releaseDirectory,
            env: Object.assign({}, process.env, {
                HA_RUNTIME_MODE: mode,
                DATA_DIR: dataDirectory
            })
        }
    ).toString("utf8"));
}


function verifyCrossVersionUpgrade(mode, root) {
    const dataDirectory = path.join(root, mode, "data");
    const rollbackDirectory = path.join(root, mode, "rollback-data");
    const extractedDirectory = path.join(root, mode, "current-release");
    const bundleDirectory = path.join(root, mode, "bundle");

    fs.mkdirSync(dataDirectory, {recursive: true});
    fs.mkdirSync(extractedDirectory, {recursive: true});
    fs.mkdirSync(bundleDirectory, {recursive: true});

    childProcess.execFileSync(
        process.execPath,
        [PREVIOUS_RELEASE_RUNTIME, "initialize", dataDirectory]
    );
    fs.cpSync(dataDirectory, rollbackDirectory, {recursive: true});

    const bundle = Bundle.createBundle(bundleDirectory);
    const releaseDirectory = extractBundle(bundle, extractedDirectory);
    const result = currentReleaseProcess(
        releaseDirectory,
        dataDirectory,
        mode === "home-assistant-app-data"
            ? "home_assistant_app"
            : "standalone"
    );

    assert.equal(result.migrated, true);
    assert.equal(result.configuration.schemaVersion, DashboardConfig.SCHEMA_VERSION);
    assert.equal(result.configuration.defaultDashboardId, "legacy");
    assert.equal(result.configuration.dashboards[0].title, "Release 0.9 Fixture");
    assert.deepEqual(
        result.configuration.systemDashboards.summary.ignoredEntities,
        ["sensor.release_test"]
    );
    assert.equal(
        result.configuration.systemDashboards.errors.rules.defaults.unknownGraceMs,
        1234
    );
    assert.equal(
        result.configuration.systemDashboards.errors.rules.entities[
            "sensor.release_test"
        ].expectedOffline,
        true
    );
    assert.equal(
        fs.readFileSync(
            path.join(dataDirectory, "backgrounds", "release-fixture.jpg"),
            "utf8"
        ),
        "release-fixture-background"
    );
    assert.equal(
        JSON.parse(fs.readFileSync(
            path.join(dataDirectory, "dashboards.json.bak"),
            "utf8"
        )).schemaVersion,
        12
    );

    childProcess.execFileSync(
        process.execPath,
        [PREVIOUS_RELEASE_RUNTIME, "verify", rollbackDirectory]
    );
}


test("Release-Version ist in Tag, Paket, App, Metadaten und Changelogs konsistent", function (t) {
    const release = VersionCheck.validate(ROOT, "v" + CURRENT_VERSION);
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
        "release/notes/" + CURRENT_VERSION + ".md",
        "src/admin/index.html",
        "src/public/system.html"
    ].forEach(function (fileName) {
        const target = path.join(fixture, fileName);
        fs.mkdirSync(path.dirname(target), {recursive: true});
        fs.copyFileSync(path.join(ROOT, fileName), target);
    });

    assert.equal(release.version, CURRENT_VERSION);
    assert.equal(release.channel, "release-candidate");
    assert.equal(release.stable, false);
    assert.throws(function () {
        VersionCheck.validate(ROOT, "v1.0.0");
    }, /Git tag/);
    fs.writeFileSync(
        path.join(fixture, "ha_legacy_dashboard/config.yaml"),
        readProjectFile("ha_legacy_dashboard/config.yaml")
            .replace(CURRENT_VERSION, "1.0.0"),
        "utf8"
    );
    assert.throws(function () {
        VersionCheck.validate(fixture, "v" + CURRENT_VERSION);
    }, /App version differs/);
});


test("Public-Test-Release ist als Prerelease gekennzeichnet und besitzt sichere Fehlerhinweise", function () {
    const workflow = readProjectFile(".github/workflows/release.yml");
    const notes = readProjectFile(
        "release/notes/" + CURRENT_VERSION + ".md"
    );
    const issueTemplate = readProjectFile(
        ".github/ISSUE_TEMPLATE/bug_report.yml"
    );

    assert.match(workflow, /--prerelease/);
    assert.match(workflow, /Public Test Release/);
    assert.match(notes, /not a final or stable release/i);
    assert.match(notes, /GitHub Issues/);
    assert.match(notes, /sanitized logs/i);
    assert.doesNotMatch(notes, /mark(?:ed)? as stable/i);
    assert.match(issueTemplate, /Home Assistant version/);
    assert.match(issueTemplate, /Home Assistant App/);
    assert.match(issueTemplate, /Standalone\/LXC/);
    assert.match(issueTemplate, /expected/i);
    assert.match(issueTemplate, /actual/i);
    assert.match(issueTemplate, /no tokens, passwords/);
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
    assert.match(
        ci + workflow,
        /npm audit --omit=dev --audit-level=moderate/
    );
    assert.doesNotMatch(
        ci + workflow,
        /npm audit --omit=dev --audit-level=high/
    );
});


test("Produktionsparser verwendet korrigiertes qs und bleibt begrenzt", function () {
    const lock = require("../package-lock.json");
    const qsPackage = lock.packages["node_modules/qs"];
    const qs = require("qs");
    const started = Date.now();
    const parsed = qs.parse(
        "items[0]=a,b&items[1]=c,d&__proto__[polluted]=yes",
        {
            arrayLimit: 1,
            comma: true,
            depth: 5,
            parameterLimit: 20
        }
    );

    assert.equal(qsPackage.version, "6.16.0");
    assert.equal({}.polluted, undefined);
    assert.ok(Date.now() - started < 1000);
    assert.equal(Object.keys(parsed).length <= 2, true);
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
        "/README.md",
        "/README.de.md",
        "/README.en.md",
        "/docs/INSTALL.de.md",
        "/docs/INSTALL.en.md",
        "/deploy/systemd/ha-legacy-dashboard.service"
    ].forEach(function (requiredPath) {
        assert.ok(entries.some(function (entry) {
            return entry.slice(-requiredPath.length) === requiredPath;
        }), "Missing standalone entry: " + requiredPath);
    });
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


test("Standalone-Dokumentation ist archivlokal und benötigt keinen Git-Checkout", function (t) {
    const root = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-release-docs-")
    );
    const bundleDirectory = path.join(root, "bundle");
    const extractDirectory = path.join(root, "extract");

    fs.mkdirSync(bundleDirectory);
    fs.mkdirSync(extractDirectory);
    t.after(function () {
        fs.rmSync(root, {recursive: true, force: true});
    });

    const releaseDirectory = extractBundle(
        Bundle.createBundle(bundleDirectory),
        extractDirectory
    );
    const markdownFiles = [
        "README.md",
        "README.de.md",
        "README.en.md",
        "docs/INSTALL.de.md",
        "docs/INSTALL.en.md"
    ];

    markdownFiles.forEach(function (fileName) {
        const content = fs.readFileSync(
            path.join(releaseDirectory, fileName),
            "utf8"
        );
        const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
        let match;

        while ((match = linkPattern.exec(content)) !== null) {
            if (/^(?:https?:|#)/.test(match[1])) {
                continue;
            }
            assert.equal(
                fs.existsSync(path.resolve(
                    path.dirname(path.join(releaseDirectory, fileName)),
                    match[1]
                )),
                true,
                fileName + " links missing archive path " + match[1]
            );
        }
    });

    const guides = markdownFiles.slice(3).map(function (fileName) {
        return fs.readFileSync(
            path.join(releaseDirectory, fileName),
            "utf8"
        );
    }).join("\n");

    assert.match(guides, /Fresh install|Neuinstallation/);
    assert.match(guides, /Upgrade N to N\+1|Update N nach N\+1/);
    assert.match(guides, /Rollback/);
    assert.doesNotMatch(
        guides,
        /deploy\/(?:deploy|check|health-check|rollback)\.sh/
    );
});


test("Standalone und App-Simulation wechseln reproduzierbar N nach N+1 und erlauben Rollback", function (t) {
    const root = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-release-upgrade-")
    );
    t.after(function () {
        fs.rmSync(root, {recursive: true, force: true});
    });

    verifyCrossVersionUpgrade("standalone", root);
    verifyCrossVersionUpgrade("home-assistant-app-data", root);
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
