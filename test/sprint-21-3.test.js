const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const DashboardConfig = require("../src/config/dashboard");
const Diagnostics = require("../src/services/diagnostics");
const Issues = require("../src/services/issues/engine");
const Normalizers = require("../src/services/diagnostics/normalizers");
const Presentation = require("../src/services/issues/presentation");
const Risk = require("../src/services/issues/risk");
const Snapshot = require("../src/services/system/snapshot");

const ROOT = path.join(__dirname, "..");


function rawState(entityId, state, deviceClass) {
    return {
        entity_id: entityId,
        state: state,
        attributes: {
            friendly_name: entityId,
            device_class: deviceClass
        },
        last_changed: "2026-08-18T08:00:00.000Z",
        last_updated: "2026-08-18T08:00:01.000Z"
    };
}


function issueSnapshot(states, entityEntries, devices, labels, labelSource) {
    const snapshot = Snapshot.createSuccessful(
        states,
        "2026-08-18T08:30:00.000Z"
    );
    const entityMetadata = Normalizers.indexBy(
        Normalizers.entityRegistry(entityEntries || []),
        "entityId"
    );

    snapshot.metadata = {
        entities: entityMetadata,
        devices: Normalizers.indexBy(
            Normalizers.deviceRegistry(devices || []),
            "deviceId"
        ),
        areas: {},
        labels: Normalizers.indexBy(
            Normalizers.labelRegistry(labels || []),
            "labelId"
        ),
        configEntries: {}
    };
    snapshot.diagnostics = {repairs: [], matter: []};
    snapshot.sources.labelRegistry = labelSource || {
        supported: true,
        ok: true,
        stale: false
    };
    snapshot.entities.forEach(function (entity) {
        const registry = entityMetadata[entity.entityId] || {};
        entity.context = {
            deviceId: registry.deviceId || null,
            entityCategory: registry.entityCategory || null
        };
    });
    return snapshot;
}


function settings(mode, labelId, securityEntities) {
    return {
        securityEntities: securityEntities || [],
        ignoredEntities: [],
        entityTitles: {},
        criticalDetectionMode: mode,
        criticalLabelId: labelId || null
    };
}


test("Schema 8 bewahrt Detection-Modus und stabile Label-ID", function () {
    const valid = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );

    valid.systemDashboards.errors.criticalDetectionMode = "ha_label";
    valid.systemDashboards.errors.criticalLabelId = "critical_devices";
    assert.equal(DashboardConfig.validateConfiguration(valid), true);

    const missing = DashboardConfig.cloneConfiguration(valid);
    missing.systemDashboards.errors.criticalLabelId = null;
    assert.throws(function () {
        DashboardConfig.validateConfiguration(missing);
    }, /Critical Label/);

    const invalidMode = DashboardConfig.cloneConfiguration(valid);
    invalidMode.systemDashboards.errors.criticalDetectionMode = "hybrid";
    assert.throws(function () {
        DashboardConfig.validateConfiguration(invalidMode);
    }, /Modus/);

    const sprint21 = DashboardConfig.cloneConfiguration(valid);
    sprint21.schemaVersion = 6;
    delete sprint21.systemDashboards.errors.criticalDetectionMode;
    delete sprint21.systemDashboards.errors.criticalLabelId;
    const migrated = DashboardConfig.migrateConfiguration(sprint21);
    assert.equal(migrated.configuration.schemaVersion, 8);
    assert.equal(
        migrated.configuration.systemDashboards.errors.criticalDetectionMode,
        "device_class"
    );
});


test("Label Registry und Zuweisungen werden reduziert normalisiert", function () {
    assert.deepEqual(Normalizers.labelRegistry([
        {label_id: "critical", name: "Kritisch", color: "red"}
    ]), [{labelId: "critical", name: "Kritisch"}]);
    assert.deepEqual(
        Normalizers.entityRegistry([{
            entity_id: "sensor.demo",
            labels: ["critical", "critical", null]
        }])[0].labelIds,
        ["critical"]
    );
    assert.deepEqual(
        Normalizers.deviceRegistry([{
            id: "device-demo",
            labels: ["critical"]
        }])[0].labelIds,
        ["critical"]
    );
});


test("Device-Class- und Cover-Policy klassifizieren nur definierte Risiken", function () {
    ["co", "gas", "moisture", "smoke", "safety"].forEach(function (value) {
        assert.equal(Risk.classify(value, null, "binary_sensor"), "safety");
    });
    ["door", "garage_door", "lock", "opening", "window"].forEach(function (value) {
        assert.equal(Risk.classify(value, null, "binary_sensor"), "security");
    });
    ["door", "garage", "gate", "window"].forEach(function (value) {
        assert.equal(Risk.classify(value, null, "cover"), "security");
    });
    ["shade", "shutter", "problem", "tamper", "temperature", "battery"]
        .forEach(function (value) {
            assert.equal(Risk.classify(value, null, "cover"), "normal");
        });
});


test("Label-Modus berücksichtigt Device und Entity, aber weder Area noch Device Class", function () {
    const snapshot = issueSnapshot(
        [
            rawState("binary_sensor.device_child", "unknown", "battery"),
            rawState("binary_sensor.entity_only", "unavailable", "temperature"),
            rawState("binary_sensor.window_unlabelled", "unknown", "window"),
            rawState("binary_sensor.area_only", "unknown", "smoke")
        ],
        [
            {entity_id: "binary_sensor.device_child", device_id: "device-labelled"},
            {entity_id: "binary_sensor.entity_only", labels: ["critical"]},
            {entity_id: "binary_sensor.window_unlabelled", device_id: "device-normal"},
            {entity_id: "binary_sensor.area_only", area_id: "critical-area"}
        ],
        [
            {id: "device-labelled", labels: ["critical"]},
            {id: "device-normal", labels: []}
        ],
        [{label_id: "critical", name: "Wichtig"}]
    );
    const result = Issues.buildIssues(
        snapshot,
        settings("ha_label", "critical")
    );
    const byEntity = Object.create(null);

    result.issues.forEach(function (issue) {
        if (issue.entityId) {
            byEntity[issue.entityId] = issue;
        }
    });

    assert.equal(byEntity["binary_sensor.device_child"].severity, "critical");
    assert.equal(byEntity["binary_sensor.entity_only"].severity, "critical");
    assert.equal(byEntity["binary_sensor.window_unlabelled"].severity, "info");
    assert.equal(byEntity["binary_sensor.area_only"].severity, "info");
    assert.deepEqual(result.criticalDetection, {
        mode: "ha_label",
        status: "available",
        labelId: "critical",
        labelName: "Wichtig"
    });
});


test("Explizite securityEntities behalten im Label-Modus Priorität", function () {
    const snapshot = issueSnapshot(
        [rawState("sensor.explicit", "unknown", "temperature")],
        [{entity_id: "sensor.explicit"}],
        [],
        [{label_id: "critical", name: "Kritisch"}]
    );
    const result = Issues.buildIssues(
        snapshot,
        settings("ha_label", "critical", ["sensor.explicit"])
    );

    assert.equal(result.issues[0].severity, "critical");
});


test("Label-Ausfall und gelöschtes Label erzeugen sichtbaren Fehler statt Fallback", function () {
    const unavailable = issueSnapshot(
        [rawState("binary_sensor.window", "unknown", "window")],
        [{entity_id: "binary_sensor.window"}],
        [],
        [],
        {supported: null, ok: false, stale: false}
    );
    const unavailableResult = Issues.buildIssues(
        unavailable,
        settings("ha_label", "critical")
    );

    assert.equal(unavailableResult.criticalDetection.status, "error");
    assert.equal(
        unavailableResult.issues.some(function (issue) {
            return issue.source === "critical_detection" && issue.severity === "error";
        }),
        true
    );
    assert.equal(
        unavailableResult.issues.find(function (issue) {
            return issue.entityId === "binary_sensor.window";
        }).severity,
        "info"
    );

    const missing = issueSnapshot(
        [],
        [],
        [],
        [{label_id: "other", name: "Anders"}]
    );
    assert.equal(
        Issues.buildIssues(missing, settings("ha_label", "deleted"))
            .criticalDetection.status,
        "missing"
    );
});


test("Stale Label-Snapshot behält bekannte Critical-Zuweisung", function () {
    const snapshot = issueSnapshot(
        [rawState("sensor.freezer", "unavailable", "temperature")],
        [{entity_id: "sensor.freezer", labels: ["critical"]}],
        [],
        [{label_id: "critical", name: "Kritisch"}],
        {supported: true, ok: false, stale: true}
    );
    const result = Issues.buildIssues(
        snapshot,
        settings("ha_label", "critical")
    );

    assert.equal(result.criticalDetection.status, "stale");
    assert.equal(result.issues[0].severity, "critical");
});


test("Presentation trennt Severity- und State-Counts", function () {
    const snapshot = issueSnapshot([
        rawState("sensor.warning", "unavailable", "temperature"),
        rawState("sensor.info", "unknown", "temperature"),
        rawState("binary_sensor.critical", "unknown", "smoke")
    ]);
    const result = Presentation.build(
        snapshot,
        Issues.buildIssues(snapshot, settings("device_class"))
    );

    assert.deepEqual(result.filters, {
        severity: {all: 3, critical: 1, error: 0, warning: 1, info: 1},
        state: {all: 3, unavailable: 1, unknown: 2}
    });
    assert.equal(result.presentationVersion, 2);
});


test("Label-Quelle nutzt festen Read-only-Command, TTL und Last-known Snapshot", async function () {
    let now = 1000;
    let fail = false;
    const calls = [];
    const client = {
        request: function (command) {
            calls.push(command.type);
            if (fail && command.type === "config/label_registry/list") {
                const error = new Error("timeout");
                error.code = "ha_websocket_timeout";
                return Promise.reject(error);
            }
            if (command.type === "config/label_registry/list") {
                return Promise.resolve([{label_id: "critical", name: "Kritisch"}]);
            }
            return Promise.resolve([]);
        },
        close: function () {}
    };
    const logger = {info: function () {}, warn: function () {}, error: function () {}};
    const service = Diagnostics.createService({
        client: client,
        logger: logger,
        clock: function () { return now; }
    });

    let snapshot = await service.getSnapshot();
    assert.equal(snapshot.capabilities.labelRegistry, true);
    assert.equal(snapshot.metadata.labels.critical.name, "Kritisch");
    await service.getSnapshot();
    assert.equal(calls.filter(function (command) {
        return command === "config/label_registry/list";
    }).length, 1);

    now += 61000;
    fail = true;
    snapshot = await service.getSnapshot();
    assert.equal(snapshot.sources.labelRegistry.stale, true);
    assert.equal(snapshot.metadata.labels.critical.name, "Kritisch");
});


test("3000 Entities, 500 Devices, 100 Labels und 500 Zuweisungen bleiben performant", function () {
    const states = [];
    const entities = [];
    const devices = [];
    const labels = [];
    let index;

    for (index = 0; index < 100; index++) {
        labels.push({label_id: "label_" + index, name: "Label " + index});
    }
    for (index = 0; index < 500; index++) {
        devices.push({
            id: "device-" + index,
            labels: index < 250 ? ["label_1"] : []
        });
    }
    for (index = 0; index < 3000; index++) {
        states.push(rawState(
            "sensor.entity_" + index,
            index < 200 ? "unknown" : "ok",
            "temperature"
        ));
        entities.push({
            entity_id: "sensor.entity_" + index,
            device_id: "device-" + (index % 500),
            labels: index >= 250 && index < 500 ? ["label_1"] : []
        });
    }

    const snapshot = issueSnapshot(states, entities, devices, labels);
    const started = Date.now();
    const result = Presentation.build(
        snapshot,
        Issues.buildIssues(snapshot, settings("ha_label", "label_1"))
    );

    assert.equal(result.issues.length, 200);
    assert.equal(result.summary.critical > 0, true);
    assert.equal(Date.now() - started < 1500, true);
});


test("Sprint 21.3 bleibt read-only, ES5 und ohne CSS Grid", function () {
    const frontend = fs.readFileSync(
        path.join(ROOT, "src/public/js/system/errors.js"),
        "utf8"
    );
    const css = fs.readFileSync(
        path.join(ROOT, "src/public/css/system.css"),
        "utf8"
    );
    const backend = [
        "src/services/diagnostics/index.js",
        "src/routes/admin.js"
    ].map(function (file) {
        return fs.readFileSync(path.join(ROOT, file), "utf8");
    }).join("\n");

    assert.doesNotMatch(frontend, /\bconst\b|\blet\b|=>|`|\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.match(backend, /config\/label_registry\/list/);
    assert.doesNotMatch(backend, /label_registry\/(?:create|update|delete)|router\.(?:post|put|patch|delete)\("\/labels/);
    assert.doesNotMatch(backend, /ws-command|ws_command|call_service/);
});
