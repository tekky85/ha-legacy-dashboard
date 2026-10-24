"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const cp = require("node:child_process");
const zlib = require("node:zlib");
const Config = require("../src/config/dashboard");
const Layout = require("../src/services/layout");
const Limits = require("../src/config/request-limits");
const Jpeg = require("./fixtures/jpeg-samples");
const ROOT = path.join(__dirname, "..");
const ADMIN = "fake-body-limit-admin";
const HA = "fake-body-limit-ha";

function sensor(index) {
    return {id: "sensor-" + index, entity: "sensor.demo_" + index, type: "sensor",
        title: "Synthetic temperature " + index, subtitle: "Local regression fixture",
        icon: "temperature", iconClass: "temperature", unit: "°C", order: index,
        visible: true, sectionId: null, size: "compact",
        control: {enabled: false, preferredOnMode: null}};
}
function configuration(widgetCount, roomEntities) {
    const config = Config.cloneConfiguration(Config.DEFAULT_CONFIGURATION);
    const dashboard = config.dashboards[0];
    dashboard.widgets = Array.from({length: widgetCount}, (_, index) => sensor(index));
    if (roomEntities) {
        const entities = {};
        Config.ROOM_SINGLE_ENTITY_FIELDS.forEach(field => { entities[field] = null; });
        Config.ROOM_ENTITY_LIST_FIELDS.forEach(field => { entities[field] = []; });
        entities.secondary = Array.from({length: roomEntities}, (_, index) => "sensor.room_" + index);
        dashboard.widgets = [Object.assign(sensor(0), {id: "room-card", entity: "", type: "room", size: "large",
            room: {areaId: null, collapsible: true, defaultExpanded: false, background: null, entities}})];
    }
    dashboard.layouts = Layout.createLayouts(dashboard.widgets);
    Config.validateConfiguration(config);
    return config;
}
function request(port, method, route, body, headers = {}) {
    const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
    return new Promise((resolve, reject) => {
        const req = http.request({host: "127.0.0.1", port, method, path: route,
            headers: Object.assign({"Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload || "")}, headers)}, res => {
            let text = ""; res.setEncoding("utf8"); res.on("data", chunk => { text += chunk; });
            res.on("end", () => resolve({status: res.statusCode, headers: res.headers, json: text ? JSON.parse(text) : null}));
        });
        req.once("error", reject); req.end(payload);
    });
}
async function freePort() {
    const server = http.createServer();
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    await new Promise(resolve => server.close(resolve)); return port;
}
async function start(t, settings = {}) {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), "ha-admin-body-"));
    const port = await freePort();
    let output = "", haCalls = 0;
    const mock = http.createServer((req, res) => { haCalls++; res.setHeader("Content-Type", "application/json"); res.end("[]"); });
    await new Promise(resolve => mock.listen(0, "127.0.0.1", resolve));
    const env = Object.assign({}, process.env, {HA_RUNTIME_MODE: "standalone", SUPERVISOR_TOKEN: "",
        HA_URL: "http://127.0.0.1:" + mock.address().port, HA_TOKEN: HA,
        ADMIN_API_ENABLED: "true", ADMIN_TOKEN: ADMIN, ADMIN_CONFIG_MAX_BYTES: "",
        DASHBOARD_CONFIG_PATH: path.join(folder, "dashboards.json"), DATA_DIR: folder,
        BIND_ADDRESS: "127.0.0.1", PORT: String(port), NODE_ENV: "test"}, settings);
    // Empty temporary cwd: dotenv cannot load a production .env.
    const child = cp.spawn(process.execPath, [path.join(ROOT, "src/server.js")], {cwd: folder, env, stdio: ["ignore", "pipe", "pipe"]});
    child.stdout.on("data", chunk => { output += chunk; }); child.stderr.on("data", chunk => { output += chunk; });
    async function stop() {
        if (child.exitCode !== null || child.signalCode !== null) return;
        await new Promise(resolve => {
            const timer = setTimeout(() => child.kill("SIGKILL"), 2000);
            child.once("exit", () => { clearTimeout(timer); resolve(); }); child.kill("SIGTERM");
        });
    }
    t.after(async () => { await stop(); await new Promise(resolve => mock.close(resolve)); fs.rmSync(folder, {recursive: true, force: true}); });
    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Gateway startup: " + output)), 5000);
        const ready = () => { if (output.includes('"server_started"')) { clearTimeout(timer); resolve(); } };
        child.stdout.on("data", ready); ready();
        child.once("exit", () => { clearTimeout(timer); reject(new Error("Gateway exited: " + output)); });
    });
    return {port, folder, stop, get calls() { return haCalls; }, get logs() { return output; },
        request(method, route, body, headers) { return request(port, method, route, body, Object.assign({Authorization: "Bearer " + ADMIN}, headers)); }};
}

test("Admin JSON size defaults to 1 MiB; validated setting remains bounded, never unlimited", () => {
    assert.equal(Limits.resolveAdminConfigMaxBytes({}), 1048576);
    for (const value of ["16384", "2097152", "16777216"]) assert.equal(Limits.resolveAdminConfigMaxBytes({ADMIN_CONFIG_MAX_BYTES: value}), Number(value));
    for (const value of ["0", "16383", "16777217", "1mb", "-1", "NaN", "Infinity", "1.5", " 65536 ", {}, true]) {
        assert.throws(() => Limits.resolveAdminConfigMaxBytes({ADMIN_CONFIG_MAX_BYTES: value}), /ADMIN_CONFIG_MAX_BYTES/);
    }
});
test("Issue #5: >20 cards/full config over 16 KiB saves atomically and survives restart", async t => {
    const app = await start(t), config = configuration(60);
    assert.ok(Buffer.byteLength(JSON.stringify(config)) > 16384);
    const oldFile = fs.readFileSync(path.join(app.folder, "dashboards.json"), "utf8");
    const saved = await app.request("PUT", "/api/admin/config", config);
    assert.equal(saved.status, 200); assert.equal(saved.json.dashboards[0].widgets.length, 60);
    assert.equal(fs.readFileSync(path.join(app.folder, "dashboards.json.bak"), "utf8"), oldFile);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(app.folder, "dashboards.json"))), saved.json);
    await app.stop();
    const restarted = await start(t, {DASHBOARD_CONFIG_PATH: path.join(app.folder, "dashboards.json")});
    const loaded = await restarted.request("GET", "/api/admin/config");
    assert.deepEqual(loaded.json, saved.json); assert.equal(app.calls + restarted.calls, 0);
});
test("Issue #5: one Room Card with 21 and 64 entities and padded full config is not count-limited", async t => {
    const app = await start(t);
    for (const count of [20, 21, 64]) {
        const config = configuration(0, count);
        // Extra whitespace represents bytes in the whole batch, not extra entities.
        const payload = JSON.stringify(config) + " ".repeat(20000);
        const response = await app.request("PUT", "/api/admin/config", payload);
        assert.equal(response.status, 200, "Room entity count " + count);
        assert.equal(response.json.dashboards[0].widgets[0].room.entities.secondary.length, count);
    }
});
test("Admin configurable byte boundary (including Unicode), gzip and last-valid preservation", async t => {
    const app = await start(t, {ADMIN_CONFIG_MAX_BYTES: "65536"}), config = configuration(21);
    config.dashboards[0].title = "ÄÖÜ großes Testdashboard";
    const text = JSON.stringify(config), boundary = text + " ".repeat(65536 - Buffer.byteLength(text));
    assert.equal(Buffer.byteLength(boundary), 65536);
    assert.equal((await app.request("PUT", "/API/ADMIN/CONFIG/", boundary)).status, 200);
    const primary = fs.readFileSync(path.join(app.folder, "dashboards.json"));
    const backup = fs.readFileSync(path.join(app.folder, "dashboards.json.bak"));
    for (const [payload, headers] of [[boundary + " ", {}], [zlib.gzipSync(boundary + " "), {"Content-Encoding": "gzip"}], ["{", {}]]) {
        const response = await app.request("PUT", "/api/admin/config", payload, headers);
        assert.equal(response.status, payload === "{" ? 400 : 413);
        if (response.status === 413) assert.match(response.json.message, /65536.*admin_config_max_bytes/);
        assert.deepEqual(fs.readFileSync(path.join(app.folder, "dashboards.json")), primary);
        assert.deepEqual(fs.readFileSync(path.join(app.folder, "dashboards.json.bak")), backup);
    }
    assert.equal(fs.readdirSync(app.folder).some(name => name.endsWith(".tmp")), false);
    assert.doesNotMatch(app.logs, new RegExp(ADMIN + "|" + HA));
});
test("Admin budget can be raised above default; large invalid schema never replaces saved data", async t => {
    const app = await start(t, {ADMIN_CONFIG_MAX_BYTES: "2097152"}), config = configuration(21);
    const oversizedForDefault = JSON.stringify(config) + " ".repeat(1048576);
    assert.equal((await app.request("PUT", "/api/admin/config", oversizedForDefault)).status, 200);
    const saved = fs.readFileSync(path.join(app.folder, "dashboards.json"));
    config.dashboards[0].widgets[0].entity = "../../invalid";
    const invalid = await app.request("PUT", "/api/admin/config", JSON.stringify(config) + " ".repeat(20000));
    assert.equal(invalid.status, 400);
    assert.deepEqual(fs.readFileSync(path.join(app.folder, "dashboards.json")), saved);
    assert.equal(app.calls, 0);
});
test("Default Admin limit rejects over 1 MiB; protected and ordinary writes keep separate limits", async t => {
    const app = await start(t), payload = JSON.stringify(configuration(21)) + " ".repeat(1048576);
    const before = fs.readFileSync(path.join(app.folder, "dashboards.json"));
    assert.equal((await app.request("PUT", "/api/admin/config", payload)).status, 413);
    assert.equal((await app.request("PUT", "/api/admin/config", "{", {Authorization: "Bearer wrong-fake"})).status, 401);
    assert.equal((await app.request("PUT", "/api/admin/config", payload, {Authorization: ""})).status, 401);
    assert.equal((await app.request("POST", "/api/light/state", JSON.stringify({padding: "x".repeat(17000)}))).status, 413);
    assert.equal((await app.request("POST", "/api/climate/temperature", JSON.stringify({padding: "x".repeat(17000)}))).status, 413);
    assert.deepEqual(fs.readFileSync(path.join(app.folder, "dashboards.json")), before);
    assert.equal(app.calls, 0);
});
test("Disabled Admin rejects before JSON parsing and large budget never grants HA writes", async t => {
    const disabled = await start(t, {ADMIN_API_ENABLED: "false"});
    assert.equal((await disabled.request("PUT", "/api/admin/config", "{")).status, 404);
    const app = await start(t), config = configuration(21);
    const response = await app.request("PUT", "/api/admin/config", config);
    assert.equal(response.status, 200);
    const denied = await app.request("POST", "/api/light/state", {entity_id: "light.not_granted", state: "on"});
    assert.equal(denied.status, 403); assert.equal(app.calls, 0);
});
test("Authenticated Admin rate limit still precedes JSON parsing; image upload remains raw", async t => {
    const app = await start(t);
    const dashboardId = Config.DEFAULT_CONFIGURATION.dashboards[0].id;
    const uploaded = await app.request("POST", "/api/admin/dashboards/" + dashboardId + "/background", Jpeg.baseline, {"Content-Type": "image/jpeg"});
    assert.equal(uploaded.status, 201);
    for (let index = 0; index < 9; index++) assert.equal((await app.request("PUT", "/api/admin/config", "{")).status, 400);
    assert.equal((await app.request("PUT", "/api/admin/config", "{")).status, 429);
    assert.equal(app.calls, 0);
});
test("Home Assistant App forwards numeric byte option and old options preserve the default", t => {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), "ha-app-option-"));
    t.after(() => fs.rmSync(folder, {recursive: true, force: true}));
    const config = fs.readFileSync(path.join(ROOT, "ha_legacy_dashboard/config.yaml"), "utf8");
    assert.match(config, /admin_config_max_bytes: 1048576/);
    assert.match(config, /admin_config_max_bytes: int\(16384,16777216\)\?/);
    // Execute the actual option-reading/export shell code; replace only fixed
    // /data paths and final Node launch, not option handling or credentials.
    const shell = fs.readFileSync(path.join(ROOT, "ha_legacy_dashboard/run.sh"), "utf8")
        .replace('OPTIONS_FILE="/data/options.json"', 'OPTIONS_FILE="$APP_TEST_OPTIONS"')
        .replace('mkdir -p /data', 'mkdir -p "$APP_TEST_DATA"')
        .replace('exec node /app/src/server.js', 'exec node -e \'console.log("OPTION:" + (process.env.ADMIN_CONFIG_MAX_BYTES || "default"))\'');
    const script = path.join(folder, "run.sh"), options = path.join(folder, "options.json");
    fs.writeFileSync(script, shell);
    for (const value of [undefined, 1048576, 2097152]) {
        const optionData = {admin_api_enabled: false};
        if (value !== undefined) optionData.admin_config_max_bytes = value;
        fs.writeFileSync(options, JSON.stringify(optionData));
        const output = cp.execFileSync("sh", [script], {encoding: "utf8", env: Object.assign({}, process.env,
            {SUPERVISOR_TOKEN: HA, ADMIN_CONFIG_MAX_BYTES: "88888", APP_TEST_DATA: folder, APP_TEST_OPTIONS: options})});
        assert.match(output, new RegExp("OPTION:" + (value || "default")));
        assert.doesNotMatch(output, new RegExp(HA));
    }
});
