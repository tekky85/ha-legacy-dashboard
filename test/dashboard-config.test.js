const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");


test("Backend-Konfiguration liefert sichtbare Widgets in Reihenfolge", function () {

    const dashboardConfig = require(
        path.join(
            __dirname,
            "..",
            "src",
            "config",
            "dashboard.js"
        )
    );

    const widgets =
        dashboardConfig.getPublicWidgets();

    const entityIds =
        dashboardConfig.getVisibleEntityIds();


    assert.equal(widgets.length, 5);
    assert.deepEqual(
        entityIds,
        widgets.map(function (widget) {
            return widget.entity;
        })
    );

    assert.equal(
        entityIds.indexOf(
            "binary_sensor.kuche_fenster_mitte"
        ),
        -1
    );

    assert.deepEqual(
        widgets.map(function (widget) {
            return widget.order;
        }),
        [10, 20, 30, 40, 50]
    );

    widgets.forEach(function (widget) {
        assert.equal(widget.visible, true);
        assert.equal(typeof widget.entity, "string");
        assert.equal(typeof widget.type, "string");
        assert.equal(typeof widget.title, "string");
        assert.equal(typeof widget.icon, "string");
        assert.equal(typeof widget.unit, "string");
        assert.equal(
            Object.prototype.hasOwnProperty.call(
                widget,
                "service"
            ),
            false
        );
        assert.equal(
            Object.prototype.hasOwnProperty.call(
                widget,
                "writable"
            ),
            false
        );
    });

    assert.equal(
        dashboardConfig.getRefreshIntervalMs(),
        5000
    );

});


test("Refresh-Intervall wird serverseitig begrenzt", function () {

    const dashboardConfig = require(
        path.join(
            __dirname,
            "..",
            "src",
            "config",
            "dashboard.js"
        )
    );

    const previous =
        process.env.DASHBOARD_REFRESH_INTERVAL_MS;


    try {

        process.env.DASHBOARD_REFRESH_INTERVAL_MS = "12000";
        assert.equal(
            dashboardConfig.getRefreshIntervalMs(),
            12000
        );

        process.env.DASHBOARD_REFRESH_INTERVAL_MS = "1000";
        assert.equal(
            dashboardConfig.getRefreshIntervalMs(),
            5000
        );

        process.env.DASHBOARD_REFRESH_INTERVAL_MS = "secret";
        assert.equal(
            dashboardConfig.getRefreshIntervalMs(),
            5000
        );

    } finally {

        if (typeof previous === "undefined") {
            delete process.env.DASHBOARD_REFRESH_INTERVAL_MS;
        } else {
            process.env.DASHBOARD_REFRESH_INTERVAL_MS = previous;
        }

    }

});


test("statische Multi-Dashboard-Konfiguration ist eindeutig und gekapselt", function () {

    const dashboardConfig = require(
        path.join(
            __dirname,
            "..",
            "src",
            "config",
            "dashboard.js"
        )
    );

    const dashboards =
        dashboardConfig.getPublicDashboards();

    const defaultDashboard =
        dashboardConfig.getDefaultDashboard();

    const roomConfiguration =
        dashboardConfig.getPublicDashboardConfig(
            "esszimmer"
        );


    assert.deepEqual(dashboards, [
        {
            id: "default",
            title: "Übersicht"
        },
        {
            id: "esszimmer",
            title: "Esszimmer"
        }
    ]);

    assert.equal(defaultDashboard.id, "default");
    assert.equal(roomConfiguration.id, "esszimmer");
    assert.deepEqual(
        roomConfiguration.widgets.map(function (widget) {
            return widget.entity;
        }),
        [
            "light.esszimmer_lampen",
            "climate.esszimmer_thermostate"
        ]
    );

    roomConfiguration.widgets[0].title = "Verändert";

    assert.equal(
        dashboardConfig
            .getPublicDashboardConfig("esszimmer")
            .widgets[0]
            .title,
        "Esszimmer"
    );

    assert.equal(
        dashboardConfig.getDashboardById("unbekannt"),
        null
    );
    assert.equal(
        dashboardConfig.getPublicDashboardConfig("unbekannt"),
        null
    );

});


test("ungültige Dashboard-IDs und Duplikate werden abgelehnt", function () {

    const dashboardConfig = require(
        path.join(
            __dirname,
            "..",
            "src",
            "config",
            "dashboard.js"
        )
    );

    const invalidIdConfiguration =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    invalidIdConfiguration
        .dashboards[0]
        .id = "Wohnzimmer";

    invalidIdConfiguration.defaultDashboardId =
        "Wohnzimmer";


    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            invalidIdConfiguration
        );
    }, /Dashboard-ID ist ungültig/);

    const duplicateConfiguration =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    duplicateConfiguration.dashboards[1].id =
        duplicateConfiguration.dashboards[0].id;

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            duplicateConfiguration
        );
    }, /nicht eindeutig/);

});


test("Frontend erzeugt nur bekannte sichtbare Widget-Typen", function () {

    const container = {
        innerHTML: ""
    };

    function makeWidget(type) {

        return function (config) {
            this.entity = config.entity;
            this.type = type;
            this.render = function (state) {
                return type + ":" + state.state + ";";
            };
        };

    }

    const context = {
        BinaryWidget: makeWidget("binary"),
        ClimateWidget: makeWidget("climate"),
        LightWidget: makeWidget("light"),
        SensorWidget: makeWidget("sensor"),
        document: {
            getElementById: function (id) {
                return id === "dashboard"
                    ? container
                    : null;
            }
        },
        parseFloat: parseFloat
    };

    const dashboardPath = path.join(
        __dirname,
        "..",
        "src",
        "public",
        "js",
        "core",
        "dashboard.js"
    );

    vm.runInNewContext(
        fs.readFileSync(dashboardPath, "utf8"),
        context
    );

    const configured = context.Dashboard.configure([
        {
            entity: "sensor.second",
            type: "sensor",
            order: 20,
            visible: true
        },
        {
            entity: "light.first",
            type: "light",
            order: 10,
            visible: true
        },
        {
            entity: "switch.hidden",
            type: "sensor",
            order: 5,
            visible: false
        },
        {
            entity: "script.unknown",
            type: "script",
            order: 1,
            visible: true
        }
    ]);

    assert.equal(configured, 2);
    assert.deepEqual(
        Array.from(
            context.Dashboard.widgets,
            function (widget) {
                return widget.entity;
            }
        ),
        ["light.first", "sensor.second"]
    );

    context.Dashboard.render({
        "light.first": {
            state: "on"
        },
        "sensor.second": {
            state: "21"
        }
    });

    assert.equal(
        container.innerHTML,
        "light:on;sensor:21;"
    );

});
