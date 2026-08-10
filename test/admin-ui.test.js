const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");


const PROJECT_PATH = path.join(__dirname, "..");
const ADMIN_PATH = path.join(PROJECT_PATH, "src", "admin");


function readAdminFile(relativePath) {
    return fs.readFileSync(
        path.join(ADMIN_PATH, relativePath),
        "utf8"
    );
}


function createHarness() {
    const storage = Object.create(null);
    const requests = [];

    const window = {
        HALegacyAdmin: {},
        sessionStorage: {
            getItem: function (key) {
                return Object.prototype.hasOwnProperty.call(storage, key)
                    ? storage[key]
                    : null;
            },
            setItem: function (key, value) {
                storage[key] = String(value);
            },
            removeItem: function (key) {
                delete storage[key];
            }
        },
        fetch: async function (url, options) {
            requests.push({
                url: url,
                options: options
            });

            return {
                ok: true,
                status: 200,
                text: async function () {
                    return JSON.stringify({
                        schemaVersion: 2,
                        defaultDashboardId: "default",
                        dashboards: []
                    });
                }
            };
        }
    };

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
        "js/auth.js",
        "js/api.js",
        "js/state.js",
        "js/dashboards.js",
        "js/widgets.js",
        "js/entities.js"
    ].forEach(function (relativePath) {
        vm.runInContext(
            readAdminFile(relativePath),
            context,
            {
                filename: relativePath
            }
        );
    });

    return {
        admin: window.HALegacyAdmin,
        requests: requests,
        storage: storage,
        window: window
    };
}


function freshConfiguration() {
    const dashboardConfig = require(
        "../src/config/dashboard"
    );

    return dashboardConfig.cloneConfiguration(
        dashboardConfig.DEFAULT_CONFIGURATION
    );
}


test("Admin-Authentifizierung bleibt auf API und Sitzung begrenzt", async function () {
    const harness = createHarness();
    const admin = harness.admin;
    const token = "fake-admin-ui-token";

    admin.Auth.setToken(token, true);
    assert.equal(admin.Auth.getToken(), token);
    assert.equal(Object.values(harness.storage)[0], token);

    await admin.Api.getConfiguration();

    assert.equal(harness.requests.length, 1);
    assert.equal(harness.requests[0].url, "/api/admin/config");
    assert.equal(
        harness.requests[0].options.headers.Authorization,
        "Bearer " + token
    );
    assert.equal(
        harness.requests[0].url.indexOf(token),
        -1
    );

    harness.window.fetch = async function () {
        return {
            ok: false,
            status: 401,
            text: async function () {
                return JSON.stringify({
                    error: "admin_authentication_required"
                });
            }
        };
    };

    await assert.rejects(
        admin.Api.getConfiguration(),
        function (error) {
            return error.status === 401;
        }
    );
    assert.equal(admin.Auth.getToken(), "");
    assert.equal(Object.keys(harness.storage).length, 0);

    admin.Auth.setToken(token, false);
    assert.equal(Object.keys(harness.storage).length, 0);
    admin.Auth.clearToken();
    assert.equal(admin.Auth.hasToken(), false);
});


test("Dashboard-Entwürfe unterstützen CRUD, Standardwechsel und Duplikate", function () {
    const harness = createHarness();
    const admin = harness.admin;
    admin.State.setConfiguration(freshConfiguration());

    assert.throws(
        function () {
            admin.Dashboards.create("Ungültig", "Fehler");
        },
        /technische ID/
    );
    assert.throws(
        function () {
            admin.Dashboards.create("default", "Doppelt");
        },
        /existiert bereits/
    );

    const office = admin.Dashboards.create("buero", "Büro");
    assert.equal(office.widgets.length, 0);
    assert.equal(admin.State.getSelectedDashboardId(), "buero");

    admin.Dashboards.update("buero", {
        title: "Arbeitszimmer",
        refreshIntervalMs: 10000
    });
    assert.equal(office.title, "Arbeitszimmer");
    assert.equal(office.refreshIntervalMs, 10000);

    admin.State.selectDashboard("default");
    const duplicate = admin.Dashboards.duplicate(
        "default",
        "default-kopie",
        "Übersicht Kopie"
    );
    const originalIds = freshConfiguration()
        .dashboards[0]
        .widgets
        .map(function (widget) {
            return widget.id;
        });
    const duplicateIds = duplicate.widgets.map(function (widget) {
        return widget.id;
    });

    duplicate.widgets.forEach(function (widget, index) {
        assert.equal(
            widget.size,
            freshConfiguration().dashboards[0].widgets[index].size
        );
    });

    assert.equal(new Set(duplicateIds).size, duplicateIds.length);
    duplicateIds.forEach(function (widgetId) {
        assert.equal(originalIds.indexOf(widgetId), -1);
    });

    assert.throws(
        function () {
            admin.Dashboards.remove("default");
        },
        /anderes Standard-Dashboard/
    );

    admin.Dashboards.setDefault("buero");
    admin.Dashboards.remove("default");
    assert.equal(
        admin.State.getDraft().defaultDashboardId,
        "buero"
    );
    assert.equal(
        admin.State.getDraft().dashboards.some(function (dashboard) {
            return dashboard.id === "default";
        }),
        false
    );

    assert.equal(admin.State.isDirty(), true);
    admin.State.discard();
    assert.equal(admin.State.isDirty(), false);
    assert.equal(admin.State.getDraft().defaultDashboardId, "default");
});


test("Entity-Suche und Widget-Entwurf begrenzen sich auf bekannte Typen", function () {
    const harness = createHarness();
    const admin = harness.admin;
    const entities = [
        {
            entity_id: "sensor.office_temperature",
            domain: "sensor",
            friendly_name: "Bürotemperatur",
            device_class: "temperature",
            unit_of_measurement: "°C"
        },
        {
            entity_id: "light.office",
            domain: "light",
            friendly_name: "Bürolicht",
            device_class: null,
            unit_of_measurement: null
        },
        {
            entity_id: "switch.unsafe",
            domain: "switch",
            friendly_name: "Nicht unterstützt",
            device_class: null,
            unit_of_measurement: null
        }
    ];

    assert.equal(admin.Entities.filter(entities, "bürotemp", "").length, 1);
    assert.equal(admin.Entities.filter(entities, "office", "light").length, 1);
    assert.equal(admin.Entities.filter(entities, "", "").length, 2);
    assert.equal(admin.Entities.isSupported(entities[2]), false);
    assert.equal(admin.Widgets.suggestionForEntity(entities[2]), null);

    admin.State.setConfiguration(freshConfiguration());
    const dashboard = admin.State.getSelectedDashboard();
    const initialLength = dashboard.widgets.length;

    const first = admin.Widgets.create(
        dashboard.id,
        entities[0],
        {
            title: "Büro",
            subtitle: "Temperatur",
            icon: "temperature",
            unit: "°C",
            order: 70,
            visible: true,
            size: "normal"
        }
    );
    const second = admin.Widgets.create(
        dashboard.id,
        entities[0],
        {
            title: "Büro zwei",
            subtitle: "Temperatur",
            icon: "sensor",
            unit: "°C",
            order: 80,
            visible: false,
            size: "compact"
        }
    );

    assert.notEqual(first.id, second.id);
    assert.equal(first.type, "sensor");
    assert.equal(first.size, "normal");
    assert.equal(second.size, "compact");
    assert.equal(dashboard.widgets.length, initialLength + 2);

    admin.Widgets.update(dashboard.id, first.id, {
        title: "Neue Temperatur",
        subtitle: "Büro",
        icon: "sensor",
        unit: "K",
        order: first.order,
        visible: false,
        size: "wide"
    });
    assert.equal(first.title, "Neue Temperatur");
    assert.equal(first.entity, "sensor.office_temperature");
    assert.equal(first.type, "sensor");
    assert.equal(first.visible, false);
    assert.equal(first.size, "wide");

    assert.throws(function () {
        admin.Widgets.update(dashboard.id, first.id, {
            title: "Ungültig",
            subtitle: "Büro",
            icon: "sensor",
            unit: "K",
            order: first.order,
            visible: true,
            size: "300px"
        });
    }, /gültige Kachelgröße/);

    admin.Widgets.setVisibility(dashboard.id, first.id, true);
    assert.equal(first.visible, true);
    assert.equal(admin.Widgets.move(dashboard.id, second.id, "up"), true);
    assert.equal(second.order < first.order, true);

    admin.Widgets.remove(dashboard.id, first.id);
    assert.equal(
        dashboard.widgets.some(function (widget) {
            return widget.id === first.id;
        }),
        false
    );

    admin.State.discard();
    assert.equal(
        admin.State.getDraft().dashboards[0].widgets[0].size,
        "normal"
    );
});


test("Admin-Dateien leaken keine Secrets und das Wall-Display bleibt ES5", function () {
    const html = readAdminFile("index.html");
    const authSource = readAdminFile("js/auth.js");
    const apiSource = readAdminFile("js/api.js");
    const appSource = readAdminFile("js/app.js");

    assert.match(html, /id="loginForm"/);
    assert.match(html, /id="logoutButton"/);
    assert.match(html, /id="dashboardList"/);
    assert.match(html, /id="entitySearch"/);
    assert.doesNotMatch(html, /Bearer\s+[A-Za-z0-9_-]{8,}/);
    assert.doesNotMatch(html, /HA_TOKEN|ADMIN_TOKEN=/);

    assert.match(authSource, /sessionStorage/);
    assert.doesNotMatch(authSource, /localStorage/);
    assert.match(apiSource, /"\/api\/admin" \+ endpoint/);
    assert.doesNotMatch(apiSource, /\/api\/dashboard(?:s)?/);
    assert.doesNotMatch(apiSource, /console\./);
    assert.match(appSource, /beforeunload/);
    assert.doesNotMatch(appSource, /dragstart|draggable|grid-column|tileWidth/);

    const legacyDirectory = path.join(
        PROJECT_PATH,
        "src",
        "public",
        "js"
    );
    const legacySources = [];

    function collectJavaScript(directory) {
        fs.readdirSync(directory, {
            withFileTypes: true
        }).forEach(function (entry) {
            const filePath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                collectJavaScript(filePath);
            } else if (/\.js$/.test(entry.name)) {
                legacySources.push(fs.readFileSync(filePath, "utf8"));
            }
        });
    }

    collectJavaScript(legacyDirectory);
    const legacySource = legacySources.join("\n");

    assert.doesNotMatch(legacySource, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(legacySource, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
});
