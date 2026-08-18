const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");


const CLIMATE_ENTITY =
    "climate.esszimmer_thermostate";

const LIGHT_ENTITY =
    "light.esszimmer_lampen";

const TEMPERATURE_ENTITY =
    "sensor.badezimmer_smart_indoor_module_temperatur";

const HUMIDITY_ENTITY =
    "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit";

const TEST_TOKEN =
    "local-integration-test-token";


function getFreePort() {

    return new Promise(function (resolve, reject) {

        const server = net.createServer();

        server.on("error", reject);

        server.listen(0, "127.0.0.1", function () {

            const port = server.address().port;

            server.close(function () {
                resolve(port);
            });

        });

    });

}


function request(port, method, requestPath, body, rawBody) {

    return new Promise(function (resolve, reject) {

        let payload = null;

        if (typeof rawBody === "string") {
            payload = rawBody;
        } else if (typeof body !== "undefined") {
            payload = JSON.stringify(body);
        }

        const headers = {};

        if (payload !== null) {
            headers["Content-Type"] = "application/json";
            headers["Content-Length"] = Buffer.byteLength(payload);
        }

        const req = http.request(
            {
                host: "127.0.0.1",
                port: port,
                method: method,
                path: requestPath,
                headers: headers
            },
            function (res) {

                let responseText = "";

                res.setEncoding("utf8");

                res.on("data", function (chunk) {
                    responseText += chunk;
                });

                res.on("end", function () {

                    let json = null;

                    try {
                        json = responseText
                            ? JSON.parse(responseText)
                            : null;
                    } catch (error) {
                        json = null;
                    }

                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        text: responseText,
                        json: json
                    });

                });

            }
        );

        req.on("error", reject);

        if (payload !== null) {
            req.write(payload);
        }

        req.end();

    });

}


function stopChild(child) {

    if (!child || child.exitCode !== null) {
        return Promise.resolve();
    }

    return new Promise(function (resolve) {

        const killTimer = setTimeout(function () {
            if (child.exitCode === null) {
                child.kill("SIGKILL");
            }
        }, 2000);

        killTimer.unref();

        child.once("exit", function () {
            clearTimeout(killTimer);
            resolve();
        });

        child.kill("SIGTERM");

    });

}


test(
    "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant",
    {
        timeout: 30000
    },
    async function (t) {

        const mockPort = await getFreePort();
        const gatewayPort = await getFreePort();

        const temporaryDirectory = fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "ha-legacy-dashboard-test-"
            )
        );

        const mock = {
            authorizationHeaders: [],
            websocketAuthorizationHeaders: [],
            confirmationMode: "immediate",
            climatePowerCalls: [],
            climateState: "heat",
            climateModes: ["off", "heat", "cool"],
            connectionError: false,
            hangEntity: null,
            lightServiceCalls: [],
            lightState: "off",
            missingEntity: null,
            pendingTemperature: null,
            postServiceReads: 0,
            serviceCalls: [],
            serviceError: false,
            serviceIssued: false,
            stateRequests: [],
            systemStateError: false,
            systemStateRequests: 0,
            systemStates: [
                {
                    entity_id: "light.system_test",
                    state: "on",
                    attributes: {
                        friendly_name: "System Test",
                        device_class: "light",
                        access_token: "raw-state-secret",
                        entity_picture: "/api/camera_proxy/private"
                    },
                    last_changed: "2026-08-11T18:00:00Z",
                    last_updated: "2026-08-11T18:00:01Z"
                }
            ],
            targetTemperature: 20
        };

        function resetMock() {
            mock.confirmationMode = "immediate";
            mock.climatePowerCalls = [];
            mock.climateState = "heat";
            mock.climateModes = ["off", "heat", "cool"];
            mock.connectionError = false;
            mock.hangEntity = null;
            mock.lightServiceCalls = [];
            mock.lightState = "off";
            mock.missingEntity = null;
            mock.pendingTemperature = null;
            mock.postServiceReads = 0;
            mock.serviceCalls = [];
            mock.serviceError = false;
            mock.serviceIssued = false;
            mock.stateRequests = [];
            mock.systemStateError = false;
            mock.systemStateRequests = 0;
            mock.targetTemperature = 20;
        }

        const mockServer = http.createServer(function (req, res) {

            let requestBody = "";

            if (req.url === "/api/websocket") {
                mock.websocketAuthorizationHeaders.push(
                    req.headers.authorization
                );
            } else {
                mock.authorizationHeaders.push(
                    req.headers.authorization
                );
            }

            req.on("data", function (chunk) {
                requestBody += chunk;
            });

            req.on("end", function () {

                res.setHeader(
                    "Content-Type",
                    "application/json"
                );

                if (
                    req.method === "GET" &&
                    req.url === "/api/"
                ) {

                    if (mock.connectionError) {
                        res.statusCode = 503;
                        res.end(JSON.stringify({
                            message: "simulated unavailable"
                        }));
                        return;
                    }

                    res.end(JSON.stringify({
                        message: "API running"
                    }));
                    return;

                }

                if (
                    req.method === "POST" &&
                    (
                        req.url ===
                            "/api/services/light/turn_on" ||
                        req.url ===
                            "/api/services/light/turn_off"
                    )
                ) {

                    if (mock.serviceError) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({
                            message: "simulated service error"
                        }));
                        return;
                    }

                    const serviceData =
                        JSON.parse(requestBody || "{}");

                    mock.lightServiceCalls.push({
                        service: req.url.substring(
                            "/api/services/light/".length
                        ),
                        data: serviceData
                    });

                    mock.lightState =
                        req.url.indexOf("turn_on") !== -1
                            ? "on"
                            : "off";

                    res.end("[]");
                    return;

                }

                if (
                    req.method === "POST" &&
                    req.url ===
                        "/api/services/climate/set_hvac_mode"
                ) {

                    if (mock.serviceError) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({
                            message: "simulated service error"
                        }));
                        return;
                    }

                    const serviceData =
                        JSON.parse(requestBody || "{}");

                    mock.climatePowerCalls.push(serviceData);
                    mock.climateState = serviceData.hvac_mode;
                    res.end("[]");
                    return;

                }

                if (
                    req.method === "POST" &&
                    req.url ===
                        "/api/services/climate/set_temperature"
                ) {

                    if (mock.serviceError) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({
                            message: "simulated service error"
                        }));
                        return;
                    }

                    const serviceData =
                        JSON.parse(requestBody || "{}");

                    mock.serviceCalls.push(serviceData);
                    mock.pendingTemperature =
                        serviceData.temperature;
                    mock.postServiceReads = 0;
                    mock.serviceIssued = true;

                    if (
                        mock.confirmationMode ===
                            "immediate"
                    ) {
                        mock.targetTemperature =
                            mock.pendingTemperature;
                    }

                    res.end("[]");
                    return;

                }

                if (
                    req.method === "GET" &&
                    req.url === "/api/states"
                ) {

                    mock.systemStateRequests += 1;

                    if (mock.systemStateError) {
                        res.statusCode = 503;
                        res.end(JSON.stringify({
                            message: "simulated unavailable"
                        }));
                        return;
                    }

                    res.end(JSON.stringify(mock.systemStates));
                    return;

                }

                if (
                    req.method === "GET" &&
                    req.url.indexOf("/api/states/") === 0
                ) {

                    const entityId = decodeURIComponent(
                        req.url.substring(
                            "/api/states/".length
                        )
                    );

                    mock.stateRequests.push(entityId);

                    if (entityId === mock.hangEntity) {
                        return;
                    }

                    if (entityId === mock.missingEntity) {
                        res.statusCode = 404;
                        res.end(JSON.stringify({
                            message: "entity not found"
                        }));
                        return;
                    }

                    if (
                        entityId === CLIMATE_ENTITY &&
                        mock.serviceIssued &&
                        mock.confirmationMode === "delayed"
                    ) {
                        mock.postServiceReads += 1;
                        if (mock.postServiceReads >= 2) {
                            mock.targetTemperature =
                                mock.pendingTemperature;
                        }
                    }

                    const attributes =
                        entityId === CLIMATE_ENTITY
                            ? {
                                current_temperature: 21,
                                temperature:
                                    mock.targetTemperature,
                                min_temp: 10,
                                max_temp: 30,
                                target_temp_step: 0.5,
                                hvac_modes: mock.climateModes
                            }
                            : {};

                    const entityState =
                        entityId === CLIMATE_ENTITY
                            ? mock.climateState
                            : entityId === LIGHT_ENTITY
                                ? mock.lightState
                                : "20";

                    res.end(JSON.stringify({
                        entity_id: entityId,
                        state: entityState,
                        attributes: attributes
                    }));
                    return;

                }

                res.statusCode = 404;
                res.end(JSON.stringify({
                    message: "not found"
                }));

            });

        });

        await new Promise(function (resolve, reject) {
            mockServer.once("error", reject);
            mockServer.listen(
                mockPort,
                "127.0.0.1",
                resolve
            );
        });

        const serverPath = path.join(
            __dirname,
            "..",
            "src",
            "server.js"
        );

        let gateway = null;
        let gatewayErrorOutput = "";
        let gatewayOutput = "";


        function startGateway() {

            gatewayErrorOutput = "";
            gatewayOutput = "";

            gateway = childProcess.spawn(
                process.execPath,
                [serverPath],
                {
                    cwd: temporaryDirectory,
                    env: Object.assign({}, process.env, {
                        HA_TOKEN: TEST_TOKEN,
                        HA_URL:
                            "http://127.0.0.1:" +
                            mockPort,
                        DASHBOARD_CONFIG_PATH:
                            path.join(
                                temporaryDirectory,
                                "dashboards.json"
                            ),
                        NODE_ENV: "test",
                        PORT: String(gatewayPort)
                    }),
                    stdio: ["ignore", "pipe", "pipe"]
                }
            );

            gateway.stderr.on("data", function (chunk) {
                gatewayErrorOutput += chunk.toString();
            });

            return new Promise(function (resolve, reject) {

                const startTimer = setTimeout(function () {
                    reject(new Error(
                        "Gateway-Start fehlgeschlagen: " +
                        gatewayErrorOutput
                    ));
                }, 5000);

                gateway.stdout.on("data", function (chunk) {
                    gatewayOutput += chunk.toString();
                    if (
                        gatewayOutput.indexOf(
                            "server_started"
                        ) !== -1
                    ) {
                        clearTimeout(startTimer);
                        resolve();
                    }
                });

                gateway.once("exit", function (code) {
                    clearTimeout(startTimer);
                    reject(new Error(
                        "Gateway wurde mit " +
                        code +
                        " beendet: " +
                        gatewayErrorOutput
                    ));
                });

            });

        }

        t.after(async function () {
            await stopChild(gateway);
            if (typeof mockServer.closeAllConnections === "function") {
                mockServer.closeAllConnections();
            }
            await new Promise(function (resolve) {
                mockServer.close(resolve);
            });
            fs.rmSync(
                temporaryDirectory,
                {
                    recursive: true,
                    force: true
                }
            );
        });

        await startGateway();
        assert.equal(
            fs.existsSync(
                path.join(
                    temporaryDirectory,
                    ".env"
                )
            ),
            false
        );

        await t.test("Standalone-Dateien und Cache-Header", async function () {

            const index = await request(
                gatewayPort,
                "GET",
                "/"
            );

            assert.equal(index.status, 200);
            assert.equal(
                index.headers["x-content-type-options"],
                "nosniff"
            );
            assert.equal(
                index.headers["x-frame-options"],
                "DENY"
            );
            assert.match(
                index.headers["content-security-policy"],
                /default-src 'self'/
            );
            assert.equal(
                index.headers["x-powered-by"],
                undefined
            );
            assert.equal(
                index.headers["cache-control"],
                "no-cache, no-store, must-revalidate"
            );
            assert.match(
                index.text,
                /apple-mobile-web-app-capable/
            );
            assert.match(
                index.text,
                /src="\/js\/app\.js\?v=36"/
            );

            const manifest = await request(
                gatewayPort,
                "GET",
                "/manifest.json"
            );

            assert.equal(manifest.status, 200);
            assert.equal(
                manifest.headers["cache-control"],
                "no-cache, no-store, must-revalidate"
            );
            assert.equal(manifest.json.display, "standalone");

            const applicationScript = await request(
                gatewayPort,
                "GET",
                "/js/app.js?v=36"
            );

            assert.equal(applicationScript.status, 200);
            assert.equal(
                applicationScript.headers["cache-control"],
                "public, max-age=31536000, immutable"
            );

            const adminPage = await request(
                gatewayPort,
                "GET",
                "/admin"
            );

            assert.equal(adminPage.status, 200);
            assert.equal(
                adminPage.headers["cache-control"],
                "no-cache, no-store, must-revalidate"
            );
            assert.match(
                adminPage.text,
                /HA Legacy Dashboard – Administration/
            );
            assert.match(
                adminPage.text,
                /src="\/admin\/js\/app\.js"/
            );
            assert.doesNotMatch(
                adminPage.text,
                /HA_TOKEN|ADMIN_TOKEN=/
            );

            const adminScript = await request(
                gatewayPort,
                "GET",
                "/admin/js/app.js"
            );

            assert.equal(adminScript.status, 200);
            assert.equal(
                adminScript.headers["cache-control"],
                "no-cache, no-store, must-revalidate"
            );

        });

        await t.test("Dashboard-URLs liefern nur konfigurierte Dashboards", async function () {

            const defaultPage = await request(
                gatewayPort,
                "GET",
                "/d/default"
            );

            const roomPage = await request(
                gatewayPort,
                "GET",
                "/d/esszimmer"
            );

            const unknownPage = await request(
                gatewayPort,
                "GET",
                "/d/unbekannt"
            );


            assert.equal(defaultPage.status, 200);
            assert.equal(roomPage.status, 200);
            assert.match(roomPage.text, /id="dashboardTitle"/);
            assert.equal(unknownPage.status, 404);
            assert.doesNotMatch(
                unknownPage.text,
                /id="dashboardTitle"/
            );

        });

        await t.test("Feste System-Dashboard-Routen bleiben vom Benutzerraster getrennt", async function () {

            const summaryPage = await request(
                gatewayPort,
                "GET",
                "/system/summary"
            );

            const errorsPage = await request(
                gatewayPort,
                "GET",
                "/system/errors"
            );

            const unknownPage = await request(
                gatewayPort,
                "GET",
                "/system/does-not-exist"
            );

            const rootPage = await request(
                gatewayPort,
                "GET",
                "/"
            );

            assert.equal(summaryPage.status, 200);
            assert.equal(errorsPage.status, 200);
            assert.equal(unknownPage.status, 404);
            assert.equal(rootPage.status, 200);
            assert.equal(
                summaryPage.headers["cache-control"],
                "no-cache, no-store, must-revalidate"
            );
            assert.match(summaryPage.text, /id="systemTitle"/);
            assert.match(errorsPage.text, /id="systemTitle"/);
            assert.doesNotMatch(unknownPage.text, /id="systemTitle"/);
            assert.match(rootPage.text, /id="dashboardTitle"/);

        });

        await t.test("Multi-Dashboard-APIs begrenzen Konfiguration und Zustände", async function () {

            resetMock();

            const list = await request(
                gatewayPort,
                "GET",
                "/api/dashboards"
            );

            assert.equal(list.status, 200);
            assert.equal(
                list.json.default_dashboard,
                "default"
            );
            assert.deepEqual(list.json.dashboards, [
                {
                    id: "default",
                    title: "Übersicht"
                },
                {
                    id: "esszimmer",
                    title: "Esszimmer"
                }
            ]);

            const roomConfig = await request(
                gatewayPort,
                "GET",
                "/api/dashboards/esszimmer/config"
            );

            assert.equal(roomConfig.status, 200);
            assert.equal(roomConfig.json.id, "esszimmer");
            assert.equal(roomConfig.json.title, "Esszimmer");
            assert.deepEqual(
                roomConfig.json.widgets.map(function (widget) {
                    return widget.entity;
                }),
                [LIGHT_ENTITY, CLIMATE_ENTITY]
            );

            mock.stateRequests = [];

            const roomState = await request(
                gatewayPort,
                "GET",
                "/api/dashboards/esszimmer/state"
            );

            assert.equal(roomState.status, 200);
            assert.deepEqual(
                mock.stateRequests.slice(0).sort(),
                [CLIMATE_ENTITY, LIGHT_ENTITY].sort()
            );
            assert.equal(
                new Set(mock.stateRequests).size,
                mock.stateRequests.length
            );
            assert.ok(roomState.json[LIGHT_ENTITY]);
            assert.ok(roomState.json[CLIMATE_ENTITY]);
            assert.equal(roomState.json[TEMPERATURE_ENTITY], undefined);

            const unknownConfig = await request(
                gatewayPort,
                "GET",
                "/api/dashboards/unbekannt/config"
            );

            const unknownState = await request(
                gatewayPort,
                "GET",
                "/api/dashboards/unbekannt/state"
            );

            assert.equal(unknownConfig.status, 404);
            assert.deepEqual(unknownConfig.json, {
                error: "dashboard_not_found"
            });
            assert.equal(unknownState.status, 404);
            assert.deepEqual(unknownState.json, {
                error: "dashboard_not_found"
            });

            assert.equal(
                JSON.stringify(list.json).indexOf(TEST_TOKEN),
                -1
            );
            assert.equal(
                JSON.stringify(roomConfig.json).indexOf(TEST_TOKEN),
                -1
            );

        });

        await t.test("System-Dashboard-APIs teilen einen reduzierten Snapshot", async function () {

            resetMock();
            mock.systemStates = [
                {
                    entity_id: "light.system_test",
                    state: "on",
                    attributes: {friendly_name: "System Test"},
                    last_changed: "2026-08-11T18:00:00Z",
                    last_updated: "2026-08-11T18:00:01Z"
                },
                {
                    entity_id: "sensor.system_unavailable",
                    state: "unavailable",
                    attributes: {
                        friendly_name: "System unavailable",
                        access_token: "must-not-survive"
                    },
                    last_changed: "2026-08-11T17:00:00Z",
                    last_updated: "2026-08-11T17:00:01Z"
                },
                {
                    entity_id: "sensor.system_unknown",
                    state: "unknown",
                    attributes: {friendly_name: "System unknown"},
                    last_changed: "2026-08-11T17:30:00Z",
                    last_updated: "2026-08-11T17:30:01Z"
                }
            ];

            const summary = await request(
                gatewayPort,
                "GET",
                "/api/system-dashboards/summary"
            );

            const errors = await request(
                gatewayPort,
                "GET",
                "/api/system-dashboards/errors"
            );

            const status = await request(
                gatewayPort,
                "GET",
                "/api/system-dashboards/status"
            );

            const unknown = await request(
                gatewayPort,
                "GET",
                "/api/system-dashboards/unknown"
            );

            assert.equal(summary.status, 200);
            assert.equal(errors.status, 200);
            assert.equal(status.status, 200);
            assert.equal(unknown.status, 404);
            assert.deepEqual(unknown.json, {
                error: "system_dashboard_not_found"
            });
            assert.equal(summary.json.items.length, 1);
            assert.equal(
                summary.json.items[0].entityIds[0],
                "light.system_test"
            );
            assert.equal(summary.json.items[0].category, "powered");
            assert.equal(errors.json.issues.length, 2);
            assert.equal(errors.json.issues[0].state, "unavailable");
            assert.equal(errors.json.issues[0].severity, "warning");
            assert.equal(errors.json.issues[1].state, "unknown");
            assert.equal(errors.json.issues[1].severity, "info");
            assert.equal(errors.json.summary.unavailable, 1);
            assert.equal(errors.json.summary.unknown, 1);
            assert.equal(errors.json.overallStatus, "warning");
            assert.equal(errors.json.presentationVersion, 2);
            assert.deepEqual(errors.json.filters, {
                severity: {
                    all: 2,
                    critical: 0,
                    error: 0,
                    warning: 1,
                    info: 1
                },
                state: {
                    all: 2,
                    unavailable: 1,
                    unknown: 1
                }
            });
            assert.equal(errors.json.groups.length, 2);
            assert.equal(errors.json.groups[0].type, "standalone");
            assert.equal(summary.json.meta.entity_count, 3);
            assert.equal(errors.json.meta.entity_count, 3);
            assert.equal(status.json.cache_ttl_ms, 3000);
            assert.equal(status.json.status, "online");
            assert.equal(mock.systemStateRequests, 1);
            assert.equal(summary.headers["cache-control"], "no-store");
            assert.equal(errors.headers["cache-control"], "no-store");
            assert.equal(status.headers["cache-control"], "no-store");

            const combined = JSON.stringify({
                summary: summary.json,
                errors: errors.json,
                status: status.json
            });

            assert.equal(combined.includes(TEST_TOKEN), false);
            assert.equal(combined.includes("raw-state-secret"), false);
            assert.equal(combined.includes("must-not-survive"), false);
            assert.equal(combined.includes("light.system_test"), true);
            assert.equal(combined.includes("ALLOWED_LIGHT_ENTITIES"), false);
            assert.equal(combined.includes("ALLOWED_CLIMATE_ENTITIES"), false);
            assert.ok(
                mock.authorizationHeaders.includes(
                    "Bearer " + TEST_TOKEN
                )
            );
            assert.equal(gatewayOutput.includes(TEST_TOKEN), false);
            assert.equal(gatewayErrorOutput.includes(TEST_TOKEN), false);

        });

        await t.test("Status, Konfiguration und Dashboard", async function () {

            resetMock();

            const status = await request(
                gatewayPort,
                "GET",
                "/api/status"
            );

            assert.equal(status.status, 200);
            assert.equal(status.json.status, "online");
            assert.equal(status.json.version, "1.0.0");
            assert.equal(
                status.json.home_assistant.status,
                "online"
            );
            assert.equal(
                status.headers["cache-control"],
                "no-store"
            );

            const configuration = await request(
                gatewayPort,
                "GET",
                "/api/dashboard/config"
            );

            assert.equal(configuration.status, 200);
            assert.equal(configuration.json.widgets.length, 5);
            assert.equal(
                configuration.json.refresh_interval_ms,
                5000
            );
            assert.deepEqual(
                configuration.json.widgets.map(function (widget) {
                    return widget.entity;
                }),
                [
                    TEMPERATURE_ENTITY,
                    HUMIDITY_ENTITY,
                    "binary_sensor.kuche_fenster_rechts",
                    LIGHT_ENTITY,
                    CLIMATE_ENTITY
                ]
            );
            assert.deepEqual(
                configuration.json.widgets.map(function (widget) {
                    return widget.type;
                }),
                [
                    "sensor",
                    "sensor",
                    "binary",
                    "light",
                    "climate"
                ]
            );
            assert.equal(
                JSON.stringify(configuration.json)
                    .indexOf(TEST_TOKEN),
                -1
            );

            const dashboard = await request(
                gatewayPort,
                "GET",
                "/api/dashboard"
            );

            assert.equal(dashboard.status, 200);
            assert.ok(dashboard.json[CLIMATE_ENTITY]);
            assert.ok(dashboard.json[LIGHT_ENTITY]);
            assert.equal(
                dashboard.json._meta.home_assistant,
                "online"
            );
            assert.deepEqual(
                dashboard.json._meta.failed_entities,
                []
            );
            assert.equal(
                JSON.stringify(dashboard.json)
                    .indexOf(TEST_TOKEN),
                -1
            );

        });

        await t.test("HA-Erreichbarkeitsstatus", async function () {

            resetMock();
            mock.connectionError = true;

            const response = await request(
                gatewayPort,
                "GET",
                "/api/status"
            );

            assert.equal(response.status, 200);
            assert.equal(response.json.status, "degraded");
            assert.equal(
                response.json.home_assistant.status,
                "offline"
            );
            assert.equal(
                JSON.stringify(response.json)
                    .indexOf(TEST_TOKEN),
                -1
            );

        });

        await t.test("fehlende Entity", async function () {

            resetMock();
            mock.missingEntity = HUMIDITY_ENTITY;

            const response = await request(
                gatewayPort,
                "GET",
                "/api/dashboard"
            );

            assert.equal(response.status, 200);
            assert.equal(
                response.json[HUMIDITY_ENTITY].state,
                "unavailable"
            );
            assert.equal(
                response.json[HUMIDITY_ENTITY]
                    .gateway_error,
                true
            );
            assert.equal(
                response.json._meta.home_assistant,
                "degraded"
            );
            assert.deepEqual(
                response.json._meta.failed_entities,
                [HUMIDITY_ENTITY]
            );

        });

        await t.test("ungültiges JSON", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                undefined,
                '{"secret":"' + TEST_TOKEN + '",'
            );

            assert.equal(response.status, 400);
            assert.equal(response.json.error, "Ungültiges JSON");

        });

        await t.test("Payload-Begrenzung und unbekannte API", async function () {

            resetMock();

            const largePayload =
                '"' + "x".repeat(17000) + '"';

            const tooLarge = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                undefined,
                largePayload
            );

            const missing = await request(
                gatewayPort,
                "GET",
                "/api/not-available"
            );

            assert.equal(tooLarge.status, 413);
            assert.equal(
                tooLarge.json.error,
                "Anfrage ist zu groß"
            );
            assert.equal(missing.status, 404);
            assert.equal(
                missing.json.error,
                "API-Endpunkt nicht gefunden"
            );
            assert.equal(mock.lightServiceCalls.length, 0);

        });

        await t.test("nicht erlaubte Climate-Entity", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: "climate.not_allowed",
                    temperature: 21
                }
            );

            assert.equal(response.status, 403);
            assert.equal(mock.serviceCalls.length, 0);

        });

        await t.test("ungültige Temperatur", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: "warm"
                }
            );

            assert.equal(response.status, 400);
            assert.equal(mock.serviceCalls.length, 0);

        });

        await t.test("erlaubtes Licht ein- und ausschalten", async function () {

            resetMock();

            const turnOn = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                {
                    entity_id: LIGHT_ENTITY,
                    state: "on"
                }
            );

            const turnOff = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                {
                    entity_id: LIGHT_ENTITY,
                    state: "off"
                }
            );

            assert.equal(turnOn.status, 202);
            assert.equal(turnOn.json.state, "on");
            assert.equal(turnOff.status, 202);
            assert.equal(turnOff.json.state, "off");

            assert.deepEqual(
                mock.lightServiceCalls,
                [
                    {
                        service: "turn_on",
                        data: {
                            entity_id: LIGHT_ENTITY
                        }
                    },
                    {
                        service: "turn_off",
                        data: {
                            entity_id: LIGHT_ENTITY
                        }
                    }
                ]
            );

        });

        await t.test("nicht erlaubte Licht-Entity", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                {
                    entity_id: "light.not_allowed",
                    state: "on"
                }
            );

            assert.equal(response.status, 403);
            assert.equal(mock.lightServiceCalls.length, 0);

        });

        await t.test("ungültiger Lichtzustand", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                {
                    entity_id: LIGHT_ENTITY,
                    state: "toggle"
                }
            );

            assert.equal(response.status, 400);
            assert.equal(mock.lightServiceCalls.length, 0);

        });

        await t.test("nicht verfügbares Licht", async function () {

            resetMock();
            mock.lightState = "unavailable";

            const response = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                {
                    entity_id: LIGHT_ENTITY,
                    state: "on"
                }
            );

            assert.equal(response.status, 503);
            assert.equal(mock.lightServiceCalls.length, 0);

        });

        await t.test("Home-Assistant-Lichtfehler", async function () {

            resetMock();
            mock.serviceError = true;

            const response = await request(
                gatewayPort,
                "POST",
                "/api/light/state",
                {
                    entity_id: LIGHT_ENTITY,
                    state: "on"
                }
            );

            assert.equal(response.status, 502);
            assert.equal(
                response.json.error,
                "Home Assistant konnte den Befehl nicht ausführen"
            );
            assert.equal(mock.lightServiceCalls.length, 0);
            assert.equal(
                JSON.stringify(response.json)
                    .indexOf(TEST_TOKEN),
                -1
            );

        });

        await t.test("Rate-Limit für Lichtbefehle", async function () {

            await stopChild(gateway);
            await startGateway();

            resetMock();

            const responses = [];
            let index;

            for (index = 0; index < 11; index += 1) {
                responses.push(
                    await request(
                        gatewayPort,
                        "POST",
                        "/api/light/state",
                        {
                            entity_id: LIGHT_ENTITY,
                            state: index % 2 === 0
                                ? "on"
                                : "off"
                        }
                    )
                );
            }

            assert.equal(
                responses[responses.length - 1].status,
                429
            );
            assert.ok(
                Number(
                    responses[responses.length - 1]
                        .headers["retry-after"]
                ) >= 1
            );
            assert.equal(mock.lightServiceCalls.length, 10);

        });

        await t.test("Minimum und Maximum", async function () {

            resetMock();

            const belowMinimum = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 9.5
                }
            );

            const aboveMaximum = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 30.5
                }
            );

            assert.equal(belowMinimum.status, 400);
            assert.equal(aboveMaximum.status, 400);
            assert.equal(mock.serviceCalls.length, 0);

        });

        await t.test("Temperaturschritt wird normalisiert", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 20.3
                }
            );

            assert.equal(response.status, 200);
            assert.equal(response.json.confirmed, true);
            assert.equal(response.json.temperature, 20.5);
            assert.deepEqual(
                mock.serviceCalls[0],
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 20.5
                }
            );

        });

        await t.test("verzögerte Bestätigung liefert HTTP 200", async function () {

            resetMock();
            mock.confirmationMode = "delayed";

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 21
                }
            );

            assert.equal(response.status, 200);
            assert.equal(response.json.confirmed, true);
            assert.equal(response.json.temperature, 21);

        });

        await t.test("ausstehende Bestätigung liefert HTTP 202", async function () {

            resetMock();
            mock.confirmationMode = "never";

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 21.5
                }
            );

            assert.equal(response.status, 202);
            assert.equal(response.json.confirmed, false);
            assert.equal(response.json.temperature, 21.5);

        });

        await t.test("Home-Assistant-Servicefehler", async function () {

            resetMock();
            mock.serviceError = true;

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                {
                    entity_id: CLIMATE_ENTITY,
                    temperature: 21
                }
            );

            assert.equal(response.status, 502);
            assert.equal(
                response.json.error,
                "Home Assistant konnte den Befehl nicht ausführen"
            );
            assert.equal(
                JSON.stringify(response.json)
                    .indexOf(TEST_TOKEN),
                -1
            );

        });

        await t.test("Climate Power schaltet nur über festen HVAC-Service", async function () {

            resetMock();

            const offResponse = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: CLIMATE_ENTITY,
                    state: "off",
                    service: "delete_everything"
                }
            );

            assert.equal(offResponse.status, 202);
            assert.deepEqual(
                mock.climatePowerCalls[0],
                {
                    entity_id: CLIMATE_ENTITY,
                    hvac_mode: "off"
                }
            );

            resetMock();
            mock.climateState = "off";

            const onResponse = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: CLIMATE_ENTITY,
                    state: "on"
                }
            );

            assert.equal(onResponse.status, 202);
            assert.deepEqual(
                mock.climatePowerCalls[0],
                {
                    entity_id: CLIMATE_ENTITY,
                    hvac_mode: "heat"
                }
            );

        });

        await t.test("Climate Power weist ungültige oder uneindeutige Wünsche ab", async function () {

            resetMock();

            const denied = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: "climate.not_allowed",
                    state: "off"
                }
            );

            const wrongDomain = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: LIGHT_ENTITY,
                    state: "off"
                }
            );

            const invalidState = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: CLIMATE_ENTITY,
                    state: "toggle"
                }
            );

            mock.climateState = "off";
            mock.climateModes = ["off", "cool", "dry"];

            const ambiguous = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: CLIMATE_ENTITY,
                    state: "on"
                }
            );

            assert.equal(denied.status, 403);
            assert.equal(wrongDomain.status, 403);
            assert.equal(invalidState.status, 400);
            assert.equal(ambiguous.status, 409);
            assert.equal(mock.climatePowerCalls.length, 0);

        });

        await t.test("Climate Power behandelt HA-Fehler und Write-Rate-Limit", async function () {

            resetMock();
            mock.serviceError = true;

            const failed = await request(
                gatewayPort,
                "POST",
                "/api/climate/power",
                {
                    entity: CLIMATE_ENTITY,
                    state: "off"
                }
            );

            assert.equal(failed.status, 502);
            assert.equal(
                JSON.stringify(failed.json).indexOf(TEST_TOKEN),
                -1
            );

            resetMock();
            let limited = null;
            let index;

            for (index = 0; index < 12; index += 1) {
                mock.climateState = "heat";
                limited = await request(
                    gatewayPort,
                    "POST",
                    "/api/climate/power",
                    {
                        entity: CLIMATE_ENTITY,
                        state: "off"
                    }
                );

                if (limited.status === 429) {
                    break;
                }
            }

            assert.equal(limited.status, 429);
            assert.ok(Number(limited.headers["retry-after"]) >= 1);

        });

        await t.test("Home-Assistant-Timeout", async function () {

            resetMock();
            mock.hangEntity = TEMPERATURE_ENTITY;

            const startedAt = Date.now();

            const response = await request(
                gatewayPort,
                "GET",
                "/api/dashboard"
            );

            assert.equal(response.status, 200);
            assert.equal(
                response.json[TEMPERATURE_ENTITY].state,
                "unavailable"
            );
            assert.equal(
                response.json[TEMPERATURE_ENTITY]
                    .gateway_error,
                true
            );
            assert.equal(
                response.json._meta.home_assistant,
                "degraded"
            );
            assert.ok(
                Date.now() - startedAt >= 9000
            );

        });

        assert.ok(
            mock.authorizationHeaders.length > 0
        );

        assert.ok(
            mock.authorizationHeaders.every(
                function (header) {
                    return header ===
                        "Bearer " + TEST_TOKEN;
                }
            )
        );

        assert.ok(
            mock.websocketAuthorizationHeaders.length > 0
        );

        assert.ok(
            mock.websocketAuthorizationHeaders.every(
                function (header) {
                    return typeof header === "undefined";
                }
            )
        );

        assert.equal(
            gatewayOutput.indexOf(TEST_TOKEN),
            -1
        );
        assert.equal(
            gatewayErrorOutput.indexOf(TEST_TOKEN),
            -1
        );
        assert.match(
            gatewayOutput,
            /"event":"server_started"/
        );

    }
);
