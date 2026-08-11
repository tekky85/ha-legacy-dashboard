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
            columns: 3,
            items: {
                "sensor-one": {x: 0, y: 0, w: 1, h: 1},
                "climate-one": {x: 1, y: 0, w: 2, h: 1}
            }
        },
        landscape: {
            columns: 6,
            items: {
                "sensor-one": {x: 1, y: 1, w: 1, h: 1},
                "climate-one": {x: 2, y: 0, w: 3, h: 2}
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
    assert.equal(container.style.height, "260px");

    context.window.innerWidth = 1024;
    context.window.innerHeight = 768;
    context.LegacyLayout.apply(container);

    assert.match(container.className, /layout-landscape/);
    assert.equal(cards[0].style.left, "16.666666666666664%");
    assert.equal(cards[0].style.top, "240px");
    assert.equal(cards[1].style.height, "460px");
    assert.equal(container.style.height, "480px");
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
                columns: 6,
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

    assert.equal(cards[0].style.width, "calc(33.33333333333333% - 20px)");
    assert.equal(cards[1].style.height, "460px");
    assert.equal(cards[2].style.width, "calc(33.33333333333333% - 20px)");
    assert.equal(
        JSON.stringify(cards).indexOf("javascript"),
        -1
    );
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
