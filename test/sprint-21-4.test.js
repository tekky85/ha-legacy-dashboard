const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const ADMIN = path.join(ROOT, "src", "admin");


function source(relativePath) {
    return fs.readFileSync(path.join(ADMIN, relativePath), "utf8");
}


function createHarness() {
    const requests = [];
    const storage = Object.create(null);
    const window = {
        HALegacyAdmin: {},
        sessionStorage: {
            getItem: function (key) { return storage[key] || null; },
            setItem: function (key, value) { storage[key] = String(value); },
            removeItem: function (key) { delete storage[key]; }
        },
        fetch: async function (url, options) {
            requests.push({url: url, options: options});
            return {
                ok: true,
                status: 200,
                text: async function () {
                    return JSON.stringify(JSON.parse(options.body));
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
        "js/system-dashboards.js",
        "js/entity-rules.js"
    ].forEach(function (file) {
        vm.runInContext(source(file), context, {filename: file});
    });

    return {admin: window.HALegacyAdmin, requests: requests};
}


function configuration() {
    return {
        schemaVersion: 7,
        defaultDashboardId: "default",
        systemDashboards: {
            summary: {ignoredEntities: [], showMediaTitles: false},
            errors: {
                securityEntities: [],
                ignoredEntities: [],
                criticalDetectionMode: "device_class",
                criticalLabelId: null
            }
        },
        dashboards: [{id: "default", title: "Default", widgets: []}]
    };
}


function settings(admin) {
    return {
        summaryIgnoredEntities:
            admin.SystemDashboards.getSummarySettings().ignoredEntities,
        securityEntities:
            admin.SystemDashboards.getErrorSettings().securityEntities,
        errorIgnoredEntities:
            admin.SystemDashboards.getErrorSettings().ignoredEntities
    };
}


test("Entity Rule Manager sucht Metadaten und kombiniert Filter", function () {
    const harness = createHarness();
    const admin = harness.admin;
    const entities = [
        {
            entity_id: "binary_sensor.window_nursery",
            domain: "binary_sensor",
            friendly_name: "Fenster Kinderzimmer",
            area_name: "Kinderzimmer",
            device_name: "Aqara Fensterkontakt"
        },
        {
            entity_id: "sensor.living_temperature",
            domain: "sensor",
            friendly_name: "Temperatur Wohnzimmer",
            area_name: "Wohnzimmer",
            device_name: "Thermostat Wohnzimmer"
        }
    ];
    const index = admin.EntityRules.createIndex(entities);

    admin.State.setConfiguration(configuration());

    ["fenster", "window_nursery", "aqara", "kinderzimmer", "binary_sensor"]
        .forEach(function (query) {
            assert.equal(
                admin.EntityRules.filter(index, settings(admin), {query: query}).total,
                1
            );
        });

    assert.equal(admin.EntityRules.filter(index, settings(admin), {
        query: "fenster",
        area: "Kinderzimmer",
        domain: "binary_sensor",
        device: "fensterkontakt"
    }).entities[0].entity_id, "binary_sensor.window_nursery");

    assert.equal(admin.EntityRules.filter(index, settings(admin), {
        area: "Wohnzimmer",
        domain: "binary_sensor"
    }).total, 0);
    assert.deepEqual(
        JSON.parse(JSON.stringify(admin.EntityRules.options(index, "area"))),
        ["Kinderzimmer", "Wohnzimmer"]
    );
});


test("Drei Entity-Regeln teilen einen lokalen Batch-Entwurf", async function () {
    const harness = createHarness();
    const admin = harness.admin;
    const entityId = "binary_sensor.window_nursery";
    const index = admin.EntityRules.createIndex([{
        entity_id: entityId,
        domain: "binary_sensor",
        friendly_name: "Fenster",
        area_name: "Kinderzimmer",
        device_name: "Kontakt"
    }]);

    admin.State.setConfiguration(configuration());
    admin.Auth.setToken("fake-admin-token", false);

    assert.equal(admin.SystemDashboards.setEntityRule(
        entityId, "summaryIgnore", true
    ), true);
    assert.equal(admin.SystemDashboards.setEntityRule(
        entityId, "securityRelevant", true
    ), true);
    assert.equal(admin.SystemDashboards.setEntityRule(
        entityId, "errorIgnore", true
    ), true);
    assert.equal(admin.State.isDirty(), true);
    assert.equal(harness.requests.length, 0);
    assert.equal(admin.EntityRules.filter(index, settings(admin), {
        configuredOnly: true
    }).total, 1);

    await admin.Api.saveConfiguration(admin.State.getDraft());
    assert.equal(harness.requests.length, 1);
    assert.equal(harness.requests[0].options.method, "PUT");
    const payload = JSON.parse(harness.requests[0].options.body);
    assert.deepEqual(payload.systemDashboards.summary.ignoredEntities, [entityId]);
    assert.deepEqual(payload.systemDashboards.errors.securityEntities, [entityId]);
    assert.deepEqual(payload.systemDashboards.errors.ignoredEntities, [entityId]);

    admin.SystemDashboards.setEntityRule(entityId, "summaryIgnore", false);
    admin.State.discard();
    assert.equal(
        admin.SystemDashboards.getEntityRules(entityId).summaryIgnore,
        false
    );
});


test("3000 Entities bleiben auf 100 DOM-Kandidaten begrenzt", function () {
    const harness = createHarness();
    const admin = harness.admin;
    const entities = [];
    let index;

    admin.State.setConfiguration(configuration());

    for (index = 0; index < 3000; index++) {
        entities.push({
            entity_id: "sensor.entity_" + index,
            domain: index % 2 === 0 ? "sensor" : "binary_sensor",
            friendly_name: "Entity " + index,
            area_name: "Area " + (index % 50),
            device_name: "Device " + (index % 500)
        });
    }

    const startedAt = Date.now();
    const searchIndex = admin.EntityRules.createIndex(entities);
    const all = admin.EntityRules.filter(searchIndex, settings(admin), {});
    const combined = admin.EntityRules.filter(searchIndex, settings(admin), {
        query: "entity",
        area: "Area 7",
        domain: "binary_sensor",
        device: "device"
    });

    assert.equal(all.total, 3000);
    assert.equal(all.entities.length, 100);
    assert.equal(all.limited, true);
    assert.equal(combined.total, 60);
    assert.equal(combined.limited, false);
    assert.equal(admin.EntityRules.options(searchIndex, "device").length, 500);
    assert.ok(Date.now() - startedAt < 1000);
});


test("System-Header zeigt Total nur einmal und Wall-JavaScript bleibt ES5", function () {
    const html = fs.readFileSync(path.join(ROOT, "src", "public", "system.html"), "utf8");
    const wallSource = ["common.js", "summary.js", "errors.js"].map(function (file) {
        return fs.readFileSync(
            path.join(ROOT, "src", "public", "js", "system", file),
            "utf8"
        );
    }).join("\n");

    assert.match(html, /id="systemDashboardTotal"/);
    assert.doesNotMatch(html, /id="summaryAllCount"/);
    assert.doesNotMatch(html, /id="errorAllCount"/);
    assert.doesNotMatch(html, /id="errorStateAllCount"/);
    assert.match(html, /system-dashboard-header/);
    assert.match(html, /system-dashboard-filter-section/);
    assert.match(html, /system-dashboard-column-switch/);
    assert.doesNotMatch(wallSource, /\bconst\b|\blet\b|=>|`/);
    assert.doesNotMatch(wallSource, /\bfetch\b|\bPromise\b|\basync\b|\bawait\b/);
});
