const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const DashboardConfig = require("../src/config/dashboard");
const Issues = require("../src/services/issues/engine");
const Presentation = require("../src/services/issues/presentation");
const RuleEngine = require("../src/services/issues/rule-engine");
const Snapshot = require("../src/services/system/snapshot");
const SystemStatus = require("../src/services/system/status");

const ROOT = path.join(__dirname, "..");


function iso(milliseconds) {
    return new Date(milliseconds).toISOString();
}


function entity(entityId, state, changedAt, options) {
    const settings = options || {};

    return {
        entityId: entityId,
        domain: entityId.split(".")[0],
        state: state,
        attributes: {
            friendlyName: settings.friendlyName || entityId,
            deviceClass: settings.deviceClass || null
        },
        lastChanged: iso(changedAt),
        lastUpdated: iso(changedAt),
        context: {
            deviceId: settings.deviceId || null,
            entityCategory: settings.entityCategory || null,
            disabledBy: null
        }
    };
}


function settings() {
    return {
        securityEntities: [],
        ignoredEntities: [],
        entityTitles: {},
        criticalDetectionMode: "device_class",
        criticalLabelId: null,
        rules: RuleEngine.cloneRules(RuleEngine.DEFAULT_RULES)
    };
}


function evaluate(engine, item, configuration, now, extra) {
    return engine.evaluate(
        item,
        configuration,
        Object.assign({nowMilliseconds: now}, extra || {})
    );
}


test("Grace Periods unterscheiden Zustand und Risk Class", function () {
    const engine = new RuleEngine.RuleEngine();
    const configuration = settings();
    const base = Date.parse("2026-08-24T10:00:00.000Z");

    assert.equal(evaluate(
        engine,
        entity("sensor.normal_unavailable", "unavailable", base, {}),
        configuration,
        base + 5000
    ).eligible, false);
    assert.equal(evaluate(
        engine,
        entity("sensor.normal_unavailable", "unavailable", base, {}),
        configuration,
        base + 31000
    ).eligible, true);

    assert.equal(evaluate(
        engine,
        entity("sensor.normal_unknown", "unknown", base, {}),
        configuration,
        base + 5000
    ).eligible, false);
    assert.equal(evaluate(
        engine,
        entity("sensor.normal_unknown", "unknown", base, {}),
        configuration,
        base + 16000
    ).eligible, true);

    const smoke = evaluate(
        engine,
        entity("binary_sensor.smoke", "unknown", base, {deviceClass: "smoke"}),
        configuration,
        base
    );
    assert.equal(smoke.eligible, true);
    assert.equal(smoke.severity, "critical");
    assert.equal(smoke.gracePeriodMs, 0);

    const securityEarly = evaluate(
        engine,
        entity("binary_sensor.window", "unavailable", base, {deviceClass: "window"}),
        configuration,
        base + 4000
    );
    const securityLate = evaluate(
        engine,
        entity("binary_sensor.window", "unavailable", base, {deviceClass: "window"}),
        configuration,
        base + 5000
    );
    assert.equal(securityEarly.eligible, false);
    assert.equal(securityLate.eligible, true);
    assert.equal(securityLate.severity, "critical");

    const diagnostic = evaluate(
        engine,
        entity("sensor.diagnostic", "unavailable", base, {entityCategory: "diagnostic"}),
        configuration,
        base + 59000
    );
    assert.equal(diagnostic.eligible, false);
    assert.equal(diagnostic.gracePeriodMs, 60000);
});


test("Gateway-Neustart respektiert zuverlässiges last_changed", function () {
    const restarted = new RuleEngine.RuleEngine();
    const now = Date.parse("2026-08-24T10:00:00.000Z");
    const evaluation = evaluate(
        restarted,
        entity("sensor.long_offline", "unavailable", now - 3600000, {}),
        settings(),
        now
    );

    assert.equal(evaluation.eligible, true);
    assert.equal(evaluation.graceActive, false);
    assert.equal(evaluation.problemStartedAt, iso(now - 3600000));
});


test("Expected Offline bleibt von Ignore getrennt und schützt Critical Risks", function () {
    const base = Date.parse("2026-08-24T11:00:00.000Z");
    const configuration = settings();
    const engine = new RuleEngine.RuleEngine();

    configuration.rules.entities["sensor.mobile"] = {
        expectedOffline: true,
        unavailableGraceMs: 0
    };
    assert.equal(evaluate(
        engine,
        entity("sensor.mobile", "unavailable", base, {}),
        configuration,
        base
    ).expectedOffline, true);
    assert.equal(evaluate(
        engine,
        entity("sensor.mobile", "unknown", base, {}),
        configuration,
        base + 16000
    ).eligible, true);

    configuration.rules.devices.device_one = {
        expectedOffline: true
    };
    assert.equal(evaluate(
        engine,
        entity("sensor.device_child", "unavailable", base, {deviceId: "device_one"}),
        configuration,
        base + 60000
    ).expectedOffline, true);

    configuration.rules.entities["binary_sensor.critical"] = {
        expectedOffline: true,
        unavailableGraceMs: 0
    };
    const protectedCritical = evaluate(
        engine,
        entity("binary_sensor.critical", "unavailable", base, {deviceClass: "smoke"}),
        configuration,
        base
    );
    assert.equal(protectedCritical.expectedOffline, false);
    assert.equal(protectedCritical.eligible, true);
    assert.equal(protectedCritical.severity, "critical");

    configuration.rules.entities["binary_sensor.critical"]
        .allowCriticalExpectedOffline = true;
    const consciousOverride = evaluate(
        engine,
        entity("binary_sensor.critical", "unavailable", base, {deviceClass: "smoke"}),
        configuration,
        base + 1
    );
    assert.equal(consciousOverride.expectedOffline, true);
    assert.equal(consciousOverride.eligible, false);

    Issues.resetRuleEngine();
    const snapshot = Snapshot.createSuccessful([{
        entity_id: "sensor.ignored",
        state: "unknown",
        attributes: {},
        last_changed: iso(base - 60000),
        last_updated: iso(base)
    }], iso(base));
    const ignored = settings();
    ignored.ignoredEntities = ["sensor.ignored"];
    ignored.rules.entities["sensor.ignored"] = {expectedOffline: true};
    assert.equal(Issues.buildIssues(snapshot, ignored).issues.length, 0);
});


test("Regelauflösung folgt Entity, Device, Security, Risk, Domain und Default", function () {
    const configuration = settings();
    const item = entity(
        "sensor.priority",
        "unavailable",
        0,
        {deviceId: "device_priority"}
    );

    configuration.rules.defaults.expectedOffline = false;
    configuration.rules.domains.sensor = {expectedOffline: true};
    let resolved = RuleEngine.resolveRule(item, configuration, false, false);
    assert.equal(resolved.effective.expectedOffline, true);
    assert.equal(resolved.ruleSource, "risk_class");

    configuration.rules.devices.device_priority = {
        expectedOffline: false,
        unavailableGraceMs: 12000
    };
    resolved = RuleEngine.resolveRule(item, configuration, false, false);
    assert.equal(resolved.effective.expectedOffline, false);
    assert.equal(resolved.effective.unavailableGraceMs, 12000);
    assert.equal(resolved.ruleSource, "device");

    configuration.rules.entities["sensor.priority"] = {
        unavailableGraceMs: 7000
    };
    resolved = RuleEngine.resolveRule(item, configuration, false, false);
    assert.equal(resolved.effective.unavailableGraceMs, 7000);
    assert.equal(resolved.ruleSource, "entity");

    delete configuration.rules.entities["sensor.priority"];
    delete configuration.rules.devices.device_priority;
    resolved = RuleEngine.resolveRule(item, configuration, true, false);
    assert.equal(resolved.riskClass, "security");
    assert.equal(resolved.effective.unavailableGraceMs, 5000);
    assert.equal(resolved.ruleSource, "security_entity");

    resolved = RuleEngine.resolveRule(item, configuration, false, true);
    assert.equal(resolved.riskClass, "security");
    assert.equal(resolved.ruleSource, "critical_detection");
});


test("Flapping nutzt nur einen begrenzten In-Memory-Ringbuffer", function () {
    const engine = new RuleEngine.RuleEngine({maxTransitions: 10});
    const configuration = settings();
    const base = Date.parse("2026-08-24T12:00:00.000Z");
    const id = "sensor.flapping";
    const states = ["on", "unavailable", "on", "unavailable", "on"];
    let result;

    states.forEach(function (state, index) {
        result = evaluate(
            engine,
            entity(id, state, base + index * 1000, {}),
            configuration,
            base + index * 1000
        );
    });

    assert.equal(result.eligible, true);
    assert.equal(result.flapping, true);
    assert.equal(result.recoveryPending, true);
    assert.equal(result.severity, "warning");
    assert.equal(engine.history(id).length, 4);

    for (let index = 5; index < 30; index++) {
        const state = index % 2 === 0 ? "on" : "unavailable";
        evaluate(
            engine,
            entity(id, state, base + index * 1000, {}),
            configuration,
            base + index * 1000
        );
    }
    assert.equal(engine.history(id).length <= 10, true);

    const quiet = new RuleEngine.RuleEngine();
    evaluate(quiet, entity("sensor.quiet", "on", base, {}), configuration, base);
    evaluate(quiet, entity("sensor.quiet", "unavailable", base + 1000, {}), configuration, base + 1000);
    result = evaluate(quiet, entity("sensor.quiet", "on", base + 2000, {}), configuration, base + 2000);
    assert.equal(result.flapping, false);

    result = evaluate(
        quiet,
        entity("sensor.quiet", "unavailable", base + 700000, {}),
        configuration,
        base + 700000
    );
    assert.equal(result.transitionCount, 1);
});


test("Stable Recovery hält Issues bis zur stabilen Wiederherstellung", function () {
    const engine = new RuleEngine.RuleEngine();
    const configuration = settings();
    const base = Date.parse("2026-08-24T13:00:00.000Z");
    const id = "sensor.recovery";

    configuration.rules.entities[id] = {
        unavailableGraceMs: 0,
        recoveryGraceMs: 10000
    };

    let result = evaluate(
        engine,
        entity(id, "unavailable", base, {}),
        configuration,
        base
    );
    assert.equal(result.eligible, true);

    result = evaluate(
        engine,
        entity(id, "on", base + 1000, {}),
        configuration,
        base + 1000
    );
    assert.equal(result.eligible, true);
    assert.equal(result.recoveryPending, true);

    result = evaluate(
        engine,
        entity(id, "unavailable", base + 3000, {}),
        configuration,
        base + 3000
    );
    assert.equal(result.eligible, true);
    assert.equal(result.recoveryPending, false);

    evaluate(
        engine,
        entity(id, "on", base + 4000, {}),
        configuration,
        base + 4000
    );
    result = evaluate(
        engine,
        entity(id, "on", base + 14000, {}),
        configuration,
        base + 14000
    );
    assert.equal(result.eligible, false);
    assert.equal(result.recoveryPending, false);
});


test("Device Aggregation ergänzt Counts und konservativen Failure Hint", function () {
    const snapshot = {
        entities: [],
        metadata: {entities: {}, devices: {}, areas: {}, configEntries: {}}
    };
    const issues = [];

    for (let index = 0; index < 3; index++) {
        snapshot.entities.push(entity(
            "sensor.device_" + index,
            "unavailable",
            0,
            {deviceId: "device_group"}
        ));
        issues.push({
            id: "issue-" + index,
            source: "entity_state",
            entityId: "sensor.device_" + index,
            state: "unavailable",
            severity: "warning",
            flapping: index === 0,
            recoveryPending: index === 1,
            durationSeconds: 60
        });
    }
    snapshot.entities.push(entity(
        "sensor.device_healthy",
        "on",
        0,
        {deviceId: "device_group"}
    ));

    const group = Presentation.aggregate(snapshot, issues)[0];
    assert.equal(group.issueCount, 3);
    assert.equal(group.unavailableCount, 3);
    assert.equal(group.flappingCount, 1);
    assert.equal(group.recoveryPendingCount, 1);
    assert.equal(group.deviceEntityCount, 4);
    assert.equal(group.deviceUnreachable, true);
    assert.match(group.deviceFailureHint, /Mehrere Entitäten/);
});


test("Schema 9 migriert Regeln und validiert Grenzen", function () {
    const schema7 = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    schema7.schemaVersion = 7;
    delete schema7.systemDashboards.errors.rules;

    const migrated = DashboardConfig.migrateConfiguration(schema7);
    assert.equal(migrated.migrated, true);
    assert.equal(migrated.configuration.schemaVersion, 9);
    assert.equal(
        migrated.configuration.systemDashboards.errors.rules
            .riskClasses.safety.unavailableGraceMs,
        0
    );

    const invalidGrace = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    invalidGrace.systemDashboards.errors.rules.entities["sensor.invalid"] = {
        unavailableGraceMs: -1
    };
    assert.throws(function () {
        DashboardConfig.validateConfiguration(invalidGrace);
    }, /ungültigen Wert/);

    const invalidThreshold = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    invalidThreshold.systemDashboards.errors.rules.devices.device_one = {
        flapThreshold: 1
    };
    assert.throws(function () {
        DashboardConfig.validateConfiguration(invalidThreshold);
    }, /ungültigen Wert/);

    const unsafeOverride = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    unsafeOverride.systemDashboards.errors.rules.entities["sensor.invalid"] = {
        allowCriticalExpectedOffline: true
    };
    assert.throws(function () {
        DashboardConfig.validateConfiguration(unsafeOverride);
    }, /ohne Expected Offline/);
});


test("Health Status respektiert Grace, Expected Offline und Recovery", function () {
    const base = Date.parse("2026-08-24T14:00:00.000Z");
    const configuration = settings();

    configuration.rules.entities["sensor.expected"] = {
        expectedOffline: true
    };

    Issues.resetRuleEngine();
    let snapshot = Snapshot.createSuccessful([
        {
            entity_id: "sensor.grace",
            state: "unavailable",
            attributes: {},
            last_changed: iso(base),
            last_updated: iso(base)
        },
        {
            entity_id: "sensor.expected",
            state: "unavailable",
            attributes: {},
            last_changed: iso(base - 60000),
            last_updated: iso(base)
        }
    ], iso(base + 5000));
    let status = SystemStatus.build(snapshot, configuration);
    assert.equal(status.relevant, 0);

    configuration.rules.entities["sensor.recovery_health"] = {
        unavailableGraceMs: 0,
        recoveryGraceMs: 10000
    };
    snapshot = Snapshot.createSuccessful([{
        entity_id: "sensor.recovery_health",
        state: "unavailable",
        attributes: {},
        last_changed: iso(base + 10000),
        last_updated: iso(base + 10000)
    }], iso(base + 10000));
    status = SystemStatus.build(snapshot, configuration);
    assert.equal(status.warning, 1);

    snapshot = Snapshot.createSuccessful([{
        entity_id: "sensor.recovery_health",
        state: "on",
        attributes: {},
        last_changed: iso(base + 11000),
        last_updated: iso(base + 11000)
    }], iso(base + 11000));
    status = SystemStatus.build(snapshot, configuration);
    assert.equal(status.warning, 1);
    assert.equal(status.relevant, 1);
});


test("3000 Entities, 500 Devices, 100 Flaps und 500 Overrides bleiben linear", function () {
    const engine = new RuleEngine.RuleEngine();
    const configuration = settings();
    const base = Date.parse("2026-08-24T15:00:00.000Z");
    const entities = [];

    for (let index = 0; index < 500; index++) {
        configuration.rules.entities["sensor.large_" + index] = {
            unavailableGraceMs: 0
        };
    }

    for (let index = 0; index < 3000; index++) {
        entities.push(entity(
            "sensor.large_" + index,
            index < 200 ? "unavailable" : "on",
            base - 60000,
            {deviceId: "device_" + (index % 500)}
        ));
    }

    for (let transition = 0; transition < 5; transition++) {
        for (let index = 0; index < 100; index++) {
            evaluate(
                engine,
                entity(
                    "sensor.large_" + index,
                    transition % 2 === 0 ? "on" : "unavailable",
                    base + transition * 1000,
                    {deviceId: "device_" + index}
                ),
                configuration,
                base + transition * 1000
            );
        }
    }

    const started = process.hrtime.bigint();
    const results = entities.map(function (item) {
        return evaluate(engine, item, configuration, base + 10000);
    });
    const elapsed = Number(process.hrtime.bigint() - started) / 1000000;

    assert.equal(results.filter(function (result) {
        return result.eligible;
    }).length >= 200, true);
    assert.equal(engine.history("sensor.large_0").length <= 16, true);
    assert.equal(elapsed < 3000, true);
});


test("Sprint 22 bleibt read-only und fragt keine HA-History ab", function () {
    const ruleSource = fs.readFileSync(
        path.join(ROOT, "src/services/issues/rule-engine.js"),
        "utf8"
    );
    const apiSource = fs.readFileSync(
        path.join(ROOT, "src/routes/api.js"),
        "utf8"
    );
    const systemRoutes = fs.readFileSync(
        path.join(ROOT, "src/routes/system-dashboards.js"),
        "utf8"
    );
    const adminSource = fs.readFileSync(
        path.join(ROOT, "src/admin/js/app.js"),
        "utf8"
    );

    assert.doesNotMatch(ruleSource, /history\/period|history\/state|recorder/);
    assert.doesNotMatch(systemRoutes, /router\.(post|put|patch|delete)\s*\(/i);
    assert.match(apiSource, /ALLOWED_LIGHT_ENTITIES/);
    assert.match(apiSource, /ALLOWED_CLIMATE_ENTITIES/);
    assert.match(adminSource, /Expected Offline/);
    assert.match(adminSource, /allowCriticalExpectedOffline/);
});
