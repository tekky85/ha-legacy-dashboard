const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");


const PROJECT_PATH = path.join(__dirname, "..");


function read(relativePath) {
    return fs.readFileSync(
        path.join(PROJECT_PATH, relativePath),
        "utf8"
    );
}


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function createWidgetContext() {

    const context = vm.createContext({
        Legacy: {
            html: {
                escape: escapeHtml
            }
        },
        LegacyIcons: {
            get: function () {
                return "<svg></svg>";
            }
        },
        Object: Object,
        Math: Math,
        isNaN: isNaN,
        parseFloat: parseFloat
    });

    [
        "src/public/js/core/presentation.js",
        "src/public/js/core/widget.js",
        "src/public/js/controls/power.js",
        "src/public/js/widgets/sensor.js",
        "src/public/js/widgets/binary.js",
        "src/public/js/widgets/light.js",
        "src/public/js/widgets/climate.js"
    ].forEach(function (fileName) {
        vm.runInContext(read(fileName), context);
    });

    return context;
}


function widgetConfig(type, title, subtitle) {
    return {
        id: type + "-one",
        type: type,
        entity: type === "binary"
            ? "binary_sensor.example"
            : type + ".example",
        title: title,
        subtitle: subtitle,
        icon: "sensor",
        size: "normal"
    };
}


test("Compact-Widgets behalten Identität und ihren primären Inhalt", function () {

    const context = createWidgetContext();
    const sensor = new context.SensorWidget(
        widgetConfig("sensor", "Bad", "Temperatur")
    );
    const binary = new context.BinaryWidget(
        widgetConfig("binary", "Küche", "Fenster")
    );
    const light = new context.LightWidget(
        widgetConfig("light", "Esszimmer", "Licht")
    );
    const climate = new context.ClimateWidget(
        widgetConfig("climate", "Heizung", "Esszimmer")
    );

    const sensorHtml = sensor.render({
        state: "21.8",
        attributes: {unit_of_measurement: "°C"}
    });
    const binaryHtml = binary.render({state: "on", attributes: {}});
    const lightHtml = light.render({
        state: "on",
        attributes: {},
        gateway_capabilities: {
            can_light_power_on: true,
            can_light_power_off: true
        }
    });
    const climateHtml = climate.render({
        state: "heat",
        attributes: {
            current_temperature: 21.8,
            temperature: 22.5,
            min_temp: 5,
            max_temp: 35,
            target_temp_step: 0.5,
            hvac_action: "heating"
        },
        gateway_capabilities: {
            can_set_temperature: true,
            can_power_on: false,
            can_power_off: true
        }
    });

    assert.match(sensorHtml, /card-identity[^>]*>Bad</);
    assert.match(sensorHtml, /21\.8/);
    assert.match(binaryHtml, /card-identity[^>]*>Küche</);
    assert.match(binaryHtml, /Offen/);
    assert.match(lightHtml, /card-identity[^>]*>Esszimmer</);
    assert.match(lightHtml, />An</);
    assert.match(lightHtml, /dashboard-power-control light-control/);
    assert.match(climateHtml, /card-identity[^>]*>Heizung</);
    assert.match(climateHtml, /climate-current-value[^>]*>21\.8</);
    assert.match(climateHtml, /climate-target-value[^>]*>22\.5/);
    assert.match(climateHtml, /data-direction="-1"/);
    assert.match(climateHtml, /data-direction="1"/);
});


test("Card-Identität folgt Titel, Kurztext, Friendly Name und Entity-ID", function () {

    const context = createWidgetContext();
    const explicit = new context.Widget(
        widgetConfig("sensor", "  Bad  ", "Raum")
    );
    const shortTitle = new context.Widget(
        widgetConfig("sensor", "", "Badezimmer")
    );
    const friendly = new context.Widget(
        widgetConfig("sensor", "", "")
    );

    assert.equal(
        explicit.getCardIdentity({attributes: {friendly_name: "Friendly"}}),
        "Bad"
    );
    assert.equal(
        shortTitle.getCardIdentity({attributes: {friendly_name: "Friendly"}}),
        "Badezimmer"
    );
    assert.equal(
        friendly.getCardIdentity({attributes: {friendly_name: "Friendly"}}),
        "Friendly"
    );
    assert.equal(
        friendly.getCardIdentity({attributes: {}}),
        "sensor.example"
    );
});


function createCard(widgetId) {
    return {
        className: "card",
        style: {},
        getAttribute: function (name) {
            return name === "data-widget-id" ? widgetId : null;
        }
    };
}


test("Rastergeometrie ist proportional, gutter-aware und gecacht", function () {

    const context = vm.createContext({
        window: {innerWidth: 768, innerHeight: 1024},
        Math: Math,
        isFinite: isFinite,
        parseFloat: parseFloat
    });

    vm.runInContext(read("src/public/js/core/layout.js"), context);

    const proportional = context.LegacyLayout.calculateGridGeometry(1200, 6);
    const minimum = context.LegacyLayout.calculateGridGeometry(600, 6);

    assert.equal(proportional.columnWidth, 200);
    assert.equal(proportional.rowHeight, 180);
    assert.equal(proportional.gutter, 20);
    assert.equal(minimum.rowHeight, 128);

    const widget = {id: "sensor-one", type: "sensor", size: "normal"};
    const card = createCard(widget.id);
    const container = {
        clientWidth: 720,
        className: "grid",
        style: {},
        getElementsByClassName: function () {
            return [card];
        }
    };
    const layouts = {
        portrait: {
            columns: 6,
            items: {"sensor-one": {x: 0, y: 0, w: 2, h: 1}}
        },
        landscape: {
            columns: 12,
            items: {"sensor-one": {x: 10, y: 0, w: 2, h: 1}}
        }
    };

    context.LegacyLayout.configure(layouts, [widget]);
    context.LegacyLayout.apply(container);

    assert.equal(card.style.width, "calc(33.33333333333333% - 20px)");
    assert.equal(card.style.height, "108px");
    assert.equal(container.style.height, "128px");
    assert.equal(context.LegacyLayout.getGeometryComputationCount(), 1);

    context.LegacyLayout.apply(container);
    assert.equal(context.LegacyLayout.getGeometryComputationCount(), 1);

    container.clientWidth = 900;
    context.LegacyLayout.apply(container);
    assert.equal(card.style.height, "115px");
    assert.equal(context.LegacyLayout.getGeometryComputationCount(), 2);

    context.window.innerWidth = 1024;
    context.window.innerHeight = 768;
    context.LegacyLayout.apply(container);
    assert.equal(card.style.left, "83.33333333333334%");
    assert.equal(context.LegacyLayout.getGeometryComputationCount(), 3);
});


test("Presentation Mode berücksichtigt reale verfügbare Pixel", function () {

    const context = vm.createContext({
        window: {innerWidth: 768, innerHeight: 1024},
        Math: Math,
        isFinite: isFinite,
        parseFloat: parseFloat
    });

    vm.runInContext(read("src/public/js/core/layout.js"), context);

    assert.equal(
        context.LegacyLayout.getPresentationMode(
            {type: "sensor"}, 2, 1, 160, 108
        ),
        "compact"
    );
    assert.equal(
        context.LegacyLayout.getPresentationMode(
            {type: "sensor"}, 3, 2, 210, 180
        ),
        "standard"
    );
    assert.equal(
        context.LegacyLayout.getPresentationMode(
            {type: "sensor"}, 4, 2, 240, 230
        ),
        "standard"
    );
    assert.equal(
        context.LegacyLayout.getPresentationMode(
            {type: "climate"}, 3, 1, 227, 108
        ),
        "compact"
    );
    assert.equal(
        context.LegacyLayout.getPresentationMode(
            {type: "climate"}, 3, 2, 227, 200
        ),
        "compact"
    );
    assert.equal(
        context.LegacyLayout.getPresentationMode(
            {type: "climate"}, 6, 2, 380, 230
        ),
        "standard"
    );
});


function createThemeContext(
    storage,
    shouldThrow,
    cookieStorage,
    cookieShouldThrow,
    pathname
) {

    const elements = {};
    const root = {className: ""};
    const body = {className: ""};
    const cookies = cookieStorage || {};
    const button = {
        attributes: {},
        setAttribute: function (name, value) {
            this.attributes[name] = value;
        }
    };
    const label = {innerHTML: ""};

    elements.themeButton = button;
    elements.themeButtonLabel = label;

    const document = {
        documentElement: root,
        body: body,
        getElementById: function (id) {
            return elements[id] || null;
        }
    };

    Object.defineProperty(document, "cookie", {
        get: function () {
            if (cookieShouldThrow) {
                throw new Error("cookies unavailable");
            }
            return Object.keys(cookies).map(function (key) {
                return encodeURIComponent(key) + "=" +
                    encodeURIComponent(cookies[key]);
            }).join("; ");
        },
        set: function (value) {
            const pair = String(value || "").split(";")[0].split("=");
            const key = decodeURIComponent(pair.shift() || "");

            if (cookieShouldThrow) {
                throw new Error("cookies unavailable");
            }
            cookies[key] = decodeURIComponent(pair.join("="));
        }
    });

    const context = vm.createContext({
        document: document,
        window: {
            location: {
                pathname: pathname || "/"
            },
            localStorage: {
                getItem: function (key) {
                    if (shouldThrow) {
                        throw new Error("storage unavailable");
                    }
                    return Object.prototype.hasOwnProperty.call(storage, key)
                        ? storage[key]
                        : null;
                },
                setItem: function (key, value) {
                    if (shouldThrow) {
                        throw new Error("storage unavailable");
                    }
                    storage[key] = String(value);
                }
            }
        }
    });

    vm.runInContext(read("src/public/js/core/theme.js"), context);

    return {
        context: context,
        root: root,
        body: body,
        button: button,
        label: label,
        cookies: cookies
    };
}


test("Dark und Light Theme überleben Reload mit bestehendem Storage-Key", function () {

    const storage = {};
    const firstLoad = createThemeContext(storage, false);

    firstLoad.context.Theme.load();
    assert.equal(firstLoad.context.Theme.current, "light");

    firstLoad.context.Theme.toggle();
    assert.equal(storage["ha-legacy-theme"], "dark");

    const darkReload = createThemeContext(storage, false);
    assert.match(darkReload.root.className, /theme-dark/);
    darkReload.context.Theme.load();
    assert.match(darkReload.body.className, /theme-dark/);

    darkReload.context.Theme.toggle();
    assert.equal(storage["ha-legacy-theme"], "light");

    const lightReload = createThemeContext(storage, false);
    lightReload.context.Theme.load();
    assert.doesNotMatch(lightReload.root.className, /theme-dark/);
    assert.doesNotMatch(lightReload.body.className, /theme-dark/);
});


test("Theme bleibt bei Storage-Fehlern für die aktuelle Sitzung bedienbar", function () {

    const harness = createThemeContext({}, true);

    assert.doesNotThrow(function () {
        harness.context.Theme.load();
        harness.context.Theme.toggle();
    });
    assert.equal(harness.context.Theme.current, "dark");
    assert.match(harness.body.className, /theme-dark/);
});


test("Theme-Fallback bleibt bei LocalStorage-Fehlern über alle Legacy-Routen erhalten", function () {

    const cookies = {};
    const routes = [
        "/",
        "/d/custom-dashboard",
        "/system/summary",
        "/system/errors",
        "/"
    ];
    const first = createThemeContext({}, true, cookies, false);

    first.context.Theme.load();
    first.context.Theme.toggle();
    assert.equal(cookies["ha-legacy-theme"], "dark");

    routes.forEach(function (route) {
        const reload = createThemeContext({}, true, cookies, false, route);

        assert.equal(reload.context.window.location.pathname, route);
        assert.match(reload.root.className, /theme-dark/);
        reload.context.Theme.load();
        assert.equal(reload.context.Theme.current, "dark");
        assert.match(reload.body.className, /theme-dark/);
    });

    const light = createThemeContext({}, true, cookies, false);
    light.context.Theme.load();
    light.context.Theme.toggle();
    assert.equal(cookies["ha-legacy-theme"], "light");

    routes.forEach(function (route) {
        const reload = createThemeContext({}, true, cookies, false, route);

        assert.equal(reload.context.window.location.pathname, route);
        reload.context.Theme.load();
        assert.equal(reload.context.Theme.current, "light");
        assert.doesNotMatch(reload.root.className, /theme-dark/);
        assert.doesNotMatch(reload.body.className, /theme-dark/);
    });
});


test("Ungültige Theme-Werte und vollständiger Storage-Ausfall bleiben sicher", function () {

    const invalid = createThemeContext(
        {"ha-legacy-theme": "sepia"},
        false,
        {"ha-legacy-theme": "contrast"},
        false
    );
    const unavailable = createThemeContext({}, true, {}, true);

    invalid.context.Theme.load();
    assert.equal(invalid.context.Theme.current, "light");

    assert.doesNotThrow(function () {
        unavailable.context.Theme.load();
        unavailable.context.Theme.toggle();
    });
    assert.equal(unavailable.context.Theme.current, "dark");
    assert.match(unavailable.body.className, /theme-dark/);
});


test("Legacy-Routen laden dasselbe Theme früh und ohne Inline-Skript", function () {

    const indexHtml = read("src/public/index.html");
    const systemHtml = read("src/public/system.html");

    assert.ok(
        indexHtml.indexOf("/js/core/theme.js?v=48") <
            indexHtml.indexOf("/css/style.css?v=48")
    );
    assert.ok(
        systemHtml.indexOf("/js/core/theme.js?v=44") <
            systemHtml.indexOf("/css/style.css?v=44")
    );
    assert.equal(
        (indexHtml.match(/\/js\/core\/theme\.js/g) || []).length,
        1
    );
    assert.equal(
        (systemHtml.match(/\/js\/core\/theme\.js/g) || []).length,
        1
    );
    assert.match(indexHtml, /\/js\/app\.js\?v=48/);
    assert.match(systemHtml, /\/js\/system\/summary\.js\?v=44/);
    assert.match(systemHtml, /\/js\/system\/errors\.js\?v=44/);
});
