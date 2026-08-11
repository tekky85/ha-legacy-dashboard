const assert = require("node:assert/strict");
const test = require("node:test");

const Cache = require("../src/services/system/cache");
const Collector = require("../src/services/system/collector");
const Issues = require("../src/services/issues/engine");
const Snapshot = require("../src/services/system/snapshot");
const Summary = require("../src/services/summary/engine");


function silentLogger(entries) {

    return {
        error: function (event, fields) {
            entries.push({level: "error", event: event, fields: fields});
        },
        info: function (event, fields) {
            entries.push({level: "info", event: event, fields: fields});
        },
        warn: function (event, fields) {
            entries.push({level: "warn", event: event, fields: fields});
        }
    };

}


function rawState(entityId, state, attributes) {

    return {
        entity_id: entityId,
        state: state,
        attributes: attributes || {},
        last_changed: "2026-08-11T18:00:00Z",
        last_updated: "2026-08-11T18:00:01Z"
    };

}


test("System-Snapshot normalisiert nur erlaubte HA-State-Felder", function () {

    const snapshot = Snapshot.createSuccessful(
        [
            rawState(
                "light.wohnzimmer",
                "on",
                {
                    friendly_name: "Wohnzimmer",
                    device_class: "light",
                    icon: "mdi:lamp",
                    battery_level: "87",
                    entity_picture: "/api/camera_proxy/secret",
                    access_token: "must-not-survive",
                    supported_features: 999
                }
            ),
            rawState(
                "sensor.temperature",
                "21.5",
                {
                    unit_of_measurement: "°C",
                    device_class: "temperature"
                }
            ),
            rawState("invalid entity", "unknown", {})
        ],
        "2026-08-11T18:00:02.000Z"
    );

    assert.equal(snapshot.entities.length, 2);
    assert.equal(snapshot.entities[0].entityId, "light.wohnzimmer");
    assert.equal(snapshot.entities[0].domain, "light");
    assert.deepEqual(snapshot.entities[0].attributes, {
        friendlyName: "Wohnzimmer",
        deviceClass: "light",
        icon: "mdi:lamp",
        batteryLevel: 87
    });
    assert.equal(snapshot.entities[0].attributes.entityPicture, undefined);
    assert.equal(snapshot.entities[0].attributes.accessToken, undefined);
    assert.equal(snapshot.entities[0].lastChanged, "2026-08-11T18:00:00.000Z");
    assert.equal(snapshot.stale, false);
    assert.equal(snapshot.homeAssistant.reachable, true);

    const publicMeta = Snapshot.toPublicMeta(snapshot);
    assert.equal(publicMeta.entity_count, 2);
    assert.equal(publicMeta.stale, false);
    assert.equal(publicMeta.entities, undefined);
    assert.equal(JSON.stringify(publicMeta).includes("must-not-survive"), false);

});


test("Collector verwendet die Sammelabfrage und loggt keine Tokens", async function () {

    const entries = [];
    let calls = 0;

    const collector = Collector.createCollector({
        homeAssistant: {
            getAllEntities: async function () {
                calls += 1;
                return [rawState("sensor.test", "1", {})];
            }
        },
        logger: silentLogger(entries),
        clock: function () {
            return Date.parse("2026-08-11T18:00:00Z");
        }
    });

    const snapshot = await collector.collect();

    assert.equal(calls, 1);
    assert.equal(snapshot.entities.length, 1);
    assert.deepEqual(
        entries.map(function (entry) {
            return entry.event;
        }),
        [
            "system_snapshot_collection_started",
            "system_snapshot_collection_succeeded"
        ]
    );
    assert.equal(
        /token|authorization|Bearer/i.test(JSON.stringify(entries)),
        false
    );

});


test("Collector behandelt eine leere HA-State-Liste kontrolliert", async function () {

    const collector = Collector.createCollector({
        homeAssistant: {
            getAllEntities: async function () {
                return [];
            }
        },
        logger: silentLogger([]),
        clock: function () {
            return Date.parse("2026-08-11T18:00:00Z");
        }
    });

    const snapshot = await collector.collect();

    assert.deepEqual(snapshot.entities, []);
    assert.equal(snapshot.stale, false);
    assert.equal(snapshot.homeAssistant.reachable, true);

});


test("Snapshot-Cache teilt Snapshot, erneuert nach TTL und dedupliziert parallel", async function () {

    const entries = [];
    let now = 1000;
    let calls = 0;
    let resolveCollection;

    const collector = {
        collect: function () {
            calls += 1;
            return new Promise(function (resolve) {
                resolveCollection = resolve;
            });
        }
    };

    const cache = Cache.createSnapshotCache({
        collector: collector,
        logger: silentLogger(entries),
        clock: function () {
            return now;
        },
        ttlMs: 3000
    });

    const firstPromise = cache.getSnapshot();
    const parallelPromise = cache.getSnapshot();

    assert.equal(calls, 1);
    assert.equal(firstPromise, parallelPromise);

    resolveCollection(
        Snapshot.createSuccessful(
            [rawState("sensor.first", "1", {})],
            new Date(now).toISOString()
        )
    );

    const first = await firstPromise;
    const cached = await cache.getSnapshot();

    assert.equal(calls, 1);
    assert.equal(cached, first);

    now = 4000;
    const renewedPromise = cache.getSnapshot();
    assert.equal(calls, 2);
    resolveCollection(
        Snapshot.createSuccessful(
            [rawState("sensor.second", "2", {})],
            new Date(now).toISOString()
        )
    );

    const renewed = await renewedPromise;
    assert.equal(renewed.entities[0].entityId, "sensor.second");
    assert.equal(cache.getState().ttlMs, 3000);

});


test("Cache behält letzte erfolgreiche Daten, zeigt Offline und erholt sich", async function () {

    let now = 1000;
    let outcome = "success";

    const collector = {
        collect: async function () {
            if (outcome === "error") {
                const error = new Error("offline");
                error.code = "home_assistant_unavailable";
                throw error;
            }

            return Snapshot.createSuccessful(
                [rawState("light.saved", outcome, {})],
                new Date(now).toISOString()
            );
        }
    };

    const cache = Cache.createSnapshotCache({
        collector: collector,
        logger: silentLogger([]),
        clock: function () {
            return now;
        },
        ttlMs: 100
    });

    const successful = await cache.getSnapshot();
    assert.equal(successful.stale, false);

    now = 1100;
    outcome = "error";
    const stale = await cache.getSnapshot();

    assert.equal(stale.stale, true);
    assert.equal(stale.homeAssistant.reachable, false);
    assert.equal(stale.entities[0].entityId, "light.saved");
    assert.equal(
        stale.lastSuccessfulCollectionAt,
        successful.lastSuccessfulCollectionAt
    );

    now = 1200;
    outcome = "recovered";
    const recovered = await cache.getSnapshot();

    assert.equal(recovered.stale, false);
    assert.equal(recovered.homeAssistant.reachable, true);
    assert.equal(recovered.entities[0].state, "recovered");

    const offlineCache = Cache.createSnapshotCache({
        collector: {
            collect: async function () {
                const error = new Error("offline");
                error.code = "home_assistant_unavailable";
                throw error;
            }
        },
        logger: silentLogger([]),
        clock: function () {
            return now;
        },
        ttlMs: 100
    });

    const offline = await offlineCache.getSnapshot();
    assert.equal(offline.stale, true);
    assert.equal(offline.entities.length, 0);
    assert.equal(offline.lastSuccessfulCollectionAt, null);

});


test("Summary wertet aktive Zustände aus und Issue-Engine bleibt leer", function () {

    const snapshot = Snapshot.createSuccessful(
        [rawState("light.private", "on", {friendly_name: "Privat"})],
        "2026-08-11T18:00:00.000Z"
    );

    const summary = Summary.buildSummary(snapshot);
    const issues = Issues.buildIssues(snapshot);

    assert.equal(summary.items.length, 1);
    assert.equal(summary.items[0].entityIds[0], "light.private");
    assert.equal(summary.items[0].category, "powered");
    assert.deepEqual(issues.issues, []);
    assert.equal(summary.meta.entity_count, 1);
    assert.equal(issues.meta.entity_count, 1);
    assert.equal(summary.entities, undefined);
    assert.equal(issues.entities, undefined);
    assert.equal(JSON.stringify(summary).includes("light.private"), true);
    assert.equal(JSON.stringify(issues).includes("light.private"), false);

});


test("3000 Entities werden deterministisch und mit kleiner Public-Payload normalisiert", function () {

    const rawStates = [];

    for (let index = 2999; index >= 0; index--) {
        rawStates.push(
            rawState(
                "sensor.entity_" + String(index).padStart(4, "0"),
                String(index),
                {
                    friendly_name: "Entity " + index,
                    device_class: "temperature",
                    huge_raw_attribute: "x".repeat(2048)
                }
            )
        );
    }

    const startedAt = process.hrtime.bigint();
    const first = Snapshot.createSuccessful(
        rawStates,
        "2026-08-11T18:00:00.000Z"
    );
    const elapsedMilliseconds =
        Number(process.hrtime.bigint() - startedAt) / 1000000;

    const second = Snapshot.createSuccessful(
        rawStates,
        "2026-08-11T18:00:00.000Z"
    );

    assert.equal(first.entities.length, 3000);
    assert.deepEqual(first, second);
    assert.equal(first.entities[0].entityId, "sensor.entity_0000");
    assert.equal(first.entities[2999].entityId, "sensor.entity_2999");
    assert.equal(first.entities[0].attributes.hugeRawAttribute, undefined);
    assert.ok(elapsedMilliseconds < 2000);

    const publicPayload = Summary.buildSummary(first);
    assert.ok(Buffer.byteLength(JSON.stringify(publicPayload)) < 2000);
    assert.equal(JSON.stringify(publicPayload).includes("entity_0000"), false);

});
