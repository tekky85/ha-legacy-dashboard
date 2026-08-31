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
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


test("Climate-Power-Capability ist serverseitig eindeutig", function () {
    const climatePower = require("../src/services/climate-power");

    assert.equal(
        climatePower.resolvePowerOnMode(
            "climate.single",
            {state: "off", attributes: {hvac_modes: ["off", "heat"]}}
        ),
        "heat"
    );
    assert.equal(
        climatePower.resolvePowerOnMode(
            "climate.esszimmer_thermostate",
            {state: "off", attributes: {hvac_modes: ["off", "cool", "heat"]}}
        ),
        "heat"
    );
    assert.equal(
        climatePower.resolvePowerOnMode(
            "climate.ambiguous",
            {state: "off", attributes: {hvac_modes: ["off", "cool", "dry"]}}
        ),
        "cool"
    );
    const offCapabilities = climatePower.capabilities(
            "climate.esszimmer_thermostate",
            {
                state: "off",
                attributes: {
                    hvac_modes: ["off", "heat", "cool"],
                    supported_features: 1,
                    temperature: 20,
                    min_temp: 10,
                    max_temp: 30,
                    target_temp_step: 0.5
                }
            },
            {
                entityId: "climate.esszimmer_thermostate",
                domain: "climate",
                preferredOnMode: null
            }
        );
    const onCapabilities = climatePower.capabilities(
            "climate.esszimmer_thermostate",
            {
                state: "heat",
                attributes: {
                    hvac_modes: ["off", "heat", "cool"],
                    supported_features: 1,
                    temperature: 20,
                    min_temp: 10,
                    max_temp: 30,
                    target_temp_step: 0.5
                }
            },
            {
                entityId: "climate.esszimmer_thermostate",
                domain: "climate",
                preferredOnMode: null
            }
    );

    assert.equal(offCapabilities.canPowerOn, true);
    assert.equal(offCapabilities.canPowerOff, false);
    assert.equal(offCapabilities.canSetTemperature, true);
    assert.equal(onCapabilities.canPowerOn, false);
    assert.equal(onCapabilities.canPowerOff, true);
});


test("Admin und Legacy verwenden dieselben Presentation-Regeln", function () {
    const context = vm.createContext({
        Math: Math,
        isFinite: isFinite,
        parseFloat: parseFloat
    });

    vm.runInContext(
        read("src/public/js/core/presentation.js"),
        context
    );

    const portrait = context.LegacyPresentation
        .calculateGridGeometry(768, 6);
    const landscape = context.LegacyPresentation
        .calculateGridGeometry(1024, 12);

    assert.equal(portrait.rowHeight, 128);
    assert.equal(landscape.rowHeight, 128);
    assert.equal(
        context.LegacyPresentation.getMode(
            {type: "sensor"},
            2,
            1,
            150,
            108
        ),
        "compact"
    );
    assert.equal(
        context.LegacyPresentation.getMode(
            {type: "climate"},
            6,
            2,
            490,
            236
        ),
        "large"
    );

    const adminApp = read("src/admin/js/app.js");
    const legacyLayout = read("src/public/js/core/layout.js");

    assert.match(adminApp, /LegacyPresentation\.getMode/);
    assert.match(legacyLayout, /LegacyPresentation\.getMode/);
    assert.match(adminApp, /preview-theme/);
    assert.match(adminApp, /portrait/);
    assert.match(adminApp, /landscape/);
    assert.match(adminApp, /admin-preview-controls/);
    assert.match(adminApp, /button\.disabled = true/);
    assert.doesNotMatch(adminApp, /\/api\/light\/state/);
    assert.doesNotMatch(adminApp, /\/api\/climate\/(?:temperature|power)/);
});


test("Unified Controls ersetzen den iOS-Switch und bleiben touch-tauglich", function () {
    const context = vm.createContext({
        Legacy: {html: {escape: escapeHtml}},
        Object: Object
    });

    vm.runInContext(
        read("src/public/js/controls/power.js"),
        context
    );

    const html = context.LegacyControls.powerButton({
        className: "light-control",
        entity: "light.example",
        state: "on",
        available: true,
        label: "Ausschalten"
    });

    assert.match(html, /^<button/);
    assert.match(html, /dashboard-power-control light-control/);
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /<svg/);
    assert.doesNotMatch(html, /light-control-track|light-control-knob/);

    const lightWidget = read("src/public/js/widgets/light.js");
    const climateWidget = read("src/public/js/widgets/climate.js");
    const css = read("src/public/css/style.css");

    assert.doesNotMatch(lightWidget, /light-control-track|light-control-knob/);
    assert.match(climateWidget, /climate-power-control/);
    assert.match(climateWidget, /can_set_temperature/);
    assert.match(css, /min-width:\s*46px/);
    assert.match(css, /min-height:\s*46px/);
    assert.match(css, /body\.theme-dark \.dashboard-power-control/);
    assert.match(
        css,
        /card-climate\.card-presentation-compact \.climate-control,[\s\S]*display:\s*none/
    );
});


test("Focus Mode bleibt Overlay und trennt Grid-DOM von Controls", function () {
    const focus = read("src/public/js/focus/focus.js");
    const renderer = read("src/public/js/focus/renderer.js");
    const app = read("src/public/js/app.js");
    const html = read("src/public/index.html");
    const css = read("src/public/css/style.css");

    assert.match(html, /id="focusOverlay"/);
    assert.match(html, /id="focusClose"[^>]*class="focus-close"|id="focusClose"/);
    assert.doesNotMatch(focus, /cloneNode\(true\)/);
    assert.match(renderer, /renderClimateFocus/);
    assert.match(renderer, /focus-climate-control/);
    assert.match(focus, /focusedWidgetId/);
    assert.match(focus, /event\.target \|\| event\.srcElement/);
    assert.match(focus, /=== overlay/);
    assert.match(css, /\.focus-overlay\s*\{[\s\S]*position:\s*fixed/);
    assert.match(css, /\.focus-widget\s*\{/);
    assert.match(app, /event\.stopPropagation/);
    assert.match(app, /LegacyFocus\.open/);
    assert.match(app, /disableDashboardControls/);
    assert.match(app, /climate-power-control/);
    assert.doesNotMatch(focus, /Legacy\.http|XMLHttpRequest|fetch/);
});


test("Sprint-17.3 wahrt ES5 und die Write-Sicherheitsgrenzen", function () {
    const legacyFiles = [
        "src/public/js/core/presentation.js",
        "src/public/js/controls/power.js",
        "src/public/js/focus/focus.js",
        "src/public/js/widgets/light.js",
        "src/public/js/widgets/climate.js",
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

    legacyFiles.forEach(function (fileName) {
        const source = read(fileName);

        forbidden.forEach(function (pattern) {
            assert.doesNotMatch(source, pattern, fileName);
        });
    });

    const api = read("src/routes/api.js");
    const adminRoute = read("src/routes/admin.js");

    assert.match(api, /controlAuthorization\.climateCapabilities/);
    assert.match(api, /controlAuthorization\.lightCapabilities/);
    assert.doesNotMatch(api, /ALLOWED_(?:LIGHT|CLIMATE)_ENTITIES/);
    assert.match(api, /"set_hvac_mode"/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
    assert.match(adminRoute, /router\.get\("\/preview"/);
    assert.doesNotMatch(adminRoute, /ALLOWED_(?:LIGHT|CLIMATE)_ENTITIES/);
});
