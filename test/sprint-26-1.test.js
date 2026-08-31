const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const DashboardConfig = require("../src/config/dashboard");
const Enrichment = require("../src/services/system/enrichment");
const IssueRules = require("../src/services/issues/rule-engine");
const Issues = require("../src/services/issues/engine");
const Layout = require("../src/services/layout");
const Rooms = require("../src/services/rooms");
const Snapshot = require("../src/services/system/snapshot");

const ROOT = path.join(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function emptyEntities() {
    return {
        temperature: null,
        humidity: null,
        climate: null,
        presence: null,
        windows: [],
        lights: [],
        switches: [],
        covers: [],
        fans: [],
        mediaPlayers: [],
        locks: [],
        batteries: [],
        alerts: [],
        secondary: []
    };
}

function roomWidget(overrides) {
    const widget = {
        id: "living-room",
        entity: "",
        type: "room",
        title: "Wohnzimmer mit einem sehr langen Namen",
        subtitle: "",
        icon: "room",
        iconClass: "room",
        unit: "",
        order: 10,
        visible: true,
        sectionId: null,
        size: "large",
        control: {
            enabled: false,
            preferredOnMode: null
        },
        room: {
            areaId: null,
            collapsible: true,
            defaultExpanded: false,
            background: null,
            entities: emptyEntities()
        }
    };

    Object.assign(widget, overrides || {});
    return widget;
}

function configurationWithRoom(widget) {
    const configuration = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    const dashboard = configuration.dashboards[0];

    dashboard.widgets = [widget];
    dashboard.sections = [{
        id: "ground-floor",
        title: "Erdgeschoss",
        order: 10,
        showTitle: true,
        areaId: null
    }];
    widget.sectionId = "ground-floor";
    dashboard.layouts = Layout.createLayouts(dashboard.widgets);
    return configuration;
}

function roomAdminContext() {
    const context = vm.createContext({
        window: {HALegacyAdmin: {}},
        JSON: JSON,
        Number: Number,
        Object: Object,
        String: String,
        Boolean: Boolean,
        Array: Array
    });
    vm.runInContext(read("src/admin/js/rooms.js"), context);
    return context.window.HALegacyAdmin.Rooms;
}

function roomWidgetContext() {
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        Number: Number,
        String: String,
        isNaN: isNaN,
        parseFloat: parseFloat,
        Legacy: {html: {escape: escapeHtml}}
    });

    [
        "src/public/js/core/widget.js",
        "src/public/js/controls/power.js",
        "src/public/js/widgets/room.js"
    ].forEach(function (fileName) {
        vm.runInContext(read(fileName), context, {filename: fileName});
    });

    return context;
}

function rawState(entityId, state, attributes) {
    return {
        entity_id: entityId,
        state: state,
        attributes: attributes || {},
        last_changed: "2026-08-30T10:00:00Z",
        last_updated: "2026-08-30T10:00:00Z"
    };
}

function enrichedSnapshot(states) {
    const metadataEntities = Object.create(null);

    states.forEach(function (state) {
        metadataEntities[state.entity_id] = {
            entityId: state.entity_id,
            deviceId: "device-room",
            areaId: "living",
            entityCategory: state.attributes.entity_category || null,
            disabledBy: null,
            hiddenBy: null,
            platform: "mock"
        };
    });

    return Enrichment.attach(
        Snapshot.createSuccessful(states, "2026-08-30T12:00:00Z"),
        {
            metadata: {
                entities: metadataEntities,
                devices: {
                    "device-room": {
                        deviceId: "device-room",
                        name: "Wohnzimmer Gerät",
                        areaId: "living"
                    }
                },
                areas: {living: {areaId: "living", name: "Wohnzimmer"}},
                labels: {},
                configEntries: {}
            },
            diagnostics: {repairs: [], matter: []},
            sources: {},
            capabilities: {}
        }
    );
}

function immediateErrorSettings() {
    const settings = DashboardConfig.getErrorsConfiguration();
    const rules = IssueRules.cloneRules(settings.rules);

    rules.defaults.unknownGraceMs = 0;
    rules.defaults.unavailableGraceMs = 0;
    rules.defaults.recoveryGraceMs = 0;
    Object.keys(rules.riskClasses).forEach(function (riskClass) {
        rules.riskClasses[riskClass].unknownGraceMs = 0;
        rules.riskClasses[riskClass].unavailableGraceMs = 0;
        rules.riskClasses[riskClass].recoveryGraceMs = 0;
    });
    settings.rules = rules;
    return settings;
}

test("Schema 11 ergänzt Room Cards und migriert Sections aus Schema 10 verlustfrei", function () {
    const previous = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    previous.schemaVersion = 10;
    previous.dashboards[0].sections = [{
        id: "ground-floor",
        title: "Erdgeschoss",
        order: 10,
        showTitle: true,
        areaId: "living"
    }];
    previous.dashboards[0].widgets[0].sectionId = "ground-floor";

    const result = DashboardConfig.migrateConfiguration(previous);

    assert.equal(result.migrated, true);
    assert.equal(result.configuration.schemaVersion, 12);
    assert.equal(result.configuration.dashboards[0].sections[0].id, "ground-floor");
    assert.equal(
        result.configuration.dashboards[0].widgets[0].sectionId,
        "ground-floor"
    );
    assert.equal(DashboardConfig.validateConfiguration(result.configuration), true);
});

test("Room Card validiert no-area, Area, Rollenlisten, Section und Hintergrund", function () {
    const widget = roomWidget();
    const noArea = configurationWithRoom(widget);

    assert.equal(DashboardConfig.validateConfiguration(noArea), true);

    widget.room.areaId = "living";
    widget.room.entities.temperature = "sensor.living_temperature";
    widget.room.entities.humidity = "sensor.living_humidity";
    widget.room.entities.windows = ["binary_sensor.window_one", "binary_sensor.window_two"];
    widget.room.background = {
        imageId: "bg-0123456789abcdef0123456789abcdef.jpg",
        position: "center center",
        size: "cover",
        overlay: 20
    };
    assert.equal(DashboardConfig.validateConfiguration(noArea), true);

    widget.room.entities.windows.push("not-an-entity");
    assert.throws(
        function () { DashboardConfig.validateConfiguration(noArea); },
        /Room-Card-Entities/
    );
});

test("Area Auto-Setup nutzt Registry-area_id und überschreibt manuelle Auswahl nur explizit", function () {
    const RoomsAdmin = roomAdminContext();
    const inventory = [
        {entity_id: "sensor.temp", domain: "sensor", device_class: "temperature", area_id: "living"},
        {entity_id: "sensor.humidity", domain: "sensor", device_class: "humidity", area_id: "living"},
        {entity_id: "climate.main", domain: "climate", area_id: "living"},
        {entity_id: "binary_sensor.presence", domain: "binary_sensor", device_class: "occupancy", area_id: "living"},
        {entity_id: "binary_sensor.window", domain: "binary_sensor", device_class: "window", area_id: "living"},
        {entity_id: "light.ceiling", domain: "light", area_id: "living"},
        {entity_id: "switch.read_only", domain: "switch", area_id: "living"},
        {entity_id: "cover.blind", domain: "cover", area_id: "living"},
        {entity_id: "fan.air", domain: "fan", area_id: "living"},
        {entity_id: "media_player.tv", domain: "media_player", area_id: "living"},
        {entity_id: "lock.door", domain: "lock", area_id: "living"},
        {entity_id: "sensor.battery", domain: "sensor", device_class: "battery", area_id: "living"},
        {entity_id: "binary_sensor.smoke", domain: "binary_sensor", device_class: "smoke", area_id: "living"},
        {entity_id: "sensor.other_room", domain: "sensor", device_class: "temperature", area_id: "kitchen"}
    ];
    const manual = RoomsAdmin.emptyRoom().entities;
    manual.temperature = "sensor.manual";
    const suggested = RoomsAdmin.suggest("living", inventory);

    assert.equal(manual.temperature, "sensor.manual");
    assert.equal(suggested.temperature, "sensor.temp");
    assert.equal(suggested.humidity, "sensor.humidity");
    assert.equal(suggested.climate, "climate.main");
    assert.equal(suggested.presence, "binary_sensor.presence");
    assert.deepEqual(Array.from(suggested.windows), ["binary_sensor.window"]);
    assert.deepEqual(Array.from(suggested.lights), ["light.ceiling"]);
    assert.deepEqual(Array.from(suggested.switches), ["switch.read_only"]);
    assert.deepEqual(Array.from(suggested.covers), ["cover.blind"]);
    assert.deepEqual(Array.from(suggested.fans), ["fan.air"]);
    assert.deepEqual(Array.from(suggested.mediaPlayers), ["media_player.tv"]);
    assert.deepEqual(Array.from(suggested.locks), ["lock.door"]);
    assert.deepEqual(Array.from(suggested.batteries), ["sensor.battery"]);
    assert.deepEqual(Array.from(suggested.alerts), ["binary_sensor.smoke"]);
});

test("Room Alerts verwenden zentrale Risk-, Severity-, Grace- und Summary-Semantik", function () {
    const states = [
        rawState("binary_sensor.window_one", "on", {friendly_name: "Fenster 1", device_class: "window"}),
        rawState("binary_sensor.window_two", "on", {friendly_name: "Fenster 2", device_class: "window"}),
        rawState("binary_sensor.smoke", "on", {friendly_name: "Rauchmelder", device_class: "smoke"}),
        rawState("sensor.battery", "12", {friendly_name: "Fenster Batterie", device_class: "battery", unit_of_measurement: "%"}),
        rawState("sensor.missing", "unavailable", {friendly_name: "Optionaler Sensor"})
    ];
    const widget = roomWidget();
    widget.room.entities.windows = ["binary_sensor.window_one", "binary_sensor.window_two"];
    widget.room.entities.alerts = ["binary_sensor.smoke"];
    widget.room.entities.batteries = ["sensor.battery"];
    widget.room.entities.secondary = ["sensor.missing"];
    Issues.resetRuleEngine();

    const result = Rooms.build(
        enrichedSnapshot(states),
        [widget],
        immediateErrorSettings()
    );
    const alerts = result.alerts[widget.id];

    assert.equal(alerts.filter(function (alert) {
        return alert.kind === "security";
    }).length, 2);
    assert.equal(alerts.find(function (alert) {
        return alert.kind === "safety";
    }).severity, "critical");
    assert.equal(alerts.find(function (alert) {
        return alert.kind === "battery";
    }).severity, "warning");
    assert.equal(alerts.find(function (alert) {
        return alert.entity_id === "sensor.missing";
    }).kind, "availability");
});

test("Collapsed und Expanded rendern Primärwerte, Alerts und nur sichere Controls", function () {
    const context = roomWidgetContext();
    const config = roomWidget();
    config.room.entities = {
        temperature: "sensor.temperature",
        humidity: "sensor.humidity",
        climate: "climate.main",
        presence: "binary_sensor.presence",
        windows: ["binary_sensor.window_one", "binary_sensor.window_two"],
        lights: ["light.allowed", "light.read_only"],
        switches: ["switch.read_only"],
        covers: ["cover.read_only"],
        fans: ["fan.read_only"],
        mediaPlayers: ["media_player.read_only"],
        locks: ["lock.read_only"],
        batteries: ["sensor.battery"],
        alerts: ["binary_sensor.smoke"],
        secondary: ["sensor.optional_missing"]
    };
    const widget = new context.RoomWidget(config);
    const states = {
        "sensor.temperature": rawState("sensor.temperature", "21.5", {unit_of_measurement: "°C"}),
        "sensor.humidity": rawState("sensor.humidity", "48", {unit_of_measurement: "%"}),
        "climate.main": rawState("climate.main", "heat", {
            current_temperature: 21.5, temperature: 22.5,
            min_temp: 5, max_temp: 35, target_temp_step: 0.5
        }),
        "binary_sensor.presence": rawState("binary_sensor.presence", "on"),
        "binary_sensor.window_one": rawState("binary_sensor.window_one", "on"),
        "binary_sensor.window_two": rawState("binary_sensor.window_two", "off"),
        "light.allowed": Object.assign(rawState("light.allowed", "on"), {
            gateway_capabilities: {can_light_power_off: true}
        }),
        "light.read_only": rawState("light.read_only", "off"),
        "switch.read_only": rawState("switch.read_only", "on"),
        "cover.read_only": rawState("cover.read_only", "open"),
        "fan.read_only": rawState("fan.read_only", "on"),
        "media_player.read_only": rawState("media_player.read_only", "playing"),
        "lock.read_only": rawState("lock.read_only", "unlocked"),
        "sensor.battery": rawState("sensor.battery", "12", {unit_of_measurement: "%"})
    };
    states["climate.main"].gateway_capabilities = {
        can_set_temperature: true,
        supports_power: true,
        can_power_off: true
    };

    const alerts = [{
        id: "smoke", title: "Rauchmelder", severity: "critical"
    }];
    const collapsed = widget.render(states, alerts);

    assert.match(collapsed, /is-collapsed/);
    assert.match(collapsed, /21\.5°C/);
    assert.match(collapsed, /48%/);
    assert.match(collapsed, /1 Öffnung offen/);
    assert.match(collapsed, /Rauchmelder/);
    assert.doesNotMatch(collapsed, /class="room-detail-group room-detail-switches"[^]*dashboard-control/);

    widget.toggleExpanded();
    const expanded = widget.render(states, alerts);
    assert.match(expanded, /is-expanded/);
    assert.match(expanded, /room-detail-lights/);
    assert.match(expanded, /room-detail-switches/);
    assert.equal((expanded.match(/room-light-control/g) || []).length, 2);
    assert.match(expanded, /room-climate-control/);
    assert.doesNotMatch(expanded, /switch-control|cover-control|fan-control|lock-control/);
    assert.match(expanded, /Nicht verfügbar/);
});

test("Room Card unterstützt Background, fehlenden Background und alle Präsentationstiers", function () {
    const context = roomWidgetContext();
    const config = roomWidget();
    const widget = new context.RoomWidget(config);
    const states = {};

    assert.doesNotMatch(widget.render(states, []), /has-room-background/);

    widget.room.background = {
        image_url: "/assets/backgrounds/bg-0123456789abcdef0123456789abcdef.jpg",
        position: "center top",
        size: "cover",
        overlay: 30
    };
    assert.match(widget.render(states, []), /has-room-background/);
    assert.match(widget.render(states, []), /bg-0123456789abcdef0123456789abcdef\.jpg/);

    const presentation = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        String: String,
        isFinite: isFinite,
        isNaN: isNaN,
        parseFloat: parseFloat,
        parseInt: parseInt
    });
    vm.runInContext(read("src/public/js/core/presentation.js"), presentation);

    assert.equal(presentation.LegacyPresentation.getMode(config, 2, 1, 180, 130, {}), "compact");
    assert.equal(presentation.LegacyPresentation.getMode(config, 3, 2, 310, 230, {}), "standard");
    assert.equal(presentation.LegacyPresentation.getMode(config, 6, 1, 430, 140, {}), "wide");
    assert.equal(presentation.LegacyPresentation.getMode(config, 6, 2, 500, 260, {}), "large");
});

test("Room Card Matrix akzeptiert jede gültige Portrait- und Landscape-Größe", function () {
    const presentation = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        String: String,
        isFinite: isFinite,
        isNaN: isNaN,
        parseFloat: parseFloat,
        parseInt: parseInt
    });
    const config = roomWidget();
    const expectedCounts = {portrait: 20, landscape: 44};
    const observed = Object.create(null);

    vm.runInContext(read("src/public/js/core/presentation.js"), presentation);

    Layout.PROFILES.forEach(function (profileName) {
        const columns = Layout.PROFILE_COLUMNS[profileName];
        const minimum = Layout.WIDGET_MINIMUM_SIZES.room[profileName];
        const canvasWidth = profileName === "portrait" ? 768 : 1024;
        const geometry = presentation.LegacyPresentation.calculateGridGeometry(
            canvasWidth,
            columns
        );
        let count = 0;
        let height;
        let width;

        for (height = 1; height <= 4; height += 1) {
            for (width = minimum.w; width <= columns; width += 1) {
                const dashboard = configurationWithRoom(roomWidget());
                const item = {x: 0, y: 0, w: width, h: height};
                const effectiveWidth = width * geometry.columnWidth - geometry.gutter;
                const effectiveHeight = height * geometry.rowHeight - geometry.gutter;
                const tier = presentation.LegacyPresentation.getMode(
                    config,
                    width,
                    height,
                    effectiveWidth,
                    effectiveHeight,
                    {contentDensity: "dense", controlCount: 3, hasSecondary: true}
                );

                dashboard.dashboards[0].layouts[profileName].items["living-room"] = item;
                assert.equal(Layout.validateLayouts(dashboard.dashboards[0]), true);
                assert.ok([
                    "compact", "standard", "wide", "tall", "large"
                ].indexOf(tier) !== -1);
                observed[tier] = true;
                count += 1;
            }
        }

        assert.equal(count, expectedCounts[profileName]);
    });

    ["compact", "standard", "wide", "large"].forEach(function (tier) {
        assert.equal(observed[tier], true, tier);
    });
});

test("Unknown, unavailable und Offline degradieren ohne aktive Room Controls", function () {
    const context = roomWidgetContext();
    const config = roomWidget();
    const widget = new context.RoomWidget(config);

    config.room.entities.temperature = "sensor.unknown";
    config.room.entities.humidity = "sensor.unavailable";
    config.room.entities.climate = "climate.unavailable";
    config.room.entities.lights = ["light.allowed"];

    const states = {
        "sensor.unknown": rawState("sensor.unknown", "unknown"),
        "sensor.unavailable": rawState("sensor.unavailable", "unavailable"),
        "climate.unavailable": Object.assign(
            rawState("climate.unavailable", "unavailable"),
            {gateway_capabilities: {can_set_temperature: true, supports_power: true, can_power_off: true}}
        ),
        "light.allowed": Object.assign(
            rawState("light.allowed", "on"),
            {gateway_capabilities: {can_light_power_off: true}}
        )
    };
    const html = widget.render(states, [], true);

    assert.match(html, /room-temperature[\s\S]*>–</);
    assert.match(html, /room-humidity[\s\S]*>–</);
    assert.equal((html.match(/disabled="disabled"/g) || []).length, 4);
});

test("Room Card bleibt in Sections, Default/Custom, Themes und HomeScreen integriert", function () {
    const dashboardSource = read("src/public/js/core/dashboard.js");
    const app = read("src/public/js/app.js");
    const theme = read("src/public/js/core/theme.js");
    const css = read("src/public/css/style.css");
    const room = read("src/public/js/widgets/room.js");
    const index = read("src/public/index.html");

    assert.match(dashboardSource, /config\.type === "room"/);
    assert.match(dashboardSource, /widget\.type === "room"/);
    assert.match(dashboardSource, /sectionGroups/);
    assert.match(app, /room-expand-control/);
    assert.match(theme, /localStorage/);
    assert.match(index, /apple-mobile-web-app-capable/);
    assert.match(css, /card-presentation-compact[^,{]*\.room-humidity/);
    assert.match(room, /room-temperature/);
    assert.match(css, /card-presentation-standard/);
    assert.match(css, /card-presentation-wide/);
    assert.match(css, /card-presentation-large/);
});

test("Room Datenpfad nutzt einen Cache-Snapshot ohne N+1 oder neue Write-API", function () {
    const api = read("src/routes/api.js");
    const rooms = read("src/services/rooms.js");
    const adminRoute = read("src/routes/admin.js");

    assert.match(api, /System\.getSnapshot\(\)/);
    assert.match(api, /getRoomWidgets/);
    assert.match(rooms, /Issues\.buildIssues/);
    assert.match(rooms, /SummaryRules\.collectActivities/);
    assert.match(rooms, /IssueRules\.resolveRule/);
    assert.doesNotMatch(rooms, /getEntity|getAllEntities|callService|axios/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
    assert.doesNotMatch(adminRoute, /area_registry\/update|entity_registry\/update/);
    assert.deepEqual(require("../src/routes/api").ALLOWED_ROOM_ENTITIES, undefined);
});

test("Admin enthält nativen Room-Editor, explizites Auto-Setup und Missing-Area-Warnung", function () {
    const html = read("src/admin/index.html");
    const app = read("src/admin/js/app.js");
    const rooms = read("src/admin/js/rooms.js");

    assert.match(html, /id="roomDialog"/);
    assert.match(html, /roomAutoSetupButton/);
    assert.match(html, /roomEntitySearch/);
    assert.match(html, /roomBackgroundEditor/);
    assert.match(app, /Vorschläge ersetzen die aktuellen manuellen/);
    assert.match(app, /Die gespeicherte Area existiert nicht mehr/);
    assert.match(rooms, /entity\.area_id === areaId/);
});

test("Legacy Room Card bleibt ES5, Flexbox-basiert und ohne Lovelace-Abhängigkeit", function () {
    const legacy = [
        "src/public/js/widgets/room.js",
        "src/public/js/core/dashboard.js",
        "src/public/js/core/presentation.js",
        "src/public/js/app.js"
    ].map(read).join("\n");
    const css = read("src/public/css/style.css");

    assert.doesNotMatch(
        legacy,
        /\blet\b|\bconst\b|=>|`|\bclass\s+[A-Za-z_$]|\bfetch\s*\(|\bPromise\b|\basync\b|\bawait\b|\?\.|\?\?/
    );
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.doesNotMatch(
        legacy,
        /customElements|shadowRoot|attachShadow|lit-html|hui-|ha-card|hass\b/
    );

    const harness = read("test/fixtures/room-card-matrix-harness.js");
    assert.match(harness, /scrollWidth/);
    assert.match(harness, /getBoundingClientRect/);
    assert.match(harness, /horizontal-overflow/);
    assert.match(harness, /touch-target/);
    assert.match(read("test/room-card-matrix-harness.html"), /widgets\/room\.js/);
});
