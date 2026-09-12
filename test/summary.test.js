const assert = require("node:assert/strict");
const test = require("node:test");

const Snapshot = require("../src/services/system/snapshot");
const Summary = require("../src/services/summary/engine");


function rawState(entityId, state, attributes, lastChanged) {
    return {
        entity_id: entityId,
        state: state,
        attributes: attributes || {},
        last_changed: lastChanged || "2026-08-11T17:00:00Z",
        last_updated: lastChanged || "2026-08-11T17:00:00Z"
    };
}


function build(rawStates, settings, collectedAt) {
    return Summary.buildSummary(
        Snapshot.createSuccessful(
            rawStates,
            collectedAt || "2026-08-11T18:00:00.000Z"
        ),
        settings || {
            ignoredEntities: [],
            showMediaTitles: false
        }
    );
}


test("Summary erkennt die definierten aktiven Zustände", function () {

    const summary = build([
        rawState("light.kueche", "on", {friendly_name: "Küchenlicht"}),
        rawState("switch.pumpe", "on", {friendly_name: "Pumpe"}),
        rawState("binary_sensor.fenster", "on", {
            friendly_name: "Fenster",
            device_class: "window"
        }),
        rawState("cover.terrasse", "opening", {
            friendly_name: "Markise",
            current_position: 42
        }),
        rawState("vacuum.robot", "cleaning", {friendly_name: "Roboter"}),
        rawState("climate.wohnen", "heat", {
            friendly_name: "Heizung",
            hvac_action: "heating"
        }),
        rawState("media_player.radio", "playing", {
            friendly_name: "Radio",
            media_title: "Privater Titel"
        }),
        rawState("fan.bad", "on", {friendly_name: "Lüfter"}),
        rawState("lock.haustuer", "unlocked", {friendly_name: "Haustür"}),
        rawState("alarm_control_panel.haus", "armed_away", {
            friendly_name: "Alarmanlage"
        })
    ]);

    assert.equal(summary.activeCount, 10);
    assert.deepEqual(
        summary.groups.map(function (group) {
            return group.category;
        }),
        [
            "security",
            "open",
            "running",
            "cleaning",
            "climate",
            "media",
            "powered"
        ]
    );
    assert.equal(summary.items[0].category, "security");
    assert.equal(summary.items[0].priority, 100);
    assert.equal(summary.items[0].entityIds.length, 1);
    assert.equal(summary.items[0].metadata.domain.length > 0, true);
    assert.equal(typeof summary.items[0].durationSeconds, "number");
    assert.match(
        summary.items.find(function (item) {
            return item.entityIds[0] === "cover.terrasse";
        }).description,
        /42 %/
    );
    assert.equal(JSON.stringify(summary).includes("Privater Titel"), false);

});


test("Summary lässt inaktive, numerische und nicht definierte Zustände weg", function () {

    const summary = build([
        rawState("light.aus", "off", {}),
        rawState("switch.aus", "off", {}),
        rawState("binary_sensor.bewegung", "on", {device_class: "motion"}),
        rawState("sensor.temperatur", "24.2", {device_class: "temperature"}),
        rawState("cover.rollladen", "closed", {}),
        rawState("vacuum.robot", "docked", {}),
        rawState("climate.wohnen", "heat", {hvac_action: "idle"}),
        rawState("media_player.radio", "paused", {}),
        rawState("fan.bad", "unavailable", {}),
        rawState("lock.haustuer", "locked", {}),
        rawState("alarm_control_panel.haus", "disarmed", {})
    ]);

    assert.equal(summary.activeCount, 0);
    assert.deepEqual(summary.items, []);
    assert.deepEqual(summary.groups, []);
    assert.equal(summary.message, "Keine aktiven Zustände.");

});


test("Sprint-19-Zustandsmatrix prüft jede ausdrücklich genannte Variante", async function (t) {

    const cases = [
        ["Light on", "light.matrix", "on", {}, "powered"],
        ["Light off", "light.matrix", "off", {}, null],
        ["Switch on", "switch.matrix", "on", {}, "powered"],
        ["Window on", "binary_sensor.window", "on", {device_class: "window"}, "open"],
        ["Window off", "binary_sensor.window", "off", {device_class: "window"}, null],
        ["Door on", "binary_sensor.door", "on", {device_class: "door"}, "open"],
        ["irrelevanter Binary Sensor", "binary_sensor.motion", "on", {device_class: "motion"}, null],
        ["Cover open", "cover.matrix", "open", {}, "open"],
        ["Cover opening", "cover.matrix", "opening", {}, "running"],
        ["Cover closing", "cover.matrix", "closing", {}, "running"],
        ["Cover closed", "cover.matrix", "closed", {}, null],
        ["Vacuum cleaning", "vacuum.matrix", "cleaning", {}, "cleaning"],
        ["Vacuum returning", "vacuum.matrix", "returning", {}, "cleaning"],
        ["Vacuum paused", "vacuum.matrix", "paused", {}, "cleaning"],
        ["Vacuum docked", "vacuum.matrix", "docked", {}, null],
        ["Climate heating", "climate.matrix", "heat", {hvac_action: "heating"}, "climate"],
        ["Climate cooling", "climate.matrix", "cool", {hvac_action: "cooling"}, "climate"],
        ["Climate idle", "climate.matrix", "heat", {hvac_action: "idle"}, null],
        ["Media playing", "media_player.matrix", "playing", {}, "media"],
        ["Media idle", "media_player.matrix", "idle", {}, null],
        ["Fan on", "fan.matrix", "on", {}, "powered"],
        ["Lock unlocked", "lock.matrix", "unlocked", {}, "security"],
        ["Lock locked", "lock.matrix", "locked", {}, null],
        ["numerische Temperatur", "sensor.temperature", "21.5", {device_class: "temperature"}, null],
        ["numerische Leistung", "sensor.power", "315.7", {device_class: "power"}, null],
        ["unavailable", "light.unavailable", "unavailable", {}, null],
        ["unknown", "light.unknown", "unknown", {}, null]
    ];

    for (const entry of cases) {
        await t.test(entry[0], function () {
            const summary = build([
                rawState(entry[1], entry[2], entry[3])
            ]);

            assert.equal(summary.activeCount, entry[4] ? 1 : 0);
            if (entry[4]) {
                assert.equal(summary.items[0].category, entry[4]);
            } else {
                assert.deepEqual(summary.items, []);
            }
        });
    }

});


test("Sprint-19-Ignore-Matrix toleriert unbekannte IDs und lässt andere Entities sichtbar", function () {

    const result = build(
        [
            rawState("switch.ignored", "on", {}),
            rawState("switch.visible", "on", {})
        ],
        {
            ignoredEntities: ["switch.ignored", "switch.not_present"],
            showMediaTitles: false
        }
    );

    assert.deepEqual(
        result.items.map(function (item) {
            return item.entityIds[0];
        }),
        ["switch.visible"]
    );

});


test("Ignorierliste und Medientitel-Opt-in bleiben reine Anzeigeoptionen", function () {

    const states = [
        rawState("switch.technik", "on", {friendly_name: "Technik"}),
        rawState("media_player.wohnzimmer", "playing", {
            friendly_name: "Wohnzimmer",
            media_title: "Ein Titel"
        })
    ];

    const hidden = build(states, {
        ignoredEntities: ["switch.technik"],
        showMediaTitles: false
    });

    assert.equal(hidden.activeCount, 1);
    assert.equal(hidden.items[0].entityIds[0], "media_player.wohnzimmer");
    assert.equal(JSON.stringify(hidden).includes("Ein Titel"), false);

    const visible = build(states, {
        ignoredEntities: ["switch.technik"],
        showMediaTitles: true
    });

    assert.equal(visible.items[0].metadata.mediaTitle, "Ein Titel");
    assert.match(visible.items[0].description, /Ein Titel/);

});


test("Priorität, Kategorie, Dauer und Titel sortieren deterministisch", function () {

    const summary = build([
        rawState("light.zweite", "on", {friendly_name: "Zweite"}, "2026-08-11T17:50:00Z"),
        rawState("light.erste", "on", {friendly_name: "Erste"}, "2026-08-11T17:00:00Z"),
        rawState("cover.offen", "open", {friendly_name: "Offen"}),
        rawState("lock.haustuer", "unlocked", {friendly_name: "Sicherheit"})
    ]);

    assert.deepEqual(
        summary.items.map(function (item) {
            return item.entityIds[0];
        }),
        [
            "lock.haustuer",
            "cover.offen",
            "light.erste",
            "light.zweite"
        ]
    );

});


test("Stale-Snapshot behält erkannte Aktivitäten und kennzeichnet Metadaten", function () {

    const successful = Snapshot.createSuccessful(
        [rawState("light.wohnzimmer", "on", {friendly_name: "Wohnzimmer"})],
        "2026-08-11T18:00:00.000Z"
    );
    const stale = Snapshot.createStale(
        successful,
        "2026-08-11T18:05:00.000Z",
        "home_assistant_unavailable"
    );

    const summary = Summary.buildSummary(stale, {
        ignoredEntities: [],
        showMediaTitles: false
    });

    assert.equal(summary.activeCount, 1);
    assert.equal(summary.items[0].entityIds[0], "light.wohnzimmer");
    assert.equal(summary.meta.stale, true);
    assert.equal(summary.meta.home_assistant.reachable, false);

});


test("1500 aktive Entities werden schnell und reproduzierbar ausgewertet", function () {

    const states = [];

    for (let index = 1499; index >= 0; index--) {
        states.push(rawState(
            "switch.activity_" + String(index).padStart(4, "0"),
            "on",
            {friendly_name: "Aktivität " + index}
        ));
    }

    const snapshot = Snapshot.createSuccessful(
        states,
        "2026-08-11T18:00:00.000Z"
    );
    const settings = {
        ignoredEntities: [],
        showMediaTitles: false
    };
    const startedAt = process.hrtime.bigint();
    const first = Summary.buildSummary(snapshot, settings);
    const elapsedMilliseconds =
        Number(process.hrtime.bigint() - startedAt) / 1000000;
    const second = Summary.buildSummary(snapshot, settings);

    assert.equal(first.activeCount, 1500);
    assert.deepEqual(first, second);
    assert.ok(elapsedMilliseconds < 2000);
    assert.ok(Buffer.byteLength(JSON.stringify(first)) < 2000000);

});
