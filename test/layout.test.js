const assert = require("node:assert/strict");
const test = require("node:test");

const dashboardConfig =
    require("../src/config/dashboard");

const Layout =
    require("../src/services/layout");


function widget(id, order, size, visible, type) {
    return {
        id: id,
        entity: "sensor." + id.replace(/-/g, "_"),
        type: type || "sensor",
        title: id,
        subtitle: "",
        icon: "sensor",
        iconClass: "sensor",
        unit: "",
        order: order,
        visible: visible,
        size: size
    };
}


function expectInvalid(configuration) {
    assert.throws(
        function () {
            dashboardConfig.validateConfiguration(configuration);
        },
        function (error) {
            return error.code === "invalid_layout";
        }
    );
}


test("Schema 2 migriert deterministisch auf Portrait- und Landscape-Raster", function () {
    const legacy = dashboardConfig.cloneConfiguration(
        dashboardConfig.DEFAULT_CONFIGURATION
    );

    legacy.schemaVersion = 2;
    legacy.dashboards.forEach(function (dashboard) {
        delete dashboard.layouts;
    });

    const originalDashboardIds = legacy.dashboards.map(function (dashboard) {
        return dashboard.id;
    });
    const originalWidgetIds = legacy.dashboards.map(function (dashboard) {
        return dashboard.widgets.map(function (entry) {
            return entry.id;
        });
    });

    const first = dashboardConfig.migrateConfiguration(legacy);
    const second = dashboardConfig.migrateConfiguration(legacy);

    assert.equal(first.migrated, true);
    assert.equal(first.configuration.schemaVersion, 3);
    assert.deepEqual(first.configuration, second.configuration);
    assert.deepEqual(
        first.configuration.dashboards.map(function (dashboard) {
            return dashboard.id;
        }),
        originalDashboardIds
    );
    assert.deepEqual(
        first.configuration.dashboards.map(function (dashboard) {
            return dashboard.widgets.map(function (entry) {
                return entry.id;
            });
        }),
        originalWidgetIds
    );
    first.configuration.dashboards.forEach(function (dashboard) {
        assert.equal(dashboard.layouts.portrait.columns, 3);
        assert.equal(dashboard.layouts.landscape.columns, 6);
        assert.equal(
            Object.keys(dashboard.layouts.portrait.items).length,
            dashboard.widgets.length
        );
        assert.equal(
            Object.keys(dashboard.layouts.landscape.items).length,
            dashboard.widgets.length
        );
    });
    assert.equal(
        dashboardConfig.validateConfiguration(first.configuration),
        true
    );
});


test("Größen-Presets bestimmen die kollisionsfreie Erstplatzierung", function () {
    const widgets = [
        widget("compact", 10, "compact", true),
        widget("normal", 20, "normal", true),
        widget("wide", 30, "wide", true),
        widget("tall", 40, "tall", true),
        widget("large", 50, "large", true),
        widget("climate", 60, "normal", true, "climate")
    ];
    const layouts = Layout.createLayouts(widgets);

    ["portrait", "landscape"].forEach(function (profileName) {
        const items = layouts[profileName].items;
        const ids = Object.keys(items);
        let firstIndex;
        let secondIndex;

        assert.deepEqual(
            {w: items.compact.w, h: items.compact.h},
            {w: 1, h: 1}
        );
        assert.deepEqual(
            {w: items.normal.w, h: items.normal.h},
            {w: 1, h: 1}
        );
        assert.deepEqual(
            {w: items.wide.w, h: items.wide.h},
            {w: 2, h: 1}
        );
        assert.deepEqual(
            {w: items.tall.w, h: items.tall.h},
            {w: 1, h: 2}
        );
        assert.deepEqual(
            {w: items.large.w, h: items.large.h},
            {w: 2, h: 2}
        );

        for (firstIndex = 0; firstIndex < ids.length; firstIndex++) {
            for (secondIndex = firstIndex + 1; secondIndex < ids.length; secondIndex++) {
                assert.equal(
                    Layout.overlaps(
                        items[ids[firstIndex]],
                        items[ids[secondIndex]]
                    ),
                    false
                );
            }
        }
    });

    assert.equal(layouts.landscape.items.climate.w, 2);
});


test("unsichtbare Widgets blockieren keine Zellen und werden sicher reaktiviert", function () {
    const widgets = [
        widget("hidden", 10, "large", false),
        widget("visible", 20, "normal", true)
    ];
    const dashboard = {
        widgets: widgets,
        layouts: Layout.createLayouts(widgets)
    };

    assert.deepEqual(
        dashboard.layouts.portrait.items.hidden,
        {x: 0, y: 0, w: 2, h: 2}
    );
    assert.deepEqual(
        dashboard.layouts.portrait.items.visible,
        {x: 0, y: 0, w: 1, h: 1}
    );

    widgets[0].visible = true;
    Layout.ensureVisibleWidgetPlacement(dashboard, widgets[0]);

    assert.equal(
        Layout.overlaps(
            dashboard.layouts.portrait.items.hidden,
            dashboard.layouts.portrait.items.visible
        ),
        false
    );
    assert.equal(
        Layout.overlaps(
            dashboard.layouts.landscape.items.hidden,
            dashboard.layouts.landscape.items.visible
        ),
        false
    );
});


test("Rastervalidierung weist Grenzen, Fremdreferenzen und Kollisionen ab", function () {
    const mutations = [
        function (candidate, item) { item.x = -1; },
        function (candidate, item) { item.y = -1; },
        function (candidate, item) { item.w = 0; },
        function (candidate, item) { item.h = 0; },
        function (candidate, item) { item.x = 3; },
        function (candidate, item) { item.x = "1"; },
        function (candidate, item) { item.y = 100; },
        function (candidate, item) { item.h = 5; },
        function (candidate) {
            candidate.dashboards[0].layouts.portrait.items.unknown =
                {x: 0, y: 10, w: 1, h: 1};
        },
        function (candidate) {
            candidate.dashboards[0].layouts.print = {
                columns: 1,
                items: {}
            };
        },
        function (candidate) {
            candidate.dashboards[0].layouts.portrait.columns = 4;
        },
        function (candidate) {
            const dashboard = candidate.dashboards[0];
            const first = dashboard.widgets[0].id;
            const second = dashboard.widgets[1].id;
            dashboard.layouts.portrait.items[second] = Object.assign(
                {},
                dashboard.layouts.portrait.items[first]
            );
        }
    ];

    mutations.forEach(function (mutate) {
        const candidate = dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );
        const firstItem = candidate.dashboards[0].layouts.portrait.items[
            candidate.dashboards[0].widgets[0].id
        ];
        mutate(candidate, firstItem);
        expectInvalid(candidate);
    });
});


test("öffentliche Layouts enthalten nur sichtbare Widgetreferenzen", function () {
    const publicConfiguration =
        dashboardConfig.getPublicDashboardConfig("default");

    const visibleIds = publicConfiguration.widgets.map(function (entry) {
        return entry.id;
    }).sort();

    ["portrait", "landscape"].forEach(function (profileName) {
        assert.deepEqual(
            Object.keys(publicConfiguration.layouts[profileName].items).sort(),
            visibleIds
        );
    });

    assert.equal(
        JSON.stringify(publicConfiguration).indexOf("token"),
        -1
    );
});
