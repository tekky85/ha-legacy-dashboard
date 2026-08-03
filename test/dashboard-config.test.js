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
