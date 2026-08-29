const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const DashboardConfig = require("../src/config/dashboard");
const Layout = require("../src/services/layout");
const Matrix = require("./fixtures/card-matrix");


const ROOT = path.join(__dirname, "..");
const TIERS = [
    "compact",
    "standard",
    "wide",
    "tall",
    "large"
];


function read(relativePath) {
    return fs.readFileSync(
        path.join(ROOT, relativePath),
        "utf8"
    );
}


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function widgetContext() {
    const context = vm.createContext({
        Boolean: Boolean,
        Math: Math,
        String: String,
        isFinite: isFinite,
        isNaN: isNaN,
        parseFloat: parseFloat,
        parseInt: parseInt,
        Legacy: {html: {escape: escapeHtml}},
        LegacyIcons: {
            get: function () {
                return '<svg class="fixture-icon"></svg>';
            }
        }
    });

    [
        "src/public/js/core/presentation.js",
        "src/public/js/core/widget.js",
        "src/public/js/controls/power.js",
        "src/public/js/widgets/sensor.js",
        "src/public/js/widgets/binary.js",
        "src/public/js/widgets/light.js",
        "src/public/js/widgets/climate.js"
    ].forEach(function (fileName) {
        vm.runInContext(read(fileName), context);
    });

    return context;
}


function configFor(entry) {
    return {
        id: entry.type + "-matrix",
        type: entry.type,
        entity: entry.type === "binary"
            ? "binary_sensor.matrix"
            : entry.type + ".matrix",
        title: entry.state.title,
        subtitle: entry.state.subtitle,
        icon: entry.type,
        iconClass: "",
        unit: entry.state.unit || "",
        size: "normal"
    };
}


function createWidget(context, entry) {
    const config = configFor(entry);

    if (entry.type === "sensor") {
        return new context.SensorWidget(config);
    }
    if (entry.type === "binary") {
        return new context.BinaryWidget(config);
    }
    if (entry.type === "light") {
        return new context.LightWidget(config);
    }
    return new context.ClimateWidget(config);
}


function layoutDashboard(type, profileName, item) {
    const widget = {
        id: type + "-matrix",
        type: type,
        entity: type === "binary"
            ? "binary_sensor.matrix"
            : type + ".matrix",
        title: "Matrix",
        subtitle: "",
        icon: type,
        iconClass: "",
        unit: type === "climate" ? "°C" : "",
        order: 1,
        visible: true,
        size: "normal"
    };
    const layouts = Layout.createLayouts([widget]);

    layouts[profileName].items[widget.id] = {
        x: 0,
        y: 0,
        w: item.w,
        h: item.h
    };

    return {
        widgets: [widget],
        layouts: layouts
    };
}


test("Card Inventory entspricht exakt den vier realen Renderern", function () {
    const dashboard = read("src/public/js/core/dashboard.js");

    assert.deepEqual(
        DashboardConfig.SUPPORTED_WIDGET_TYPES,
        Matrix.TYPES
    );
    assert.deepEqual(Matrix.TYPES, [
        "sensor",
        "binary",
        "light",
        "climate"
    ]);

    Matrix.TYPES.forEach(function (type) {
        assert.match(
            dashboard,
            new RegExp(
                'config\\.type === "' + type + '"'
            )
        );
    });

    [
        "switch",
        "cover",
        "fan",
        "lock",
        "media_player",
        "vacuum"
    ].forEach(function (type) {
        assert.equal(
            DashboardConfig.SUPPORTED_WIDGET_TYPES.indexOf(type),
            -1
        );
    });
});


test("Size Matrix enthält jede serverseitig gültige Profilgröße", function () {
    const expectedCounts = {
        sensor: {portrait: 20, landscape: 44},
        binary: {portrait: 20, landscape: 44},
        light: {portrait: 20, landscape: 44},
        climate: {portrait: 20, landscape: 40}
    };

    Matrix.TYPES.forEach(function (type) {
        Layout.PROFILES.forEach(function (profileName) {
            const sizes = Matrix.sizes(type, profileName);

            assert.equal(
                sizes.length,
                expectedCounts[type][profileName]
            );
            assert.equal(
                Matrix.PROFILES[profileName].columns,
                Layout.PROFILE_COLUMNS[profileName]
            );
            assert.equal(
                Matrix.MINIMUM_WIDTHS[type][profileName],
                Layout.WIDGET_MINIMUM_SIZES[type][profileName].w
            );

            sizes.forEach(function (size) {
                assert.equal(
                    Layout.validateLayouts(
                        layoutDashboard(type, profileName, size)
                    ),
                    true
                );
            });
        });
    });

    assert.equal(Matrix.cases().length, 1128);
});


test("Presentation Matrix verwendet nur fünf Tiers und erreicht sie je Renderer", function () {
    const context = widgetContext();
    const observed = {};

    Matrix.TYPES.forEach(function (type) {
        observed[type] = {};
    });

    Matrix.cases().forEach(function (entry) {
        const widget = createWidget(context, entry);
        const profile = Matrix.PROFILES[entry.profile];
        const geometry =
            context.LegacyPresentation.calculateGridGeometry(
                profile.canvasWidth,
                profile.columns
            );
        const effectiveWidth =
            entry.size.w * geometry.columnWidth -
            geometry.gutter;
        const effectiveHeight =
            entry.size.h * geometry.rowHeight -
            geometry.gutter;
        const hints = context.LegacyPresentation.getHints(
            widget,
            entry.state.data
        );
        const tier = context.LegacyPresentation.getMode(
            widget,
            entry.size.w,
            entry.size.h,
            effectiveWidth,
            effectiveHeight,
            hints
        );

        assert.ok(TIERS.indexOf(tier) !== -1, entry.id);
        observed[entry.type][tier] = true;
    });

    Matrix.TYPES.forEach(function (type) {
        assert.deepEqual(
            Object.keys(observed[type]).sort(),
            TIERS.slice(0).sort(),
            type
        );
    });
});


test("Representative States rendern genau die erwarteten Inhalte und Controls", function () {
    const context = widgetContext();

    Matrix.cases().forEach(function (entry) {
        const widget = createWidget(context, entry);
        const html = widget.render(entry.state.data);
        const identityCount =
            (html.match(/class="title card-identity"/g) || []).length;
        const stepCount =
            (html.match(/class="dashboard-control dashboard-control-step climate-control"/g) || []).length;
        const powerCount =
            (html.match(/<button[^>]*\bdashboard-control-power\b/g) || []).length;

        assert.equal(identityCount, 1, entry.id);
        assert.match(html, /data-card-density="(?:normal|dense)"/);
        assert.match(html, /data-card-controls="[0-3]"/);
        assert.match(html, /data-card-state="(?:available|unavailable)"/);

        if (entry.type === "sensor") {
            assert.match(html, /class="value/);
            assert.equal(stepCount, 0);
            assert.equal(powerCount, 0);
        } else if (entry.type === "binary") {
            assert.match(html, /class="status /);
            assert.equal(stepCount, 0);
            assert.equal(powerCount, 0);
        } else if (entry.type === "light") {
            assert.match(html, /class="light-state /);
            assert.equal(stepCount, 0);
            assert.equal(powerCount, 1);
        } else {
            assert.match(html, /class="climate-current-value"/);
            assert.match(html, /class="climate-target-value"/);
            assert.match(html, /class="climate-state /);
            assert.equal(stepCount, 2);
            assert.equal(powerCount, 1);
        }
    });
});


test("Climate Large besitzt eine eigene vollständige Grid-Presentation", function () {
    const css = read("src/public/css/style.css");

    assert.match(
        css,
        /card-climate\.card-presentation-large \.climate-values[\s\S]*?-webkit-flex:\s*1 1 auto/
    );
    assert.match(
        css,
        /card-climate\.card-presentation-large \.climate-current[\s\S]*?text-align:\s*center/
    );
    assert.match(
        css,
        /card-climate\.card-presentation-large \.climate-target-row[\s\S]*?width:\s*auto;[\s\S]*?min-width:\s*260px/
    );
    assert.match(
        css,
        /card-climate\.card-presentation-large \.climate-control,[\s\S]*?min-width:\s*52px;[\s\S]*?min-height:\s*52px/
    );
    assert.doesNotMatch(
        css,
        /card-climate\.card-presentation-large \.climate-target-row\s*\{[^}]*width:\s*100%/
    );
});


test("Matrix-Harness prüft Overflow, Clipping, Controls und Tier-Klassen", function () {
    const harness = read(
        "test/fixtures/card-matrix-harness.js"
    );

    assert.match(harness, /scrollWidth/);
    assert.match(harness, /scrollHeight/);
    assert.match(harness, /getBoundingClientRect/);
    assert.match(harness, /duplicate-control/);
    assert.match(harness, /missing-control/);
    assert.match(harness, /invalid-tier/);
    assert.match(harness, /touch-target/);
    assert.match(
        harness,
        /matrix-case grid grid-layout-active/
    );
});


test("Sprint 25.6 bleibt ES5, CSS-Grid-frei und ohne neue Write-Fläche", function () {
    const legacyFiles = [
        "src/public/js/core/presentation.js",
        "src/public/js/core/widget.js",
        "src/public/js/core/layout.js",
        "src/public/js/widgets/sensor.js",
        "src/public/js/widgets/binary.js",
        "src/public/js/widgets/light.js",
        "src/public/js/widgets/climate.js"
    ];
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
    const css = read("src/public/css/style.css");
    const api = read("src/routes/api.js");

    legacyFiles.forEach(function (fileName) {
        forbidden.forEach(function (pattern) {
            assert.doesNotMatch(read(fileName), pattern, fileName);
        });
    });

    assert.doesNotMatch(css, /display:\s*grid|\bgap\s*:/);
    assert.match(api, /"climate\.esszimmer_thermostate"/);
    assert.match(api, /"light\.esszimmer_lampen"/);
    assert.doesNotMatch(api, /body\.(?:domain|service|service_data)/);
});
