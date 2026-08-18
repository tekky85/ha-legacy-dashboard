const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Issues = require("../src/services/issues/engine");
const Presentation = require("../src/services/issues/presentation");
const Snapshot = require("../src/services/system/snapshot");
const Enrichment = require("../src/services/system/enrichment");
const Normalizers = require("../src/services/diagnostics/normalizers");

const ROOT = path.join(__dirname, "..");


function rawState(entityId, state, friendlyName, changed) {
    return {
        entity_id: entityId,
        state: state,
        attributes: {
            friendly_name: friendlyName
        },
        last_changed: changed || "2026-08-17T09:42:00.000Z",
        last_updated: "2026-08-17T10:00:00.000Z"
    };
}


function enrichedSnapshot() {

    const snapshot = Snapshot.createSuccessful([
        rawState(
            "binary_sensor.rauch_alarm",
            "unavailable",
            "Rauchalarm",
            "2026-08-17T09:42:00.000Z"
        ),
        rawState(
            "sensor.rauch_batterie",
            "unknown",
            "Batterie",
            "2026-08-17T09:55:00.000Z"
        ),
        rawState(
            "sensor.rauch_signal",
            "unavailable",
            "Signal",
            "2026-08-17T09:50:00.000Z"
        ),
        rawState(
            "sensor.gleicher_name_anderes_geraet",
            "unavailable",
            "Rauchalarm",
            "2026-08-17T09:58:00.000Z"
        ),
        rawState(
            "sensor.gleicher_name_ohne_geraet",
            "unknown",
            "Rauchalarm",
            "2026-08-17T09:59:00.000Z"
        ),
        rawState(
            "sensor.ignoriert",
            "unavailable",
            "Ignoriert",
            "2026-08-17T09:40:00.000Z"
        )
    ], "2026-08-17T10:00:00.000Z");

    Enrichment.attach(snapshot, {
        metadata: {
            entities: Normalizers.indexBy(
                Normalizers.entityRegistry([
                    {entity_id: "binary_sensor.rauch_alarm", device_id: "abc123", platform: "zha"},
                    {entity_id: "sensor.rauch_batterie", device_id: "abc123", platform: "zha"},
                    {entity_id: "sensor.rauch_signal", device_id: "abc123", platform: "zha"},
                    {entity_id: "sensor.gleicher_name_anderes_geraet", device_id: "def456", area_id: "flur", platform: "zha"}
                ]),
                "entityId"
            ),
            devices: Normalizers.indexBy(
                Normalizers.deviceRegistry([
                    {
                        id: "abc123",
                        name: "Rauchmelder",
                        name_by_user: "Rauchmelder Flur",
                        area_id: "flur",
                        config_entry_id: "entry-zha"
                    },
                    {
                        id: "def456",
                        name: "Rauchmelder Flur",
                        area_id: "flur",
                        config_entry_id: "entry-zha"
                    }
                ]),
                "deviceId"
            ),
            areas: Normalizers.indexBy(
                Normalizers.areaRegistry([
                    {area_id: "flur", name: "Flur"}
                ]),
                "areaId"
            ),
            configEntries: Normalizers.indexBy(
                Normalizers.configEntries([
                    {
                        entry_id: "entry-zha",
                        domain: "zha",
                        title: "ZHA",
                        state: "loaded"
                    },
                    {
                        entry_id: "entry-broken",
                        domain: "demo",
                        title: "Demo Integration",
                        state: "setup_error"
                    }
                ]),
                "entryId"
            )
        },
        diagnostics: {
            repairs: Normalizers.repairs({issues: [{
                domain: "demo",
                issue_id: "repair-one",
                severity: "warning",
                is_fixable: true
            }]}),
            matter: [{
                id: "matter-system",
                status: "active",
                severity: "warning",
                title: "Matter Diagnose"
            }]
        },
        capabilities: {},
        sources: {}
    });

    return snapshot;
}


test("Presentation aggregiert ausschließlich echte Device-IDs", function () {

    const snapshot = enrichedSnapshot();
    const detected = Issues.buildIssues(snapshot, {
        securityEntities: ["binary_sensor.rauch_alarm"],
        ignoredEntities: ["sensor.ignoriert"],
        entityTitles: {}
    });
    const before = JSON.stringify(detected);
    const result = Presentation.build(snapshot, detected);
    const device = result.groups.find(function (group) {
        return group.deviceId === "abc123";
    });
    const secondDevice = result.groups.find(function (group) {
        return group.deviceId === "def456";
    });
    const standaloneEntity = result.groups.find(function (group) {
        return group.entityId === "sensor.gleicher_name_ohne_geraet";
    });

    assert.equal(JSON.stringify(detected), before);
    assert.equal(result.issues, detected.issues);
    assert.equal(device.type, "device");
    assert.equal(device.title, "Rauchmelder Flur");
    assert.equal(device.areaName, "Flur");
    assert.equal(device.integration, "ZHA");
    assert.equal(device.issueCount, 3);
    assert.equal(device.severity, "critical");
    assert.equal(device.securityRelevant, true);
    assert.equal(device.durationSeconds, 1080);
    assert.deepEqual(device.counts, {
        critical: 1,
        error: 0,
        warning: 1,
        info: 1,
        unavailable: 2,
        unknown: 1
    });
    assert.equal(secondDevice.issueCount, 1);
    assert.equal(standaloneEntity.type, "standalone");
    assert.equal(
        result.groups.filter(function (group) {
            return group.type === "device";
        }).length,
        2
    );
    assert.equal(
        result.groups.filter(function (group) {
            return group.title === "Rauchmelder Flur";
        }).length,
        2
    );
});


test("Config Entry, Repair und Matter bleiben Standalone und Filter zählen Issues", function () {

    const snapshot = enrichedSnapshot();
    const result = Presentation.build(
        snapshot,
        Issues.buildIssues(snapshot, {
            securityEntities: ["binary_sensor.rauch_alarm"],
            ignoredEntities: ["sensor.ignoriert"],
            entityTitles: {}
        })
    );

    [
        "config_entry",
        "home_assistant_repair",
        "matter_diagnostic"
    ].forEach(function (source) {
        const group = result.groups.find(function (entry) {
            return entry.source === source;
        });
        assert.equal(group.type, "standalone");
    });

    assert.deepEqual(result.filters, {
        severity: {
            all: 8,
            critical: 1,
            error: 1,
            warning: 4,
            info: 2
        },
        state: {
            all: 8,
            unavailable: 3,
            unknown: 2
        }
    });
    assert.equal(result.presentationVersion, 2);
    assert.equal(JSON.stringify(result).includes("identifiers"), false);
    assert.equal(JSON.stringify(result).includes("connections"), false);
    assert.equal(JSON.stringify(result).includes("manufacturer"), false);
});


test("Device Groups sortieren Severity, Security, Dauer und Namen deterministisch", function () {

    const snapshot = {
        entities: [
            {entityId: "sensor.info", attributes: {}, context: {deviceId: "i"}},
            {entityId: "sensor.warning", attributes: {}, context: {deviceId: "w"}},
            {entityId: "sensor.error", attributes: {}, context: {deviceId: "e"}},
            {entityId: "sensor.critical", attributes: {}, context: {deviceId: "c"}}
        ],
        metadata: {
            entities: {},
            devices: {
                i: {deviceId: "i", name: "Info"},
                w: {deviceId: "w", name: "Warnung"},
                e: {deviceId: "e", name: "Fehler"},
                c: {deviceId: "c", name: "Kritisch"}
            },
            areas: {},
            configEntries: {}
        }
    };
    const issues = [
        {id: "i", source: "entity_state", entityId: "sensor.info", state: "unknown", severity: "info", durationSeconds: 20},
        {id: "w", source: "entity_state", entityId: "sensor.warning", state: "unavailable", severity: "warning", durationSeconds: 20},
        {id: "e", source: "entity_state", entityId: "sensor.error", state: "unknown", severity: "error", durationSeconds: 20, securityRelevant: true},
        {id: "c", source: "entity_state", entityId: "sensor.critical", state: "unavailable", severity: "critical", durationSeconds: 20, securityRelevant: true}
    ];
    const first = Presentation.aggregate(snapshot, issues);
    const second = Presentation.aggregate(snapshot, issues);

    assert.deepEqual(
        first.map(function (group) { return group.severity; }),
        ["critical", "error", "warning", "info"]
    );
    assert.deepEqual(first, second);
});


test("3000 Entities, 500 Devices und 200 aktive Issues werden linear aggregiert", function () {

    const started = Date.now();
    const states = [];
    const registry = [];
    const devices = [];
    let index;

    for (index = 0; index < 500; index += 1) {
        devices.push({id: "device-" + index, name: "Device " + index});
    }

    for (index = 0; index < 3000; index += 1) {
        states.push(rawState(
            "sensor.synthetic_" + index,
            index < 200
                ? index % 2 === 0 ? "unavailable" : "unknown"
                : "0",
            "Synthetic " + index
        ));
        registry.push({
            entity_id: "sensor.synthetic_" + index,
            device_id:
                index < 200
                    ? "device-" + (index % 50)
                    : "device-" + (index % 500),
            platform: "demo"
        });
    }

    const snapshot = Snapshot.createSuccessful(
        states,
        "2026-08-17T10:00:00.000Z"
    );
    Enrichment.attach(snapshot, {
        metadata: {
            entities: Normalizers.indexBy(
                Normalizers.entityRegistry(registry),
                "entityId"
            ),
            devices: Normalizers.indexBy(
                Normalizers.deviceRegistry(devices),
                "deviceId"
            ),
            areas: {},
            configEntries: {}
        },
        diagnostics: {repairs: [], matter: []},
        capabilities: {},
        sources: {}
    });

    const detected = Issues.buildIssues(snapshot);
    const result = Presentation.build(snapshot, detected);
    const deviceGroups = result.groups.filter(function (group) {
        return group.type === "device";
    });

    assert.equal(detected.issues.length, 200);
    assert.equal(deviceGroups.length, 50);
    assert.equal(result.filters.severity.all, 200);
    assert.equal(Date.now() - started < 1500, true);
});


test("Sprint 21.1 bleibt read-only, ES5 und frei von CSS Grid", function () {

    const frontend = fs.readFileSync(
        path.join(ROOT, "src/public/js/system/errors.js"),
        "utf8"
    );
    const css = fs.readFileSync(
        path.join(ROOT, "src/public/css/system.css"),
        "utf8"
    );
    const route = fs.readFileSync(
        path.join(ROOT, "src/routes/system-dashboards.js"),
        "utf8"
    );
    const presentation = fs.readFileSync(
        path.join(ROOT, "src/services/issues/presentation.js"),
        "utf8"
    );

    assert.doesNotMatch(frontend, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(frontend, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
    assert.doesNotMatch(frontend, /\?\.|\?\?/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.match(css, /display:\s*-webkit-flex/);
    assert.match(css, /width:\s*48%/);
    assert.match(css, /align-items:\s*flex-start/);
    assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.error-card[\s\S]*width:\s*100%/);
    assert.doesNotMatch(route, /router\.(post|put|patch|delete)/);
    assert.doesNotMatch(presentation, /homeassistant|callService|write/i);
    assert.match(route, /IssuePresentation\.build/);
});
