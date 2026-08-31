const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const DashboardConfig = require("../src/config/dashboard");
const ClimatePower = require("../src/services/climate-power");
const ControlAuthorization = require("../src/services/control-authorization");
const Layout = require("../src/services/layout");

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

function legacyControlContext() {
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        Number: Number,
        Object: Object,
        String: String,
        isNaN: isNaN,
        parseFloat: parseFloat,
        Legacy: {html: {escape: escapeHtml}}
    });

    [
        "src/public/js/core/widget.js",
        "src/public/js/controls/power.js",
        "src/public/js/widgets/light.js",
        "src/public/js/widgets/climate.js",
        "src/public/js/widgets/room.js",
        "src/public/js/focus/view-model.js"
    ].forEach(function (fileName) {
        vm.runInContext(read(fileName), context, {filename: fileName});
    });

    return context;
}

function widget(id, entity, type, control) {
    return {
        id: id,
        entity: entity,
        type: type,
        title: id,
        subtitle: "",
        icon: type,
        iconClass: type,
        unit: "",
        order: 10,
        visible: true,
        sectionId: null,
        size: "normal",
        control: control || {
            enabled: false,
            preferredOnMode: null
        }
    };
}

function controlConfiguration() {
    const configuration = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
    const dashboard = configuration.dashboards[0];

    dashboard.widgets = [
        widget(
            "light-kitchen",
            "light.kitchen_ceiling",
            "light",
            {enabled: true, preferredOnMode: null}
        ),
        widget(
            "light-hall",
            "light.hall_ceiling",
            "light",
            {enabled: true, preferredOnMode: null}
        ),
        widget(
            "climate-office",
            "climate.office",
            "climate",
            {enabled: true, preferredOnMode: "auto"}
        ),
        widget(
            "climate-bedroom",
            "climate.bedroom",
            "climate",
            {enabled: true, preferredOnMode: null}
        ),
        widget(
            "light-read-only",
            "light.read_only",
            "light"
        ),
        Object.assign(
            widget(
                "room-living",
                "",
                "room",
                {enabled: true, preferredOnMode: "heat"}
            ),
            {
                room: {
                    areaId: null,
                    collapsible: true,
                    defaultExpanded: false,
                    background: null,
                    entities: {
                        temperature: null,
                        humidity: null,
                        climate: "climate.living_room",
                        presence: null,
                        windows: [],
                        lights: ["light.living_room"],
                        switches: [],
                        covers: [],
                        fans: [],
                        mediaPlayers: [],
                        locks: [],
                        batteries: [],
                        alerts: [],
                        secondary: []
                    }
                }
            }
        )
    ];
    dashboard.layouts = Layout.createLayouts(dashboard.widgets);
    return configuration;
}

function climateState(state, modes, overrides) {
    return {
        entity_id: "climate.test",
        state: state,
        attributes: Object.assign({
            hvac_modes: modes,
            supported_features: 1,
            temperature: 20,
            min_temp: 7,
            max_temp: 30,
            target_temp_step: 0.5
        }, overrides || {})
    };
}

function climateAuthorization(entityId, preferredOnMode) {
    return {
        entityId: entityId,
        domain: "climate",
        preferredOnMode: preferredOnMode || null
    };
}

test("Schema 12 trennt Sichtbarkeit und persistierte Steuerfreigabe", function (t) {
    const temporaryDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "sprint-26-2-config-")
    );

    t.after(function () {
        fs.rmSync(temporaryDirectory, {recursive: true, force: true});
    });

    const configuration = controlConfiguration();
    const configPath = path.join(temporaryDirectory, "dashboards.json");

    DashboardConfig.initialize({configPath: configPath});
    DashboardConfig.replaceConfiguration(configuration);

    assert.equal(DashboardConfig.SCHEMA_VERSION, 12);
    assert.deepEqual(
        DashboardConfig.getControlAuthorization("light.kitchen_ceiling"),
        {
            entityId: "light.kitchen_ceiling",
            domain: "light",
            preferredOnMode: null
        }
    );
    assert.equal(
        DashboardConfig.getControlAuthorization("light.read_only"),
        null
    );
    assert.deepEqual(
        DashboardConfig.getControlAuthorization("climate.office"),
        {
            entityId: "climate.office",
            domain: "climate",
            preferredOnMode: "auto"
        }
    );
    assert.equal(
        DashboardConfig.getControlAuthorization("light.living_room").domain,
        "light"
    );
    assert.deepEqual(
        DashboardConfig.getControlAuthorization("climate.living_room"),
        {
            entityId: "climate.living_room",
            domain: "climate",
            preferredOnMode: "heat"
        }
    );
    assert.equal(
        Object.prototype.hasOwnProperty.call(
            DashboardConfig.getPublicDashboardConfig().widgets[0],
            "control"
        ),
        false
    );
});

test("Schema-11-Migration erteilt Custom-Entities keine impliziten Writes", function () {
    const previous = controlConfiguration();

    previous.schemaVersion = 11;
    previous.dashboards.forEach(function (dashboard) {
        dashboard.widgets.forEach(function (entry) {
            delete entry.control;
        });
    });

    const migrated = DashboardConfig.migrateConfiguration(previous);
    const custom = migrated.configuration.dashboards[0].widgets[0];
    const historical = migrated.configuration.dashboards[1].widgets[0];

    assert.equal(migrated.configuration.schemaVersion, 12);
    assert.deepEqual(custom.control, {
        enabled: false,
        preferredOnMode: null
    });
    assert.deepEqual(historical.control, {
        enabled: true,
        preferredOnMode: null
    });
    assert.equal(
        DashboardConfig.validateConfiguration(migrated.configuration),
        true
    );
});

test("mehrere unterschiedliche Lights verwenden dieselbe zentrale Freigabe", function () {
    const first = ControlAuthorization.lightCapabilities(
        "light.kitchen_ceiling",
        {state: "off", attributes: {}}
    );
    const second = ControlAuthorization.lightCapabilities(
        "light.hall_ceiling",
        {state: "on", attributes: {}}
    );
    const denied = ControlAuthorization.lightCapabilities(
        "light.read_only",
        {state: "off", attributes: {}}
    );

    assert.deepEqual(first.public, {
        can_light_power_on: true,
        can_light_power_off: true
    });
    assert.deepEqual(second.public, {
        can_light_power_on: true,
        can_light_power_off: true
    });
    assert.deepEqual(denied.public, {
        can_light_power_on: false,
        can_light_power_off: false
    });
});

test("Climate-Power folgt echten Modi, Präferenz und letztem Modus", function () {
    ClimatePower.resetRememberedModes();

    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.office",
            climateState("off", ["off", "auto", "cool"]),
            "cool"
        ),
        "cool"
    );
    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.bedroom",
            climateState("off", ["off", "cool", "dry"]),
            "heat"
        ),
        "cool"
    );

    ClimatePower.rememberNonOffMode(
        "climate.office",
        climateState("heat_cool", ["off", "auto", "heat_cool"])
    );
    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.office",
            climateState("off", ["off", "auto", "heat_cool"]),
            "auto"
        ),
        "heat_cool"
    );
    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.no-heat",
            climateState("off", ["off", "cool"]),
            null
        ),
        "cool"
    );
});

test("Climate-Capability-Matrix deckt off/heat, off/auto, Multi-Mode und unavailable ab", function () {
    const heat = ClimatePower.capabilities(
        "climate.second_heat",
        climateState("off", ["off", "heat"]),
        climateAuthorization("climate.second_heat")
    );
    const auto = ClimatePower.capabilities(
        "climate.third_auto",
        climateState("off", ["off", "auto"]),
        climateAuthorization("climate.third_auto")
    );
    const multi = ClimatePower.capabilities(
        "climate.fourth_multi",
        climateState("off", ["off", "heat", "auto"]),
        climateAuthorization("climate.fourth_multi", "heat")
    );
    const withoutOff = ClimatePower.capabilities(
        "climate.fifth_without_off",
        climateState("heat", ["heat", "auto"]),
        climateAuthorization("climate.fifth_without_off")
    );
    const unavailable = ClimatePower.capabilities(
        "climate.sixth_unavailable",
        climateState("unavailable", ["off", "heat"]),
        climateAuthorization("climate.sixth_unavailable")
    );
    const unauthorized = ClimatePower.capabilities(
        "climate.seventh_denied",
        climateState("off", ["off", "heat"]),
        null
    );

    assert.equal(heat.canPowerOn, true);
    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.second_heat",
            climateState("off", ["off", "heat"]),
            null
        ),
        "heat"
    );
    assert.equal(auto.canPowerOn, true);
    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.third_auto",
            climateState("off", ["off", "auto"]),
            null
        ),
        "auto"
    );
    assert.equal(multi.canPowerOn, true);
    assert.equal(
        ClimatePower.resolvePowerOnMode(
            "climate.fourth_multi",
            climateState("off", ["off", "heat", "auto"]),
            "heat"
        ),
        "heat"
    );
    assert.equal(withoutOff.supportsPower, false);
    assert.equal(withoutOff.canPowerOff, false);
    assert.equal(unavailable.supportsPower, true);
    assert.equal(unavailable.canPowerOn, false);
    assert.equal(unavailable.canSetTemperature, false);
    assert.equal(unauthorized.supportsPower, true);
    assert.equal(unauthorized.canPowerOn, false);
    assert.equal(unauthorized.canSetTemperature, false);
});

test("Control-Grant-Validierung weist Typfehler und widersprüchliche Modi ab", function () {
    const sensorGrant = controlConfiguration();
    sensorGrant.dashboards[0].widgets[4].type = "sensor";
    sensorGrant.dashboards[0].widgets[4].entity = "sensor.read_only";
    sensorGrant.dashboards[0].widgets[4].control.enabled = true;
    assert.throws(function () {
        DashboardConfig.validateConfiguration(sensorGrant);
    });

    const invalidMode = controlConfiguration();
    invalidMode.dashboards[0].widgets[2].control.preferredOnMode = "off";
    assert.throws(function () {
        DashboardConfig.validateConfiguration(invalidMode);
    });

    const conflicting = controlConfiguration();
    conflicting.dashboards[0].widgets.push(
        widget(
            "climate-office-duplicate",
            "climate.office",
            "climate",
            {enabled: true, preferredOnMode: "cool"}
        )
    );
    conflicting.dashboards[0].layouts = Layout.createLayouts(
        conflicting.dashboards[0].widgets
    );
    assert.throws(function () {
        DashboardConfig.validateConfiguration(conflicting);
    });
});

test("Climate-Zieltemperatur bleibt im Off-Zustand unabhängig von Power editierbar", function () {
    const authorization = {
        entityId: "climate.test",
        domain: "climate",
        preferredOnMode: null
    };
    const off = ClimatePower.capabilities(
        "climate.test",
        climateState("off", ["off", "auto"]),
        authorization
    );
    const noOff = ClimatePower.capabilities(
        "climate.test",
        climateState("heat", ["heat"]),
        authorization
    );
    const unsupportedTarget = ClimatePower.capabilities(
        "climate.test",
        climateState("off", ["off", "auto"], {supported_features: 0}),
        authorization
    );
    const missingTarget = ClimatePower.capabilities(
        "climate.test",
        climateState("off", ["off", "auto"], {temperature: null}),
        authorization
    );
    const rangeOnly = ClimatePower.capabilities(
        "climate.test",
        climateState("off", ["off", "auto"], {
            temperature: null,
            target_temp_low: 18,
            target_temp_high: 22
        }),
        authorization
    );

    assert.equal(off.supportsPower, true);
    assert.equal(off.canPowerOn, true);
    assert.equal(off.canSetTemperature, true);
    assert.deepEqual(off.temperature, {
        minimum: 7,
        maximum: 30,
        step: 0.5,
        target: 20
    });
    assert.equal(noOff.supportsPower, false);
    assert.equal(noOff.canPowerOn, false);
    assert.equal(noOff.canPowerOff, false);
    assert.equal(noOff.canSetTemperature, true);
    assert.equal(unsupportedTarget.canSetTemperature, false);
    assert.equal(missingTarget.canSetTemperature, false);
    assert.equal(rangeOnly.canSetTemperature, false);
});

test("Grid, Focus und Room konsumieren dieselben Gateway-Capabilities", function () {
    const climate = read("src/public/js/widgets/climate.js");
    const focus = read("src/public/js/focus/view-model.js");
    const room = read("src/public/js/widgets/room.js");
    const api = read("src/routes/api.js");
    const control = read("src/services/control-authorization.js");

    [climate, focus, room].forEach(function (source) {
        assert.match(source, /can_set_temperature/);
        assert.match(source, /supports_power/);
    });
    assert.doesNotMatch(
        climate,
        /canSetTemperature[\s\S]{0,160}state\s*!==\s*["']off["']/
    );
    assert.doesNotMatch(
        focus,
        /temperatureAvailable[\s\S]{0,180}state\s*!==\s*["']off["']/
    );
    assert.match(api, /controlAuthorization\.climateCapabilities/);
    assert.match(api, /controlAuthorization\.lightCapabilities/);
    assert.match(control, /dashboardConfig\.getControlAuthorization/);
    assert.doesNotMatch(api, /ALLOWED_(?:LIGHT|CLIMATE)_ENTITIES/);
    assert.doesNotMatch(api, /router\.(?:post|put)\([^)]*service/);
});

test("Grid, Focus und Room rendern freigegebene Off-Controls aus demselben Payload", function () {
    const context = legacyControlContext();
    const lightState = {
        entity_id: "light.kitchen_ceiling",
        state: "off",
        attributes: {},
        gateway_capabilities: {
            can_light_power_on: true,
            can_light_power_off: true
        }
    };
    const climateData = {
        entity_id: "climate.office",
        state: "off",
        attributes: {
            current_temperature: 21,
            temperature: 20,
            min_temp: 8,
            max_temp: 28,
            target_temp_step: 0.5
        },
        gateway_capabilities: {
            can_set_temperature: true,
            supports_power: true,
            can_power_on: true,
            can_power_off: false
        }
    };
    const lightWidget = new context.LightWidget({
        id: "light-grid",
        entity: "light.kitchen_ceiling",
        type: "light",
        title: "Küche",
        subtitle: "",
        icon: "light",
        iconClass: "light",
        size: "normal"
    });
    const climateWidget = new context.ClimateWidget({
        id: "climate-grid",
        entity: "climate.office",
        type: "climate",
        title: "Büro",
        subtitle: "",
        icon: "heating",
        iconClass: "heating",
        unit: "°C",
        size: "normal"
    });
    const lightHtml = lightWidget.render(lightState);
    const climateHtml = climateWidget.render(climateData);
    const lightFocus = context.LegacyFocusViewModel.create({
        widget: lightWidget,
        state: lightState
    });
    const climateFocus = context.LegacyFocusViewModel.create({
        widget: climateWidget,
        state: climateData
    });
    const room = new context.RoomWidget({
        id: "room-grid",
        entity: "",
        type: "room",
        title: "Wohnbereich",
        subtitle: "",
        icon: "room",
        iconClass: "room",
        size: "large",
        room: {
            areaId: null,
            collapsible: false,
            defaultExpanded: true,
            background: null,
            entities: {
                temperature: null,
                humidity: null,
                climate: "climate.office",
                presence: null,
                windows: [],
                lights: ["light.kitchen_ceiling"],
                switches: [],
                covers: [],
                fans: [],
                mediaPlayers: [],
                locks: [],
                batteries: [],
                alerts: [],
                secondary: []
            }
        }
    });
    const roomHtml = room.render({
        "light.kitchen_ceiling": lightState,
        "climate.office": climateData
    }, []);

    assert.match(lightHtml, /light-control/);
    assert.doesNotMatch(lightHtml, /light-control[^>]*disabled="disabled"/);
    assert.equal(
        (climateHtml.match(/climate-control/g) || []).length >= 2,
        true
    );
    assert.match(climateHtml, /climate-power-control/);
    assert.equal(lightFocus.powerAvailable, true);
    assert.equal(climateFocus.canDecrease, true);
    assert.equal(climateFocus.canIncrease, true);
    assert.equal(climateFocus.powerVisible, true);
    assert.equal(climateFocus.powerAvailable, true);
    assert.match(roomHtml, /room-light-control/);
    assert.match(roomHtml, /room-climate-power-control/);
    assert.equal(
        (roomHtml.match(/climate-control/g) || []).length >= 2,
        true
    );
});

test("Admin bietet explizite Freigabe und sichere Climate-Moduswahl", function () {
    const html = read("src/admin/index.html");
    const app = read("src/admin/js/app.js");
    const widgets = read("src/admin/js/widgets.js");
    const rooms = read("src/admin/js/rooms.js");

    assert.match(html, /widgetControlEnabledInput/);
    assert.match(html, /widgetPreferredOnModeInput/);
    assert.match(html, /roomControlEnabledInput/);
    assert.match(html, /roomPreferredOnModeInput/);
    assert.match(app, /hvac_modes/);
    assert.match(app, /Steuerung freigegeben/);
    assert.match(widgets, /preferredOnMode/);
    assert.match(rooms, /preferredOnMode/);
    assert.doesNotMatch(app, /HA_TOKEN|SUPERVISOR_TOKEN/);
});
