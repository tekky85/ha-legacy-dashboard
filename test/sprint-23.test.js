const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const AutomationImpact = require("../src/services/automations/impact");
const AutomationIndexes = require("../src/services/automations/indexes");
const AutomationNormalizers = require("../src/services/automations/normalizers");
const AutomationService = require("../src/services/automations/service");
const Issues = require("../src/services/issues/engine");
const Presentation = require("../src/services/issues/presentation");
const RuleEngine = require("../src/services/issues/rule-engine");
const Snapshot = require("../src/services/system/snapshot");

const ROOT = path.join(__dirname, "..");


function rawState(entityId, state, attributes, changedAt) {
    return {
        entity_id: entityId,
        state: state,
        attributes: attributes || {},
        last_changed: changedAt || "2026-08-24T10:00:00.000Z",
        last_updated: changedAt || "2026-08-24T10:00:00.000Z"
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


function source(ok) {
    return {
        supported: true,
        ok: ok !== false,
        stale: false,
        lastSuccessfulAt: "2026-08-24T10:01:00.000Z",
        errorCode: null
    };
}


function automationSnapshot() {
    const snapshot = Snapshot.createSuccessful([
        rawState("binary_sensor.window", "unavailable", {
            friendly_name: "Fenster"
        }, "2026-08-24T09:58:00.000Z"),
        rawState("sensor.standalone", "unknown", {
            friendly_name: "Standalone"
        }, "2026-08-24T09:58:00.000Z"),
        rawState("automation.direct", "on", {
            id: "direct-id",
            friendly_name: "Direkte Automation",
            last_triggered: "2026-08-24T09:45:00.000Z",
            mode: "single",
            current: 0,
            max: 1
        }),
        rawState("automation.indirect", "off", {
            id: "indirect-id",
            friendly_name: "Area Automation"
        }),
        rawState("automation.dynamic", "on", {
            id: "dynamic-id",
            friendly_name: "Dynamische Automation"
        })
    ], "2026-08-24T10:01:00.000Z");
    const inventory = AutomationNormalizers.inventory(snapshot.entities);
    const references = {
        "automation.direct": AutomationNormalizers.references({
            triggers: [{entity_id: "binary_sensor.window"}],
            actions: [{target: {device_id: "device-window"}}]
        }),
        "automation.indirect": AutomationNormalizers.references({
            conditions: [{target: {area_id: "bedroom"}}],
            actions: [{target: {label_id: ["security", "area-label"]}}]
        }),
        "automation.dynamic": AutomationNormalizers.references({
            actions: [{target: {entity_id: "{{ states('input_text.target') }}"}}]
        })
    };

    inventory.forEach(function (automation) {
        automation.references = references[automation.entityId];
    });

    snapshot.metadata = {
        entities: {
            "binary_sensor.window": {
                entityId: "binary_sensor.window",
                deviceId: "device-window",
                areaId: null,
                labelIds: []
            },
            "sensor.standalone": {
                entityId: "sensor.standalone",
                deviceId: null,
                areaId: null,
                labelIds: []
            }
        },
        devices: {
            "device-window": {
                deviceId: "device-window",
                name: "Fenstergerät",
                areaId: "bedroom",
                labelIds: ["security"]
            }
        },
        areas: {bedroom: {
            areaId: "bedroom",
            name: "Schlafzimmer",
            labelIds: ["area-label"]
        }},
        labels: {security: {labelId: "security", name: "Sicherheit"}},
        configEntries: {}
    };
    snapshot.entities.forEach(function (entity) {
        const registry = snapshot.metadata.entities[entity.entityId];
        entity.context = {
            deviceId: registry ? registry.deviceId : null,
            areaId: registry ? registry.areaId : null,
            disabledBy: null,
            entityCategory: null,
            deviceName: registry && registry.deviceId
                ? "Fenstergerät"
                : null,
            areaName: registry && registry.deviceId
                ? "Schlafzimmer"
                : null
        };
    });
    snapshot.automations = {
        inventory: inventory,
        indexes: AutomationIndexes.create(inventory)
    };
    snapshot.sources.automationInventory = source();
    snapshot.sources.automationConfig = source();
    snapshot.sources.automationTrace = {
        supported: null,
        ok: false,
        stale: false,
        lastSuccessfulAt: null,
        errorCode: null
    };
    snapshot.capabilities = {
        automationInventory: true,
        automationConfigRead: true,
        automationTraceRead: false
    };

    return snapshot;
}


test("Automation Inventory normalisiert Zustände und ausschließlich benötigte Attribute", function () {
    const snapshot = Snapshot.createSuccessful([
        rawState("automation.on", "on", {
            id: "automation-id",
            friendly_name: "Flurlicht",
            last_triggered: "2026-08-24T09:00:00Z",
            mode: "queued",
            current: 2,
            max: 5,
            secret: "must-not-leak"
        }),
        rawState("automation.off", "off", {friendly_name: "Aus"}),
        rawState("automation.unavailable", "unavailable", {}),
        rawState("automation.unknown", "unknown", {}),
        rawState("sensor.other", "on", {})
    ], "2026-08-24T10:00:00Z");
    const result = AutomationNormalizers.inventory(snapshot.entities);
    const on = result.find(function (automation) {
        return automation.entityId === "automation.on";
    });
    const off = result.find(function (automation) {
        return automation.entityId === "automation.off";
    });
    const unavailable = result.find(function (automation) {
        return automation.entityId === "automation.unavailable";
    });
    const unknown = result.find(function (automation) {
        return automation.entityId === "automation.unknown";
    });

    assert.equal(result.length, 4);
    assert.equal(on.lastTriggered, "2026-08-24T09:00:00.000Z");
    assert.equal(on.mode, "queued");
    assert.equal(on.currentRuns, 2);
    assert.equal(on.maxRuns, 5);
    assert.equal(off.state, "off");
    assert.equal(off.available, true);
    assert.equal(unavailable.available, false);
    assert.equal(unknown.state, "unknown");
    assert.equal(JSON.stringify(result).includes("must-not-leak"), false);
});


test("Reference Parser indexiert explizite Trigger, Conditions und Actions ohne Templates", function () {
    const result = AutomationNormalizers.references({config: {
        triggers: [
            {entity_id: ["binary_sensor.window", "binary_sensor.window"]},
            {device_id: "device-one"}
        ],
        conditions: [{target: {area_id: "bedroom"}}],
        actions: [
            {target: {label_id: ["security", "security"]}},
            {target: {entity_id: "light.hall"}},
            {data: {message: "{{ states('sensor.private') }}"}}
        ],
        description: "sensor.name_is_not_a_reference"
    }});

    assert.deepEqual(result.entityIds, ["binary_sensor.window", "light.hall"]);
    assert.deepEqual(result.deviceIds, ["device-one"]);
    assert.deepEqual(result.areaIds, ["bedroom"]);
    assert.deepEqual(result.labelIds, ["security"]);
    assert.deepEqual(result.sections.trigger.entityIds, ["binary_sensor.window"]);
    assert.deepEqual(result.sections.condition.areaIds, ["bedroom"]);
    assert.deepEqual(result.sections.action.entityIds, ["light.hall"]);
    assert.equal(result.dynamicReferences, true);
    assert.equal(result.entityIds.includes("sensor.private"), false);
    assert.equal(result.entityIds.includes("sensor.name_is_not_a_reference"), false);
});


test("Reference Index und Impact unterscheiden direct, indirect und unvollständige Analyse", function () {
    const snapshot = automationSnapshot();
    const issue = {
        entityId: "binary_sensor.window",
        source: "entity_state"
    };
    const impact = AutomationImpact.forIssue(snapshot, issue);
    const direct = impact.find(function (item) {
        return item.entityId === "automation.direct";
    });
    const indirect = impact.find(function (item) {
        return item.entityId === "automation.indirect";
    });
    const analysis = AutomationImpact.analysis(snapshot);

    assert.equal(direct.confidence, "direct");
    assert.deepEqual(direct.reasons, ["entity", "device"]);
    assert.equal(indirect.confidence, "indirect");
    assert.deepEqual(indirect.reasons, ["area", "label"]);
    assert.equal(indirect.disabled, true);
    assert.equal(analysis.dynamicCount, 1);
    assert.equal(analysis.unknownConfidence, "unknown");
    assert.equal(impact.some(function (item) {
        return item.entityId === "automation.dynamic";
    }), false);
});


test("Blueprints bleiben als nicht statisch auflösbare Referenzen markiert", function () {
    const result = AutomationNormalizers.references({config: {
        use_blueprint: {
            path: "demo/private-blueprint.yaml",
            input: {target: "binary_sensor.window"}
        }
    }});

    assert.equal(result.dynamicReferences, true);
    assert.deepEqual(result.entityIds, []);
    assert.equal(JSON.stringify(result).includes("private-blueprint"), false);
});


test("Device Group und Standalone Issue erhalten Automation Impact erst nach Sprint-22-Auswertung", function () {
    Issues.resetRuleEngine();
    const snapshot = automationSnapshot();
    const result = Presentation.build(
        snapshot,
        Issues.buildIssues(snapshot, settings())
    );
    const device = result.groups.find(function (group) {
        return group.deviceId === "device-window";
    });
    const standalone = result.groups.find(function (group) {
        return group.entityId === "sensor.standalone";
    });

    assert.equal(device.affectedAutomationCount, 2);
    assert.equal(device.affectedAutomations[0].confidence, "direct");
    assert.equal(standalone.affectedAutomationCount, 0);
    assert.equal(result.automationAnalysis.dynamicCount, 1);
    assert.equal(result.presentationVersion, 3);
    assert.equal(JSON.stringify(result).includes("triggers"), false);
    assert.equal(JSON.stringify(result).includes("actions"), false);
});


test("Automation off ist kein Issue; unavailable und unknown folgen der bestehenden Rule Engine", function () {
    Issues.resetRuleEngine();
    const snapshot = Snapshot.createSuccessful([
        rawState("automation.disabled", "off", {friendly_name: "Deaktiviert"}, "2026-08-24T09:00:00Z"),
        rawState("automation.unavailable", "unavailable", {friendly_name: "Nicht verfügbar"}, "2026-08-24T09:00:00Z"),
        rawState("automation.unknown", "unknown", {friendly_name: "Unbekannt"}, "2026-08-24T09:00:00Z")
    ], "2026-08-24T10:00:00Z");
    snapshot.entities.forEach(function (entity) {
        entity.context = {disabledBy: null, entityCategory: null};
    });
    snapshot.metadata = {entities: {}, devices: {}, areas: {}, labels: {}, configEntries: {}};
    snapshot.diagnostics = {repairs: [], matter: []};
    const result = Issues.buildIssues(snapshot, settings());
    const unavailable = result.issues.find(function (issue) {
        return issue.entityId === "automation.unavailable";
    });
    const unknown = result.issues.find(function (issue) {
        return issue.entityId === "automation.unknown";
    });

    assert.equal(result.issues.some(function (issue) {
        return issue.entityId === "automation.disabled";
    }), false);
    assert.equal(unavailable.source, "automation_unavailable");
    assert.equal(unavailable.severity, "warning");
    assert.equal(unknown.source, "entity_state");
    assert.equal(unknown.severity, "info");
});


test("Config Adapter nutzt feste Commands, Cache und Inflight-Deduplizierung", async function () {
    const calls = [];
    const logs = [];
    const client = {
        request: function (command) {
            calls.push(command);
            return Promise.resolve({config: {
                triggers: [{entity_id: "binary_sensor.window"}],
                actions: [{target: {device_id: "device-one"}}],
                secret: "raw-secret"
            }});
        }
    };
    const service = AutomationService.createService({
        client: client,
        logger: {
            info: function (event, fields) {
                logs.push({event: event, fields: fields});
            },
            warn: function (event, fields) {
                logs.push({event: event, fields: fields});
            }
        },
        clock: function () {
            return Date.parse("2026-08-24T10:00:00Z");
        }
    });
    const entities = Snapshot.createSuccessful([
        rawState("automation.one", "on", {id: "one"}),
        rawState("automation.two", "off", {id: "two"})
    ], "2026-08-24T10:00:00Z").entities;
    const first = service.getMetadata(entities, true);
    const second = service.getMetadata(entities, true);
    const results = await Promise.all([first, second]);
    await service.getMetadata(entities, true);

    assert.equal(calls.length, 2);
    assert.equal(calls.every(function (command) {
        return command.type === "automation/config" &&
            /^automation\./.test(command.entity_id);
    }), true);
    assert.equal(results[0].configSource.supported, true);
    assert.equal(results[0].indexes.automationsByEntityId["binary_sensor.window"].length, 2);
    assert.equal(JSON.stringify(results).includes("raw-secret"), false);
    assert.equal(JSON.stringify(logs).includes("raw-secret"), false);
});


test("Unsupported Config Capability bleibt kontrolliert und zerstört Inventory nicht", async function () {
    const service = AutomationService.createService({
        client: {
            request: function () {
                const error = new Error("unsupported");
                error.code = "ha_command_unsupported";
                return Promise.reject(error);
            }
        },
        logger: {info: function () {}, warn: function () {}}
    });
    const entities = Snapshot.createSuccessful([
        rawState("automation.one", "on", {id: "one"})
    ], "2026-08-24T10:00:00Z").entities;
    const result = await service.getMetadata(entities, true);

    assert.equal(result.inventory.length, 1);
    assert.equal(result.inventorySource.ok, true);
    assert.equal(result.configSource.supported, false);
    assert.equal(result.indexes.dynamicAutomationEntityIds.length, 0);
});


test("Vollständiger Config-Ausfall bleibt unbekannt und letzter gültiger Snapshot behält Automation-Metadaten", async function () {
    const service = AutomationService.createService({
        client: {
            request: function () {
                const error = new Error("timeout");
                error.code = "ha_websocket_timeout";
                return Promise.reject(error);
            }
        },
        logger: {info: function () {}, warn: function () {}}
    });
    const successful = automationSnapshot();
    const result = await service.getMetadata(
        successful.entities,
        true
    );
    const stale = Snapshot.createStale(
        successful,
        "2026-08-24T10:02:00.000Z",
        "home_assistant_unavailable"
    );

    assert.equal(result.configSource.supported, null);
    assert.equal(result.configSource.ok, false);
    assert.equal(result.inventory.length, 3);
    assert.equal(stale.automations.inventory.length, 3);
    assert.equal(stale.sources.automationConfig.stale, true);
});


test("Trace Summary trennt Fehler, Condition false und Not Triggered ohne Raw Payload", async function () {
    const calls = [];
    const service = AutomationService.createService({
        client: {
            request: function (command) {
                calls.push(command);
                return Promise.resolve([
                    {
                        run_id: "error-run",
                        timestamp: {start: "2026-08-24T09:00:00Z", finish: "2026-08-24T09:00:02Z"},
                        script_execution: "error",
                        error: "private service data",
                        trigger: "Fenster geöffnet",
                        trace: {"action/0": [{changed_variables: {secret: "hidden"}}]}
                    },
                    {
                        run_id: "condition-run",
                        timestamp: {start: "2026-08-24T09:10:00Z", finish: "2026-08-24T09:10:01Z"},
                        script_execution: "failed_conditions"
                    },
                    {
                        run_id: "not-triggered-run",
                        timestamp: {start: "2026-08-24T09:20:00Z", finish: "2026-08-24T09:20:00Z"},
                        script_execution: "not_triggered",
                        not_triggered: true
                    }
                ]);
            }
        },
        logger: {info: function () {}, warn: function () {}}
    });
    const inventory = [{
        entityId: "automation.one",
        itemId: "one",
        name: "One"
    }];
    const result = await service.getTraceSummaries(
        inventory,
        ["automation.one"]
    );
    const summaries = result.automations[0].summaries;

    assert.deepEqual(calls, [{
        type: "trace/list",
        domain: "automation",
        item_id: "one"
    }]);
    assert.equal(result.source.status, "available");
    assert.equal(result.automations[0].errorCount, 1);
    assert.equal(summaries[0].result, "not_triggered");
    assert.equal(summaries[0].hasError, false);
    assert.equal(summaries[1].result, "condition_false");
    assert.equal(summaries[1].hasError, false);
    assert.equal(summaries[2].durationSeconds, 2);
    assert.equal(summaries[2].error, "Ausführungsfehler");
    assert.equal(JSON.stringify(result).includes("private service data"), false);
    assert.equal(JSON.stringify(result).includes("hidden"), false);
});


test("Trace Capability unsupported und Cache bleiben unabhängig vom Error Payload", async function () {
    let calls = 0;
    const service = AutomationService.createService({
        client: {
            request: function () {
                calls += 1;
                const error = new Error("unknown command");
                error.code = "ha_command_unsupported";
                return Promise.reject(error);
            }
        },
        logger: {info: function () {}, warn: function () {}}
    });
    const inventory = [{entityId: "automation.one", itemId: "one"}];
    const first = await service.getTraceSummaries(inventory, ["automation.one"]);
    const second = await service.getTraceSummaries(inventory, ["automation.one"]);

    assert.equal(first.source.status, "unsupported");
    assert.equal(second.source.status, "unsupported");
    assert.equal(calls, 1);
});


test("Große Automation-Datenmenge nutzt Indizes und bleibt kompakt", function () {
    const startedAt = Date.now();
    const inventory = [];
    let automationIndex;
    let referenceIndex;
    const rawTraces = [];

    for (automationIndex = 0; automationIndex < 500; automationIndex++) {
        const references = AutomationNormalizers.emptyReferences();
        for (referenceIndex = 0; referenceIndex < 4; referenceIndex++) {
            references.entityIds.push(
                "sensor.entity_" + (automationIndex * 4 + referenceIndex)
            );
        }
        inventory.push({
            entityId: "automation.automation_" + automationIndex,
            name: "Automation " + automationIndex,
            state: "on",
            available: true,
            lastTriggered: null,
            references: references
        });
    }

    for (automationIndex = 0; automationIndex < 100; automationIndex++) {
        rawTraces.push({
            run_id: "run-" + automationIndex,
            timestamp: {
                start: new Date(
                    Date.parse("2026-08-24T10:00:00Z") + automationIndex * 1000
                ).toISOString(),
                finish: new Date(
                    Date.parse("2026-08-24T10:00:00Z") + automationIndex * 1000 + 500
                ).toISOString()
            },
            script_execution: "finished"
        });
    }

    const indexes = AutomationIndexes.create(inventory);
    const snapshot = {
        entities: [],
        metadata: {entities: {}, devices: {}, areas: {}, labels: {}},
        automations: {inventory: inventory, indexes: indexes},
        sources: {automationConfig: source()}
    };

    for (automationIndex = 0; automationIndex < 3000; automationIndex++) {
        snapshot.entities.push({
            entityId: "sensor.entity_" + automationIndex,
            context: {
                deviceId: automationIndex < 500
                    ? "device-" + automationIndex
                    : null
            }
        });
    }

    for (automationIndex = 0; automationIndex < 500; automationIndex++) {
        snapshot.metadata.devices["device-" + automationIndex] = {
            deviceId: "device-" + automationIndex
        };
    }

    for (automationIndex = 0; automationIndex < 200; automationIndex++) {
        const impact = AutomationImpact.forIssue(snapshot, {
            entityId: "sensor.entity_" + automationIndex
        });
        assert.equal(impact.length, 1);
    }

    assert.equal(Object.keys(indexes.automationsByEntityId).length, 2000);
    assert.equal(AutomationNormalizers.traces(rawTraces, 100).length, 100);
    assert.equal(Date.now() - startedAt < 2000, true);
});


test("Sprint 23 bleibt read-only, minimiert Payloads und erhält ES5/CSS-Kompatibilität", function () {
    const backend = [
        "src/services/automations/service.js",
        "src/routes/system-dashboards.js"
    ].map(function (fileName) {
        return fs.readFileSync(path.join(ROOT, fileName), "utf8");
    }).join("\n");
    const frontend = fs.readFileSync(
        path.join(ROOT, "src/public/js/system/errors.js"),
        "utf8"
    );
    const css = fs.readFileSync(
        path.join(ROOT, "src/public/css/system.css"),
        "utf8"
    );
    const html = fs.readFileSync(
        path.join(ROOT, "src/public/system.html"),
        "utf8"
    );

    assert.doesNotMatch(backend, /automation\.(trigger|turn_on|turn_off|reload)/);
    assert.doesNotMatch(backend, /call_service|execute_script/);
    assert.doesNotMatch(backend, /config\/automation\/config/);
    assert.match(backend, /type: "automation\/config"/);
    assert.match(backend, /type: "trace\/list"/);
    assert.doesNotMatch(frontend, /\blet\b|\bconst\b|=>|`|fetch\s*\(|Promise/);
    assert.doesNotMatch(css, /display\s*:\s*grid|\bgap\s*:/);
    assert.match(html, /Advanced Diagnostics/);
    assert.match(frontend, /errors\/automation-traces/);
    assert.equal(frontend.includes("raw trace"), false);
});
