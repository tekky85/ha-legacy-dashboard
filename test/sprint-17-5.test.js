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


function createContext() {
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        String: String,
        isFinite: isFinite,
        isNaN: isNaN,
        parseFloat: parseFloat,
        Legacy: {
            html: {
                escape: function (value) {
                    return String(value)
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;");
                }
            }
        },
        LegacyIcons: {
            get: function () {
                return '<svg class="fixture-icon"></svg>';
            }
        }
    });

    vm.runInContext(read("src/public/js/controls/power.js"), context);
    vm.runInContext(read("src/public/js/focus/view-model.js"), context);
    vm.runInContext(read("src/public/js/focus/renderer.js"), context);
    return context;
}


function widget(type, id) {
    return {
        id: id,
        type: type,
        entity: type + ".example",
        title: "Raum & Test",
        subtitle: "Untertitel",
        icon: type === "binary" ? "window" : type,
        iconClass: type === "sensor" ? "temperature" : "",
        unit: "°C",
        getCardIdentity: function () {
            return this.title;
        }
    };
}


test("Focus besitzt View Model und typgetrennte native Renderer", function () {
    const focus = read("src/public/js/focus/focus.js");
    const renderer = read("src/public/js/focus/renderer.js");
    const html = read("src/public/index.html");

    assert.doesNotMatch(focus, /cloneNode\s*\(/);
    assert.doesNotMatch(focus, /getElementsByClassName\(\s*["']card/);
    assert.match(focus, /LegacyFocusViewModel\.create/);
    assert.match(focus, /LegacyFocusRenderer\.render/);
    assert.match(renderer, /function renderSensorFocus/);
    assert.match(renderer, /function renderBinaryFocus/);
    assert.match(renderer, /function renderLightFocus/);
    assert.match(renderer, /function renderClimateFocus/);
    assert.match(html, /class="focus-panel"/);
    assert.ok(
        html.indexOf("/js/focus/view-model.js?v=50") <
            html.indexOf("/js/focus/renderer.js?v=50")
    );
    assert.ok(
        html.indexOf("/js/focus/renderer.js?v=50") <
            html.indexOf("/js/focus/focus.js?v=50")
    );
});


test("Sensor und Binary rendern eigene Focus-DOMs ohne Grid-Klassen", function () {
    const context = createContext();
    const sensor = context.LegacyFocusViewModel.create({
        widget: widget("sensor", "sensor-1"),
        state: {
            state: "21.8",
            attributes: {unit_of_measurement: "°C"}
        }
    });
    const binary = context.LegacyFocusViewModel.create({
        widget: widget("binary", "binary-1"),
        state: {state: "on", attributes: {}}
    });
    const sensorHtml = context.LegacyFocusRenderer.render(sensor);
    const binaryHtml = context.LegacyFocusRenderer.render(binary);

    assert.equal(sensor.value, "21.8");
    assert.equal(sensor.unit, "°C");
    assert.match(sensorHtml, /focus-widget-sensor/);
    assert.match(sensorHtml, /Raum &amp; Test/);
    assert.match(sensorHtml, /21\.8/);
    assert.match(binaryHtml, /focus-widget-binary/);
    assert.match(binaryHtml, /Offen/);
    assert.doesNotMatch(sensorHtml + binaryHtml, /card-size-|card-presentation-/);
    assert.doesNotMatch(sensorHtml + binaryHtml, /class="[^"]*\bcard\b/);
    assert.doesNotMatch(sensorHtml + binaryHtml, /style=/);
});


test("Light Focus bindet Power ausschließlich an Gateway-Capabilities", function () {
    const context = createContext();
    const allowed = context.LegacyFocusViewModel.create({
        widget: widget("light", "light-1"),
        state: {
            state: "on",
            attributes: {},
            gateway_capabilities: {can_light_power_off: true}
        }
    });
    const denied = context.LegacyFocusViewModel.create({
        widget: widget("light", "light-1"),
        state: {
            state: "on",
            attributes: {},
            gateway_capabilities: {}
        }
    });
    const stale = context.LegacyFocusViewModel.create({
        widget: widget("light", "light-1"),
        state: {
            state: "on",
            attributes: {},
            gateway_capabilities: {can_light_power_off: true}
        },
        stale: true
    });

    assert.equal(allowed.powerAvailable, true);
    assert.equal(denied.powerAvailable, false);
    assert.equal(stale.powerAvailable, false);
    assert.match(context.LegacyFocusRenderer.render(allowed), /focus-light-control/);
    assert.match(context.LegacyFocusRenderer.render(denied), /disabled="disabled"/);
    assert.match(context.LegacyFocusRenderer.render(stale), /Veraltete Daten/);
});


test("Climate Focus hält Ist, Soll und autorisierte Controls bedienbar", function () {
    const context = createContext();
    const model = context.LegacyFocusViewModel.create({
        widget: widget("climate", "climate-1"),
        state: {
            state: "heat",
            attributes: {
                current_temperature: 21.8,
                temperature: 22.5,
                min_temp: 5,
                max_temp: 30,
                target_temp_step: 0.5,
                hvac_action: "heating"
            },
            gateway_capabilities: {
                can_set_temperature: true,
                supports_power: true,
                can_power_off: true,
                can_power_on: false
            }
        }
    });
    const html = context.LegacyFocusRenderer.render(model);

    assert.equal(model.currentText, "21.8");
    assert.equal(model.targetText, "22.5");
    assert.equal(model.canDecrease, true);
    assert.equal(model.canIncrease, true);
    assert.equal(model.powerVisible, true);
    assert.equal(model.powerAvailable, true);
    assert.match(html, /focus-widget-climate/);
    assert.match(html, /focus-current-value[^>]*>21\.8/);
    assert.match(html, /focus-target-value[^>]*>22\.5/);
    assert.equal(
        (
            html.match(
                /class="[^"]*focus-step-action focus-climate-control"/g
            ) || []
        ).length,
        2
    );
    assert.match(html, /focus-climate-power-control/);
    assert.doesNotMatch(html, /card-size-|card-presentation-|style=/);
});


test("Unavailable Focus bleibt groß und deaktiviert alle Writes", function () {
    const context = createContext();
    const model = context.LegacyFocusViewModel.create({
        widget: widget("climate", "climate-1"),
        state: {
            state: "unavailable",
            attributes: {},
            gateway_capabilities: {
                can_set_temperature: true,
                supports_power: true,
                can_power_on: true
            }
        }
    });
    const html = context.LegacyFocusRenderer.render(model);

    assert.equal(model.unavailable, true);
    assert.equal(model.canDecrease, false);
    assert.equal(model.canIncrease, false);
    assert.equal(model.powerAvailable, false);
    assert.match(html, /focus-state-unavailable/);
    assert.equal((html.match(/disabled="disabled"/g) || []).length, 3);
});


test("Focus CSS ist von Grid-Media-Queries isoliert und verhindert Shrink", function () {
    const css = read("src/public/css/style.css");
    const focusSection = css.split(
        "NATIVE FOCUS INTERACTION VIEW"
    )[1].split("CLIMATE RESPONSIVE LAYOUT")[0];

    assert.doesNotMatch(focusSection, /\.card(?:\b|-)/);
    assert.doesNotMatch(focusSection, /card-presentation-|card-size-/);
    assert.doesNotMatch(focusSection, /transform\s*:\s*scale|\bzoom\s*:/);
    assert.match(focusSection, /\.focus-panel\s*\{[\s\S]*?box-sizing:\s*border-box/);
    assert.match(focusSection, /\.focus-panel\s*\{[\s\S]*?flex-shrink:\s*0/);
    assert.match(focusSection, /\.focus-widget\s*\{[\s\S]*?flex-shrink:\s*0/);
    assert.match(focusSection, /\.focus-action\s*\{[\s\S]*?min-width:\s*54px/);
    assert.match(focusSection, /\.focus-action\s*\{[\s\S]*?min-height:\s*54px/);
    assert.match(focusSection, /\.focus-step-action\s*\{[\s\S]*?width:\s*56px/);
    assert.match(focusSection, /\.focus-step-action\s*\{[\s\S]*?height:\s*56px/);
});


test("Focus State Binding nutzt Widget-ID statt Grid-DOM", function () {
    const dashboard = read("src/public/js/core/dashboard.js");
    const app = read("src/public/js/app.js");

    assert.match(dashboard, /getFocusSource:\s*function \(widgetId\)/);
    assert.match(dashboard, /this\.states\[widget\.entity\]/);
    assert.match(dashboard, /controlsDisabled:\s*this\.controlsDisabled/);
    assert.match(app, /LegacyFocus\.initialize\(function \(widgetId\)/);
    assert.match(app, /Dashboard\.getFocusSource\(widgetId\)/);
    assert.match(app, /getAttribute\("data-widget-id"\)/);
    assert.match(app, /focus-light-control/);
    assert.match(app, /focus-climate-control/);
    assert.match(app, /focus-climate-power-control/);
});


test("Sprint 17.5 bleibt ES5 und verändert keine Backend-Write-Fläche", function () {
    const legacyFiles = [
        "src/public/js/focus/view-model.js",
        "src/public/js/focus/renderer.js",
        "src/public/js/focus/focus.js",
        "src/public/js/core/dashboard.js",
        "src/public/js/app.js"
    ];
    const forbidden = [
        /\blet\b/,
        /\bconst\b/,
        /=>/,
        /`/,
        /\bclass\s+[A-Za-z_$]/,
        /\bfetch\s*\(/,
        /\bPromise\b/,
        /\basync\b/,
        /\bawait\b/,
        /\?\./,
        /\?\?/
    ];
    const api = read("src/routes/api.js");
    const server = read("src/server.js");

    legacyFiles.forEach(function (fileName) {
        forbidden.forEach(function (pattern) {
            assert.doesNotMatch(read(fileName), pattern, fileName);
        });
    });

    assert.match(api, /controlAuthorization\.climateCapabilities/);
    assert.match(api, /controlAuthorization\.lightCapabilities/);
    assert.doesNotMatch(api, /ALLOWED_(?:LIGHT|CLIMATE)_ENTITIES/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
    assert.doesNotMatch(
        read("src/public/js/focus/focus.js") +
            read("src/public/js/focus/renderer.js"),
        /Legacy\.http|XMLHttpRequest|fetch|ADMIN_TOKEN|HA_TOKEN/
    );
    assert.doesNotMatch(server, /focus/i);
});
