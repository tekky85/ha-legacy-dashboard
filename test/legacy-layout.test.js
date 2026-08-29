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


function createCard(widgetId) {
    return {
        className: "card",
        style: {},
        getAttribute: function (name) {
            return name === "data-widget-id"
                ? widgetId
                : null;
        }
    };
}


function createContainer(cards) {
    return {
        className: "grid",
        style: {},
        getElementsByClassName: function (className) {
            return className === "card" ? cards : [];
        }
    };
}


test("Legacy-Raster wechselt bei Rotation zwischen Portrait und Landscape", function () {
    const context = vm.createContext({
        window: {
            innerWidth: 768,
            innerHeight: 1024
        },
        Math: Math,
        isFinite: isFinite
    });

    vm.runInContext(
        read("src/public/js/core/layout.js"),
        context
    );

    const widgets = [
        {id: "sensor-one", type: "sensor", size: "normal"},
        {id: "climate-one", type: "climate", size: "wide"}
    ];
    const layouts = {
        portrait: {
            columns: 6,
            items: {
                "sensor-one": {x: 0, y: 0, w: 2, h: 1},
                "climate-one": {x: 2, y: 0, w: 4, h: 1}
            }
        },
        landscape: {
            columns: 12,
            items: {
                "sensor-one": {x: 2, y: 1, w: 2, h: 1},
                "climate-one": {x: 4, y: 0, w: 6, h: 2}
            }
        }
    };
    const cards = [createCard("sensor-one"), createCard("climate-one")];
    const container = createContainer(cards);

    context.LegacyLayout.configure(layouts, widgets);
    context.LegacyLayout.apply(container);

    assert.match(container.className, /layout-portrait/);
    assert.equal(cards[0].style.left, "0%");
    assert.equal(cards[1].style.width, "calc(66.66666666666666% - 20px)");
    assert.equal(container.style.height, "128px");
    assert.equal(cards[0].style.height, "108px");

    context.window.innerWidth = 1024;
    context.window.innerHeight = 768;
    context.LegacyLayout.apply(container);

    assert.match(container.className, /layout-landscape/);
    assert.equal(cards[0].style.left, "16.666666666666664%");
    assert.equal(cards[0].style.top, "128px");
    assert.equal(cards[1].style.height, "236px");
    assert.equal(container.style.height, "256px");
});


test("Legacy-Raster nutzt Größen-Presets als sicheren Profil-Fallback", function () {
    const context = vm.createContext({
        window: {
            innerWidth: 1024,
            innerHeight: 768
        },
        Math: Math,
        isFinite: isFinite
    });

    vm.runInContext(
        read("src/public/js/core/layout.js"),
        context
    );

    const widgets = [
        {id: "wide", type: "sensor", size: "wide"},
        {id: "tall", type: "sensor", size: "tall"},
        {id: "climate", type: "climate", size: "normal"}
    ];
    const cards = widgets.map(function (entry) {
        return createCard(entry.id);
    });
    const container = createContainer(cards);

    context.LegacyLayout.configure(
        {
            portrait: null,
            landscape: {
                columns: 12,
                items: {
                    wide: {
                        x: 0,
                        y: 0,
                        w: "javascript:alert(1)",
                        h: 1
                    }
                }
            }
        },
        widgets
    );
    context.LegacyLayout.apply(container);

    assert.equal(cards[0].style.width, "calc(50% - 20px)");
    assert.equal(cards[1].style.height, "236px");
    assert.equal(cards[2].style.width, "calc(25% - 20px)");
    assert.equal(
        JSON.stringify(cards).indexOf("javascript"),
        -1
    );
});


test("Presentation Modes folgen Typ und Geometrie und werden je Profil gecacht", function () {
    const context = vm.createContext({
        window: {innerWidth: 768, innerHeight: 1024},
        Math: Math,
        isFinite: isFinite
    });
    const widgets = [
        {id: "sensor", type: "sensor", size: "normal"},
        {id: "binary", type: "binary", size: "normal"},
        {id: "light", type: "light", size: "normal"},
        {id: "climate", type: "climate", size: "normal"}
    ];
    const layouts = {
        portrait: {
            columns: 6,
            items: {
                sensor: {x: 0, y: 0, w: 2, h: 1},
                binary: {x: 2, y: 0, w: 2, h: 1},
                light: {x: 4, y: 0, w: 2, h: 1},
                climate: {x: 0, y: 1, w: 2, h: 1}
            }
        },
        landscape: {
            columns: 12,
            items: {
                sensor: {x: 0, y: 0, w: 3, h: 1},
                binary: {x: 3, y: 0, w: 3, h: 1},
                light: {x: 6, y: 0, w: 3, h: 1},
                climate: {x: 0, y: 1, w: 6, h: 2}
            }
        }
    };
    const cards = widgets.map(function (entry) {
        return createCard(entry.id);
    });
    const container = createContainer(cards);

    vm.runInContext(read("src/public/js/core/layout.js"), context);
    context.LegacyLayout.configure(layouts, widgets);
    context.LegacyLayout.apply(container);

    assert.match(cards[0].className, /card-presentation-compact/);
    assert.match(cards[1].className, /card-presentation-compact/);
    assert.match(cards[2].className, /card-presentation-compact/);
    assert.match(cards[3].className, /card-presentation-compact/);
    assert.equal(context.LegacyLayout.getPresentationComputationCount(), 4);

    context.LegacyLayout.apply(container);
    assert.equal(context.LegacyLayout.getPresentationComputationCount(), 4);

    context.window.innerWidth = 1024;
    context.window.innerHeight = 768;
    context.LegacyLayout.apply(container);

    assert.match(cards[0].className, /card-presentation-compact/);
    assert.match(cards[1].className, /card-presentation-compact/);
    assert.match(cards[2].className, /card-presentation-compact/);
    assert.match(cards[3].className, /card-presentation-large/);
    assert.equal(context.LegacyLayout.getPresentationComputationCount(), 8);
    assert.equal(context.LegacyLayout.getGeometryComputationCount(), 2);
});


test("Climate bleibt bis vier Spalten kompakt und wird ab fünf wide", function () {
    const context = vm.createContext({
        window: {innerWidth: 1024, innerHeight: 768},
        Math: Math,
        isFinite: isFinite
    });

    vm.runInContext(read("src/public/js/core/layout.js"), context);

    assert.equal(
        context.LegacyLayout.getPresentationMode({type: "climate"}, 4, 1),
        "compact"
    );
    assert.equal(
        context.LegacyLayout.getPresentationMode({type: "climate"}, 5, 1),
        "wide"
    );
});


test("kompakte Widget-CSS erhält Kerninformationen und Touchziele", function () {
    const css = read("src/public/css/style.css");
    const sensor = read("src/public/js/widgets/sensor.js");
    const binary = read("src/public/js/widgets/binary.js");
    const light = read("src/public/js/widgets/light.js");
    const climate = read("src/public/js/widgets/climate.js");

    assert.match(css, /card-presentation-compact/);
    assert.match(css, /card-presentation-standard|card-presentation-large/);
    assert.match(css, /\.climate-control\s*\{[\s\S]*?width:\s*44px;[\s\S]*?height:\s*44px;/);
    assert.match(css, /text-overflow:\s*ellipsis/);
    assert.match(css, /\.card-identity/);
    assert.doesNotMatch(
        css,
        /card-identity[^}]*display:\s*none/
    );
    assert.match(sensor, /card-sensor/);
    assert.match(sensor, /card-identity/);
    assert.match(sensor, /value/);
    assert.match(binary, /card-binary/);
    assert.match(binary, /card-identity/);
    assert.match(binary, /status/);
    assert.match(light, /light-control/);
    assert.match(light, /card-identity/);
    assert.match(climate, /climate-current-value/);
    assert.match(climate, /card-identity/);
    assert.match(climate, /climate-target-value/);
    assert.match(climate, /data-direction="-1"/);
    assert.match(climate, /data-direction="1"/);
});


test("Legacy-Renderer referenzieren nur validierte Widget-IDs", function () {
    const widgetSource = read("src/public/js/core/widget.js");
    const layoutSource = read("src/public/js/core/layout.js");
    const css = read("src/public/css/style.css");

    assert.match(widgetSource, /data-widget-id/);
    assert.match(widgetSource, /\^\[a-z0-9\]/);
    assert.match(layoutSource, /Number|isInteger|safeProfile/);
    assert.doesNotMatch(layoutSource, /innerHTML|eval\(|Function\(/);
    assert.match(css, /\.grid\.grid-layout-active/);
    assert.match(css, /position:\s*absolute/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|grid-column|grid-row/);
});
