const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const DashboardReturnTarget =
    require("../src/services/dashboard-return-target");
const Snapshot = require("../src/services/system/snapshot");
const SystemStatus = require("../src/services/system/status");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "src", "public");


function element() {
    return {
        attributes: {},
        className: "",
        hidden: false,
        href: "",
        innerHTML: "",
        onclick: null,
        setAttribute: function (name, value) {
            this.attributes[name] = String(value);
        },
        getAttribute: function (name) {
            return this.attributes[name];
        }
    };
}


function harness(pathname, search, referrer) {
    const requests = [];
    const elements = {
        dashboardReturnNavigation: element(),
        errorsNavigation: element(),
        summaryNavigation: element(),
        systemHealthFreshness: element(),
        systemHealthLink: element(),
        systemHealthSymbol: element(),
        systemSummaryLink: element()
    };
    let backCalls = 0;
    const window = {
        history: {
            back: function () {
                backCalls += 1;
            }
        },
        location: {
            host: "dashboard.example",
            href: "",
            pathname: pathname,
            protocol: "https:",
            search: search || ""
        }
    };
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        Number: Number,
        String: String,
        decodeURIComponent: decodeURIComponent,
        encodeURIComponent: encodeURIComponent,
        isFinite: isFinite,
        document: {
            referrer: referrer || ""
        },
        Legacy: {
            dom: {
                byId: function (id) {
                    return elements[id] || null;
                }
            },
            http: {
                get: function (url, success, error) {
                    requests.push({
                        error: error,
                        success: success,
                        url: url
                    });
                }
            }
        },
        window: window
    });

    vm.runInContext(
        fs.readFileSync(
            path.join(PUBLIC, "js", "core", "system-navigation.js"),
            "utf8"
        ),
        context
    );

    return {
        backCalls: function () { return backCalls; },
        elements: elements,
        navigation: context.SystemNavigation,
        requests: requests,
        window: window
    };
}


function health(errors, stale, reachable, lastSuccessful) {
    return {
        errors: errors,
        meta: {
            home_assistant: {reachable: reachable},
            last_successful_update: lastSuccessful || null,
            stale: stale
        }
    };
}


function rawState(entityId, state) {
    return {
        entity_id: entityId,
        state: state,
        attributes: {},
        last_changed: "2026-08-24T10:00:00.000Z",
        last_updated: "2026-08-24T10:00:00.000Z"
    };
}


test("Status fasst Issues klein zusammen und trennt Info von Alarm-Severities", function () {
    const snapshot = Snapshot.createSuccessful(
        [
            rawState("sensor.warning", "unavailable"),
            rawState("sensor.info", "unknown")
        ],
        "2026-08-24T10:05:00.000Z"
    );
    const result = SystemStatus.build(snapshot, {
        criticalDetectionMode: "device_class",
        ignoredEntities: [],
        securityEntities: []
    });

    assert.deepEqual(result, {
        total: 2,
        critical: 0,
        error: 0,
        warning: 1,
        info: 1,
        relevant: 1,
        highest_severity: "warning"
    });
    assert.equal(SystemStatus.highestSeverity({
        critical: 0, error: 1, warning: 2, info: 3
    }), "error");
    assert.equal(SystemStatus.highestSeverity({
        critical: 0, error: 0, warning: 0, info: 3
    }), "info");
});


test("Summary bleibt auf Default und Custom Dashboard immer erreichbar", function () {
    const root = harness("/", "", "");
    const custom = harness("/d/kitchen/", "", "");

    root.navigation.initializeDashboard();
    custom.navigation.initializeDashboard();

    assert.equal(
        root.elements.systemSummaryLink.href,
        "/system/summary?returnTo=%2F"
    );
    assert.equal(
        custom.elements.systemSummaryLink.href,
        "/system/summary?returnTo=%2Fd%2Fkitchen%2F"
    );
    assert.equal(
        custom.elements.systemHealthLink.href,
        "/system/errors?returnTo=%2Fd%2Fkitchen%2F"
    );
    assert.equal(root.elements.systemHealthLink.hidden, false);
    assert.equal(root.elements.systemHealthSymbol.innerHTML, "?");
});


test("Health Indicator blendet nur frisches Healthy und Info-only aus", function () {
    [
        {errors: {}, hidden: true},
        {errors: {info: 4}, hidden: true},
        {errors: {warning: 1}, hidden: false, className: "is-warning"},
        {errors: {error: 2}, hidden: false, className: "is-error"},
        {errors: {critical: 3}, hidden: false, className: "is-critical"}
    ].forEach(function (scenario) {
        const current = harness("/", "", "");

        current.navigation.initializeDashboard();
        current.navigation.renderHealth(
            health(scenario.errors, false, true),
            false
        );

        assert.equal(
            current.elements.systemHealthLink.hidden,
            scenario.hidden
        );

        if (scenario.className) {
            assert.match(
                current.elements.systemHealthLink.className,
                new RegExp(scenario.className)
            );
            assert.equal(
                current.elements.systemHealthSymbol.innerHTML,
                "!"
            );
        }
    });
});


test("Stale, unbekannt und Last-known Critical bleiben sichtbar", function () {
    const staleHealthy = harness("/", "", "");
    const staleCritical = harness("/", "", "");
    const unknown = harness("/", "", "");

    staleHealthy.navigation.renderHealth(
        health({}, true, false, "2026-08-24T10:00:00.000Z"),
        false
    );
    staleCritical.navigation.renderHealth(
        health(
            {critical: 2},
            true,
            false,
            "2026-08-24T10:00:00.000Z"
        ),
        false
    );
    unknown.navigation.renderHealth(
        health({}, true, false, null),
        false
    );

    assert.equal(staleHealthy.elements.systemHealthLink.hidden, false);
    assert.match(staleHealthy.elements.systemHealthLink.className, /is-stale/);
    assert.equal(staleHealthy.elements.systemHealthSymbol.innerHTML, "?");
    assert.match(staleCritical.elements.systemHealthLink.className, /is-critical/);
    assert.match(staleCritical.elements.systemHealthLink.className, /is-stale/);
    assert.equal(staleCritical.elements.systemHealthFreshness.hidden, false);
    assert.match(
        staleCritical.elements.systemHealthLink.getAttribute("aria-label"),
        /nicht aktuell/
    );
    assert.match(unknown.elements.systemHealthLink.className, /is-unknown/);
});


test("Health nutzt vorhandenen Dashboard-Refresh ohne eigenen Polling-Loop", function () {
    const current = harness("/d/kitchen", "", "");

    current.navigation.refreshHealth();
    current.navigation.refreshHealth();

    assert.equal(current.requests.length, 1);
    assert.equal(
        current.requests[0].url,
        "/api/system-dashboards/status"
    );

    current.requests[0].success(
        health({critical: 1}, false, true)
    );
    current.navigation.refreshHealth();
    assert.equal(current.requests.length, 2);
    current.requests[1].error();
    assert.match(current.elements.systemHealthLink.className, /is-critical/);
    assert.match(current.elements.systemHealthLink.className, /is-stale/);

    const source = fs.readFileSync(
        path.join(PUBLIC, "js", "core", "system-navigation.js"),
        "utf8"
    );
    assert.doesNotMatch(
        source,
        /setInterval|\/api\/system-dashboards\/(?:summary|errors)/
    );
});


test("System-Dashboards erhalten exaktes Return Target und sicheren Fallback", function () {
    const custom = harness(
        "/system/errors",
        "?returnTo=%2Fd%2Fkitchen%2F",
        ""
    );
    const direct = harness("/system/summary", "", "");
    const historyFallback = harness(
        "/system/errors",
        "",
        "https://dashboard.example/d/kitchen"
    );

    assert.equal(custom.navigation.initializeSystemPage(), "/d/kitchen/");
    assert.equal(custom.elements.dashboardReturnNavigation.href, "/d/kitchen/");
    assert.equal(
        custom.elements.summaryNavigation.href,
        "/system/summary?returnTo=%2Fd%2Fkitchen%2F"
    );
    assert.equal(
        custom.elements.errorsNavigation.href,
        "/system/errors?returnTo=%2Fd%2Fkitchen%2F"
    );

    assert.equal(direct.navigation.initializeSystemPage(), "/");
    assert.equal(direct.elements.dashboardReturnNavigation.href, "/");

    historyFallback.navigation.initializeSystemPage();
    assert.equal(typeof historyFallback.elements.dashboardReturnNavigation.onclick, "function");
    historyFallback.elements.dashboardReturnNavigation.onclick({
        preventDefault: function () {}
    });
    assert.equal(historyFallback.backCalls(), 1);
});


test("Return Target verhindert Open Redirects und unbekannte Dashboards", function () {
    const exists = function (dashboardId) {
        return dashboardId === "kitchen";
    };

    assert.equal(DashboardReturnTarget.resolve("/", exists), "/");
    assert.equal(
        DashboardReturnTarget.resolve("/d/kitchen/", exists),
        "/d/kitchen/"
    );

    [
        "https://external.example",
        "//external.example",
        "javascript:alert(1)",
        "data:text/html,test",
        "/d/not-configured",
        "/admin",
        "/system/errors",
        "/d/kitchen?next=https://external.example"
    ].forEach(function (target) {
        assert.equal(
            DashboardReturnTarget.resolve(target, exists),
            null
        );
    });

    const browser = harness(
        "/system/errors",
        "?returnTo=https%3A%2F%2Fexternal.example",
        ""
    );
    assert.equal(browser.navigation.initializeSystemPage(), "/");
    assert.equal(browser.elements.dashboardReturnNavigation.href, "/");
});


test("Sprint 21.5 bleibt ES5, Grid-frei und ohne neue Write-Fläche", function () {
    const navigation = fs.readFileSync(
        path.join(PUBLIC, "js", "core", "system-navigation.js"),
        "utf8"
    );
    const app = fs.readFileSync(
        path.join(PUBLIC, "js", "app.js"),
        "utf8"
    );
    const css = fs.readFileSync(
        path.join(PUBLIC, "css", "style.css"),
        "utf8"
    );
    const routes = fs.readFileSync(
        path.join(ROOT, "src", "routes", "system-dashboards.js"),
        "utf8"
    );

    assert.doesNotMatch(navigation + app, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(
        navigation + app,
        /\bfetch\b|\bPromise\b|\basync\b|\bawait\b|\?\.|\?\?/
    );
    assert.doesNotMatch(css, /display:\s*grid|grid-template|\bgap\s*:/);
    assert.match(css, /min-height:\s*44px/);
    assert.match(navigation, /Legacy\.http\.get/);
    assert.doesNotMatch(routes, /router\.(?:post|put|patch|delete)\s*\(/i);
    assert.doesNotMatch(
        navigation,
        /HA_TOKEN|ADMIN_TOKEN|\/api\/websocket|new\s+WebSocket/i
    );
});
