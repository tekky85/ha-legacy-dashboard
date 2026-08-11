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
        hidden: false,
        children: [],
        attributes: {},
        onclick: null,
        appendChild: function (child) {
            this.children.push(child);
            return child;
        },
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
        "updated", "wallClock", "wallDate", "summaryOverview",
        "summaryGroups", "summaryActiveCount", "errorsOverview",
        "errorOverall", "errorOverallSymbol", "errorOverallLabel",
        "errorCriticalCount", "errorErrorCount", "errorWarningCount",
        "errorInfoCount", "errorUnavailableCount", "errorUnknownCount",
        "errorGroups"
    ].forEach(function (id) {
        elements[id] = createElement();
    });

    const context = vm.createContext({
        Date: Date,
        isNaN: isNaN,
        document: {
            body: createElement(),
            title: "",
            createElement: function () {
                return createElement();
            },
            createElementNS: function () {
                return createElement();
            },
            createTextNode: function (text) {
                return {textContent: String(text)};
            },
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
        activeCount: 0,
        groups: [],
        message: "Keine aktiven Zustände.",
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(
        harness.elements.systemMessage.innerHTML,
        "Keine aktiven Zustände."
    );
    assert.match(harness.elements.connectionBadge.className, /is-online/);

    harness.timers.shift()();
    harness.requests[1].success({
        activeCount: 1,
        groups: [],
        message: "1 aktiver Zustand.",
        meta: meta(false, true, "2026-08-11T18:00:00.000Z")
    });

    assert.match(harness.elements.systemMessage.className, /is-stale/);
    assert.match(harness.elements.networkBanner.innerHTML, /Letzte Systemdaten/);

    harness.timers.shift()();
    harness.requests[2].success({
        activeCount: 0,
        groups: [],
        message: "Keine aktiven Zustände.",
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
        overallStatus: "unknown",
        summary: {},
        groups: [],
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

    harness.timers.shift()();
    harness.requests[2].success({
        overallStatus: "ok",
        message: "Keine aktiven Störungen erkannt.",
        summary: {},
        groups: [],
        meta: meta(true, false, "2026-08-11T18:05:00.000Z")
    });

    assert.match(harness.elements.systemMessage.className, /is-recovered/);
    assert.match(harness.elements.systemMessage.innerHTML, /wiederhergestellt/);

    const staleHarness = createHarness(
        "/system/errors",
        "errors.js"
    );

    staleHarness.requests[0].success({
        overallStatus: "stale",
        summary: {warning: 1, unavailable: 1},
        groups: [
            {
                severity: "warning",
                title: "Warnungen",
                issues: [
                    {
                        severity: "warning",
                        title: "Letzte bekannte Störung",
                        entityId: "sensor.saved",
                        state: "unavailable",
                        durationSeconds: 60
                    }
                ]
            }
        ],
        meta: meta(false, true, "2026-08-11T18:00:00.000Z")
    });

    assert.match(staleHarness.elements.systemMessage.className, /is-stale/);
    assert.match(staleHarness.elements.errorOverall.className, /is-stale/);
    assert.equal(staleHarness.elements.errorGroups.children.length, 1);

});


test("Error-Shell zeigt Status, Severity-Gruppen, States und Recovery", function () {
    const harness = createHarness(
        "/system/errors",
        "errors.js"
    );

    harness.requests[0].success({
        overallStatus: "critical",
        message: "2 aktive Störungen erkannt.",
        summary: {
            critical: 1,
            error: 0,
            warning: 0,
            info: 1,
            unavailable: 1,
            unknown: 1
        },
        groups: [
            {
                severity: "critical",
                title: "Kritisch",
                issues: [
                    {
                        severity: "critical",
                        title: "Ein sehr langer sicherheitsrelevanter Rauchmeldername nicht erreichbar",
                        entityId: "binary_sensor.rauchmelder_flur",
                        state: "unavailable",
                        durationSeconds: 720,
                        securityRelevant: true,
                        description: "Die Entity ist derzeit nicht verfügbar."
                    }
                ]
            },
            {
                severity: "info",
                title: "Unbekannt",
                issues: [
                    {
                        severity: "info",
                        title: "Fenster: Zustand unbekannt",
                        entityId: "binary_sensor.fenster",
                        state: "unknown",
                        durationSeconds: null,
                        securityRelevant: false
                    }
                ]
            }
        ],
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(harness.elements.errorsOverview.hidden, false);
    assert.match(harness.elements.errorOverall.className, /is-critical/);
    assert.equal(harness.elements.errorOverallLabel.innerHTML, "Kritisch");
    assert.equal(harness.elements.errorCriticalCount.innerHTML, "1");
    assert.equal(harness.elements.errorUnavailableCount.innerHTML, "1");
    assert.equal(harness.elements.errorUnknownCount.innerHTML, "1");
    assert.equal(harness.elements.errorGroups.children.length, 2);

    harness.timers.shift()();
    harness.requests[1].success({
        overallStatus: "ok",
        message: "Keine aktiven Störungen erkannt.",
        summary: {},
        groups: [],
        meta: meta(true, false, "2026-08-11T18:00:05.000Z")
    });

    assert.match(harness.elements.errorOverall.className, /is-ok/);
    assert.match(harness.elements.systemMessage.innerHTML, /Keine aktiven Störungen/);

    const largeHarness = createHarness(
        "/system/errors",
        "errors.js"
    );
    const manyIssues = [];

    for (let index = 0; index < 205; index++) {
        manyIssues.push({
            severity: "warning",
            title: "Störung " + index,
            entityId: "sensor.issue_" + index,
            state: "unavailable",
            durationSeconds: index
        });
    }

    largeHarness.requests[0].success({
        overallStatus: "warning",
        message: "205 aktive Störungen erkannt.",
        summary: {
            total: 205,
            warning: 205,
            unavailable: 205
        },
        groups: [
            {
                severity: "warning",
                title: "Warnungen",
                issues: manyIssues
            }
        ],
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(
        largeHarness.elements.errorGroups.children[0].children[1].children.length,
        200
    );
    assert.equal(
        largeHarness.elements.errorGroups.children[1].className,
        "error-more"
    );
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
    assert.match(html, /\/js\/core\/compat\.js\?v=25/);
    assert.match(html, /id="errorOverallLabel"/);
    assert.match(html, /id="errorUnavailableCount"/);
    assert.match(html, /id="errorUnknownCount"/);
    assert.match(source, /Legacy\.http\.get/);
    assert.match(source, /MAX_RENDERED_ISSUES\s*=\s*200/);
    assert.doesNotMatch(source, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(source, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
    assert.doesNotMatch(source, /\?\.|\?\?/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.match(css, /word-break:\s*break-word/);

});
