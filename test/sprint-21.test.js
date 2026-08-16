const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Diagnostics = require("../src/services/diagnostics");
const Normalizers = require("../src/services/diagnostics/normalizers");
const SourceCache = require("../src/services/diagnostics/source-cache");
const Enrichment = require("../src/services/system/enrichment");
const HomeAssistantWebSocket = require("../src/services/homeassistant-websocket");
const Issues = require("../src/services/issues/engine");
const Snapshot = require("../src/services/system/snapshot");
const Summary = require("../src/services/summary/engine");

const ROOT = path.join(__dirname, "..");


function tick() {
    return new Promise(function (resolve) {
        setImmediate(resolve);
    });
}


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


function createFakeWebSocketClass() {
    function FakeWebSocket(url) {
        this.url = url;
        this.listeners = {};
        this.sent = [];
        FakeWebSocket.instances.push(this);
    }

    FakeWebSocket.instances = [];

    FakeWebSocket.prototype.addEventListener = function (name, handler) {
        this.listeners[name] = handler;
    };

    FakeWebSocket.prototype.send = function (payload) {
        this.sent.push(JSON.parse(payload));
    };

    FakeWebSocket.prototype.emitMessage = function (message) {
        this.listeners.message({data: JSON.stringify(message)});
    };

    FakeWebSocket.prototype.close = function () {
        if (this.listeners.close) {
            this.listeners.close({});
        }
    };

    return FakeWebSocket;
}


function rawState(entityId, state, attributes) {
    return {
        entity_id: entityId,
        state: state,
        attributes: attributes || {},
        last_changed: "2026-08-16T10:00:00Z",
        last_updated: "2026-08-16T10:01:00Z"
    };
}


test("Backend-WebSocket authentifiziert, korreliert IDs und loggt kein Token", async function () {
    const FakeWebSocket = createFakeWebSocketClass();
    const logs = [];
    const client = HomeAssistantWebSocket.createClient({
        url: "ws://127.0.0.1:8123/api/websocket",
        token: "fake-ha-token-sprint-21",
        WebSocketImplementation: FakeWebSocket,
        logger: silentLogger(logs),
        connectTimeoutMs: 1000,
        requestTimeoutMs: 1000
    });

    const firstResult = client.request({type: "config/entity_registry/list"});
    const secondResult = client.request({type: "config/device_registry/list"});
    const socket = FakeWebSocket.instances[0];

    socket.emitMessage({type: "auth_required", ha_version: "2026.8.0"});
    assert.deepEqual(socket.sent[0], {
        type: "auth",
        access_token: "fake-ha-token-sprint-21"
    });

    socket.emitMessage({type: "auth_ok", ha_version: "2026.8.0"});
    await tick();

    assert.equal(socket.sent[1].id, 1);
    assert.equal(socket.sent[2].id, 2);
    assert.notEqual(socket.sent[1].id, socket.sent[2].id);

    socket.emitMessage({
        id: 2,
        type: "result",
        success: true,
        result: [{id: "device"}]
    });
    socket.emitMessage({
        id: 1,
        type: "result",
        success: true,
        result: [{entity_id: "sensor.test"}]
    });

    assert.deepEqual(await firstResult, [{entity_id: "sensor.test"}]);
    assert.deepEqual(await secondResult, [{id: "device"}]);
    assert.equal(
        JSON.stringify(logs).includes("fake-ha-token-sprint-21"),
        false
    );
    client.close();
});


test("WebSocket auth_invalid, Timeout, Disconnect und Reconnect bleiben kontrolliert", async function () {
    const InvalidSocket = createFakeWebSocketClass();
    const invalidClient = HomeAssistantWebSocket.createClient({
        url: "ws://localhost/api/websocket",
        token: "fake",
        WebSocketImplementation: InvalidSocket,
        logger: silentLogger([]),
        connectTimeoutMs: 100,
        requestTimeoutMs: 100
    });
    const invalidRequest = invalidClient.request({type: "config/area_registry/list"});
    InvalidSocket.instances[0].emitMessage({type: "auth_required"});
    InvalidSocket.instances[0].emitMessage({type: "auth_invalid"});
    await assert.rejects(invalidRequest, {code: "ha_websocket_auth_failed"});

    const TimeoutSocket = createFakeWebSocketClass();
    const timeoutClient = HomeAssistantWebSocket.createClient({
        url: "ws://localhost/api/websocket",
        token: "fake",
        WebSocketImplementation: TimeoutSocket,
        logger: silentLogger([]),
        connectTimeoutMs: 100,
        requestTimeoutMs: 5,
        maxReconnectDelayMs: 1
    });
    const timeoutRequest = timeoutClient.request({type: "config_entries/get"});
    TimeoutSocket.instances[0].emitMessage({type: "auth_required"});
    TimeoutSocket.instances[0].emitMessage({type: "auth_ok"});
    await assert.rejects(timeoutRequest, {code: "ha_websocket_timeout"});

    TimeoutSocket.instances[0].close();
    await new Promise(function (resolve) {
        setTimeout(resolve, 10);
    });
    assert.equal(TimeoutSocket.instances.length >= 2, true);
    timeoutClient.close();
});


test("WebSocket-Konstruktor- und Sendefehler hinterlassen keine offenen Requests", async function () {
    function ThrowingConstructor() {
        throw new Error("socket unavailable");
    }
    const constructorClient = HomeAssistantWebSocket.createClient({
        url: "ws://localhost/api/websocket",
        token: "fake",
        WebSocketImplementation: ThrowingConstructor,
        logger: silentLogger([]),
        maxReconnectAttempts: 0
    });
    await assert.rejects(
        constructorClient.request({type: "config/entity_registry/list"}),
        {code: "ha_websocket_unavailable"}
    );

    const SendSocket = createFakeWebSocketClass();
    SendSocket.prototype.send = function (payload) {
        const message = JSON.parse(payload);
        if (message.type === "auth") {
            this.sent.push(message);
            return;
        }
        throw new Error("send failed");
    };
    const sendClient = HomeAssistantWebSocket.createClient({
        url: "ws://localhost/api/websocket",
        token: "fake",
        WebSocketImplementation: SendSocket,
        logger: silentLogger([]),
        requestTimeoutMs: 100
    });
    const sendRequest = sendClient.request({type: "config/device_registry/list"});
    SendSocket.instances[0].emitMessage({type: "auth_required"});
    SendSocket.instances[0].emitMessage({type: "auth_ok"});
    await assert.rejects(sendRequest, {code: "ha_websocket_unavailable"});
    assert.equal(sendClient.getState().pendingRequests, 0);
    sendClient.close();
});


test("Registry-Normalisierung übernimmt nur benötigte Metadaten", function () {
    const entities = Normalizers.entityRegistry([{
        entity_id: "binary_sensor.rauchmelder",
        device_id: "device-1",
        area_id: "area-entity",
        config_entry_id: "entry-1",
        platform: "zha",
        disabled_by: "user",
        hidden_by: "integration",
        entity_category: "diagnostic",
        name: "Status",
        original_name: "Alarm",
        unique_id: "secret-unique-id"
    }]);
    assert.deepEqual(entities[0], {
        entityId: "binary_sensor.rauchmelder",
        deviceId: "device-1",
        areaId: "area-entity",
        configEntryId: "entry-1",
        configSubentryId: null,
        platform: "zha",
        disabledBy: "user",
        hiddenBy: "integration",
        entityCategory: "diagnostic",
        name: "Status",
        originalName: "Alarm",
        icon: null
    });
    assert.equal(JSON.stringify(entities).includes("secret-unique-id"), false);

    const devices = Normalizers.deviceRegistry([{
        id: "device-1",
        name: "Rauchmelder",
        name_by_user: "Rauchmelder Flur",
        area_id: "area-device",
        manufacturer: "Demo",
        model: "Detector",
        model_id: "D1",
        config_entry_id: "entry-1",
        config_subentry_id: "subentry-1",
        identifiers: [["zha", "sensitive"]],
        connections: [["mac", "00:11:22:33:44:55"]],
        serial_number: "serial-secret"
    }]);
    assert.equal(devices[0].nameByUser, "Rauchmelder Flur");
    assert.equal(devices[0].configEntryId, "entry-1");
    assert.equal(devices[0].configSubentryId, "subentry-1");
    assert.equal(JSON.stringify(devices).includes("00:11"), false);
    assert.equal(JSON.stringify(devices).includes("serial-secret"), false);
});


test("Device Registry unterstützt Single-Entry und defensiven Legacy-Fallback", function () {
    const devices = Normalizers.deviceRegistry([
        {id: "current", config_entry_id: "entry-current"},
        {id: "legacy-one", config_entries: ["entry-one"]},
        {
            id: "legacy-primary",
            config_entries: ["entry-a", "entry-b"],
            primary_config_entry: "entry-b"
        },
        {id: "legacy-ambiguous", config_entries: ["entry-a", "entry-b"]}
    ]);
    assert.equal(devices[0].configEntryId, "entry-current");
    assert.equal(devices[1].configEntryId, "entry-one");
    assert.equal(devices[2].configEntryId, "entry-b");
    assert.equal(devices[3].configEntryId, null);
});


test("Area-Auflösung priorisiert Entity vor Device und nutzt keine Namensheuristik", function () {
    const metadata = {
        entities: {
            "sensor.entity_area": {entityId: "sensor.entity_area", deviceId: "d1", areaId: "a1"},
            "sensor.device_area": {entityId: "sensor.device_area", deviceId: "d1", areaId: null},
            "sensor.keller_im_namen": {entityId: "sensor.keller_im_namen", deviceId: null, areaId: null}
        },
        devices: {
            d1: {deviceId: "d1", name: "Gerät", nameByUser: "Mein Gerät", areaId: "a2", configEntryId: "c1"}
        },
        areas: {
            a1: {areaId: "a1", name: "Flur"},
            a2: {areaId: "a2", name: "Wohnzimmer"}
        },
        configEntries: {
            c1: {entryId: "c1", domain: "zha", title: "ZHA", state: "loaded"}
        }
    };
    const snapshot = Snapshot.createSuccessful([
        rawState("sensor.entity_area", "1", {}),
        rawState("sensor.device_area", "1", {}),
        rawState("sensor.keller_im_namen", "1", {})
    ], "2026-08-16T10:02:00Z");
    Enrichment.attach(snapshot, {
        metadata: metadata,
        diagnostics: {repairs: [], matter: []},
        capabilities: {},
        sources: {}
    });
    assert.equal(snapshot.entities[0].context.areaName, "Wohnzimmer");
    assert.equal(snapshot.entities[1].context.areaName, "Flur");
    assert.equal(snapshot.entities[2].context.areaName, null);
    assert.equal(snapshot.entities[0].context.deviceName, "Mein Gerät");
    assert.equal(snapshot.entities[0].context.integration, "ZHA");
});


test("Disabled, hidden und registry-only erzeugen keine falschen Entity-Issues", function () {
    const snapshot = Snapshot.createSuccessful([
        rawState("sensor.disabled", "unavailable", {}),
        rawState("sensor.hidden", "unknown", {})
    ], "2026-08-16T10:02:00Z");
    Enrichment.attach(snapshot, {
        metadata: {
            entities: {
                "sensor.disabled": {entityId: "sensor.disabled", disabledBy: "user"},
                "sensor.hidden": {entityId: "sensor.hidden", hiddenBy: "user"},
                "sensor.registry_only": {entityId: "sensor.registry_only", disabledBy: null}
            },
            devices: {}, areas: {}, configEntries: {}
        },
        diagnostics: {repairs: [], matter: []},
        capabilities: {}, sources: {}
    });
    const result = Issues.buildIssues(snapshot);
    assert.equal(result.issues.length, 1);
    assert.equal(result.issues[0].entityId, "sensor.hidden");
    assert.equal(result.issues.some(function (issue) {
        return issue.entityId === "sensor.registry_only";
    }), false);
});


test("Config-Entry- und Repair-Issues sind read-only normalisiert", function () {
    const configEntries = Normalizers.configEntries([
        {entry_id: "loaded", domain: "zha", title: "ZHA", state: "loaded"},
        {entry_id: "broken", domain: "matter", title: "Matter", state: "setup_error"},
        {entry_id: "retry", domain: "demo", title: "Demo", state: "setup_retry"},
        {entry_id: "new", domain: "future", title: "Future", state: "future_state"}
    ]);
    const repairs = Normalizers.repairs({issues: [
        {domain: "zha", issue_id: "critical", severity: "critical", is_fixable: true},
        {domain: "demo", issue_id: "error", severity: "error", is_fixable: false},
        {domain: "demo", issue_id: "warning", severity: "warning", is_fixable: true}
    ]});
    const snapshot = Snapshot.createSuccessful([], "2026-08-16T10:02:00Z");
    Enrichment.attach(snapshot, {
        metadata: {
            entities: {}, devices: {}, areas: {},
            configEntries: Normalizers.indexBy(configEntries, "entryId")
        },
        diagnostics: {repairs: repairs, matter: []},
        capabilities: {repairs: true}, sources: {}
    });
    const result = Issues.buildIssues(snapshot);
    assert.equal(result.issues.length, 5);
    assert.equal(result.issues.some(function (issue) {
        return issue.id.indexOf("loaded") !== -1;
    }), false);
    assert.equal(result.issues.some(function (issue) {
        return issue.id.indexOf("future") !== -1;
    }), false);
    assert.equal(result.issues.find(function (issue) {
        return issue.id === "config-entry-broken-setup_error";
    }).severity, "error");
    assert.equal(result.issues.find(function (issue) {
        return issue.id === "config-entry-retry-setup_retry";
    }).severity, "warning");
    assert.equal(result.issues.find(function (issue) {
        return issue.id === "ha-repair-zha-critical";
    }).fixable, true);
});


test("Summary filtert diagnostic/config und liefert nur reduzierten Kontext", function () {
    const snapshot = Snapshot.createSuccessful([
        rawState("switch.primary", "on", {friendly_name: "Primär"}),
        rawState("switch.diagnostic", "on", {friendly_name: "Diagnose"}),
        rawState("switch.config", "on", {friendly_name: "Konfiguration"})
    ], "2026-08-16T10:02:00Z");
    snapshot.entities[0].context = {
        deviceName: "Luftreiniger",
        areaName: "Wohnzimmer",
        integration: "Demo",
        platform: "demo"
    };
    snapshot.entities[1].context = {entityCategory: "diagnostic"};
    snapshot.entities[2].context = {entityCategory: "config"};
    const result = Summary.buildSummary(snapshot);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].title, "Luftreiniger");
    assert.equal(result.items[0].metadata.areaName, "Wohnzimmer");
    assert.equal(result.items[0].metadata.integration, "Demo");
    assert.equal(result.items[0].metadata.manufacturer, undefined);
});


test("Source Cache dedupliziert, nutzt TTL, bleibt stale und erholt sich", async function () {
    let now = 1000;
    let calls = 0;
    let outcome = "ok";
    let resolver;
    const cache = SourceCache.createSourceCache({
        name: "registry_test",
        ttlMs: 100,
        clock: function () { return now; },
        logger: silentLogger([]),
        fetch: function () {
            calls += 1;
            if (outcome === "pending") {
                return new Promise(function (resolve) { resolver = resolve; });
            }
            if (outcome === "error") {
                const error = new Error("offline");
                error.code = "ha_websocket_unavailable";
                return Promise.reject(error);
            }
            return Promise.resolve([outcome]);
        }
    });
    assert.deepEqual((await cache.get()).data, ["ok"]);
    assert.equal((await cache.get()).data[0], "ok");
    assert.equal(calls, 1);

    now = 1100;
    outcome = "pending";
    const first = cache.get();
    const parallel = cache.get();
    assert.equal(first, parallel);
    await tick();
    resolver(["renewed"]);
    assert.deepEqual((await first).data, ["renewed"]);

    now = 1200;
    outcome = "error";
    const stale = await cache.get();
    assert.equal(stale.stale, true);
    assert.deepEqual(stale.data, ["renewed"]);

    now = 1300;
    outcome = "recovered";
    const recovered = await cache.get();
    assert.equal(recovered.ok, true);
    assert.equal(recovered.stale, false);
});


test("Capability-Probes verwenden nur feste Read-only-Commands und cachen unabhängig", async function () {
    const calls = [];
    let now = 1000;
    const client = {
        request: function (command) {
            calls.push(command.type);
            if (command.type === "repairs/list_issues") {
                const error = new Error("unsupported");
                error.code = "ha_command_unsupported";
                return Promise.reject(error);
            }
            return Promise.resolve([]);
        },
        close: function () {}
    };
    const service = Diagnostics.createService({
        client: client,
        logger: silentLogger([]),
        clock: function () { return now; }
    });
    let snapshot = await service.getSnapshot();
    assert.deepEqual(calls.slice().sort(), [
        "config/area_registry/list",
        "config/device_registry/list",
        "config/entity_registry/list",
        "config_entries/get",
        "repairs/list_issues"
    ]);
    assert.equal(snapshot.capabilities.repairs, false);
    assert.equal(snapshot.sources.repairs.errorCode, "unsupported");
    assert.equal(snapshot.capabilities.matterDiagnostics, false);
    assert.equal(calls.some(function (type) {
        return /^matter\//.test(type);
    }), false);

    await service.getSnapshot();
    assert.equal(calls.length, 5);
    now += 31000;
    snapshot = await service.getSnapshot();
    assert.equal(calls.filter(function (type) {
        return type === "config_entries/get";
    }).length, 2);
    assert.equal(calls.filter(function (type) {
        return type === "config/entity_registry/list";
    }).length, 1);
});


test("Partial Failure erhält State-Snapshot und erfolgreiche Quellen", async function () {
    const collector = require("../src/services/system/collector").createCollector({
        homeAssistant: {
            getAllEntities: async function () {
                return [rawState("sensor.problem", "unavailable", {})];
            }
        },
        diagnostics: {
            getSnapshot: async function () {
                return {
                    metadata: {entities: {}, devices: {}, areas: {}, configEntries: {}},
                    diagnostics: {repairs: [], matter: []},
                    capabilities: {deviceRegistry: true, areaRegistry: false},
                    sources: {
                        deviceRegistry: {supported: true, ok: true, stale: false, lastSuccessfulAt: "2026-08-16T10:00:00Z"},
                        areaRegistry: {supported: true, ok: false, stale: false, errorCode: "registry_fetch_failed"}
                    }
                };
            }
        },
        logger: silentLogger([]),
        clock: function () { return Date.parse("2026-08-16T10:02:00Z"); }
    });
    const snapshot = await collector.collect();
    assert.equal(snapshot.entities.length, 1);
    assert.equal(snapshot.sources.deviceRegistry.ok, true);
    assert.equal(snapshot.sources.areaRegistry.ok, false);
    assert.equal(Issues.buildIssues(snapshot).issues.length, 1);
});


test("Kompletter WebSocket-Ausfall zerstört den REST-State-Snapshot nicht", async function () {
    const collector = require("../src/services/system/collector").createCollector({
        homeAssistant: {
            getAllEntities: async function () {
                return [rawState("sensor.rest_only", "unavailable", {friendly_name: "REST Sensor"})];
            }
        },
        diagnostics: {
            getSnapshot: async function () {
                const error = new Error("websocket offline");
                error.code = "ha_websocket_unavailable";
                throw error;
            }
        },
        logger: silentLogger([]),
        clock: function () { return Date.parse("2026-08-16T10:02:00Z"); }
    });
    const snapshot = await collector.collect();
    const publicMeta = Snapshot.toPublicMeta(snapshot);
    assert.equal(snapshot.homeAssistant.reachable, true);
    assert.equal(snapshot.entities.length, 1);
    assert.equal(snapshot.sources.states.ok, true);
    assert.equal(snapshot.sources.entityRegistry.errorCode, "ha_websocket_unavailable");
    assert.equal(Issues.buildIssues(snapshot).issues.length, 1);
    assert.equal(JSON.stringify(publicMeta).includes("websocket offline"), false);
});


test("3000 Entities, 500 Devices, 50 Areas, 100 Entries und Repairs bleiben linear und reduziert", function () {
    const started = Date.now();
    const states = [];
    const entityEntries = [];
    const devices = [];
    const areas = [];
    const configEntries = [];
    const repairs = [];
    let index;

    for (index = 0; index < 50; index += 1) {
        areas.push({area_id: "area-" + index, name: "Demo Area " + index});
    }
    for (index = 0; index < 100; index += 1) {
        configEntries.push({entry_id: "entry-" + index, domain: "demo", title: "Demo " + index, state: "loaded"});
        repairs.push({domain: "demo", issue_id: "issue-" + index, severity: "warning", is_fixable: true});
    }
    for (index = 0; index < 500; index += 1) {
        devices.push({
            id: "device-" + index,
            name: "Device " + index,
            area_id: "area-" + (index % 50),
            config_entry_id: "entry-" + (index % 100),
            identifiers: [["demo", "secret-" + index]],
            connections: [["mac", "private-" + index]]
        });
    }
    for (index = 0; index < 3000; index += 1) {
        states.push(rawState(
            "sensor.synthetic_" + index,
            index < 10 ? "unavailable" : "0",
            {friendly_name: "Synthetic " + index}
        ));
        entityEntries.push({
            entity_id: "sensor.synthetic_" + index,
            device_id: "device-" + (index % 500),
            config_entry_id: "entry-" + (index % 100),
            platform: "demo"
        });
    }

    const snapshot = Snapshot.createSuccessful(states, "2026-08-16T10:02:00Z");
    Enrichment.attach(snapshot, {
        metadata: {
            entities: Normalizers.indexBy(Normalizers.entityRegistry(entityEntries), "entityId"),
            devices: Normalizers.indexBy(Normalizers.deviceRegistry(devices), "deviceId"),
            areas: Normalizers.indexBy(Normalizers.areaRegistry(areas), "areaId"),
            configEntries: Normalizers.indexBy(Normalizers.configEntries(configEntries), "entryId")
        },
        diagnostics: {repairs: Normalizers.repairs({issues: repairs}), matter: []},
        capabilities: {}, sources: {}
    });
    const result = Issues.buildIssues(snapshot);
    const payload = JSON.stringify(result);

    assert.equal(result.issues.length, 110);
    assert.equal(payload.includes("secret-"), false);
    assert.equal(payload.includes("private-"), false);
    assert.equal(payload.includes("identifiers"), false);
    assert.equal(Date.now() - started < 1500, true);
});


test("Security-Regression enthält keine Proxy- oder Write-Commands", function () {
    const diagnosticSource = [
        "src/services/homeassistant-websocket.js",
        "src/services/diagnostics/index.js",
        "src/services/diagnostics/normalizers.js",
        "src/routes/admin.js"
    ].map(function (file) {
        return fs.readFileSync(path.join(ROOT, file), "utf8");
    }).join("\n");
    const apiSource = fs.readFileSync(
        path.join(ROOT, "src/routes/api.js"),
        "utf8"
    );

    assert.doesNotMatch(diagnosticSource, /ws-command|ws_command/);
    assert.doesNotMatch(diagnosticSource, /config\/entity_registry\/(?:update|remove)|config\/device_registry\/(?:update|remove)|config\/area_registry\/(?:update|delete)/);
    assert.doesNotMatch(diagnosticSource, /config_entries\/(?:update|disable|delete|reload)|repairs\/(?:ignore_issue|get_issue_data)|matter\//);
    assert.doesNotMatch(diagnosticSource, /call_service|commission|fabric|pairing|thread_credentials|wifi_credentials/i);
    assert.match(apiSource, /"climate\.esszimmer_thermostate"/);
    assert.match(apiSource, /"light\.esszimmer_lampen"/);
    assert.doesNotMatch(apiSource, /system-diagnostics.*post/i);
});
