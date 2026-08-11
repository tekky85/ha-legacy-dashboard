const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const PUBLIC_PATH = path.join(
    __dirname,
    "..",
    "src",
    "public"
);


function createElement() {

    return {
        className: "",
        innerHTML: "",
        attributes: {},
        onclick: null,
        setAttribute: function (name, value) {
            this.attributes[name] = value;
        }
    };

}


function createHarness(pathname, entryFile) {

    const elements = {};
    const requests = [];
    const timers = [];

    [
        "connectionBadge", "connectionLabel", "entityCount",
        "errorsNavigation", "homeAssistantState", "lastSuccessfulUpdate",
        "networkBanner", "summaryNavigation", "systemCardTitle",
        "systemMessage", "systemTitle", "themeButton", "themeButtonLabel",
        "updated", "wallClock", "wallDate"
    ].forEach(function (id) {
        elements[id] = createElement();
    });

    const context = vm.createContext({
        Date: Date,
        isNaN: isNaN,
        document: {
            body: createElement(),
            title: "",
            getElementById: function (id) {
                return elements[id] || null;
            }
        },
        Legacy: {
            dom: {
                byId: function (id) {
                    return elements[id] || null;
                }
            },
            html: {
                escape: function (value) {
                    return String(value)
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#39;");
                }
            },
            http: {
                get: function (url, success, error) {
                    requests.push({
                        url: url,
                        success: success,
                        error: error
                    });
                }
            }
        },
        Theme: {
            load: function () {},
            toggle: function () {}
        },
        window: {
            location: {
                pathname: pathname
            },
            clearTimeout: function () {},
            setInterval: function () {},
            setTimeout: function (callback) {
                timers.push(callback);
                return timers.length;
            }
        }
    });

    vm.runInContext(
        fs.readFileSync(
            path.join(PUBLIC_PATH, "js", "system", "common.js"),
            "utf8"
        ),
        context
    );

    vm.runInContext(
        fs.readFileSync(
            path.join(PUBLIC_PATH, "js", "system", entryFile),
            "utf8"
        ),
        context
    );

    return {
        elements: elements,
        requests: requests,
        timers: timers
    };

}


function meta(reachable, stale, lastSuccessfulUpdate) {

    return {
        home_assistant: {
            reachable: reachable
        },
        stale: stale,
        collected_at: "2026-08-11T18:00:00.000Z",
        last_successful_update: lastSuccessfulUpdate,
        entity_count: 42
    };

}


test("Summary-Shell zeigt Online, Stale und Recovery", function () {

    const harness = createHarness(
        "/system/summary",
        "summary.js"
    );

    assert.equal(harness.requests.length, 1);
    assert.equal(
        harness.requests[0].url,
        "/api/system-dashboards/summary"
    );

    harness.requests[0].success({
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(
        harness.elements.systemMessage.innerHTML,
        "Noch keine Summary-Regeln aktiviert."
    );
    assert.match(harness.elements.connectionBadge.className, /is-online/);

    harness.timers.shift()();
    harness.requests[1].success({
        meta: meta(false, true, "2026-08-11T18:00:00.000Z")
    });

    assert.match(harness.elements.systemMessage.className, /is-stale/);
    assert.match(harness.elements.networkBanner.innerHTML, /Letzte Systemdaten/);

    harness.timers.shift()();
    harness.requests[2].success({
        meta: meta(true, false, "2026-08-11T18:00:05.000Z")
    });

    assert.match(harness.elements.systemMessage.className, /is-recovered/);
    assert.match(harness.elements.systemMessage.innerHTML, /wiederhergestellt/);

});


test("Error-Shell zeigt Offlinezustand und Gatewayfehler", function () {

    const harness = createHarness(
        "/system/errors",
        "errors.js"
    );

    assert.equal(
        harness.requests[0].url,
        "/api/system-dashboards/errors"
    );

    harness.requests[0].success({
        meta: meta(false, true, null)
    });

    assert.match(harness.elements.systemMessage.innerHTML, /Noch keine Systemdaten/);
    assert.match(harness.elements.connectionBadge.className, /is-offline/);

    harness.timers.shift()();
    harness.requests[1].error({
        message: "Netzwerkfehler"
    });

    assert.match(harness.elements.networkBanner.innerHTML, /Netzwerkfehler/);
    assert.match(harness.elements.systemMessage.className, /is-offline/);

});


test("System-Shell bleibt ES5 und frei von CSS Grid", function () {

    const html = fs.readFileSync(
        path.join(PUBLIC_PATH, "system.html"),
        "utf8"
    );

    const source = ["common.js", "summary.js", "errors.js"]
        .map(function (fileName) {
            return fs.readFileSync(
                path.join(PUBLIC_PATH, "js", "system", fileName),
                "utf8"
            );
        })
        .join("\n");

    const css = fs.readFileSync(
        path.join(PUBLIC_PATH, "css", "system.css"),
        "utf8"
    );

    assert.match(html, /Daten werden geladen …/);
    assert.match(html, /class="theme-icon-moon"/);
    assert.match(html, /class="theme-icon-sun"/);
    assert.match(html, /\/js\/core\/compat\.js\?v=22/);
    assert.match(source, /Legacy\.http\.get/);
    assert.doesNotMatch(source, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(source, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
    assert.doesNotMatch(source, /\?\.|\?\?/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);

});
