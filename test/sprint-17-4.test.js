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


function createElement(className) {
    return {
        className: className || "",
        style: {},
        attributes: {},
        innerHTML: "",
        scrollTop: 0,
        onclick: null,
        focused: false,
        setAttribute: function (name, value) {
            this.attributes[name] = String(value);
        },
        removeAttribute: function (name) {
            delete this.attributes[name];

            if (name === "style") {
                this.style = {};
            }
        },
        focus: function () {
            this.focused = true;
        }
    };
}


function createHarness() {
    const elements = {
        focusOverlay: createElement("focus-overlay"),
        focusShell: createElement("focus-panel"),
        focusClose: createElement("focus-close"),
        focusContent: createElement("focus-content")
    };
    const body = createElement("");
    const opener = createElement("card");
    const listeners = {};
    const scrollCalls = [];
    let markup = '<section class="focus-widget">A</section>';
    const document = {
        body: body,
        documentElement: {clientWidth: 0, clientHeight: 0},
        activeElement: opener,
        getElementById: function (id) {
            return elements[id] || null;
        }
    };
    const windowObject = {
        innerWidth: 768,
        innerHeight: 1024,
        pageXOffset: 0,
        pageYOffset: 145,
        addEventListener: function (name, handler) {
            listeners[name] = handler;
        },
        clearTimeout: function () {},
        setTimeout: function (handler) {
            handler();
            return 1;
        },
        scrollTo: function (x, y) {
            scrollCalls.push([x, y]);
        }
    };
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        RegExp: RegExp,
        document: document,
        window: windowObject,
        LegacyFocusViewModel: {
            create: function (source) {
                return source;
            }
        },
        LegacyFocusRenderer: {
            render: function () {
                return markup;
            }
        }
    });

    vm.runInContext(read("src/public/js/focus/focus.js"), context);
    context.LegacyFocus.initialize(function (widgetId) {
        return widgetId === "sensor-1"
            ? {widgetId: widgetId}
            : null;
    });

    return {
        api: context.LegacyFocus,
        body: body,
        closeButton: elements.focusClose,
        content: elements.focusContent,
        listeners: listeners,
        overlay: elements.focusOverlay,
        panel: elements.focusShell,
        scrollCalls: scrollCalls,
        setMarkup: function (value) {
            markup = value;
        },
        window: windowObject
    };
}


test("Focus-Geometrie verwendet den realen Viewport", function () {
    const harness = createHarness();
    const portrait = harness.api.calculateGeometry({
        width: 768,
        height: 1024
    });
    const landscape = harness.api.calculateGeometry({
        width: 1024,
        height: 768
    });
    const narrow = harness.api.calculateGeometry({
        width: 320,
        height: 460
    });

    assert.deepEqual(JSON.parse(JSON.stringify(portrait)), {
        width: 768,
        height: 1024,
        margin: 16,
        panelWidth: 736,
        maxWidth: 736,
        maxHeight: 992,
        minimumPanelHeight: 260,
        landscape: false,
        shortViewport: false
    });
    assert.equal(landscape.panelWidth, 760);
    assert.equal(landscape.maxHeight, 736);
    assert.equal(landscape.landscape, true);
    assert.equal(narrow.panelWidth, 304);
    assert.equal(narrow.maxHeight, 444);
    assert.equal(narrow.shortViewport, true);
});


test("Focus sperrt und restauriert den Dashboard-Scroll", function () {
    const harness = createHarness();

    harness.body.style.position = "relative";
    harness.api.open("sensor-1");

    assert.match(harness.body.className, /focus-page-locked/);
    assert.equal(harness.body.style.position, "fixed");
    assert.equal(harness.body.style.top, "-145px");
    assert.equal(harness.overlay.style.height, "1024px");
    assert.equal(harness.panel.style.width, "736px");
    assert.equal(harness.panel.style.maxHeight, "992px");

    harness.api.close();

    assert.doesNotMatch(harness.body.className, /focus-page-locked/);
    assert.equal(harness.body.style.position, "relative");
    assert.deepEqual(harness.scrollCalls, [[0, 145]]);
});


test("Rotation vermisst den offenen Focus neu, ohne ihn zu schließen", function () {
    const harness = createHarness();

    harness.api.open("sensor-1");
    harness.window.innerWidth = 1024;
    harness.window.innerHeight = 768;
    harness.listeners.orientationchange();

    assert.equal(harness.api.isOpen(), true);
    assert.match(harness.overlay.className, /focus-layout-landscape/);
    assert.doesNotMatch(harness.overlay.className, /focus-layout-portrait/);
    assert.equal(harness.panel.style.width, "760px");
    assert.equal(harness.panel.style.maxHeight, "736px");
});


test("Focus-Refresh bewahrt Scroll und übernimmt keine Grid-Geometrie", function () {
    const harness = createHarness();

    harness.api.open("sensor-1");
    harness.content.scrollTop = 27;
    harness.setMarkup('<section class="focus-widget">B</section>');
    harness.api.refresh();

    assert.equal(harness.api.isOpen(), true);
    assert.equal(harness.content.scrollTop, 27);
    assert.equal(
        harness.content.innerHTML,
        '<section class="focus-widget">B</section>'
    );
    assert.equal(harness.panel.style.width, "736px");
});


test("Focus-Styles bewahren Scroll- und Shrink-Schutz aus Sprint 17.4", function () {
    const css = read("src/public/css/style.css");
    const focus = read("src/public/js/focus/focus.js");
    const html = read("src/public/index.html");

    assert.match(html, /id="focusShell"/);
    assert.match(html, /class="focus-toolbar"/);
    assert.match(css, /\.focus-overlay\s*\{[\s\S]*?overflow:\s*hidden/);
    assert.match(css, /\.focus-panel\s*\{[\s\S]*?overflow:\s*hidden/);
    assert.match(css, /\.focus-content\s*\{[\s\S]*?overflow-y:\s*auto/);
    assert.match(css, /\.focus-widget\s*\{[\s\S]*?flex-shrink:\s*0/);
    assert.match(focus, /window\.innerHeight/);
    assert.match(focus, /orientationchange/);
    assert.match(focus, /focus-page-locked/);
    assert.doesNotMatch(focus, /Legacy\.http|XMLHttpRequest|fetch/);
});


test("Sprint 17.4 bleibt ES5-kompatibel und erweitert keine Write-API", function () {
    const focus = read("src/public/js/focus/focus.js");
    const api = read("src/routes/api.js");
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

    forbidden.forEach(function (pattern) {
        assert.doesNotMatch(focus, pattern);
    });

    assert.match(api, /controlAuthorization\.climateCapabilities/);
    assert.match(api, /controlAuthorization\.lightCapabilities/);
    assert.doesNotMatch(api, /ALLOWED_(?:LIGHT|CLIMATE)_ENTITIES/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
});
