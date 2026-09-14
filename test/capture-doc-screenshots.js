"use strict";

/*
 * Reproducible product-documentation screenshots.
 *
 * The harness serves the unmodified application assets and answers only with
 * deterministic localhost demo data. It never reads .env or contacts Home
 * Assistant. The resulting images are screenshots of the real frontend, not
 * generated UI mockups.
 */

const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "docs", "screenshots");
const BACKGROUND_ID = "bg-0123456789abcdef0123456789abcdef.png";
const ADMIN_TOKEN = "documentation-demo-token";
const BROWSER_CANDIDATES = [
    process.env.CHROME_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
].filter(Boolean);

function browserPath() {
    return BROWSER_CANDIDATES.find(function (candidate) {
        return fs.existsSync(candidate);
    }) || "";
}

function layout(items, columns) {
    return {columns: columns, items: items};
}

function roomWidget() {
    return {
        id: "room-living",
        entity: "sensor.demo_wohnzimmer_temperatur",
        type: "room",
        title: "Wohnzimmer",
        subtitle: "Raumübersicht",
        icon: "home",
        iconClass: "home",
        unit: "",
        order: 10,
        visible: true,
        sectionId: "ground-floor",
        size: "large",
        control: {enabled: true, preferredOnMode: "auto"},
        room: {
            areaId: "living-room",
            collapsible: true,
            defaultExpanded: true,
            background: {
                imageId: BACKGROUND_ID,
                image_url: "/assets/backgrounds/" + BACKGROUND_ID,
                position: "center center",
                size: "cover",
                overlay: 30
            },
            entities: {
                temperature: "sensor.demo_wohnzimmer_temperatur",
                humidity: "sensor.demo_wohnzimmer_luftfeuchte",
                climate: "climate.demo_wohnzimmer",
                presence: "binary_sensor.demo_wohnzimmer_anwesenheit",
                windows: ["binary_sensor.demo_wohnzimmer_fenster"],
                lights: ["light.demo_wohnzimmer"],
                switches: ["switch.demo_wohnzimmer_steckdose"],
                covers: ["cover.demo_wohnzimmer_rollladen"],
                fans: ["fan.demo_wohnzimmer"],
                mediaPlayers: ["media_player.demo_wohnzimmer"],
                locks: ["lock.demo_haustur"],
                batteries: ["sensor.demo_fenster_batterie"],
                secondary: []
            }
        }
    };
}

function directWidgets() {
    return [
        {
            id: "sensor-kitchen",
            entity: "sensor.demo_kuche_temperatur",
            type: "sensor",
            title: "Küche",
            subtitle: "Temperatur",
            icon: "temperature",
            iconClass: "temperature",
            unit: "°C",
            order: 20,
            visible: true,
            sectionId: "ground-floor",
            size: "normal",
            control: {enabled: false, preferredOnMode: null}
        },
        {
            id: "light-hall",
            entity: "light.demo_flur",
            type: "light",
            title: "Flurlicht",
            subtitle: "Erdgeschoss",
            icon: "light",
            iconClass: "light",
            unit: "",
            order: 30,
            visible: true,
            sectionId: "ground-floor",
            size: "normal",
            control: {enabled: true, preferredOnMode: null}
        },
        {
            id: "climate-bedroom",
            entity: "climate.demo_schlafzimmer",
            type: "climate",
            title: "Schlafzimmer",
            subtitle: "Thermostat",
            icon: "heating",
            iconClass: "heating",
            unit: "°C",
            order: 40,
            visible: true,
            sectionId: "upper-floor",
            size: "wide",
            control: {enabled: true, preferredOnMode: "heat"}
        },
        {
            id: "window-bedroom",
            entity: "binary_sensor.demo_schlafzimmer_fenster",
            type: "binary",
            title: "Schlafzimmer",
            subtitle: "Fenster",
            icon: "window",
            iconClass: "window",
            unit: "",
            order: 50,
            visible: true,
            sectionId: "upper-floor",
            size: "normal",
            control: {enabled: false, preferredOnMode: null}
        }
    ];
}

function dashboardConfiguration(id) {
    const widgets = [roomWidget()].concat(directWidgets());
    const items = {
        "room-living": {x: 0, y: 0, w: 6, h: 4},
        "sensor-kitchen": {x: 6, y: 0, w: 3, h: 1},
        "light-hall": {x: 9, y: 0, w: 3, h: 1},
        "climate-bedroom": {x: 0, y: 0, w: 6, h: 2},
        "window-bedroom": {x: 6, y: 0, w: 3, h: 1}
    };
    const compact = id === "compact";
    const background = id === "background";

    if (compact) {
        widgets[0].size = "compact";
        widgets[0].room.defaultExpanded = false;
        items["room-living"] = {x: 0, y: 0, w: 3, h: 1};
        widgets[3].size = "compact";
        items["climate-bedroom"] = {x: 6, y: 0, w: 3, h: 1};
    }

    return {
        id: id || "default",
        title: id === "focus" ? "Klima & Räume" : "Hausübersicht",
        show_title: true,
        background: background ? {
            image_url: "/assets/backgrounds/" + BACKGROUND_ID,
            position: "center center",
            size: "cover",
            overlay: 35
        } : null,
        refresh_interval_ms: 300000,
        sections: [
            {id: "ground-floor", title: "Erdgeschoss", order: 10, showTitle: true, areaId: null},
            {id: "upper-floor", title: "Obergeschoss", order: 20, showTitle: true, areaId: null}
        ],
        widgets: widgets.map(function (widget) {
            const copy = JSON.parse(JSON.stringify(widget));
            delete copy.control;
            return copy;
        }),
        layouts: {
            portrait: layout(items, 6),
            landscape: layout(items, 12)
        }
    };
}

function state(entityId, value, attributes, capabilities) {
    return {
        entity_id: entityId,
        state: value,
        attributes: attributes || {},
        gateway_capabilities: capabilities || {}
    };
}

function dashboardState() {
    const result = {
        "sensor.demo_wohnzimmer_temperatur": state("sensor.demo_wohnzimmer_temperatur", "21.7", {friendly_name: "Wohnzimmer Temperatur", unit_of_measurement: "°C"}),
        "sensor.demo_wohnzimmer_luftfeuchte": state("sensor.demo_wohnzimmer_luftfeuchte", "46", {friendly_name: "Wohnzimmer Luftfeuchte", unit_of_measurement: "%"}),
        "climate.demo_wohnzimmer": state("climate.demo_wohnzimmer", "heat", {friendly_name: "Wohnzimmer Thermostat", current_temperature: 21.7, temperature: 22.0, min_temp: 5, max_temp: 30, target_temp_step: 0.5, hvac_modes: ["off", "heat", "auto"], hvac_action: "heating", supported_features: 1}, {can_set_temperature: true, supports_power: true, can_power_on: false, can_power_off: true}),
        "binary_sensor.demo_wohnzimmer_anwesenheit": state("binary_sensor.demo_wohnzimmer_anwesenheit", "on", {friendly_name: "Präsenz Wohnzimmer"}),
        "binary_sensor.demo_wohnzimmer_fenster": state("binary_sensor.demo_wohnzimmer_fenster", "open", {friendly_name: "Terrassentür"}),
        "light.demo_wohnzimmer": state("light.demo_wohnzimmer", "on", {friendly_name: "Wohnzimmerlicht"}, {can_light_power_on: false, can_light_power_off: true}),
        "switch.demo_wohnzimmer_steckdose": state("switch.demo_wohnzimmer_steckdose", "on", {friendly_name: "Steckdose"}),
        "cover.demo_wohnzimmer_rollladen": state("cover.demo_wohnzimmer_rollladen", "open", {friendly_name: "Rollladen"}),
        "fan.demo_wohnzimmer": state("fan.demo_wohnzimmer", "off", {friendly_name: "Ventilator"}),
        "media_player.demo_wohnzimmer": state("media_player.demo_wohnzimmer", "playing", {friendly_name: "Wohnzimmer Audio"}),
        "lock.demo_haustur": state("lock.demo_haustur", "locked", {friendly_name: "Haustür"}),
        "sensor.demo_fenster_batterie": state("sensor.demo_fenster_batterie", "18", {friendly_name: "Fenstersensor Batterie", unit_of_measurement: "%"}),
        "sensor.demo_kuche_temperatur": state("sensor.demo_kuche_temperatur", "22.4", {friendly_name: "Küche Temperatur", unit_of_measurement: "°C"}),
        "light.demo_flur": state("light.demo_flur", "off", {friendly_name: "Flurlicht"}, {can_light_power_on: true, can_light_power_off: false}),
        "climate.demo_schlafzimmer": state("climate.demo_schlafzimmer", "off", {friendly_name: "Schlafzimmer Thermostat", current_temperature: 19.6, temperature: 20.5, min_temp: 5, max_temp: 30, target_temp_step: 0.5, hvac_modes: ["off", "heat"], supported_features: 1}, {can_set_temperature: true, supports_power: true, can_power_on: true, can_power_off: false}),
        "binary_sensor.demo_schlafzimmer_fenster": state("binary_sensor.demo_schlafzimmer_fenster", "closed", {friendly_name: "Schlafzimmer Fenster"}),
        _room_alerts: {"room-living": [{id: "room-open", title: "Terrassentür offen", severity: "warning", state: "open"}, {id: "room-battery", title: "Batterie niedrig", severity: "warning", state: "18"}]},
        _meta: {home_assistant: "online", fetched_at: "2026-09-13T10:30:00.000Z", failed_entities: []}
    };
    return result;
}

function adminConfiguration(withBackground) {
    const publicConfig = dashboardConfiguration("default");
    return {
        schemaVersion: 12,
        defaultDashboardId: "default",
        systemDashboards: {
            summary: {ignoredEntities: [], showMediaTitles: false},
            errors: {
                securityEntities: ["binary_sensor.demo_rauchmelder"],
                ignoredEntities: [],
                criticalDetectionMode: "ha_label",
                criticalLabelId: "critical",
                rules: {
                    defaults: {unknownGraceMs: 15000, unavailableGraceMs: 30000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000, expectedOffline: false},
                    riskClasses: {
                        safety: {unknownGraceMs: 0, unavailableGraceMs: 0, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000},
                        security: {unknownGraceMs: 0, unavailableGraceMs: 5000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000},
                        normal: {unknownGraceMs: 15000, unavailableGraceMs: 30000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000},
                        diagnostic: {unknownGraceMs: 30000, unavailableGraceMs: 60000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000}
                    },
                    domains: {}, devices: {}, entities: {"sensor.demo_fenster_batterie": {expectedOffline: true}}
                }
            }
        },
        dashboards: [{
            id: "default",
            title: "Hausübersicht",
            showTitle: true,
            background: withBackground ? {imageId: BACKGROUND_ID, position: "center center", size: "cover", overlay: 0.32} : null,
            refreshIntervalMs: 300000,
            sections: publicConfig.sections,
            widgets: [roomWidget()].concat(directWidgets()),
            layouts: publicConfig.layouts
        }]
    };
}

function entities() {
    return [
        ["sensor.demo_wohnzimmer_temperatur", "sensor", "Wohnzimmer Temperatur", "temperature", "°C", "living-room", "Wohnzimmer", "device-living", "Raumsensor"],
        ["sensor.demo_wohnzimmer_luftfeuchte", "sensor", "Wohnzimmer Luftfeuchte", "humidity", "%", "living-room", "Wohnzimmer", "device-living", "Raumsensor"],
        ["climate.demo_wohnzimmer", "climate", "Wohnzimmer Thermostat", null, null, "living-room", "Wohnzimmer", "device-climate", "Thermostat"],
        ["binary_sensor.demo_wohnzimmer_anwesenheit", "binary_sensor", "Präsenz Wohnzimmer", "occupancy", null, "living-room", "Wohnzimmer", "device-living", "Präsenzsensor"],
        ["binary_sensor.demo_wohnzimmer_fenster", "binary_sensor", "Terrassentür", "door", null, "living-room", "Wohnzimmer", "device-window", "Fenstersensor"],
        ["light.demo_wohnzimmer", "light", "Wohnzimmerlicht", null, null, "living-room", "Wohnzimmer", "device-light", "Deckenlicht"],
        ["sensor.demo_fenster_batterie", "sensor", "Fenstersensor Batterie", "battery", "%", "living-room", "Wohnzimmer", "device-window", "Fenstersensor"],
        ["binary_sensor.demo_rauchmelder", "binary_sensor", "Rauchmelder Demo", "smoke", null, "upper-floor", "Obergeschoss", "device-smoke", "Rauchmelder"]
    ].map(function (item) {
        return {entity_id: item[0], domain: item[1], friendly_name: item[2], device_class: item[3], unit_of_measurement: item[4], area_id: item[5], area_name: item[6], device_id: item[7], device_name: item[8], entity_category: item[3] === "battery" ? "diagnostic" : null, disabled_by: null, hidden_by: null, labels: []};
    });
}

function summaryPayload() {
    return {
        dashboard: "summary", title: "Summary", message: "4 aktive Zustände.", activeCount: 4,
        filters: [
            {id: "all", count: 4}, {id: "open", count: 1}, {id: "powered", count: 1},
            {id: "active", count: 0}, {id: "climate", count: 1}, {id: "media", count: 1}, {id: "security", count: 0}
        ],
        groups: [
            {id: "open", label: "Offen", items: [{id: "open-door", title: "Terrassentür", description: "Ist geöffnet", category: "open", state: "open", durationSeconds: 2700}]},
            {id: "climate", label: "Klima aktiv", items: [{id: "climate", title: "Wohnzimmer Thermostat", description: "Heizt", category: "climate", state: "heat", durationSeconds: 900}]},
            {id: "powered", label: "Eingeschaltet", items: [{id: "light", title: "Wohnzimmerlicht", description: "Licht ist eingeschaltet", category: "powered", state: "on", durationSeconds: 300}]},
            {id: "media", label: "Medien", items: [{id: "media", title: "Wohnzimmer Audio", description: "Wiedergabe", category: "media", state: "playing", durationSeconds: 180}]}
        ],
        items: [], meta: systemMeta()
    };
}

function issue(title, entityId, severity, stateValue, automation) {
    return {id: "issue-" + entityId.replace(".", "-"), title: title, entityId: entityId, severity: severity, state: stateValue, durationSeconds: 3600, securityRelevant: severity === "critical", riskClass: severity === "critical" ? "safety" : "normal", description: "Die Entity ist derzeit nicht verfügbar.", affectedAutomations: automation ? [automation] : [], affectedAutomationCount: automation ? 1 : 0};
}

function errorsPayload() {
    const automation = {entityId: "automation.demo_luftung", name: "Lüftung bei offenem Fenster", state: "on", available: true, disabled: false, confidence: "direct", reasons: ["entity"], lastTriggered: "2026-09-13T09:45:00.000Z"};
    const critical = issue("Rauchmelder Obergeschoss", "binary_sensor.demo_rauchmelder", "critical", "unavailable", automation);
    const warning = issue("Fenstersensor Batterie", "sensor.demo_fenster_batterie", "warning", "unknown", null);
    return {
        overallStatus: "critical", message: "2 aktive Störungen erkannt.",
        summary: {total: 2, critical: 1, error: 0, warning: 1, info: 0, unavailable: 1, unknown: 1, flapping: 1, recoveryPending: 0},
        filters: {severity: {all: 2, critical: 1, error: 0, warning: 1, info: 0}, state: {all: 2, unavailable: 1, unknown: 1}},
        groups: [
            {id: "device-smoke", type: "device", deviceId: "device-smoke", title: "Rauchmelder", areaName: "Obergeschoss", integration: "Demo Integration", severity: "critical", securityRelevant: true, riskClass: "safety", issueCount: 1, durationSeconds: 3600, counts: {critical: 1, error: 0, warning: 0, info: 0, unavailable: 1, unknown: 0, flapping: 0, recoveryPending: 0}, unavailableCount: 1, unknownCount: 0, flappingCount: 0, recoveryPendingCount: 0, affectedAutomations: [automation], affectedAutomationCount: 1, issues: [critical]},
            {id: "device-window", type: "device", deviceId: "device-window", title: "Fenstersensor", areaName: "Wohnzimmer", integration: "Demo Integration", severity: "warning", securityRelevant: false, riskClass: "diagnostic", issueCount: 1, durationSeconds: 3600, counts: {critical: 0, error: 0, warning: 1, info: 0, unavailable: 0, unknown: 1, flapping: 1, recoveryPending: 0}, unavailableCount: 0, unknownCount: 1, flappingCount: 1, recoveryPendingCount: 0, affectedAutomations: [], affectedAutomationCount: 0, issues: [warning]}
        ],
        automationAnalysis: {inventoryCount: 3, dynamicCount: 1, unknownImpacts: [{entityId: "automation.demo_dynamic", name: "Dynamische Demo-Automation", state: "on", available: true, disabled: false, confidence: "unknown"}], configStatus: "available"},
        sources: {entityRegistry: {status: "available"}, repairs: {status: "available"}},
        meta: systemMeta()
    };
}

function systemMeta() {
    return {home_assistant: {reachable: true}, stale: false, collected_at: "2026-09-13T10:30:00.000Z", last_successful_at: "2026-09-13T10:30:00.000Z"};
}

function json(response, payload) {
    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"});
    response.end(JSON.stringify(payload));
}

function contentType(fileName) {
    return ({".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png"})[path.extname(fileName)] || "application/octet-stream";
}

function injectedHtml(fileName, url) {
    let html = fs.readFileSync(fileName, "utf8");
    const query = new URL(url, "http://127.0.0.1").searchParams;
    let early = "";
    let late = "";
    const scrollScript = function (selector) {
        return "<script>(function waitForCaptureTarget(){var e=document.querySelector('" +
            selector + "');if(!e){setTimeout(waitForCaptureTarget,100);return;}" +
            "setTimeout(function(){window.scrollTo(0,e.getBoundingClientRect().top+" +
            "(window.pageYOffset||document.documentElement.scrollTop||0)-110);},500);}());</script>";
    };

    if (query.get("theme") === "dark") {
        early += "<script>try{localStorage.setItem('ha-legacy-theme','dark');}catch(e){}</script>";
    }
    if (fileName.indexOf(path.join("src", "admin")) !== -1) {
        early += "<script>try{sessionStorage.setItem('ha-legacy-dashboard-admin-token','" + ADMIN_TOKEN + "');}catch(e){}</script>";
        if (query.get("view") === "rules") {
            late += "<script>setTimeout(function(){document.getElementById('openEntityRulesButton').click();},1200);</script>";
        } else if (query.get("view") === "room") {
            late += "<script>setTimeout(function(){var b=document.querySelector('[data-action=widget-edit][data-id=room-living]');if(b){b.click();}},1200);</script>";
        } else if (query.get("view") === "preview") {
            late += "<script>setTimeout(function(){var landscape=document.querySelector('[data-action=layout-profile][data-id=landscape]');if(landscape){landscape.click();}setTimeout(function(){var dark=document.querySelector('[data-action=preview-theme][data-id=dark]');if(dark){dark.click();}},250);},1200);</script>";
        } else if (query.get("view") === "layout") {
            late += scrollScript(".layout-section");
        } else if (query.get("view") === "sections") {
            late += scrollScript(".dashboard-sections-editor");
        } else if (query.get("view") === "system") {
            late += scrollScript(".diagnostic-sources");
        }
    } else if (query.get("view") === "focus") {
        late += "<script>setTimeout(function(){var c=document.querySelector('[data-widget-id=climate-bedroom]');if(c){c.click();}},1200);</script>";
    } else if (query.get("view") === "room") {
        late += "<script>setTimeout(function(){var b=document.querySelector('[data-room-widget=room-living]');if(b&&b.getAttribute('aria-expanded')!=='true'){b.click();}},1200);</script>";
    } else if (query.get("view") === "diagnostics") {
        late += "<script>setTimeout(function(){var b=document.getElementById('advancedDiagnosticsToggle');if(b){b.click();}var d=document.querySelector('.error-details-toggle');if(d){d.click();}setTimeout(function(){var i=document.querySelector('.automation-impact-toggle');if(i){i.click();}},300);},1200);</script>";
    }
    html = html.replace("<head>", "<head>" + early);
    html = html.replace("</body>", late + "</body>");
    return html;
}

function server() {
    return http.createServer(function (request, response) {
        const parsed = new URL(request.url, "http://127.0.0.1");
        const pathname = parsed.pathname;
        let fileName = null;
        let dashboardId = "default";

        if (pathname === "/api/dashboard/config") { return json(response, dashboardConfiguration("default")); }
        if (pathname === "/api/dashboard") { return json(response, dashboardState()); }
        if (/^\/api\/dashboards\/[^/]+\/config$/.test(pathname)) {
            dashboardId = pathname.split("/")[3];
            return json(response, dashboardConfiguration(dashboardId));
        }
        if (/^\/api\/dashboards\/[^/]+\/state$/.test(pathname)) { return json(response, dashboardState()); }
        if (pathname === "/api/system-dashboards/status") { return json(response, {status: "online", cache_ttl_ms: 3000, errors: {overallStatus: "warning", summary: {total: 1, warning: 1}}, meta: systemMeta()}); }
        if (pathname === "/api/system-dashboards/summary") { return json(response, summaryPayload()); }
        if (pathname === "/api/system-dashboards/errors") { return json(response, errorsPayload()); }
        if (pathname === "/api/system-dashboards/errors/automation-traces") { return json(response, {source: {status: "available"}, automations: [{entityId: "automation.demo_luftung", errorCount: 0, summaries: [{runId: "demo-run", state: "finished", startedAt: "2026-09-13T09:45:00.000Z", error: null}]}]}); }
        if (pathname === "/api/admin/config") {
            return json(response, adminConfiguration(String(request.headers.referer || "").indexOf("view=background") !== -1));
        }
        if (pathname === "/api/admin/entities") { return json(response, {entities: entities(), areas: [{id: "living-room", name: "Wohnzimmer"}, {id: "upper-floor", name: "Obergeschoss"}]}); }
        if (pathname === "/api/admin/preview") { return json(response, {entities: entities().map(function (entity) { return Object.assign({}, entity, {state: entity.domain === "light" ? "on" : entity.domain === "climate" ? "heat" : "21.7", current_temperature: entity.domain === "climate" ? 21.7 : null, target_temperature: entity.domain === "climate" ? 22 : null, minimum_temperature: entity.domain === "climate" ? 5 : null, maximum_temperature: entity.domain === "climate" ? 30 : null, target_temperature_step: entity.domain === "climate" ? 0.5 : null, supported_features: entity.domain === "climate" ? 1 : null, hvac_modes: entity.domain === "climate" ? ["off", "heat", "auto"] : []}); }), fetched_at: "2026-09-13T10:30:00.000Z"}); }
        if (pathname === "/api/admin/labels") { return json(response, {labels: [{id: "critical", name: "Kritisch"}], source: {status: "available"}}); }
        if (pathname === "/api/admin/system-diagnostics/status") {
            return json(response, {sources: {entityRegistry: {status: "available"}, deviceRegistry: {status: "available"}, areaRegistry: {status: "available"}, labelRegistry: {status: "available"}, configEntries: {status: "available"}, repairs: {status: "available"}, matter: {status: "unsupported"}, automationInventory: {status: "available"}, automationConfig: {status: "available"}, automationTrace: {status: "available"}}});
        }
        if (pathname === "/assets/backgrounds/" + BACKGROUND_ID) {
            fileName = path.join(ROOT, "ha_legacy_dashboard", "icon.png");
        } else if (pathname === "/" || /^\/d\/[^/]+\/?$/.test(pathname)) {
            fileName = path.join(ROOT, "src", "public", "index.html");
        } else if (pathname === "/system/summary" || pathname === "/system/errors") {
            fileName = path.join(ROOT, "src", "public", "system.html");
        } else if (pathname === "/admin" || pathname === "/admin/") {
            fileName = path.join(ROOT, "src", "admin", "index.html");
        } else if (pathname.indexOf("/admin/") === 0) {
            fileName = path.join(ROOT, "src", pathname);
        } else {
            fileName = path.join(ROOT, "src", "public", pathname);
        }

        if (!fileName || fileName.indexOf(ROOT + path.sep) !== 0 || !fs.existsSync(fileName) || fs.statSync(fileName).isDirectory()) {
            response.writeHead(404); response.end("Not found"); return;
        }
        if (path.extname(fileName) === ".html") {
            const body = injectedHtml(fileName, request.url);
            response.writeHead(200, {"Content-Type": contentType(fileName), "Cache-Control": "no-store"});
            response.end(body);
            return;
        }
        response.writeHead(200, {"Content-Type": contentType(fileName), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"});
        fs.createReadStream(fileName).pipe(response);
    });
}

function capture(executable, url, destination, width, height, profileDirectory) {
    return new Promise(function (resolve, reject) {
        const child = childProcess.spawn(executable, [
            "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
            "--disable-background-networking", "--disable-component-update", "--no-first-run",
            "--user-data-dir=" + profileDirectory,
            "--window-size=" + width + "," + height,
            "--force-device-scale-factor=1", "--virtual-time-budget=4500",
            "--screenshot=" + destination, url
        ], {stdio: ["ignore", "ignore", "pipe"]});
        let errorText = "";
        child.stderr.on("data", function (chunk) { errorText += chunk.toString("utf8"); });
        child.on("error", reject);
        child.on("close", function (code) {
            if (code !== 0 || !fs.existsSync(destination)) {
                reject(new Error("Screenshot fehlgeschlagen: " + errorText.slice(-1200)));
                return;
            }
            resolve();
        });
    });
}

async function main() {
    const executable = browserPath();
    const localServer = server();
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "ha-legacy-doc-shots-"));
    const jobs = [
        ["/", "dashboards/main-light.png", 1280, 720],
        ["/?theme=dark", "dashboards/main-dark.png", 1280, 720],
        ["/d/compact", "dashboards/compact-cards.png", 1024, 768],
        ["/d/focus?theme=dark&view=focus", "dashboards/focus-card.png", 768, 1024],
        ["/d/background", "dashboards/background-image.png", 768, 1024],
        ["/?view=room", "dashboards/sections-room-card.png", 1024, 1024],
        ["/admin/", "admin/dashboard-management.png", 1440, 1000],
        ["/admin/?view=background", "admin/dashboard-background.png", 1440, 1000],
        ["/admin/", "admin/sections.png", 1440, 1400],
        ["/admin/", "admin/layout-editor.png", 1440, 2500],
        ["/admin/?view=preview", "admin/live-preview.png", 1440, 2500],
        ["/admin/?view=room", "admin/room-card-editor.png", 1440, 1000],
        ["/admin/?view=rules", "admin/entity-rules.png", 1440, 1000],
        ["/admin/", "admin/system-diagnostics.png", 1280, 1700],
        ["/system/summary", "system/summary.png", 1280, 720],
        ["/system/errors?theme=dark", "system/errors.png", 1280, 720],
        ["/system/errors?theme=dark&view=diagnostics", "system/errors-automation-impact.png", 1280, 900]
    ];
    let address;
    let index;

    if (!executable) { throw new Error("Kein Chromium-basierter Browser gefunden; CHROME_BIN setzen"); }
    await new Promise(function (resolve, reject) { localServer.once("error", reject); localServer.listen(0, "127.0.0.1", resolve); });
    address = localServer.address();
    try {
        for (index = 0; index < jobs.length; index += 1) {
            fs.mkdirSync(path.dirname(path.join(OUTPUT, jobs[index][1])), {recursive: true});
            await capture(executable, "http://127.0.0.1:" + address.port + jobs[index][0], path.join(OUTPUT, jobs[index][1]), jobs[index][2], jobs[index][3], path.join(temporaryDirectory, "profile-" + index));
        }
        process.stdout.write("Documentation screenshots captured: " + jobs.length + " PNG files.\n");
    } finally {
        await new Promise(function (resolve) { localServer.close(resolve); });
        fs.rmSync(temporaryDirectory, {recursive: true, force: true});
    }
}

main().catch(function (error) { process.stderr.write(error.message + "\n"); process.exitCode = 1; });
