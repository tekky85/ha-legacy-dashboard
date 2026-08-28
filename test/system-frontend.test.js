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

    const element = {
        className: "",
        hidden: false,
        children: [],
        attributes: {},
        onclick: null,
        disabled: false,
        appendChild: function (child) {
            this.children.push(child);
            return child;
        },
        setAttribute: function (name, value) {
            this.attributes[name] = value;
        },
        getAttribute: function (name) {
            return this.attributes[name];
        }
    };

    element.childNodes = element.children;

    Object.defineProperty(element, "innerHTML", {
        get: function () {
            return this._innerHTML || "";
        },
        set: function (value) {
            this._innerHTML = String(value);
            this.children = [];
            this.childNodes = this.children;
        }
    });

    return element;

}


function createHarness(pathname, entryFile, options) {

    options = options || {};
    const elements = {};
    const requests = [];
    const timers = [];
    const listeners = {};
    const storage = options.storage || {};

    [
        "connectionBadge", "connectionLabel", "entityCount",
        "errorsNavigation", "homeAssistantState", "lastSuccessfulUpdate",
        "networkBanner", "summaryNavigation", "systemCardTitle",
        "systemMessage", "systemTitle", "themeButton", "themeButtonLabel",
        "updated", "wallClock", "wallDate", "summaryOverview",
        "summaryGroups", "systemDashboardTotal", "summaryColumnControl",
        "errorColumnControl", "errorsOverview",
        "errorOverall", "errorOverallSymbol", "errorOverallLabel",
        "errorAllCount", "errorCriticalCount", "errorErrorCount",
        "errorWarningCount", "errorInfoCount", "errorUnknownCount", "errorUnavailableCount", "errorFilterAll",
        "errorFilterCritical", "errorFilterError", "errorFilterWarning",
        "errorFilterInfo", "errorStateAll", "errorStateUnavailable", "errorStateUnknown", "errorFilterEmpty", "errorGroups",
        "summaryFilterAll", "summaryFilterOpen", "summaryFilterPowered",
        "summaryFilterActive", "summaryFilterClimate", "summaryFilterMedia",
        "summaryFilterSecurity", "summaryAllCount", "summaryOpenCount",
        "summaryPoweredCount", "summaryActiveFilterCount",
        "summaryClimateCount", "summaryMediaCount", "summarySecurityCount",
        "summaryFilterEmpty", "summaryColumn1", "summaryColumn2",
        "summaryColumn3", "errorColumn1", "errorColumn2", "errorColumn3",
        "advancedDiagnostics", "advancedDiagnosticsToggle",
        "advancedDiagnosticsTitle", "advancedDiagnosticsSummary",
        "advancedDiagnosticsDetails", "advancedAutomationInventory",
        "advancedAutomationConfig", "advancedAutomationTrace",
        "advancedAutomationDynamic", "advancedRegistryStatus",
        "advancedRepairsStatus", "advancedDiagnosticsNote"
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
            toggle: function () {},
            readStoredValue: function (key) {
                if (options.storageFailure) {
                    return null;
                }
                return Object.prototype.hasOwnProperty.call(storage, key)
                    ? storage[key]
                    : null;
            },
            storeValue: function (key, value) {
                if (!options.storageFailure) {
                    storage[key] = value;
                }
            }
        },
        window: {
            innerWidth: options.width || 1024,
            location: {
                pathname: pathname
            },
            addEventListener: function (name, callback) {
                listeners[name] = callback;
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
        listeners: listeners,
        requests: requests,
        storage: storage,
        timers: timers,
        window: context.window
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
            total: 2,
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
    assert.equal(harness.elements.systemDashboardTotal.innerHTML, " · 2 Probleme");
    assert.equal(harness.elements.systemMessage.hidden, true);
    assert.equal(harness.elements.errorCriticalCount.innerHTML, "1");
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

    assert.equal(largeHarness.elements.errorGroups.children.length, 201);
    assert.equal(
        largeHarness.elements.errorGroups.children[200].className,
        "error-more"
    );
});


test("Error-Filter und Device-Details arbeiten ohne Reload", function () {

    const harness = createHarness(
        "/system/errors",
        "errors.js"
    );

    harness.requests[0].success({
        overallStatus: "critical",
        message: "3 aktive Störungen erkannt.",
        summary: {
            total: 3,
            critical: 1,
            warning: 1,
            info: 1,
            unknown: 1
        },
        filters: {
            all: 3,
            critical: 1,
            error: 0,
            warning: 1,
            unknown: 1
        },
        groups: [
            {
                id: "device-demo",
                type: "device",
                title: "Rauchmelder Flur",
                areaName: "Flur",
                integration: "ZHA",
                severity: "critical",
                securityRelevant: true,
                issueCount: 2,
                durationSeconds: 1080,
                counts: {
                    critical: 1,
                    error: 0,
                    warning: 0,
                    info: 1,
                    unknown: 1
                },
                issues: [
                    {
                        title: "Rauchalarm",
                        entityId: "binary_sensor.rauch_alarm",
                        state: "unavailable",
                        severity: "critical",
                        durationSeconds: 1080
                    },
                    {
                        title: "Batterie",
                        entityId: "sensor.rauch_batterie",
                        state: "unknown",
                        severity: "info",
                        durationSeconds: 300
                    }
                ]
            },
            {
                id: "repair-demo",
                type: "standalone",
                title: "Home Assistant Repair",
                description: "Hinweis",
                severity: "warning",
                state: "repair",
                issueCount: 1,
                durationSeconds: null,
                counts: {
                    critical: 0,
                    error: 0,
                    warning: 1,
                    info: 0,
                    unknown: 0
                },
                issues: []
            }
        ],
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(harness.elements.errorGroups.children.length, 2);
    assert.match(harness.elements.errorFilterAll.className, /is-active/);
    assert.equal(
        harness.elements.errorFilterAll.getAttribute("aria-pressed"),
        "true"
    );

    const deviceCard = harness.elements.errorGroups.children[0];
    const details = deviceCard.children[2];
    const toggle = deviceCard.children[3];

    assert.doesNotMatch(deviceCard.className, /is-expanded/);
    assert.equal(details.children.length, 0);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");

    toggle.onclick();
    assert.match(deviceCard.className, /is-expanded/);
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.equal(details.children[0].children.length, 2);

    toggle.onclick();
    assert.doesNotMatch(deviceCard.className, /is-expanded/);
    assert.equal(details.children.length, 0);

    harness.elements.errorFilterWarning.onclick();
    assert.equal(harness.requests.length, 1);
    assert.equal(harness.elements.errorGroups.children.length, 1);
    assert.match(harness.elements.errorFilterWarning.className, /is-active/);

    harness.elements.errorStateUnknown.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 0);

    harness.elements.errorFilterInfo.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 1);
    assert.equal(
        harness.elements.errorGroups.children[0].children[3]
            .getAttribute("aria-expanded"),
        "false"
    );

    harness.elements.errorFilterError.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 0);
    assert.equal(harness.elements.errorFilterEmpty.hidden, false);

    harness.elements.errorFilterAll.onclick();
    harness.elements.errorStateAll.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 2);
    assert.equal(harness.elements.errorFilterEmpty.hidden, true);
});


test("Error-Filter bilden exakte sichtbare Device Groups ohne Cross-Child-Matches", function () {

    const harness = createHarness(
        "/system/errors",
        "errors.js"
    );
    const payload = {
        overallStatus: "critical",
        summary: {
            total: 4,
            critical: 1,
            error: 1,
            warning: 1,
            info: 1,
            unavailable: 2,
            unknown: 2
        },
        filters: {
            severity: {
                all: 4,
                critical: 1,
                error: 1,
                warning: 1,
                info: 1
            },
            state: {
                all: 4,
                unavailable: 2,
                unknown: 2
            }
        },
        groups: [{
            id: "device-mixed",
            type: "device",
            title: "Gemischtes Gerät",
            severity: "critical",
            issueCount: 4,
            counts: {
                critical: 1,
                error: 1,
                warning: 1,
                info: 1,
                unavailable: 2,
                unknown: 2
            },
            issues: [
                {
                    title: "Critical unavailable",
                    entityId: "binary_sensor.critical",
                    severity: "critical",
                    state: "unavailable"
                },
                {
                    title: "Error unknown",
                    entityId: "sensor.error",
                    severity: "error",
                    state: "unknown"
                },
                {
                    title: "Warning unknown",
                    entityId: "sensor.warning",
                    severity: "warning",
                    state: "unknown"
                },
                {
                    title: "Info unavailable",
                    entityId: "sensor.info",
                    severity: "info",
                    state: "unavailable"
                }
            ]
        }],
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    };

    function textOf(element) {
        return (element.children || []).map(function (child) {
            if (typeof child.textContent === "string") {
                return child.textContent;
            }
            return textOf(child);
        }).join("");
    }

    function visibleCard() {
        return harness.elements.errorGroups.children[0];
    }

    function assertVisibleSeverity(filterButton, severity, label) {
        let card;

        filterButton.onclick();
        card = visibleCard();
        assert.equal(harness.elements.errorGroups.children.length, 1);
        assert.match(card.className, new RegExp("error-card-" + severity));
        assert.equal(textOf(card.children[0].children[1]), label);
        assert.equal(textOf(card.children[1].children[0]), "1 Entity betroffen");
    }

    harness.requests[0].success(payload);

    assert.match(visibleCard().className, /error-card-critical/);
    assert.equal(textOf(visibleCard().children[1].children[0]), "4 Entities betroffen");

    assertVisibleSeverity(harness.elements.errorFilterCritical, "critical", "Kritisch");
    assertVisibleSeverity(harness.elements.errorFilterError, "error", "Fehler");
    assertVisibleSeverity(harness.elements.errorFilterWarning, "warning", "Warnung");
    assertVisibleSeverity(harness.elements.errorFilterInfo, "info", "Info");

    harness.elements.errorFilterAll.onclick();
    harness.elements.errorStateUnknown.onclick();
    assert.match(visibleCard().className, /error-card-error/);
    assert.equal(textOf(visibleCard().children[1].children[0]), "2 Entities betroffen");

    harness.elements.errorStateUnavailable.onclick();
    assert.match(visibleCard().className, /error-card-critical/);
    assert.equal(textOf(visibleCard().children[1].children[0]), "2 Entities betroffen");

    [
        [harness.elements.errorFilterCritical, "critical", harness.elements.errorStateUnavailable, true],
        [harness.elements.errorFilterCritical, "critical", harness.elements.errorStateUnknown, false],
        [harness.elements.errorFilterError, "error", harness.elements.errorStateUnavailable, false],
        [harness.elements.errorFilterError, "error", harness.elements.errorStateUnknown, true],
        [harness.elements.errorFilterWarning, "warning", harness.elements.errorStateUnavailable, false],
        [harness.elements.errorFilterWarning, "warning", harness.elements.errorStateUnknown, true],
        [harness.elements.errorFilterInfo, "info", harness.elements.errorStateUnavailable, true],
        [harness.elements.errorFilterInfo, "info", harness.elements.errorStateUnknown, false]
    ].forEach(function (combination) {
        combination[0].onclick();
        combination[2].onclick();
        assert.equal(
            harness.elements.errorGroups.children.length,
            combination[3] ? 1 : 0
        );
        if (combination[3]) {
            assert.match(
                visibleCard().className,
                new RegExp("error-card-" + combination[1])
            );
        }
    });

    harness.elements.errorFilterInfo.onclick();
    harness.elements.errorStateAll.onclick();
    visibleCard().children[3].onclick();
    assert.equal(visibleCard().children[2].children[0].children.length, 1);
    assert.equal(
        textOf(visibleCard().children[2].children[0].children[0].children[0]),
        "Info unavailable"
    );

    harness.elements.errorStateUnknown.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 0);
    assert.equal(harness.elements.errorFilterEmpty.hidden, false);

    harness.elements.errorFilterWarning.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 1);
    assert.match(visibleCard().className, /error-card-warning/);

    harness.elements.errorStateUnavailable.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 0);

    harness.elements.errorFilterCritical.onclick();
    assert.equal(harness.elements.errorGroups.children.length, 1);
    assert.match(visibleCard().className, /error-card-critical/);

    assert.equal(harness.elements.errorOverall.className, "error-overall is-critical");
    assert.equal(payload.groups[0].severity, "critical");
    assert.equal(payload.groups[0].issueCount, 4);
    assert.equal(payload.groups[0].issues.length, 4);
    assert.equal(harness.requests.length, 1);
});


test("Summary-Filter nutzen Serverkategorien ohne Reload und mit eigenem Empty State", function () {

    const harness = createHarness(
        "/system/summary",
        "summary.js"
    );

    harness.requests[0].success({
        activeCount: 2,
        message: "2 aktive Zustände.",
        filters: [
            {id: "all", count: 2, categories: ["open", "powered"]},
            {id: "open", count: 1, categories: ["open"]},
            {id: "powered", count: 1, categories: ["powered"]},
            {id: "active", count: 0, categories: ["running", "cleaning", "movement"]},
            {id: "climate", count: 0, categories: ["climate"]},
            {id: "media", count: 0, categories: ["media"]},
            {id: "security", count: 0, categories: ["security"]}
        ],
        groups: [
            {
                category: "open",
                title: "Offen",
                items: [{
                    title: "Demo-Fenster",
                    category: "open",
                    durationSeconds: 60,
                    metadata: {}
                }]
            },
            {
                category: "powered",
                title: "Eingeschaltet",
                items: [{
                    title: "Demo-Licht",
                    category: "powered",
                    durationSeconds: 120,
                    metadata: {}
                }]
            }
        ],
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(harness.elements.summaryGroups.children.length, 2);
    assert.equal(
        harness.elements.systemDashboardTotal.innerHTML,
        " · 2 aktive Zustände"
    );
    assert.equal(harness.elements.systemMessage.hidden, true);
    assert.equal(harness.elements.summaryOpenCount.innerHTML, "1");

    harness.elements.summaryFilterOpen.onclick();
    assert.equal(harness.requests.length, 1);
    assert.equal(harness.elements.summaryGroups.children.length, 1);
    assert.match(harness.elements.summaryFilterOpen.className, /is-active/);

    harness.elements.summaryFilterClimate.onclick();
    assert.equal(harness.elements.summaryGroups.children.length, 0);
    assert.equal(harness.elements.summaryFilterEmpty.hidden, false);
    assert.equal(
        harness.elements.summaryFilterEmpty.innerHTML,
        ""
    );

    const staleHarness = createHarness(
        "/system/summary",
        "summary.js"
    );
    staleHarness.requests[0].success({
        activeCount: 1,
        message: "1 aktiver Zustand.",
        filters: [
            {id: "all", count: 1, categories: ["open"]},
            {id: "climate", count: 0, categories: ["climate"]}
        ],
        groups: [{
            category: "open",
            title: "Offen",
            items: [{title: "Demo-Fenster", category: "open", metadata: {}}]
        }],
        meta: meta(false, true, "2026-08-11T18:00:00.000Z")
    });
    staleHarness.elements.summaryFilterClimate.onclick();
    assert.match(staleHarness.elements.networkBanner.innerHTML, /Letzte Systemdaten/);
    assert.match(staleHarness.elements.systemMessage.className, /is-stale/);
    assert.equal(staleHarness.elements.summaryFilterEmpty.hidden, false);
});


test("Summary und Errors speichern Spalten getrennt und fallen responsiv zurück", function () {

    const storage = {
        systemSummaryColumns: "3",
        systemErrorsColumns: "2"
    };
    const summary = createHarness(
        "/system/summary",
        "summary.js",
        {storage: storage, width: 1024}
    );
    const errors = createHarness(
        "/system/errors",
        "errors.js",
        {storage: storage, width: 1024}
    );

    assert.match(summary.elements.summaryGroups.className, /system-columns-3/);
    assert.match(errors.elements.errorGroups.className, /system-columns-2/);

    summary.elements.summaryColumn1.onclick();
    errors.elements.errorColumn3.onclick();
    assert.equal(storage.systemSummaryColumns, "1");
    assert.equal(storage.systemErrorsColumns, "3");
    assert.equal(summary.requests.length, 1);
    assert.equal(errors.requests.length, 1);

    const reloaded = createHarness(
        "/system/summary",
        "summary.js",
        {storage: storage, width: 1024}
    );
    assert.match(reloaded.elements.summaryGroups.className, /system-columns-1/);

    const narrow = createHarness(
        "/system/errors",
        "errors.js",
        {storage: {systemErrorsColumns: "3"}, width: 600}
    );
    assert.match(narrow.elements.errorGroups.className, /system-columns-1/);
    assert.equal(narrow.elements.errorColumn3.disabled, true);

    narrow.window.innerWidth = 1024;
    narrow.listeners.resize();
    assert.match(narrow.elements.errorGroups.className, /system-columns-3/);

    assert.doesNotThrow(function () {
        const noStorage = createHarness(
            "/system/summary",
            "summary.js",
            {storageFailure: true, width: 1024}
        );
        noStorage.elements.summaryColumn2.onclick();
    });
});


test("Advanced Diagnostics lädt Trace Summaries ausschließlich on-demand", function () {

    const harness = createHarness(
        "/system/errors",
        "errors.js"
    );

    assert.equal(harness.requests.length, 1);
    assert.equal(
        harness.requests[0].url,
        "/api/system-dashboards/errors"
    );

    harness.requests[0].success({
        overallStatus: "warning",
        summary: {total: 1, warning: 1},
        filters: {
            severity: {all: 1, critical: 0, error: 0, warning: 1, info: 0},
            state: {all: 1, unavailable: 1, unknown: 0}
        },
        groups: [{
            id: "standalone-one",
            type: "standalone",
            title: "Demo",
            severity: "warning",
            issueCount: 1,
            affectedAutomationCount: 1,
            affectedAutomations: [{
                entityId: "automation.demo",
                name: "Demo Automation",
                state: "on",
                available: true,
                confidence: "direct",
                reasons: ["entity"]
            }],
            issues: [{
                id: "issue-one",
                severity: "warning",
                state: "unavailable"
            }]
        }],
        automationAnalysis: {
            inventoryCount: 1,
            dynamicCount: 0,
            configStatus: "available"
        },
        meta: meta(true, false, "2026-08-11T18:00:00.000Z")
    });

    assert.equal(harness.requests.length, 1);
    harness.elements.advancedDiagnosticsToggle.onclick();
    assert.equal(harness.requests.length, 2);
    assert.equal(
        harness.requests[1].url,
        "/api/system-dashboards/errors/automation-traces"
    );

    harness.requests[1].success({
        source: {status: "available"},
        automations: [{
            entityId: "automation.demo",
            errorCount: 0,
            summaries: []
        }]
    });
    assert.equal(
        harness.elements.advancedAutomationTrace.innerHTML,
        "Verfügbar"
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
    assert.match(html, /\/js\/core\/compat\.js\?v=44/);
    assert.match(html, /id="dashboardReturnNavigation"/);
    assert.match(html, /\/js\/core\/system-navigation\.js\?v=44/);
    assert.match(html, /id="errorOverallLabel"/);
    assert.match(html, /id="errorFilterAll"/);
    assert.match(html, /id="errorUnknownCount"/);
    assert.match(html, /Keine passenden aktiven Zustände\./);
    assert.match(source, /Legacy\.http\.get/);
    assert.match(source, /MAX_RENDERED_ISSUES\s*=\s*200/);
    assert.doesNotMatch(source, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(source, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
    assert.doesNotMatch(source, /\?\.|\?\?/);
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.match(css, /word-break:\s*break-word/);

});
