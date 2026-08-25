const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const DashboardConfig = require("../src/config/dashboard");
const HomeAssistant = require("../src/services/homeassistant");
const HomeAssistantWebSocket = require("../src/services/homeassistant-websocket");
const Runtime = require("../src/config/runtime");

const ROOT = path.join(__dirname, "..");
const APP_PATH = path.join(ROOT, "ha_legacy_dashboard");
const TEST_SUPERVISOR_TOKEN = "test-token";


function readProjectFile(fileName) {
    return fs.readFileSync(
        path.join(ROOT, fileName),
        "utf8"
    );
}


function createFakeWebSocketClass() {

    function FakeWebSocket(url) {
        this.url = url;
        this.listeners = {};
        this.sent = [];
        FakeWebSocket.instances.push(this);
    }

    FakeWebSocket.instances = [];

    FakeWebSocket.prototype.addEventListener =
        function (name, handler) {
            this.listeners[name] = handler;
        };

    FakeWebSocket.prototype.send = function (payload) {
        this.sent.push(JSON.parse(payload));
    };

    FakeWebSocket.prototype.emitMessage =
        function (message) {
            this.listeners.message({
                data: JSON.stringify(message)
            });
        };

    FakeWebSocket.prototype.close = function () {
        if (this.listeners.close) {
            this.listeners.close({});
        }
    };

    return FakeWebSocket;
}


function getFreePort() {
    return new Promise(function (resolve, reject) {
        const server = net.createServer();

        server.once("error", reject);
        server.listen(0, "127.0.0.1", function () {
            const port = server.address().port;
            server.close(function () {
                resolve(port);
            });
        });
    });
}


function getJson(port, requestPath) {
    return new Promise(function (resolve, reject) {
        const request = http.get({
            host: "127.0.0.1",
            port: port,
            path: requestPath
        }, function (response) {
            let body = "";

            response.setEncoding("utf8");
            response.on("data", function (chunk) {
                body += chunk;
            });
            response.on("end", function () {
                resolve({
                    status: response.statusCode,
                    json: JSON.parse(body)
                });
            });
        });

        request.once("error", reject);
    });
}


test("Runtime-Verbindung trennt Standalone und Home Assistant App", function () {

    const standalone =
        Runtime.resolveHomeAssistantConnection({
            environment: {
                HA_RUNTIME_MODE: "standalone",
                HA_URL: "https://ha.example.test/",
                HA_TOKEN: "fake-standalone-token"
            }
        });

    assert.deepEqual(standalone, {
        mode: "standalone",
        restBaseUrl: "https://ha.example.test/api",
        websocketUrl:
            "wss://ha.example.test/api/websocket",
        token: "fake-standalone-token"
    });

    const app = Runtime.resolveHomeAssistantConnection({
        environment: {
            HA_RUNTIME_MODE: "home_assistant_app",
            SUPERVISOR_TOKEN: TEST_SUPERVISOR_TOKEN
        }
    });

    assert.deepEqual(app, {
        mode: "home_assistant_app",
        restBaseUrl: "http://supervisor/core/api",
        websocketUrl:
            "ws://supervisor/core/websocket",
        token: TEST_SUPERVISOR_TOKEN
    });

    assert.equal(
        Runtime.detectRuntimeMode({
            SUPERVISOR_TOKEN: TEST_SUPERVISOR_TOKEN
        }),
        "home_assistant_app"
    );

    assert.doesNotThrow(function () {
        Runtime.resolveHomeAssistantConnection({
            environment: {
                HA_RUNTIME_MODE:
                    "home_assistant_app",
                SUPERVISOR_TOKEN:
                    TEST_SUPERVISOR_TOKEN
            }
        });
    });

    assert.throws(function () {
        Runtime.resolveHomeAssistantConnection({
            environment: {
                HA_RUNTIME_MODE:
                    "home_assistant_app"
            }
        });
    }, /Supervisor-Zugriff/);
});


test("App-Modus sammelt REST-States über einen lokalen Supervisor-Mock", async function (t) {

    const requests = [];
    const mockServer = http.createServer(
        function (request, response) {
            requests.push({
                method: request.method,
                path: request.url,
                authorization:
                    request.headers.authorization
            });

            response.setHeader(
                "Content-Type",
                "application/json"
            );
            response.end(JSON.stringify([{
                entity_id: "sensor.mock",
                state: "23",
                attributes: {}
            }]));
        }
    );

    await new Promise(function (resolve, reject) {
        mockServer.once("error", reject);
        mockServer.listen(0, "127.0.0.1", resolve);
    });

    t.after(function () {
        return new Promise(function (resolve) {
            mockServer.close(resolve);
        });
    });

    const port = mockServer.address().port;
    const connection =
        Runtime.resolveHomeAssistantConnection({
            environment: {
                HA_RUNTIME_MODE:
                    "home_assistant_app",
                SUPERVISOR_TOKEN:
                    TEST_SUPERVISOR_TOKEN
            },
            supervisorRestUrl:
                "http://127.0.0.1:" +
                port +
                "/core/api"
        });

    const service = HomeAssistant.createService({
        connection: connection
    });

    const entities = await service.getAllEntities();

    assert.equal(entities[0].entity_id, "sensor.mock");
    assert.deepEqual(requests, [{
        method: "GET",
        path: "/core/api/states",
        authorization:
            "Bearer " + TEST_SUPERVISOR_TOKEN
    }]);
});


test("App-WebSocket nutzt Proxy, authentifiziert und liefert Registry-Metadaten", async function () {

    const FakeWebSocket =
        createFakeWebSocketClass();

    const connection =
        Runtime.resolveHomeAssistantConnection({
            environment: {
                HA_RUNTIME_MODE:
                    "home_assistant_app",
                SUPERVISOR_TOKEN:
                    TEST_SUPERVISOR_TOKEN
            }
        });

    const client =
        HomeAssistantWebSocket.createClient({
            connection: connection,
            WebSocketImplementation:
                FakeWebSocket,
            logger: {
                error: function () {},
                info: function () {},
                warn: function () {}
            },
            connectTimeoutMs: 1000,
            requestTimeoutMs: 1000
        });

    const result = client.request({
        type: "config/entity_registry/list"
    });
    const socket = FakeWebSocket.instances[0];

    assert.equal(
        socket.url,
        "ws://supervisor/core/websocket"
    );

    socket.emitMessage({type: "auth_required"});
    assert.deepEqual(socket.sent[0], {
        type: "auth",
        access_token: TEST_SUPERVISOR_TOKEN
    });

    socket.emitMessage({type: "auth_ok"});

    await new Promise(function (resolve) {
        setImmediate(resolve);
    });

    assert.equal(
        socket.sent[1].type,
        "config/entity_registry/list"
    );

    socket.emitMessage({
        id: socket.sent[1].id,
        type: "result",
        success: true,
        result: [{
            entity_id: "sensor.mock",
            device_id: "device-mock"
        }]
    });

    assert.deepEqual(await result, [{
        entity_id: "sensor.mock",
        device_id: "device-mock"
    }]);

    client.close();
});


test("App-Prozess startet ohne HA_TOKEN, bleibt bei HA-Ausfall healthy und beendet SIGTERM sauber", async function (t) {

    const port = await getFreePort();
    const temporaryDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-app-process-test-")
    );
    const environment = Object.assign(
        {},
        process.env,
        {
            HA_RUNTIME_MODE:
                "home_assistant_app",
            SUPERVISOR_TOKEN:
                TEST_SUPERVISOR_TOKEN,
            DASHBOARD_CONFIG_PATH:
                path.join(
                    temporaryDirectory,
                    "dashboards.json"
                ),
            BIND_ADDRESS: "127.0.0.1",
            PORT: String(port),
            NODE_ENV: "test"
        }
    );

    delete environment.HA_TOKEN;
    delete environment.HA_URL;

    const child = childProcess.spawn(
        process.execPath,
        [path.join(ROOT, "src", "server.js")],
        {
            cwd: temporaryDirectory,
            env: environment,
            stdio: ["ignore", "pipe", "pipe"]
        }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", function (chunk) {
        stdout += chunk.toString();
    });
    child.stderr.on("data", function (chunk) {
        stderr += chunk.toString();
    });

    t.after(function () {
        if (child.exitCode === null) {
            child.kill("SIGKILL");
        }
        fs.rmSync(temporaryDirectory, {
            recursive: true,
            force: true
        });
    });

    await new Promise(function (resolve, reject) {
        const timeout = setTimeout(function () {
            reject(new Error(
                "App-Prozess ist nicht gestartet: " +
                stderr
            ));
        }, 5000);

        child.stdout.on("data", function () {
            if (stdout.indexOf("server_started") !== -1) {
                clearTimeout(timeout);
                resolve();
            }
        });
        child.once("exit", function (code) {
            clearTimeout(timeout);
            reject(new Error(
                "App-Prozess endete vorzeitig mit " +
                code +
                ": " +
                stderr
            ));
        });
    });

    const health = await getJson(port, "/health");

    assert.equal(health.status, 200);
    assert.deepEqual(health.json, {status: "ok"});
    assert.match(stdout, /"runtime_mode":"home_assistant_app"/);
    assert.equal(stdout.indexOf(TEST_SUPERVISOR_TOKEN), -1);
    assert.equal(stderr.indexOf(TEST_SUPERVISOR_TOKEN), -1);

    const exitCode = await new Promise(function (resolve) {
        child.once("exit", function (code) {
            resolve(code);
        });
        child.kill("SIGTERM");
    });

    assert.equal(exitCode, 0);
    assert.match(stdout, /"event":"server_stopped"/);
});


test("App-Metadaten sind minimal, direkt erreichbar und multi-arch vorbereitet", function () {

    const config = readProjectFile(
        "ha_legacy_dashboard/config.yaml"
    );
    const packageConfiguration = JSON.parse(
        readProjectFile("package.json")
    );

    assert.match(config, /^name: HA Legacy Dashboard$/m);
    assert.match(config, /^slug: ha_legacy_dashboard$/m);
    assert.match(
        config,
        new RegExp(
            '^version: "' +
            packageConfiguration.version
                .replace(/\./g, "\\.") +
            '"$',
            "m"
        )
    );
    assert.match(config, /^  - amd64$/m);
    assert.match(config, /^  - aarch64$/m);
    assert.match(config, /^homeassistant_api: true$/m);
    assert.match(config, /^apparmor: true$/m);
    assert.match(config, /^  "3000\/tcp": 3000$/m);
    assert.match(
        config,
        /^webui: http:\/\/\[HOST\]:\[PORT:3000\]\/$/m
    );
    assert.match(config, /^stage: experimental$/m);
    assert.match(
        config,
        /^image: "ghcr\.io\/tekky85\/ha-legacy-dashboard"$/m
    );
    assert.match(config, /^backup: cold$/m);
    assert.match(
        config,
        /^watchdog: .*\/health$/m
    );

    [
        "hassio_api",
        "hassio_role",
        "docker_api",
        "full_access",
        "host_network",
        "host_pid",
        "host_dbus",
        "privileged",
        "homeassistant_config",
        "ingress:"
    ].forEach(function (forbidden) {
        assert.equal(
            config.indexOf(forbidden),
            -1,
            "Unerwartete App-Berechtigung: " +
                forbidden
        );
    });

    assert.doesNotMatch(config, /HA_TOKEN/);
    assert.equal(
        fs.existsSync(
            path.join(APP_PATH, "build.yaml")
        ),
        false
    );

    const repository =
        readProjectFile("repository.yaml");
    assert.match(repository, /^name:/m);
    assert.match(repository, /^url: https:\/\//m);
    assert.match(repository, /^maintainer:/m);
});


test("App-Image und Startup Wrapper schließen Secrets und unnötige Artefakte aus", function () {

    const dockerfile = readProjectFile(
        "ha_legacy_dashboard/Dockerfile"
    );
    const dockerignore = readProjectFile(
        "ha_legacy_dashboard/.dockerignore"
    );
    const startup = readProjectFile(
        "ha_legacy_dashboard/run.sh"
    );

    assert.match(dockerfile, /npm ci --omit=dev/);
    assert.match(dockerfile, /io\.hass\.type="app"/);
    assert.match(dockerfile, /HEALTHCHECK[\s\S]*\/health/);
    assert.match(dockerfile, /STOPSIGNAL SIGTERM/);
    assert.match(startup, /exec node \/app\/src\/server\.js/);
    assert.match(startup, /DASHBOARD_CONFIG_PATH=\/data\/dashboards\.json/);
    assert.doesNotMatch(
        startup,
        /echo[^\n]*\$(?:admin_token|SUPERVISOR_TOKEN|ADMIN_TOKEN)/i
    );
    assert.match(dockerignore, /^\.env\.\*$/m);
    assert.match(dockerignore, /^test$/m);
    assert.match(dockerignore, /^docs$/m);
    assert.doesNotMatch(
        dockerfile,
        /COPY\s+\.\s+\./
    );
});


test("App-Datenpfad persistiert die vollständige bestehende Konfiguration", function (t) {

    assert.equal(
        Runtime.resolveDataDirectory({
            HA_RUNTIME_MODE: "home_assistant_app"
        }),
        "/data"
    );

    const temporaryDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-app-data-test-")
    );
    const configPath = path.join(
        temporaryDirectory,
        "dashboards.json"
    );

    t.after(function () {
        fs.rmSync(temporaryDirectory, {
            recursive: true,
            force: true
        });
    });

    DashboardConfig.initialize({
        configPath: configPath
    });

    const updated =
        DashboardConfig.getConfiguration();
    updated.systemDashboards.summary
        .ignoredEntities = ["sensor.mock"];
    updated.systemDashboards.errors
        .securityEntities = ["binary_sensor.mock"];
    updated.systemDashboards.errors
        .criticalDetectionMode = "ha_label";
    updated.systemDashboards.errors
        .criticalLabelId = "critical";
    updated.systemDashboards.errors.rules.defaults
        .unknownGraceMs = 1234;

    DashboardConfig.replaceConfiguration(updated);
    DashboardConfig.initialize({
        configPath: configPath
    });

    const reloaded =
        DashboardConfig.getConfiguration();

    assert.deepEqual(
        reloaded.systemDashboards.summary
            .ignoredEntities,
        ["sensor.mock"]
    );
    assert.deepEqual(
        reloaded.systemDashboards.errors
            .securityEntities,
        ["binary_sensor.mock"]
    );
    assert.equal(
        reloaded.systemDashboards.errors
            .criticalDetectionMode,
        "ha_label"
    );
    assert.equal(
        reloaded.systemDashboards.errors
            .rules.defaults.unknownGraceMs,
        1234
    );

    assert.match(
        readProjectFile("src/public/js/core/theme.js"),
        /localStorage/
    );
});


test("Weder Wall-Display noch Admin-Frontend kennen Supervisor-Zugangsdaten", function () {

    const frontendRoots = [
        path.join(ROOT, "src", "public"),
        path.join(ROOT, "src", "admin")
    ];

    frontendRoots.forEach(function (frontendRoot) {
        fs.readdirSync(frontendRoot, {
            recursive: true,
            withFileTypes: true
        }).forEach(function (entry) {
            if (!entry.isFile()) {
                return;
            }

            const filePath = path.join(
                entry.parentPath,
                entry.name
            );
            const content = fs.readFileSync(
                filePath,
                "utf8"
            );

            assert.doesNotMatch(
                content,
                /SUPERVISOR_TOKEN|supervisor\/core\/|\/api\/websocket/
            );
        });
    });
});


test("App-Paket enthält keine zweite Quellcodekopie", function () {
    assert.equal(
        fs.existsSync(path.join(APP_PATH, "src")),
        false
    );
    assert.equal(
        fs.statSync(
            path.join(APP_PATH, "run.sh")
        ).mode & 0o111,
        0o111
    );
});
