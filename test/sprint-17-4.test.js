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


class FakeElement {
    constructor(tagName, ownerDocument) {
        this.tagName = String(tagName || "div").toUpperCase();
        this.ownerDocument = ownerDocument;
        this.className = "";
        this.children = [];
        this.parentNode = null;
        this.attributes = {};
        this.style = {};
        this.scrollTop = 0;
        this.onclick = null;
        this.id = "";
    }

    get childNodes() {
        return this.children;
    }

    get firstChild() {
        return this.children.length ? this.children[0] : null;
    }

    appendChild(child) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }

        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);

        if (index !== -1) {
            this.children.splice(index, 1);
            child.parentNode = null;
        }

        return child;
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);

        if (name === "id") {
            this.id = String(value);
        }
    }

    getAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this.attributes, name)
            ? this.attributes[name]
            : null;
    }

    removeAttribute(name) {
        delete this.attributes[name];

        if (name === "style") {
            this.style = {};
        }
    }

    getElementsByClassName(className) {
        const result = [];

        function visit(element) {
            element.children.forEach(function (child) {
                const classes = " " + (child.className || "") + " ";

                if (classes.indexOf(" " + className + " ") !== -1) {
                    result.push(child);
                }

                visit(child);
            });
        }

        visit(this);
        return result;
    }

    cloneNode(deep) {
        const clone = new FakeElement(this.tagName, this.ownerDocument);

        clone.className = this.className;
        clone.id = this.id;
        clone.attributes = Object.assign({}, this.attributes);
        clone.style = Object.assign({}, this.style);
        clone.scrollTop = this.scrollTop;

        if (deep) {
            this.children.forEach(function (child) {
                clone.appendChild(child.cloneNode(true));
            });
        }

        return clone;
    }

    focus() {
        this.ownerDocument.activeElement = this;
    }

    set innerHTML(value) {
        if (value === "") {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
        }
    }

    get innerHTML() {
        return "";
    }
}


function add(parent, className, attributes) {
    const element = new FakeElement("div", parent.ownerDocument);

    element.className = className || "";

    Object.keys(attributes || {}).forEach(function (name) {
        element.setAttribute(name, attributes[name]);
    });

    parent.appendChild(element);
    return element;
}


function standardCard(document, type, id) {
    const card = new FakeElement("section", document);
    const header = add(card, "card-header");

    card.className =
        "card card-" + type +
        " card-size-compact card-presentation-compact";
    card.setAttribute("data-widget-id", id);
    add(header, "icon");

    if (type === "sensor") {
        add(card, "value");
    } else if (type === "binary") {
        add(card, "status status-danger");
    } else if (type === "light") {
        add(header, "light-state light-state-on");
        add(card, "dashboard-power-control light-control", {
            disabled: "disabled"
        });
    }

    add(card, "title card-identity");
    add(card, "subtitle");
    return card;
}


function climateCard(document, id) {
    const card = new FakeElement("section", document);
    const header = add(card, "card-header");
    const heading = add(header, "climate-heading");
    const copy = add(heading, "climate-heading-copy");
    const values = add(card, "climate-values");
    const targetRow = add(values, "climate-target-row");

    card.className =
        "card card-climate card-size-compact card-presentation-compact";
    card.setAttribute("data-widget-id", id);
    add(heading, "icon heating");
    add(copy, "title card-identity");
    add(copy, "subtitle");
    add(header, "climate-state climate-state-heating");
    add(values, "climate-current");
    add(targetRow, "climate-control", {disabled: "disabled"});
    add(targetRow, "climate-target");
    add(targetRow, "climate-control", {disabled: "disabled"});
    add(targetRow, "dashboard-power-control climate-power-control", {
        disabled: "disabled"
    });
    return card;
}


function createHarness() {
    const elements = {};
    const listeners = {};
    const scrollCalls = [];
    const document = {
        documentElement: {clientWidth: 0, clientHeight: 0},
        activeElement: null,
        createElement: function (tagName) {
            return new FakeElement(tagName, document);
        },
        getElementById: function (id) {
            return elements[id] || null;
        }
    };
    const body = new FakeElement("body", document);
    const dashboard = new FakeElement("main", document);
    const overlay = new FakeElement("div", document);
    const shell = new FakeElement("div", document);
    const closeButton = new FakeElement("button", document);
    const content = new FakeElement("div", document);
    const opener = new FakeElement("section", document);
    const windowObject = {
        innerWidth: 768,
        innerHeight: 1024,
        pageXOffset: 0,
        pageYOffset: 145,
        event: null,
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

    document.body = body;
    document.activeElement = opener;
    elements.dashboard = dashboard;
    elements.focusOverlay = overlay;
    elements.focusShell = shell;
    elements.focusClose = closeButton;
    elements.focusContent = content;
    overlay.className = "focus-overlay";
    shell.className = "focus-shell";
    content.className = "focus-content";
    overlay.appendChild(shell);
    shell.appendChild(closeButton);
    shell.appendChild(content);

    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        RegExp: RegExp,
        document: document,
        window: windowObject
    });

    vm.runInContext(read("src/public/js/focus/focus.js"), context);
    context.LegacyFocus.initialize();

    return {
        api: context.LegacyFocus,
        body: body,
        closeButton: closeButton,
        content: content,
        dashboard: dashboard,
        listeners: listeners,
        overlay: overlay,
        scrollCalls: scrollCalls,
        shell: shell,
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

    assert.deepEqual(
        JSON.parse(JSON.stringify(portrait)),
        {
            width: 768,
            height: 1024,
            margin: 16,
            maxWidth: 736,
            maxHeight: 992,
            landscape: false,
            shortViewport: false
        }
    );
    assert.equal(landscape.maxWidth, 760);
    assert.equal(landscape.maxHeight, 736);
    assert.equal(landscape.landscape, true);
    assert.equal(narrow.maxWidth, 304);
    assert.equal(narrow.maxHeight, 444);
    assert.equal(narrow.shortViewport, true);
});


test("Sensor, Binary und Light erhalten priorisierte Focus-Regionen", function () {
    ["sensor", "binary", "light"].forEach(function (type) {
        const harness = createHarness();
        const card = standardCard(harness.body.ownerDocument, type, type + "-1");
        const originalChildren = card.children.slice();

        harness.dashboard.appendChild(card);
        harness.api.open(card);

        const clone = harness.content.firstChild;
        const regionNames = clone.children.map(function (child) {
            return child.className;
        });

        assert.equal(card.children.length, originalChildren.length, type);
        assert.equal(clone.getElementsByClassName("card-identity").length, 1, type);
        assert.equal(regionNames[0], "focus-header", type);
        assert.equal(regionNames[1], "focus-primary", type);

        if (type === "light") {
            assert.equal(regionNames[2], "focus-controls");
            assert.equal(
                clone.getElementsByClassName("light-control")[0]
                    .getAttribute("disabled"),
                "disabled"
            );
        }
    });
});


test("Climate priorisiert Ist, Soll, Minus, Plus und Power", function () {
    const harness = createHarness();
    const card = climateCard(harness.body.ownerDocument, "climate-1");

    harness.dashboard.appendChild(card);
    harness.api.open(card);

    const clone = harness.content.firstChild;
    const regions = clone.children.map(function (child) {
        return child.className;
    });
    const controls = clone.getElementsByClassName("focus-controls")[0];

    assert.deepEqual(regions, [
        "focus-header",
        "focus-primary",
        "focus-controls"
    ]);
    assert.equal(clone.getElementsByClassName("climate-current").length, 1);
    assert.equal(clone.getElementsByClassName("climate-target").length, 1);
    assert.equal(controls.getElementsByClassName("climate-control").length, 2);
    assert.equal(
        controls.getElementsByClassName("climate-power-control").length,
        1
    );
    assert.equal(
        controls.getElementsByClassName("climate-control")[0]
            .getAttribute("disabled"),
        "disabled"
    );
});


test("Focus sperrt und restauriert den Dashboard-Scroll", function () {
    const harness = createHarness();
    const card = standardCard(harness.body.ownerDocument, "sensor", "sensor-1");

    harness.body.style.position = "relative";
    harness.dashboard.appendChild(card);
    harness.api.open(card);

    assert.match(harness.body.className, /focus-page-locked/);
    assert.equal(harness.body.style.position, "fixed");
    assert.equal(harness.body.style.top, "-145px");
    assert.equal(harness.overlay.style.height, "1024px");
    assert.equal(harness.shell.style.maxHeight, "992px");

    harness.api.close();

    assert.doesNotMatch(harness.body.className, /focus-page-locked/);
    assert.equal(harness.body.style.position, "relative");
    assert.deepEqual(harness.scrollCalls, [[0, 145]]);
});


test("Rotation vermisst den offenen Focus neu, ohne ihn zu schließen", function () {
    const harness = createHarness();
    const card = climateCard(harness.body.ownerDocument, "climate-1");

    harness.dashboard.appendChild(card);
    harness.api.open(card);
    harness.window.innerWidth = 1024;
    harness.window.innerHeight = 768;
    harness.listeners.orientationchange();

    assert.equal(harness.api.isOpen(), true);
    assert.match(harness.overlay.className, /focus-landscape/);
    assert.doesNotMatch(harness.overlay.className, /focus-portrait/);
    assert.equal(harness.shell.style.maxWidth, "760px");
    assert.equal(harness.shell.style.maxHeight, "736px");
});


test("Focus-Refresh ersetzt nur den Clone und vermisst nicht bei jedem Poll", function () {
    const harness = createHarness();
    const card = standardCard(harness.body.ownerDocument, "sensor", "sensor-1");

    harness.dashboard.appendChild(card);
    harness.api.open(card);
    harness.content.scrollTop = 27;
    harness.shell.style.maxHeight = "777px";
    harness.api.refresh();

    assert.equal(harness.api.isOpen(), true);
    assert.equal(harness.content.children.length, 1);
    assert.equal(harness.content.scrollTop, 27);
    assert.equal(harness.shell.style.maxHeight, "777px");
});


test("Focus-Styles vermeiden doppelte Scrollcontainer und feste Kartenhoehen", function () {
    const css = read("src/public/css/style.css");
    const focus = read("src/public/js/focus/focus.js");
    const html = read("src/public/index.html");

    assert.match(html, /id="focusShell"/);
    assert.match(html, /class="focus-toolbar"/);
    assert.match(css, /\.focus-overlay\s*\{[\s\S]*?overflow:\s*hidden/);
    assert.match(css, /\.focus-shell\s*\{[\s\S]*?overflow:\s*hidden/);
    assert.match(css, /\.focus-content\s*\{[\s\S]*?overflow-y:\s*auto/);
    assert.match(css, /\.focus-content \.focus-card\s*\{[\s\S]*?min-height:\s*0/);
    assert.doesNotMatch(css, /\.card-climate\.focus-card\s*\{\s*min-height:/);
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

    assert.match(api, /"climate\.esszimmer_thermostate"/);
    assert.match(api, /"light\.esszimmer_lampen"/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
});
