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
            confirmationMode: "immediate",
            hangEntity: null,
            missingEntity: null,
            pendingTemperature: null,
            postServiceReads: 0,
            serviceCalls: [],
            serviceError: false,
            serviceIssued: false,
            targetTemperature: 20
        };

        function resetMock() {
            mock.confirmationMode = "immediate";
            mock.hangEntity = null;
            mock.missingEntity = null;
            mock.pendingTemperature = null;
            mock.postServiceReads = 0;
            mock.serviceCalls = [];
            mock.serviceError = false;
            mock.serviceIssued = false;
            mock.targetTemperature = 20;
        }

        const mockServer = http.createServer(function (req, res) {

            let requestBody = "";

            mock.authorizationHeaders.push(
                req.headers.authorization
            );

            req.on("data", function (chunk) {
                requestBody += chunk;
            });

            req.on("end", function () {

                res.setHeader(
                    "Content-Type",
                    "application/json"
                );

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
                    req.url.indexOf("/api/states/") === 0
                ) {

                    const entityId = decodeURIComponent(
                        req.url.substring(
                            "/api/states/".length
                        )
                    );

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
                                target_temp_step: 0.5
                            }
                            : {};

                    res.end(JSON.stringify({
                        entity_id: entityId,
                        state:
                            entityId === CLIMATE_ENTITY
                                ? "heat"
                                : "20",
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

        const gateway = childProcess.spawn(
            process.execPath,
            [serverPath],
            {
                cwd: temporaryDirectory,
                env: Object.assign({}, process.env, {
                    HA_TOKEN: TEST_TOKEN,
                    HA_URL:
                        "http://127.0.0.1:" +
                        mockPort,
                    NODE_ENV: "test",
                    PORT: String(gatewayPort)
                }),
                stdio: ["ignore", "pipe", "pipe"]
            }
        );

        let gatewayErrorOutput = "";

        gateway.stderr.on("data", function (chunk) {
            gatewayErrorOutput += chunk.toString();
        });

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

        await new Promise(function (resolve, reject) {

            const startTimer = setTimeout(function () {
                reject(new Error(
                    "Gateway-Start fehlgeschlagen: " +
                    gatewayErrorOutput
                ));
            }, 5000);

            gateway.stdout.on("data", function (chunk) {
                if (
                    chunk.toString().indexOf(
                        "läuft auf Port"
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
        assert.equal(
            fs.existsSync(
                path.join(
                    temporaryDirectory,
                    ".env"
                )
            ),
            false
        );

        await t.test("Status und Dashboard", async function () {

            resetMock();

            const status = await request(
                gatewayPort,
                "GET",
                "/api/status"
            );

            assert.equal(status.status, 200);
            assert.equal(status.json.status, "online");

            const dashboard = await request(
                gatewayPort,
                "GET",
                "/api/dashboard"
            );

            assert.equal(dashboard.status, 200);
            assert.ok(dashboard.json[CLIMATE_ENTITY]);
            assert.equal(
                JSON.stringify(dashboard.json)
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

        });

        await t.test("ungültiges JSON", async function () {

            resetMock();

            const response = await request(
                gatewayPort,
                "POST",
                "/api/climate/temperature",
                undefined,
                "{"
            );

            assert.equal(response.status, 400);

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

    }
);
