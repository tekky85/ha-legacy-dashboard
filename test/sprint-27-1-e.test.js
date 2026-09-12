const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const DashboardConfig = require("../src/config/dashboard");
const Enrichment = require("../src/services/system/enrichment");
const Issues = require("../src/services/issues/engine");
const Normalizers = require("../src/services/diagnostics/normalizers");
const Snapshot = require("../src/services/system/snapshot");
const Traceability = require("./fixtures/sprint-27-1-e-traceability");

const ROOT = path.join(__dirname, "..");


function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}


function numberedRequirements(specification) {
    const start = specification.search(/^# Tests\b/m);
    const scoped = start === -1
        ? specification
        : specification.slice(start);
    const end = scoped.search(/^# Performance(?:-Test)?\b/m);
    const testSection = end === -1 ? scoped : scoped.slice(0, end);
    const requirements = [];
    const pattern = /^(\d+)\.\s+(.+)$/gm;
    let match;

    while ((match = pattern.exec(testSection)) !== null) {
        requirements.push({
            number: Number(match[1]),
            description: match[2]
        });
    }

    return requirements;
}


test("Sprint-27.1-E-Traceability ordnet alle 510 nummerierten Anforderungen lückenlos zu", function () {
    const allowedCoverage = ["direct", "equivalent", "manual", "n/a"];
    const manualQueue = read("docs/audits/MANUAL_TEST_QUEUE.md");
    let total = 0;

    Object.keys(Traceability).forEach(function (sprintId) {
        const definition = Traceability[sprintId];
        const requirements = numberedRequirements(read(definition.spec));
        const byNumber = Object.create(null);

        assert.equal(requirements.length, definition.total, sprintId);
        requirements.forEach(function (requirement, index) {
            assert.equal(requirement.number, index + 1, sprintId);
        });

        definition.blocks.forEach(function (block) {
            assert.ok(allowedCoverage.indexOf(block.coverage) !== -1);
            assert.ok(block.from >= 1 && block.to <= definition.total);
            assert.ok(block.from <= block.to);
            assert.ok(block.evidence.length > 0);

            for (let number = block.from; number <= block.to; number += 1) {
                assert.equal(byNumber[number], undefined, sprintId + "-" + number);
                byNumber[number] = block.coverage;
            }

            if (block.coverage === "manual") {
                block.evidence.forEach(function (manualId) {
                    assert.match(manualId, /^MT-\d+$/);
                    assert.match(
                        manualQueue,
                        new RegExp("^## " + manualId + "$", "m")
                    );
                });
                return;
            }

            block.evidence.forEach(function (item) {
                const content = read(item.file);
                if (item.contains) {
                    assert.ok(
                        content.indexOf(item.contains) !== -1,
                        item.file + " enthält Evidenzmarker nicht: " + item.contains
                    );
                }
            });
        });

        requirements.forEach(function (requirement) {
            assert.notEqual(
                byNumber[requirement.number],
                undefined,
                sprintId + "-" + requirement.number
            );
        });
        assert.equal(Object.keys(byNumber).length, definition.total);
        total += definition.total;
    });

    assert.equal(total, 510);
});


test("Anzeige- und Risikoregeln verändern keine Control Grants", function (t) {
    const temporaryDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "sprint-27-1-e-controls-")
    );

    t.after(function () {
        fs.rmSync(temporaryDirectory, {recursive: true, force: true});
    });

    const configuration = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );

    DashboardConfig.initialize({
        configPath: path.join(temporaryDirectory, "dashboards.json")
    });
    DashboardConfig.replaceConfiguration(configuration);

    const beforeLight = DashboardConfig.getControlAuthorization(
        "light.esszimmer_lampen"
    );
    const beforeClimate = DashboardConfig.getControlAuthorization(
        "climate.esszimmer_thermostate"
    );

    configuration.systemDashboards.summary.ignoredEntities = [
        "light.esszimmer_lampen",
        "climate.esszimmer_thermostate"
    ];
    configuration.systemDashboards.errors.securityEntities = [
        "light.esszimmer_lampen",
        "climate.esszimmer_thermostate"
    ];
    configuration.systemDashboards.errors.ignoredEntities = [
        "light.esszimmer_lampen"
    ];
    DashboardConfig.replaceConfiguration(configuration);

    assert.deepEqual(
        DashboardConfig.getControlAuthorization("light.esszimmer_lampen"),
        beforeLight
    );
    assert.deepEqual(
        DashboardConfig.getControlAuthorization("climate.esszimmer_thermostate"),
        beforeClimate
    );
    assert.equal(
        DashboardConfig.getControlAuthorization("light.not_on_a_dashboard"),
        null
    );
});


test("Registry- und Diagnose-Grenzmatrix bleibt sanitisiert und fehlertolerant", function () {
    const areas = Normalizers.areaRegistry([
        {area_id: "living", name: "Wohnzimmer", labels: ["private-label"]},
        {name: "Ohne ID"}
    ]);
    const devices = Normalizers.deviceRegistry([{
        id: "device-one",
        name: "Gerät",
        manufacturer: "Demo",
        model: "Model 1",
        hw_version: "A",
        sw_version: "1.2",
        identifiers: [["demo", "secret"]]
    }]);
    const entries = Normalizers.configEntries([{
        entry_id: "entry-one",
        domain: "demo",
        title: "Demo Integration",
        state: "loaded",
        source: "user",
        disabled_by: null,
        private_data: "secret"
    }]);

    assert.equal(areas.length, 1);
    assert.equal(areas[0].areaId, "living");
    assert.equal(devices[0].manufacturer, "Demo");
    assert.equal(devices[0].hardwareVersion, "A");
    assert.equal(entries[0].source, "user");
    assert.equal(JSON.stringify(devices).includes("secret"), false);
    assert.equal(JSON.stringify(entries).includes("private_data"), false);
    assert.deepEqual(Normalizers.repairs({malformed: true}), []);
    assert.deepEqual(Normalizers.repairs({issues: [null, {ignored: true}]}), []);

    const snapshot = Snapshot.createSuccessful([{
        entity_id: "sensor.unknown_area",
        state: "1",
        attributes: {},
        last_changed: "2026-09-12T08:00:00Z",
        last_updated: "2026-09-12T08:00:00Z"
    }], "2026-09-12T08:01:00Z");

    Enrichment.attach(snapshot, {
        metadata: {
            entities: {
                "sensor.unknown_area": {
                    entityId: "sensor.unknown_area",
                    deviceId: null,
                    areaId: "area-does-not-exist"
                }
            },
            devices: {},
            areas: {},
            labels: {},
            configEntries: {}
        },
        diagnostics: {repairs: [], matter: []},
        capabilities: {},
        sources: {}
    });

    assert.equal(snapshot.entities[0].context.areaId, "area-does-not-exist");
    assert.equal(snapshot.entities[0].context.areaName, null);
});


test("Label-Lifecycle behält stabile ID bei Rename und zeigt First-Failure", function () {
    const failed = Issues.criticalDetection({
        metadata: {labels: {}, entities: {}, devices: {}},
        sources: {
            labelRegistry: {supported: null, ok: false, stale: false}
        }
    }, {
        criticalDetectionMode: "ha_label",
        criticalLabelId: "critical"
    });

    assert.equal(failed.status, "error");
    assert.deepEqual(Object.keys(failed.eligibleEntities), []);

    const renamed = Issues.criticalDetection({
        metadata: {
            labels: {
                critical: {labelId: "critical", name: "Neuer Anzeigename"}
            },
            entities: {
                "sensor.freezer": {
                    entityId: "sensor.freezer",
                    deviceId: null,
                    labelIds: ["critical"]
                }
            },
            devices: {}
        },
        sources: {
            labelRegistry: {supported: true, ok: true, stale: false}
        }
    }, {
        criticalDetectionMode: "ha_label",
        criticalLabelId: "critical"
    });

    assert.equal(renamed.status, "available");
    assert.equal(renamed.labelId, "critical");
    assert.equal(renamed.labelName, "Neuer Anzeigename");
    assert.equal(renamed.eligibleEntities["sensor.freezer"], true);
});


test("Legacy-Systemkarten besitzen Schutz für lange Namen", function () {
    const css = read("src/public/css/system.css");
    const frontend = [
        read("src/public/js/system/common.js"),
        read("src/public/js/system/summary.js"),
        read("src/public/js/system/errors.js")
    ].join("\n");

    assert.match(
        css,
        /\.error-card-title\s*\{[^}]*min-width:\s*0[^}]*word-break:\s*break-word/s
    );
    assert.match(
        css,
        /\.error-item-title\s*\{[^}]*min-width:\s*0[^}]*word-break:\s*break-word/s
    );
    assert.match(
        css,
        /\.summary-item-title\s*\{[^}]*min-width:\s*0[^}]*word-break:\s*break-word/s
    );
    assert.doesNotMatch(frontend, /\bfetch\b|\bPromise\b|=>|\bconst\b|\blet\b/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
});
