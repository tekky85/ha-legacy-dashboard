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
        .replace(/"/g, "&quot;");
}


function createContext() {
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        String: String,
        isFinite: isFinite,
        isNaN: isNaN,
        parseFloat: parseFloat,
        Legacy: {html: {escape: escapeHtml}},
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
        title: "Test",
        subtitle: "",
        icon: type,
        iconClass: "",
        unit: "°C",
        getCardIdentity: function () {
            return this.title;
        }
    };
}


test("Power Control verwendet in Grid und Focus denselben SVG-Renderer", function () {
    const context = createContext();
    const lightModel = context.LegacyFocusViewModel.create({
        widget: widget("light", "light-focus"),
        state: {
            state: "on",
            attributes: {},
            gateway_capabilities: {can_light_power_off: true}
        }
    });
    const focusHtml = context.LegacyFocusRenderer.render(lightModel);
    const climateModel = context.LegacyFocusViewModel.create({
        widget: widget("climate", "climate-focus"),
        state: {
            state: "heat",
            attributes: {
                current_temperature: 21.8,
                temperature: 22.5,
                min_temp: 5,
                max_temp: 30,
                target_temp_step: 0.5
            },
            gateway_capabilities: {
                can_set_temperature: true,
                can_power_off: true
            }
        }
    });
    const climateFocusHtml = context.LegacyFocusRenderer.render(climateModel);
    const gridHtml = context.LegacyControls.powerButton({
        className: "light-control",
        entity: "light.example",
        state: "on",
        available: true,
        label: "Ausschalten"
    });
    const renderer = read("src/public/js/focus/renderer.js");

    assert.match(gridHtml, /^<button[^>]*dashboard-control-power/);
    assert.match(focusHtml, /^<section[\s\S]*<button[^>]*dashboard-control-power/);
    assert.match(focusHtml, /focus-action focus-power-action focus-light-control/);
    assert.match(climateFocusHtml, /focus-action focus-power-action focus-climate-power-control/);
    assert.equal(
        (gridHtml.match(/<svg/g) || []).length,
        1
    );
    assert.equal(
        (focusHtml.match(/<svg/g) || []).length,
        2
    );
    assert.match(gridHtml + focusHtml, /width="24" height="24" viewBox="0 0 24 24"/);
    assert.match(gridHtml + focusHtml, /M12 3v10/);
    assert.match(gridHtml + focusHtml, /M6\.3 6\.7a8 8/);
    assert.doesNotMatch(gridHtml + focusHtml + climateFocusHtml, /⏻/);
    assert.doesNotMatch(renderer, /function powerIcon|focus-power-icon/);
    assert.match(renderer, /LegacyControls\.powerButton/);
});


test("Power Control bildet alle gemeinsamen Zustände ohne Geometriewechsel ab", function () {
    const context = createContext();
    const states = [
        {state: "on", available: true, expected: "is-on"},
        {state: "off", available: true, expected: "is-off"},
        {state: "off", available: true, busy: true, expected: "is-busy"},
        {state: "off", available: true, disabled: true, expected: "is-disabled"},
        {state: "unavailable", available: false, expected: "is-unavailable"},
        {state: "error", available: false, error: true, expected: "is-error"}
    ];

    states.forEach(function (settings) {
        const html = context.LegacyControls.powerButton(settings);

        assert.match(html, new RegExp(settings.expected));
        assert.match(html, /dashboard-control-power-icon/);
    });
});


test("Power-Geometrie neutralisiert Safari-Button- und SVG-Baselines", function () {
    const css = read("src/public/css/style.css");

    assert.match(css, /\.dashboard-control-power\s*\{[\s\S]*?display:\s*-webkit-flex;[\s\S]*?align-items:\s*center;[\s\S]*?justify-content:\s*center;/);
    assert.match(css, /\.dashboard-control-power\s*\{[\s\S]*?line-height:\s*1;[\s\S]*?-webkit-box-sizing:\s*border-box;[\s\S]*?-webkit-appearance:\s*none;/);
    assert.match(css, /\.dashboard-control-power-icon\s*\{[\s\S]*?width:\s*24px;[\s\S]*?height:\s*24px;[\s\S]*?line-height:\s*0;/);
    assert.match(css, /\.dashboard-control-power-icon svg\s*\{[\s\S]*?display:\s*block;/);
    assert.match(css, /\.dashboard-control-power-label\s*\{[\s\S]*?white-space:\s*nowrap;/);
    assert.match(css, /\.light-control\.dashboard-power-control\s*\{[\s\S]*?height:\s*52px;/);
    assert.match(css, /\.climate-power-control\.dashboard-power-control\s*\{[\s\S]*?width:\s*46px;[\s\S]*?height:\s*46px;/);
    assert.match(css, /\.focus-power-action\.dashboard-control-power\s*\{[\s\S]*?height:\s*54px;/);
    assert.doesNotMatch(css, /\.focus-power-icon\s*\{/);
});


test("Focus-Geometrie bleibt vom Grid getrennt", function () {
    const renderer = read("src/public/js/focus/renderer.js");
    const focus = read("src/public/js/focus/focus.js");
    const focusCss = read("src/public/css/style.css")
        .split("NATIVE FOCUS INTERACTION VIEW")[1]
        .split("CLIMATE RESPONSIVE LAYOUT")[0];

    assert.doesNotMatch(renderer + focus, /cloneNode\s*\(/);
    assert.doesNotMatch(renderer, /card-presentation-|card-size-|data-layout/);
    assert.doesNotMatch(focusCss, /\.card(?:\b|-)|card-presentation-|card-size-/);
    assert.match(renderer, /renderLightFocus/);
    assert.match(renderer, /renderClimateFocus/);
});


test("Sprint 17.6 bleibt ES5 und erweitert keine Write-Fläche", function () {
    const legacyFiles = [
        "src/public/js/controls/power.js",
        "src/public/js/focus/renderer.js",
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

    legacyFiles.forEach(function (fileName) {
        forbidden.forEach(function (pattern) {
            assert.doesNotMatch(read(fileName), pattern, fileName);
        });
    });

    assert.match(api, /"climate\.esszimmer_thermostate"/);
    assert.match(api, /"light\.esszimmer_lampen"/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
    assert.doesNotMatch(
        read("src/public/js/controls/power.js") +
            read("src/public/js/focus/renderer.js"),
        /Legacy\.http|XMLHttpRequest|HA_TOKEN|ADMIN_TOKEN/
    );
});
