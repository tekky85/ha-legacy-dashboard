const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");


const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "src", "public");
const NAVIGATION_SOURCE = fs.readFileSync(
    path.join(PUBLIC, "js", "core", "system-navigation.js"),
    "utf8"
);


function element() {
    return {
        attributes: {},
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


function harness(pathname, search, standalone, referrer) {
    const elements = {
        dashboardReturnNavigation: element(),
        errorsNavigation: element(),
        summaryNavigation: element(),
        systemHealthFreshness: element(),
        systemHealthLink: element(),
        systemHealthSymbol: element(),
        systemSummaryLink: element()
    };
    const location = {
        host: "dashboard.example:3000",
        href: "https://dashboard.example:3000" + pathname + (search || ""),
        pathname: pathname,
        protocol: "https:",
        search: search || ""
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
                get: function () {}
            }
        },
        navigator: {
            standalone: standalone
        },
        window: {
            history: {
                back: function () {}
            },
            location: location
        }
    });

    vm.runInContext(NAVIGATION_SOURCE, context);

    return {
        elements: elements,
        location: location,
        navigation: context.SystemNavigation
    };
}


function activate(link) {
    let prevented = false;
    const result = link.onclick({
        preventDefault: function () {
            prevented = true;
        }
    });

    assert.equal(prevented, true);
    assert.equal(result, false);
}


test("Dashboard-Navigation bleibt in normalem Safari und im HomeScreen-Fenster", function () {
    [false, true].forEach(function (standalone) {
        const root = harness("/", "", standalone);
        const custom = harness("/d/kitchen/", "", standalone);

        root.navigation.initializeDashboard();
        custom.navigation.initializeDashboard();

        assert.equal(
            root.elements.systemSummaryLink.getAttribute("target"),
            "_self"
        );
        activate(root.elements.systemSummaryLink);
        assert.equal(
            root.location.href,
            "/system/summary?returnTo=%2F"
        );

        activate(custom.elements.systemHealthLink);
        assert.equal(
            custom.location.href,
            "/system/errors?returnTo=%2Fd%2Fkitchen%2F"
        );
    });
});


test("Summary, Errors und Zurück verwenden dieselbe interne Navigation", function () {
    [false, true].forEach(function (standalone) {
        const summary = harness(
            "/system/summary",
            "?returnTo=%2Fd%2Fkitchen%2F",
            standalone
        );
        const errors = harness(
            "/system/errors",
            "?returnTo=%2F",
            standalone
        );

        summary.navigation.initializeSystemPage();
        errors.navigation.initializeSystemPage();

        activate(summary.elements.errorsNavigation);
        assert.equal(
            summary.location.href,
            "/system/errors?returnTo=%2Fd%2Fkitchen%2F"
        );

        activate(summary.elements.dashboardReturnNavigation);
        assert.equal(summary.location.href, "/d/kitchen/");

        activate(errors.elements.summaryNavigation);
        assert.equal(
            errors.location.href,
            "/system/summary?returnTo=%2F"
        );

        activate(errors.elements.dashboardReturnNavigation);
        assert.equal(errors.location.href, "/");
    });
});


test("Interne Navigation lehnt Origins, Protokolle und ungültige Return Targets ab", function () {
    const current = harness("/", "", true);
    const original = current.location.href;

    [
        "https://dashboard.example:3000/system/summary",
        "https://external.example/system/errors",
        "//external.example/system/errors",
        "javascript:alert(1)",
        "data:text/html,test",
        "blob:https://dashboard.example/id",
        "/admin",
        "/system/errors?returnTo=https%3A%2F%2Fexternal.example",
        "/system/summary?returnTo=%2F&next=https%3A%2F%2Fexternal.example",
        "/d/kitchen?next=%2Fsystem%2Ferrors"
    ].forEach(function (target) {
        assert.equal(current.navigation.validateInternalPath(target), null);
        assert.equal(current.navigation.navigateInternal(target), false);
        assert.equal(current.location.href, original);
    });

    assert.equal(current.navigation.navigateInternal("/"), true);
    assert.equal(current.location.href, "/");
    assert.equal(
        current.navigation.navigateInternal(
            "/system/errors?returnTo=%2Fd%2Fkitchen%2F"
        ),
        true
    );
});


test("Alle produktinternen Links sind frei von neuen Tabs und window.open", function () {
    const legacyHtml = ["index.html", "system.html"]
        .map(function (fileName) {
            return fs.readFileSync(path.join(PUBLIC, fileName), "utf8");
        })
        .join("\n");
    const adminHtml = fs.readFileSync(
        path.join(ROOT, "src", "admin", "index.html"),
        "utf8"
    );
    const adminApp = fs.readFileSync(
        path.join(ROOT, "src", "admin", "js", "app.js"),
        "utf8"
    );

    assert.doesNotMatch(legacyHtml + adminHtml + adminApp, /target=["']_blank/i);
    assert.doesNotMatch(NAVIGATION_SOURCE + adminApp, /window\.open\s*\(/);
    assert.match(NAVIGATION_SOURCE, /window\.location\.href\s*=\s*target/);
    assert.doesNotMatch(NAVIGATION_SOURCE, /\btouchstart\b|\btouchend\b/);
});


test("Sprint 25.2 bleibt ES5 und ändert keine Home-Assistant-Schreibfläche", function () {
    const apiRoutes = fs.readFileSync(
        path.join(ROOT, "src", "routes", "api.js"),
        "utf8"
    );

    assert.doesNotMatch(NAVIGATION_SOURCE, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(
        NAVIGATION_SOURCE,
        /\bfetch\b|\bPromise\b|\basync\b|\bawait\b|\?\.|\?\?/
    );
    assert.doesNotMatch(
        apiRoutes,
        /router\.(?:post|put|patch|delete)\s*\(\s*["']\/api\/system/i
    );
});
