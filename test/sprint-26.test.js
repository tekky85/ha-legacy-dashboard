const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const DashboardConfig = require("../src/config/dashboard");
const Layout = require("../src/services/layout");

const ROOT = path.join(__dirname, "..");


function read(relativePath) {
    return fs.readFileSync(
        path.join(ROOT, relativePath),
        "utf8"
    );
}


function currentConfiguration() {
    return DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
}


function adminHarness() {
    const window = {HALegacyAdmin: {}};
    const context = vm.createContext({
        window: window,
        JSON: JSON,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Object: Object,
        Array: Array,
        Error: Error,
        RegExp: RegExp
    });

    [
        "src/admin/js/state.js",
        "src/admin/js/layout.js",
        "src/admin/js/sections.js",
        "src/admin/js/dashboards.js",
        "src/admin/js/widgets.js"
    ].forEach(function (relativePath) {
        vm.runInContext(read(relativePath), context, {
            filename: relativePath
        });
    });

    return window.HALegacyAdmin;
}


function wallHarness() {
    const layoutCalls = [];
    const grids = [];
    let rendered = "";

    const container = {
        className: "grid",
        getElementsByClassName: function () {
            return grids;
        }
    };

    Object.defineProperty(container, "innerHTML", {
        get: function () {
            return rendered;
        },
        set: function (html) {
            const pattern = /data-section-grid="([^"]*)"/g;
            let match;

            rendered = html;
            grids.length = 0;
            while ((match = pattern.exec(html))) {
                grids.push({
                    id: match[1],
                    getAttribute: function () {
                        return this.id;
                    }
                });
            }
        }
    });

    function TestWidget(config) {
        Object.keys(config).forEach(function (key) {
            this[key] = config[key];
        }, this);
        this.sectionId = config.sectionId || null;
    }

    TestWidget.prototype.render = function () {
        return '<article class="card" data-widget-id="' +
            this.id + '"></article>';
    };

    const context = vm.createContext({
        SensorWidget: TestWidget,
        BinaryWidget: TestWidget,
        LightWidget: TestWidget,
        ClimateWidget: TestWidget,
        Legacy: {
            html: {
                escape: function (value) {
                    return String(value)
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;");
                }
            }
        },
        LegacyLayout: {
            configure: function () {},
            apply: function (grid, widgets, cacheKey) {
                layoutCalls.push({
                    grid: grid,
                    ids: widgets
                        ? widgets.map(function (widget) {
                            return widget.id;
                        })
                        : null,
                    cacheKey: cacheKey || null
                });
            }
        },
        LegacyFocus: {refresh: function () {}},
        Boolean: Boolean,
        String: String,
        document: {
            getElementById: function () {
                return container;
            }
        }
    });

    vm.runInContext(
        read("src/public/js/core/dashboard.js"),
        context,
        {filename: "dashboard.js"}
    );

    return {
        Dashboard: vm.runInContext("Dashboard", context),
        container: container,
        layoutCalls: layoutCalls
    };
}


test("Schema 10 ergänzt Abschnitte additiv und migriert Schema 9 verlustfrei", function () {
    const previous = currentConfiguration();
    const oldLayouts = JSON.parse(JSON.stringify(
        previous.dashboards[0].layouts
    ));

    previous.schemaVersion = 9;
    previous.dashboards.forEach(function (dashboard) {
        delete dashboard.sections;
        dashboard.widgets.forEach(function (widget) {
            delete widget.sectionId;
        });
    });

    const result = DashboardConfig.migrateConfiguration(previous);

    assert.equal(result.migrated, true);
    assert.equal(
        result.configuration.schemaVersion,
        DashboardConfig.SCHEMA_VERSION
    );
    assert.deepEqual(result.configuration.dashboards[0].sections, []);
    assert.ok(result.configuration.dashboards[0].widgets.every(function (widget) {
        return widget.sectionId === null;
    }));
    assert.deepEqual(result.configuration.dashboards[0].layouts, oldLayouts);
    assert.equal(DashboardConfig.validateConfiguration(result.configuration), true);
});


test("Abschnitte, Area-Referenzen und Karten-Zuordnungen werden vollständig validiert", function () {
    const valid = currentConfiguration();
    const dashboard = valid.dashboards[0];

    dashboard.sections = [
        {id: "ground-floor", title: "Erdgeschoss", order: 10, showTitle: true, areaId: "ground_floor"},
        {id: "upper-floor", title: "Obergeschoss", order: 20, showTitle: false, areaId: null}
    ];
    dashboard.widgets[0].sectionId = "ground-floor";
    dashboard.widgets[1].sectionId = "upper-floor";
    assert.equal(DashboardConfig.validateConfiguration(valid), true);

    [
        function (candidate) {
            candidate.dashboards[0].sections[1].id = "ground-floor";
        },
        function (candidate) {
            candidate.dashboards[0].sections[0].id = "Ungültig";
        },
        function (candidate) {
            candidate.dashboards[0].sections[0].order = "10";
        },
        function (candidate) {
            candidate.dashboards[0].sections[0].showTitle = "yes";
        },
        function (candidate) {
            candidate.dashboards[0].sections[0].areaId = "../area";
        },
        function (candidate) {
            candidate.dashboards[0].widgets[0].sectionId = "missing";
        }
    ].forEach(function (mutate) {
        const invalid = DashboardConfig.cloneConfiguration(valid);
        mutate(invalid);
        assert.throws(function () {
            DashboardConfig.validateConfiguration(invalid);
        });
    });
});


test("Rasterkoordinaten sind je Abschnitt isoliert und bleiben innerhalb eines Abschnitts kollisionsfrei", function () {
    const configuration = currentConfiguration();
    const dashboard = configuration.dashboards[0];
    const first = dashboard.widgets[0];
    const second = dashboard.widgets[1];

    dashboard.sections = [
        {id: "one", title: "Eins", order: 10, showTitle: true, areaId: null},
        {id: "two", title: "Zwei", order: 20, showTitle: true, areaId: null}
    ];
    first.sectionId = "one";
    second.sectionId = "two";

    Layout.PROFILES.forEach(function (profileName) {
        dashboard.layouts[profileName].items[second.id] = Object.assign(
            {},
            dashboard.layouts[profileName].items[first.id]
        );
    });

    assert.equal(DashboardConfig.validateConfiguration(configuration), true);

    second.sectionId = "one";
    assert.throws(function () {
        DashboardConfig.validateConfiguration(configuration);
    }, /überlappende Widgets/);
});


test("Admin verwaltet Reihenfolge, Zuordnung und sicheres Löschen mit Karten-Rückführung", function () {
    const admin = adminHarness();
    const configuration = currentConfiguration();

    admin.State.setConfiguration(configuration);

    const dashboard = admin.State.getDraft().dashboards[0];
    const first = dashboard.widgets[0];
    const second = dashboard.widgets[1];

    const ground = admin.Sections.create("default", {
        title: "Erdgeschoss",
        areaId: "ground_floor"
    });
    const upper = admin.Sections.create("default", {
        title: "Obergeschoss",
        showTitle: false
    });

    admin.Sections.update("default", ground.id, {title: "EG"});
    assert.equal(ground.title, "EG");
    assert.equal(upper.showTitle, false);
    assert.equal(admin.Sections.move("default", upper.id, "up"), true);
    assert.equal(dashboard.sections[0].id, upper.id);

    admin.Sections.assignWidget("default", first.id, ground.id);
    admin.Sections.assignWidget("default", second.id, upper.id);
    assert.equal(first.sectionId, ground.id);
    assert.equal(second.sectionId, upper.id);

    admin.Sections.assignWidget("default", second.id, null);
    Layout.PROFILES.forEach(function (profileName) {
        dashboard.layouts[profileName].items[first.id] = Object.assign(
            {},
            dashboard.layouts[profileName].items[second.id]
        );
    });

    const countBefore = dashboard.widgets.length;
    admin.Sections.remove("default", ground.id);

    assert.equal(dashboard.widgets.length, countBefore);
    assert.equal(first.sectionId, null);
    assert.notDeepEqual(
        dashboard.layouts.portrait.items[first.id],
        dashboard.layouts.portrait.items[second.id]
    );
    assert.equal(DashboardConfig.validateConfiguration(
        admin.State.getDraft()
    ), true);
});


test("Wall-Display rendert Abschnitte vertikal und behält den alten Fallback", function () {
    const harness = wallHarness();
    const widgets = [
        {id: "first", entity: "sensor.first", type: "sensor", title: "A", order: 10, visible: true, sectionId: "ground"},
        {id: "second", entity: "sensor.second", type: "sensor", title: "B", order: 20, visible: true, sectionId: null},
        {id: "third", entity: "sensor.third", type: "sensor", title: "C", order: 30, visible: true, sectionId: "upper"}
    ];
    const sections = [
        {id: "upper", title: "Obergeschoss", order: 20, showTitle: false, areaId: null},
        {id: "ground", title: "Erdgeschoss", order: 10, showTitle: true, areaId: "ground_floor"}
    ];

    harness.Dashboard.configure(widgets, {}, sections);
    harness.Dashboard.render({});

    assert.equal(harness.container.className, "dashboard-sections");
    assert.ok(harness.container.innerHTML.indexOf("Erdgeschoss") !== -1);
    assert.equal(harness.container.innerHTML.indexOf("Obergeschoss"), -1);
    assert.ok(harness.container.innerHTML.indexOf("Nicht zugeordnet") !== -1);
    assert.deepEqual(
        harness.layoutCalls.map(function (call) {
            return [call.cacheKey, call.ids.join(",")];
        }),
        [
            ["ground", "first"],
            ["upper", "third"],
            ["unassigned", "second"]
        ]
    );

    harness.layoutCalls.length = 0;
    harness.Dashboard.configure(widgets, {}, []);
    harness.Dashboard.render({});
    assert.equal(harness.container.className, "grid");
    assert.equal(harness.layoutCalls.length, 1);
    assert.equal(harness.layoutCalls[0].ids, null);
});


test("Admin und Wall-Display erhalten Area-Read-only-, ES5- und Sicherheitsgrenzen", function () {
    const adminHtml = read("src/admin/index.html");
    const adminApp = read("src/admin/js/app.js");
    const adminRoute = read("src/routes/admin.js");
    const wallFiles = [
        "src/public/js/core/widget.js",
        "src/public/js/core/layout.js",
        "src/public/js/core/dashboard.js",
        "src/public/js/app.js"
    ];
    const wallCss = read("src/public/css/style.css");

    assert.match(adminHtml, /id="widgetSectionInput"/);
    assert.match(adminHtml, /\/admin\/js\/sections\.js/);
    assert.match(adminApp, /section-add/);
    assert.match(adminApp, /section-area/);
    assert.match(adminRoute, /area_id:/);
    assert.match(adminRoute, /areas: areas/);
    assert.doesNotMatch(adminRoute, /area_registry\/(create|update|delete)/);
    assert.doesNotMatch(adminRoute, /callService/);

    wallFiles.forEach(function (relativePath) {
        const source = read(relativePath);
        [
            /\blet\b/,
            /\bconst\b/,
            /=>/,
            /\bclass\s+[A-Za-z_$]/,
            /`/,
            /\bfetch\s*\(/
        ].forEach(function (forbidden) {
            assert.doesNotMatch(source, forbidden, relativePath);
        });
    });

    assert.doesNotMatch(wallCss, /display\s*:\s*grid/i);
    assert.match(wallCss, /\.dashboard-sections[\s\S]*flex-direction:\s*column/);
    assert.match(read("src/public/index.html"), /\/js\/app\.js\?v=49/);
});
