const assert = require("node:assert/strict");
const test = require("node:test");

const Issues = require("../src/services/issues/engine");
const Severity = require("../src/services/issues/severity");
const Snapshot = require("../src/services/system/snapshot");


function rawState(entityId, state, attributes, lastChanged) {
    return {
        entity_id: entityId,
        state: state,
        attributes: attributes || {},
        last_changed: lastChanged || "2026-08-11T17:00:00Z",
        last_updated: "2026-08-11T17:30:00Z"
    };
}


function settings(securityEntities, ignoredEntities) {
    return {
        securityEntities: securityEntities || [],
        ignoredEntities: ignoredEntities || [],
        entityTitles: {
            "sensor.configured": "Konfigurierter Titel"
        }
    };
}


function build(states, configuration, collectedAt) {
    return Issues.buildIssues(
        Snapshot.createSuccessful(
            states,
            collectedAt || "2026-08-11T18:00:00.000Z"
        ),
        configuration || settings()
    );
}


test("unavailable und unknown bleiben getrennt und normalisiert", function () {
    const result = build([
        rawState("sensor.configured", "unavailable", {
            friendly_name: "Friendly Name",
            access_token: "must-not-survive",
            media_title: "Privater Titel"
        }),
        rawState("sensor.unknown", "unknown", {}),
        rawState("sensor.off", "off", {})
    ]);

    assert.equal(result.issues.length, 2);
    assert.equal(result.issues[0].state, "unavailable");
    assert.equal(result.issues[0].severity, "warning");
    assert.equal(result.issues[0].title, "Konfigurierter Titel nicht erreichbar");
    assert.equal(result.issues[1].state, "unknown");
    assert.equal(result.issues[1].severity, "info");
    assert.equal(result.summary.unavailable, 1);
    assert.equal(result.summary.unknown, 1);
    assert.equal(result.overallStatus, "warning");
    assert.equal(result.issues[0].source, "entity_state");
    assert.equal(result.issues[0].status, "active");
    assert.equal(result.issues[0].metadata.state, "unavailable");
    assert.equal(JSON.stringify(result).includes("must-not-survive"), false);
    assert.equal(JSON.stringify(result).includes("Privater Titel"), false);
});


test("Security-Konfiguration und Risk Class bestimmen Severity ohne Namensheuristik", function () {
    const result = build(
        [
            rawState("binary_sensor.rauch", "unavailable", {
                friendly_name: "Rauchmelder",
                device_class: "smoke"
            }),
            rawState("binary_sensor.gas", "unknown", {
                friendly_name: "Gasmelder",
                device_class: "gas"
            }),
            rawState("binary_sensor.hinweis", "unavailable", {
                device_class: "safety"
            }),
            rawState("sensor.ignore", "unknown", {})
        ],
        settings(
            ["binary_sensor.rauch", "binary_sensor.gas"],
            ["sensor.ignore"]
        )
    );

    assert.deepEqual(
        result.issues.map(function (issue) {
            return [issue.entityId, issue.severity, issue.securityRelevant];
        }).sort(function (first, second) {
            return first[0].localeCompare(second[0]);
        }),
        [
            ["binary_sensor.gas", "critical", true],
            ["binary_sensor.hinweis", "critical", true],
            ["binary_sensor.rauch", "critical", true]
        ]
    );
    assert.equal(
        result.issues.every(function (issue) {
            return issue.potentiallySecurityRelevant === true;
        }),
        true
    );
    assert.equal(result.overallStatus, "critical");
    assert.equal(
        result.issues.some(function (issue) {
            return issue.entityId === "sensor.ignore";
        }),
        false
    );
});


test("Severity-Sortierung ist vollständig und deterministisch", function () {
    const input = [
        {severity: "info", securityRelevant: false, durationSeconds: 500, title: "Info", entityId: "sensor.info"},
        {severity: "warning", securityRelevant: false, durationSeconds: 10, title: "Warnung", entityId: "sensor.warning"},
        {severity: "error", securityRelevant: false, durationSeconds: 10, title: "Fehler", entityId: "sensor.error"},
        {severity: "critical", securityRelevant: false, durationSeconds: 10, title: "Kritisch", entityId: "sensor.critical"},
        {severity: "warning", securityRelevant: true, durationSeconds: 1, title: "Security", entityId: "sensor.security"},
        {severity: "warning", securityRelevant: false, durationSeconds: 100, title: "Alt", entityId: "sensor.old"},
        {severity: "warning", securityRelevant: false, durationSeconds: 100, title: "Alt", entityId: "sensor.old_b"}
    ];

    Severity.sortIssues(input);

    assert.deepEqual(
        input.map(function (issue) {
            return issue.entityId;
        }),
        [
            "sensor.critical",
            "sensor.error",
            "sensor.security",
            "sensor.old",
            "sensor.old_b",
            "sensor.warning",
            "sensor.info"
        ]
    );
});


test("Dauer nutzt nur last_changed und wird niemals negativ", function () {
    const result = build([
        rawState("sensor.known", "unavailable", {}, "2026-08-11T17:58:30Z"),
        rawState("sensor.future", "unknown", {}, "2026-08-11T19:00:00Z"),
        rawState("sensor.missing", "unknown", {}, "not-a-date")
    ]);

    const byId = Object.create(null);
    result.issues.forEach(function (issue) {
        byId[issue.entityId] = issue;
    });

    assert.equal(byId["sensor.known"].durationSeconds, 90);
    assert.equal(byId["sensor.future"].durationSeconds, 0);
    assert.equal(byId["sensor.missing"].durationSeconds, null);
    assert.equal(byId["sensor.known"].startedAt, "2026-08-11T17:58:30.000Z");
});


test("Gesamtstatus unterscheidet OK, Warning, Error, Critical und stale", function () {
    assert.equal(build([]).overallStatus, "ok");
    assert.equal(build([rawState("sensor.warning", "unavailable")]).overallStatus, "warning");
    assert.equal(build(
        [rawState("sensor.error", "unknown")],
        settings(["sensor.error"])
    ).overallStatus, "critical");
    assert.equal(build(
        [rawState("sensor.critical", "unavailable")],
        settings(["sensor.critical"])
    ).overallStatus, "critical");

    const successful = Snapshot.createSuccessful(
        [rawState("sensor.saved", "unavailable")],
        "2026-08-11T18:00:00.000Z"
    );
    const stale = Issues.buildIssues(
        Snapshot.createStale(
            successful,
            "2026-08-11T18:05:00.000Z",
            "home_assistant_unavailable"
        ),
        settings()
    );
    const offline = Issues.buildIssues(
        Snapshot.createStale(
            null,
            "2026-08-11T18:05:00.000Z",
            "home_assistant_unavailable"
        ),
        settings()
    );

    assert.equal(stale.overallStatus, "stale");
    assert.equal(stale.issues.length, 1);
    assert.equal(stale.meta.stale, true);
    assert.equal(stale.meta.last_successful_update, "2026-08-11T18:00:00.000Z");
    assert.equal(stale.issues[0].startedAt, "2026-08-11T17:00:00.000Z");
    assert.equal(offline.overallStatus, "unknown");
    assert.equal(offline.issues.length, 0);
    assert.match(offline.message, /noch nicht verfügbar/i);
});


test("Recovery berechnet Issues neu und entfernt behobene Störungen", function () {
    const staleSource = Snapshot.createSuccessful(
        [rawState("sensor.recovery", "unavailable")],
        "2026-08-11T18:00:00.000Z"
    );
    const stale = Issues.buildIssues(
        Snapshot.createStale(
            staleSource,
            "2026-08-11T18:05:00.000Z",
            "home_assistant_unavailable"
        ),
        settings()
    );
    const recovered = build([
        rawState("sensor.recovery", "20")
    ], settings(), "2026-08-11T18:06:00.000Z");

    assert.equal(stale.issues.length, 1);
    assert.equal(recovered.issues.length, 0);
    assert.equal(recovered.overallStatus, "ok");
    assert.equal(recovered.meta.stale, false);
});


test("Unvollständige Entities bleiben robust und datenreduziert", function () {
    const result = build([
        rawState("sensor.no_attributes", "unavailable", null),
        rawState("sensor.unusual", "mystery", {friendly_name: "Mystery"})
    ]);

    assert.equal(result.issues.length, 1);
    assert.match(result.issues[0].title, /sensor\.no_attributes/);
    assert.equal(result.issues[0].deviceClass, null);
    assert.equal(result.entities, undefined);
    assert.equal(result.issues[0].attributes, undefined);
});


test("1000 Entities werden schnell, korrekt und kompakt ausgewertet", function () {
    const states = [];
    const securityEntities = [];

    for (let index = 0; index < 1000; index++) {
        let state = "off";

        if (index < 50) {
            state = "unavailable";
        } else if (index < 70) {
            state = "unknown";
        }

        const entityId = "sensor.large_" + String(index).padStart(4, "0");
        states.push(rawState(entityId, state, {
            friendly_name: "Große Entity " + index,
            huge_raw_attribute: "x".repeat(4096)
        }));

        if (index < 5 || (index >= 50 && index < 53)) {
            securityEntities.push(entityId);
        }
    }

    const snapshot = Snapshot.createSuccessful(
        states,
        "2026-08-11T18:00:00.000Z"
    );
    const startedAt = process.hrtime.bigint();
    const first = Issues.buildIssues(
        snapshot,
        settings(securityEntities)
    );
    const elapsedMilliseconds =
        Number(process.hrtime.bigint() - startedAt) / 1000000;
    const second = Issues.buildIssues(
        snapshot,
        settings(securityEntities)
    );

    assert.equal(first.issues.length, 70);
    assert.equal(first.summary.critical, 8);
    assert.equal(first.summary.error, 0);
    assert.equal(first.summary.warning, 45);
    assert.equal(first.summary.info, 17);
    assert.deepEqual(first, second);
    assert.ok(elapsedMilliseconds < 2000);
    assert.ok(Buffer.byteLength(JSON.stringify(first)) < 200000);
    assert.equal(JSON.stringify(first).includes("huge_raw_attribute"), false);
});
