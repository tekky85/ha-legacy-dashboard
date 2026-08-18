const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Issues = require("../src/services/issues/engine");
const Presentation = require("../src/services/issues/presentation");
const Risk = require("../src/services/issues/risk");
const Snapshot = require("../src/services/system/snapshot");
const Summary = require("../src/services/summary/engine");

const ROOT = path.join(__dirname, "..");


function rawState(entityId, state, deviceClass) {
    return {
        entity_id: entityId,
        state: state,
        attributes: {
            friendly_name: "Demo " + entityId,
            device_class: deviceClass
        },
        last_changed: "2026-08-17T10:00:00.000Z",
        last_updated: "2026-08-17T10:00:01.000Z"
    };
}


function buildIssues(states, configuration, contexts) {

    const snapshot = Snapshot.createSuccessful(
        states,
        "2026-08-17T10:30:00.000Z"
    );

    snapshot.entities.forEach(function (entity) {
        entity.context = contexts && contexts[entity.entityId]
            ? contexts[entity.entityId]
            : {};
    });

    return {
        snapshot: snapshot,
        result: Issues.buildIssues(snapshot, configuration || {
            securityEntities: [],
            ignoredEntities: [],
            entityTitles: {}
        })
    };
}


test("Safety Device Classes bewerten unknown und unavailable als critical", function () {

    ["smoke", "carbon_monoxide", "gas", "moisture", "water"]
        .forEach(function (deviceClass) {
            ["unknown", "unavailable"].forEach(function (state) {
                const built = buildIssues([
                    rawState(
                        "binary_sensor.safety_" + deviceClass + "_" + state,
                        state,
                        deviceClass
                    )
                ]).result;

                assert.equal(built.issues[0].severity, "critical");
                assert.equal(built.issues[0].riskClass, "safety");
                assert.equal(built.issues[0].securityRelevant, true);
            });
        });
});


test("Security Device Classes bewerten unknown und unavailable als critical", function () {

    ["window", "door", "opening", "garage_door", "lock"]
        .forEach(function (deviceClass) {
            ["unknown", "unavailable"].forEach(function (state) {
                const built = buildIssues([
                    rawState(
                        "binary_sensor.security_" + deviceClass + "_" + state,
                        state,
                        deviceClass
                    )
                ]).result;

                assert.equal(built.issues[0].severity, "critical");
                assert.equal(built.issues[0].riskClass, "security");
                assert.equal(built.issues[0].securityRelevant, true);
            });
        });

    const lockDomain = buildIssues([
        rawState("lock.front_door", "unknown", null)
    ]).result;
    assert.equal(lockDomain.issues[0].severity, "critical");
    assert.equal(lockDomain.issues[0].riskClass, "security");
});


test("Normale und diagnostische Entities bleiben bei der milden Severity", function () {

    const built = buildIssues(
        [
            rawState("sensor.temperature", "unknown", "temperature"),
            rawState("sensor.humidity", "unknown", "humidity"),
            rawState("sensor.battery", "unknown", "battery"),
            rawState("sensor.signal", "unavailable", "signal_strength"),
            rawState("sensor.named_leak", "unknown", "battery"),
            rawState("sensor.diagnostic", "unknown", "battery")
        ],
        null,
        {
            "sensor.diagnostic": {entityCategory: "diagnostic"}
        }
    ).result;

    assert.deepEqual(
        built.issues.map(function (issue) { return issue.severity; }),
        ["warning", "info", "info", "info", "info", "info"]
    );
    assert.equal(
        built.issues.find(function (issue) {
            return issue.entityId === "sensor.diagnostic";
        }).riskClass,
        "diagnostic"
    );
    assert.equal(
        built.issues.find(function (issue) {
            return issue.entityId === "sensor.named_leak";
        }).riskClass,
        "normal"
    );
    assert.equal(Risk.classify("not_a_real_class", null, "sensor"), "normal");
});


test("Explizite securityEntities behalten Priorität und unknown wird critical", function () {

    const built = buildIssues(
        [rawState("sensor.explicit", "unknown", "temperature")],
        {
            securityEntities: ["sensor.explicit"],
            ignoredEntities: [],
            entityTitles: {}
        }
    ).result;

    assert.equal(built.issues[0].severity, "critical");
    assert.equal(built.issues[0].riskClass, "security");
    assert.equal(built.issues[0].securityRelevant, true);
});


test("Device Group übernimmt Critical-Risiko, Counts und Child-State", function () {

    const contexts = {
        "binary_sensor.window": {deviceId: "device-one", deviceName: "Demo-Gerät"},
        "sensor.battery": {deviceId: "device-one", deviceName: "Demo-Gerät"}
    };
    const built = buildIssues(
        [
            rawState("binary_sensor.window", "unknown", "window"),
            rawState("sensor.battery", "unknown", "battery")
        ],
        null,
        contexts
    );
    built.snapshot.metadata = {
        entities: {},
        devices: {"device-one": {deviceId: "device-one", name: "Demo-Gerät"}},
        areas: {},
        configEntries: {}
    };

    const result = Presentation.build(built.snapshot, built.result);
    const group = result.groups[0];

    assert.equal(group.type, "device");
    assert.equal(group.severity, "critical");
    assert.equal(group.counts.critical, 1);
    assert.equal(group.counts.info, 1);
    assert.equal(group.counts.unknown, 2);
    assert.equal(result.filters.severity.critical, 1);
    assert.equal(result.filters.state.unknown, 2);
    assert.equal(group.issues[0].state, "unknown");
    assert.equal(group.issues[0].riskClass, "security");
});


test("Summary liefert Filter aus bestehenden Sprint-19-Kategorien", function () {

    const summary = Summary.buildSummary(
        Snapshot.createSuccessful(
            [
                rawState("binary_sensor.window", "on", "window"),
                rawState("light.demo", "on", null),
                rawState("vacuum.demo", "cleaning", null),
                rawState("climate.demo", "heat", null),
                rawState("media_player.demo", "playing", null),
                rawState("lock.demo", "unlocked", null)
            ].map(function (state) {
                if (state.entity_id === "climate.demo") {
                    state.attributes.hvac_action = "heating";
                }
                return state;
            }),
            "2026-08-17T10:30:00.000Z"
        ),
        {ignoredEntities: [], showMediaTitles: false}
    );

    const counts = {};
    summary.filters.forEach(function (filter) {
        counts[filter.id] = filter.count;
    });

    assert.deepEqual(counts, {
        all: 6,
        open: 1,
        powered: 1,
        active: 1,
        climate: 1,
        media: 1,
        security: 1
    });
    assert.deepEqual(
        summary.filters.find(function (filter) {
            return filter.id === "active";
        }).categories,
        ["running", "cleaning", "movement"]
    );
});


test("Sprint 21.2 bleibt read-only, ES5 und ohne CSS Grid", function () {

    const frontend = ["common.js", "summary.js", "errors.js"]
        .map(function (fileName) {
            return fs.readFileSync(
                path.join(ROOT, "src/public/js/system", fileName),
                "utf8"
            );
        }).join("\n");
    const css = fs.readFileSync(
        path.join(ROOT, "src/public/css/system.css"),
        "utf8"
    );
    const route = fs.readFileSync(
        path.join(ROOT, "src/routes/system-dashboards.js"),
        "utf8"
    );

    assert.doesNotMatch(frontend, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(frontend, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
    assert.doesNotMatch(frontend, /\?\.|\?\?/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.match(css, /display:\s*-webkit-flex/);
    assert.match(css, /system-columns-3/);
    assert.doesNotMatch(route, /router\.(post|put|patch|delete)/);
    assert.match(frontend, /systemSummaryColumns/);
    assert.match(frontend, /systemErrorsColumns/);
});
