"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const SHOTS = [
    "dashboards/main-light.png",
    "dashboards/main-dark.png",
    "dashboards/background-image.png",
    "dashboards/compact-cards.png",
    "dashboards/focus-card.png",
    "dashboards/sections-room-card.png",
    "admin/dashboard-management.png",
    "admin/dashboard-background.png",
    "admin/sections.png",
    "admin/layout-editor.png",
    "admin/live-preview.png",
    "admin/room-card-editor.png",
    "admin/entity-rules.png",
    "admin/system-diagnostics.png",
    "system/summary.png",
    "system/errors.png",
    "system/errors-automation-impact.png"
];

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath));
}

function markdownImages(markdown) {
    const result = [];
    const pattern = /!\[[^\]]*\]\((docs\/screenshots\/[^)]+)\)/g;
    let match;

    while ((match = pattern.exec(markdown)) !== null) {
        result.push(match[1].replace("docs/screenshots/", ""));
    }
    return result;
}

test("RQ-08-02 gallery files are real readable PNGs with declared dimensions", function () {
    SHOTS.forEach(function (relativePath) {
        const content = read(path.join("docs", "screenshots", relativePath));
        const signature = content.subarray(0, 8).toString("hex");
        const width = content.readUInt32BE(16);
        const height = content.readUInt32BE(20);

        assert.equal(signature, "89504e470d0a1a0a", relativePath + " must be PNG");
        assert.ok(width >= 768, relativePath + " width must be documentation-readable");
        assert.ok(height >= 720, relativePath + " height must be documentation-readable");
        assert.match(relativePath, /^[a-z0-9-]+\/[a-z0-9-]+\.png$/);
    });
});

test("RQ-08-02 German and English galleries reference the same complete set", function () {
    const german = markdownImages(read("README.de.md").toString("utf8"));
    const english = markdownImages(read("README.en.md").toString("utf8"));

    assert.deepEqual(german, english);
    assert.deepEqual(german.slice().sort(), SHOTS.slice().sort());
    assert.match(read("README.md").toString("utf8"), /docs\/screenshots\/dashboards\/main-light\.png/);
    assert.match(read("README.md").toString("utf8"), /docs\/screenshots\/README\.md/);
});

test("RQ-08-02 capture provenance is local-only and privacy-scanned", function () {
    const captureSource = read("test/capture-doc-screenshots.js").toString("utf8");
    const manifest = read("docs/screenshots/README.md").toString("utf8");
    const forbidden = [
        /192\.168\./i,
        /Bearer\s+[A-Za-z0-9._-]+/i,
        /SUPERVISOR_TOKEN/i,
        /HA_TOKEN/i,
        /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
        /robert@/i
    ];

    assert.match(captureSource, /127\.0\.0\.1/);
    assert.doesNotMatch(captureSource, /dotenv|process\.env\.HA_|process\.env\.SUPERVISOR_/);
    assert.match(manifest, /unveränderten produktiven/);
    assert.match(manifest, /keine `\.env`/);

    SHOTS.forEach(function (relativePath) {
        const raw = read(path.join("docs", "screenshots", relativePath)).toString("latin1");
        forbidden.forEach(function (pattern) {
            assert.doesNotMatch(raw, pattern, relativePath + " contains private marker " + pattern);
        });
    });
});

test("RQ-08-03 project status reflects current schema, packaging, and audit batch", function () {
    const status = read("docs/PROJECT_STATUS.md").toString("utf8");
    const dashboardConfig = read("src/config/dashboard.js").toString("utf8");

    assert.match(dashboardConfig, /const SCHEMA_VERSION = 12;/);
    assert.match(status, /Aktuelle Konfigurationsschema-Version: `12`/);
    assert.match(status, /Sprint 27\.1-I/);
    assert.match(status, /Parts 01 bis 19/);
    assert.match(status, /`build\.yaml`[^\n]*entfernt/);
    assert.doesNotMatch(status, /Das Paket liegt[^\n]*\n?[^\n]*`config\.yaml`, `build\.yaml`/);
});
