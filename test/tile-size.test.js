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


test("Legacy-Widget normalisiert ausschließlich bekannte Größenklassen", function () {
    const context = vm.createContext({});

    vm.runInContext(
        read("src/public/js/core/widget.js"),
        context
    );

    [
        "compact",
        "normal",
        "wide",
        "tall",
        "large"
    ].forEach(function (size) {
        const widget = new context.Widget({
            size: size
        });

        assert.equal(
            widget.getSizeClass(),
            "card-size-" + size
        );
    });

    [
        undefined,
        "",
        "huge",
        "300px",
        "normal onclick=alert(1)"
    ].forEach(function (size) {
        const widget = new context.Widget({
            size: size
        });

        assert.equal(
            widget.getSizeClass(),
            "card-size-normal"
        );
    });
});


test("alle Legacy-Renderer wenden das sichere Größen-Preset an", function () {
    [
        "sensor.js",
        "binary.js",
        "light.js",
        "climate.js"
    ].forEach(function (fileName) {
        const source = read(
            "src/public/js/widgets/" + fileName
        );

        assert.match(source, /this\.getSizeClass\(\)/);
        assert.doesNotMatch(
            source,
            /class=[^\n]*config\.size|style=[^\n]*size/
        );
    });
});


test("Flexbox-CSS bildet Presets ohne freie Maße oder CSS Grid ab", function () {
    const css = read("src/public/css/style.css");

    [
        "compact",
        "normal",
        "wide",
        "tall",
        "large"
    ].forEach(function (size) {
        assert.match(
            css,
            new RegExp("\\.card\\.card-size-" + size)
        );
    });

    assert.match(css, /@media screen and \(min-width: 600px\)/);
    assert.match(css, /@media screen and \(min-width: 900px\)/);
    assert.match(css, /@media screen and \(max-width: 599px\)/);
    assert.match(css, /display: -webkit-flex;/);
    assert.match(css, /-webkit-align-items: flex-start;/);
    assert.doesNotMatch(css, /display:\s*grid/);
    assert.doesNotMatch(css, /grid-template|grid-column|grid-row/);
});


test("Admin-Oberfläche bietet nur die fünf Größen-Presets an", function () {
    const html = read("src/admin/index.html");
    const app = read("src/admin/js/app.js");

    assert.match(html, /id="widgetSizeInput"/);
    [
        "compact",
        "normal",
        "wide",
        "tall",
        "large"
    ].forEach(function (size) {
        assert.match(
            html,
            new RegExp("<option value=\"" + size + "\">")
        );
    });
    assert.match(app, /Größe: /);
    assert.match(app, /size: "normal"/);
    assert.match(app, /widgetSizeInput\.value/);
});
