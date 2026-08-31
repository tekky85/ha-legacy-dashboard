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
        title: "Sehr langer Testtitel für die Zentrierung",
        subtitle: "Test",
        icon: type,
        iconClass: "",
        unit: "°C",
        getCardIdentity: function () {
            return this.title;
        }
    };
}


test("gemeinsame Control-Hierarchie trennt Row, Group, Button und Content", function () {
    const context = createContext();
    const button = context.LegacyControls.powerButton({
        className: "light-control",
        entity: "light.example",
        state: "on",
        available: true,
        label: "Ausschalten"
    });
    const row = context.LegacyControls.controlRow(button, {
        className: "light-control-row",
        groupClassName: "light-control-group"
    });

    assert.match(row, /^<div class="dashboard-control-row/);
    assert.match(row, /<div class="dashboard-control-group/);
    assert.match(row, /<button[^>]*dashboard-control-power/);
    assert.match(row, /<span class="dashboard-control-content dashboard-control-power-content">/);
    assert.match(row, /dashboard-control-power-icon/);
    assert.match(row, /dashboard-control-power-label/);
});


test("Grid Light und Climate besitzen explizite volle Control-Zonen", function () {
    const light = read("src/public/js/widgets/light.js");
    const climate = read("src/public/js/widgets/climate.js");
    const css = read("src/public/css/style.css");

    assert.match(light, /LegacyControls\.controlRow\([\s\S]*?card-control-row light-control-row/);
    assert.match(light, /groupClassName:\s*"light-control-group"/);
    assert.match(climate, /climate-target-row dashboard-control-row/);
    assert.match(climate, /class="climate-target-group"/);
    assert.match(css, /\.dashboard-control-row\s*\{[\s\S]*?width:\s*100%;[\s\S]*?text-align:\s*center;/);
    assert.match(css, /\.light-control-group\s*\{[\s\S]*?width:\s*100%;/);
    assert.doesNotMatch(
        css,
        /card-light\.card-presentation-compact[\s\S]{0,300}align-self:\s*flex-end/
    );
});


test("native Buttons sind keine Flex-Layout-Parents mehr", function () {
    const css = read("src/public/css/style.css");

    assert.match(css, /\.dashboard-control\s*\{[\s\S]*?display:\s*inline-block;/);
    assert.match(css, /\.dashboard-control-power\s*\{[\s\S]*?display:\s*inline-block;/);
    assert.match(css, /\.focus-action\s*\{[\s\S]*?display:\s*inline-block;/);
    assert.match(css, /\.climate-control\s*\{[\s\S]*?display:\s*inline-block;/);
    assert.match(css, /\.dashboard-control-content\s*\{[\s\S]*?display:\s*-webkit-flex;[\s\S]*?display:\s*flex;/);
    assert.match(css, /\.dashboard-control-content\s*\{[\s\S]*?-webkit-align-items:\s*center;[\s\S]*?-webkit-justify-content:\s*center;/);
    assert.match(css, /\.dashboard-control\s*\{[\s\S]*?-webkit-appearance:\s*none;/);
});


test("Climate Focus zentriert Step-Gruppe und Power in eigenen Rows", function () {
    const context = createContext();
    const model = context.LegacyFocusViewModel.create({
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
                supports_power: true,
                can_power_off: true
            }
        }
    });
    const html = context.LegacyFocusRenderer.render(model);
    const css = read("src/public/css/style.css");

    assert.match(html, /dashboard-control-row focus-temperature-control-row/);
    assert.match(html, /dashboard-control-group focus-step-controls/);
    assert.match(html, /dashboard-control-row focus-power-control-row/);
    assert.match(html, /dashboard-control-group focus-power-control-group/);
    assert.equal((html.match(/dashboard-control-step-content/g) || []).length, 2);
    assert.match(css, /\.focus-step-controls\s*\{[\s\S]*?display:\s*inline-block;[\s\S]*?text-align:\s*center;/);
    assert.match(css, /\.focus-step-action\s*\{[\s\S]*?width:\s*56px;[\s\S]*?height:\s*56px;/);
});


test("Light Focus nutzt dieselbe zentrierte Row und Power-Komponente", function () {
    const context = createContext();
    const model = context.LegacyFocusViewModel.create({
        widget: widget("light", "light-focus"),
        state: {
            state: "on",
            attributes: {},
            gateway_capabilities: {can_light_power_off: true}
        }
    });
    const html = context.LegacyFocusRenderer.render(model);

    assert.match(html, /dashboard-control-row focus-controls focus-light-controls/);
    assert.match(html, /dashboard-control-group focus-light-control-group/);
    assert.match(html, /dashboard-control-power-content/);
    assert.match(html, /focus-light-control/);
});


test("Portrait, Landscape und Short Layout ändern nur Focus-Geometrie", function () {
    const css = read("src/public/css/style.css");
    const focusSection = css.split(
        "NATIVE FOCUS INTERACTION VIEW"
    )[1].split("CLIMATE RESPONSIVE LAYOUT")[0];

    assert.match(focusSection, /focus-layout-landscape[\s\S]*?focus-temperature-control-row/);
    assert.match(focusSection, /focus-layout-landscape[\s\S]*?focus-power-control-row/);
    assert.match(focusSection, /focus-layout-short[\s\S]*?focus-temperature-control-row/);
    assert.doesNotMatch(focusSection, /card-presentation-|card-size-|\.grid/);
    assert.doesNotMatch(focusSection, /translate[XY]?\s*\(/);
});


test("Sprint 17.7 bleibt ES5, Grid-frei und ohne neue Write-Fläche", function () {
    const legacyFiles = [
        "src/public/js/controls/power.js",
        "src/public/js/widgets/light.js",
        "src/public/js/widgets/climate.js",
        "src/public/js/focus/renderer.js"
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
    const css = read("src/public/css/style.css");
    const api = read("src/routes/api.js");

    legacyFiles.forEach(function (fileName) {
        forbidden.forEach(function (pattern) {
            assert.doesNotMatch(read(fileName), pattern, fileName);
        });
    });

    assert.doesNotMatch(css, /display:\s*grid|\bgap\s*:/);
    assert.doesNotMatch(css, /margin-left:\s*37px/);
    assert.match(api, /controlAuthorization\.climateCapabilities/);
    assert.match(api, /controlAuthorization\.lightCapabilities/);
    assert.doesNotMatch(api, /ALLOWED_(?:LIGHT|CLIMATE)_ENTITIES/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
    assert.doesNotMatch(
        legacyFiles.map(read).join("\n"),
        /Legacy\.http|XMLHttpRequest|HA_TOKEN|ADMIN_TOKEN/
    );
});
