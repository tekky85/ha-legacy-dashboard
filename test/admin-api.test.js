const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const JpegSamples = require("./fixtures/jpeg-samples");


const FAKE_HA_TOKEN =
    "fake-local-home-assistant-token";

const FAKE_ADMIN_TOKEN =
    "fake-local-admin-token";


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


function request(
    port,
    method,
    requestPath,
    body,
    headers
) {

    return new Promise(function (resolve, reject) {

        const rawPayload = Buffer.isBuffer(body);

        const payload =
            typeof body === "undefined"
                ? null
                : rawPayload
                    ? body
                    : JSON.stringify(body);

        const requestHeaders =
            Object.assign({}, headers || {});


        if (payload !== null) {
            if (!rawPayload) {
                requestHeaders["Content-Type"] =
                    "application/json";
            }
            requestHeaders["Content-Length"] =
                Buffer.byteLength(payload);
        }

        const req = http.request(
            {
                host: "127.0.0.1",
                port: port,
                method: method,
                path: requestPath,
                headers: requestHeaders
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

    if (
        !child ||
        child.exitCode !== null ||
        child.signalCode !== null
    ) {
        return Promise.resolve();
    }

    return new Promise(function (resolve) {

        const timer = setTimeout(function () {
            if (child.exitCode === null) {
                child.kill("SIGKILL");
            }
        }, 2000);

        timer.unref();

        child.once("exit", function () {
            clearTimeout(timer);
            resolve();
        });

        child.kill("SIGTERM");

    });

}


test(
    "Admin-API ist geschützt und verwaltet persistente Dashboards",
    {
        timeout: 30000
    },
    async function (t) {

        const mockPort = await getFreePort();

        const temporaryDirectory = fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "ha-dashboard-admin-test-"
            )
        );

        const children = [];
        const mockAuthorizationHeaders = [];


        const mockServer = http.createServer(function (req, res) {

            if (req.url === "/api/states") {
                mockAuthorizationHeaders.push(
                    req.headers.authorization
                );
            }

            res.setHeader(
                "Content-Type",
                "application/json"
            );


            if (
                req.method === "GET" &&
                req.url === "/api/states"
            ) {
                res.end(JSON.stringify([
                    {
                        entity_id:
                            "sensor.office_temperature",
                        state: "21.5",
                        attributes: {
                            friendly_name:
                                "Bürotemperatur",
                            device_class:
                                "temperature",
                            unit_of_measurement: "°C",
                            access_token:
                                "must-not-leak",
                            latitude: 52.5
                        }
                    },
                    {
                        entity_id: "light.office",
                        state: "off",
                        attributes: {
                            friendly_name: "Bürolicht"
                        }
                    },
                    {
                        entity_id: "invalid-entity",
                        state: "unknown",
                        attributes: {
                            friendly_name: "Ungültig"
                        }
                    }
                ]));
                return;
            }


            res.statusCode = 404;
            res.end(JSON.stringify({
                message: "not found"
            }));

        });


        await new Promise(function (resolve, reject) {
            mockServer.once("error", reject);
            mockServer.listen(
                mockPort,
                "127.0.0.1",
                resolve
            );
        });


        t.after(async function () {
            let index;

            for (index = 0; index < children.length; index++) {
                await stopChild(children[index].child);
            }

            if (
                typeof mockServer.closeAllConnections ===
                    "function"
            ) {
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


        async function startGateway(
            name,
            adminEnabled,
            adminToken,
            existingConfigPath
        ) {

            const port = await getFreePort();

            const configPath =
                existingConfigPath ||
                path.join(
                    temporaryDirectory,
                    name + "-dashboards.json"
                );

            let output = "";
            let errorOutput = "";

            const child = childProcess.spawn(
                process.execPath,
                [
                    path.join(
                        __dirname,
                        "..",
                        "src",
                        "server.js"
                    )
                ],
                {
                    cwd: temporaryDirectory,
                    env: Object.assign({}, process.env, {
                        ADMIN_API_ENABLED:
                            adminEnabled,
                        ADMIN_TOKEN:
                            adminToken,
                        DASHBOARD_CONFIG_PATH:
                            configPath,
                        DATA_DIR:
                            path.join(
                                temporaryDirectory,
                                name + "-data"
                            ),
                        HA_TOKEN:
                            FAKE_HA_TOKEN,
                        HA_URL:
                            "http://127.0.0.1:" +
                            mockPort,
                        NODE_ENV: "test",
                        PORT: String(port)
                    }),
                    stdio: ["ignore", "pipe", "pipe"]
                }
            );

            const instance = {
                child: child,
                configPath: configPath,
                getOutput: function () {
                    return output + errorOutput;
                },
                port: port
            };

            children.push(instance);

            child.stdout.on("data", function (chunk) {
                output += chunk.toString();
            });
            child.stderr.on("data", function (chunk) {
                errorOutput += chunk.toString();
            });


            await new Promise(function (resolve, reject) {

                const timer = setTimeout(function () {
                    reject(new Error(
                        "Gateway-Start fehlgeschlagen: " +
                        errorOutput
                    ));
                }, 5000);

                child.stdout.on("data", function () {
                    if (
                        output.indexOf(
                            "server_started"
                        ) !== -1
                    ) {
                        clearTimeout(timer);
                        resolve();
                    }
                });

                child.once("exit", function (code) {
                    clearTimeout(timer);
                    reject(new Error(
                        "Gateway endete mit " +
                        code +
                        ": " +
                        errorOutput
                    ));
                });

            });

            return instance;

        }


        await t.test(
            "standardmäßig deaktiviert",
            async function () {

                const gateway = await startGateway(
                    "disabled",
                    "false",
                    "",
                    null
                );

                const response = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    {
                        Authorization:
                            "Bearer " +
                            FAKE_ADMIN_TOKEN
                    }
                );

                assert.equal(response.status, 404);
                assert.deepEqual(response.json, {
                    error: "admin_api_disabled"
                });

                await stopChild(gateway.child);

            }
        );


        await t.test(
            "fehlender oder wiederverwendeter Token wird abgewiesen",
            async function () {

                const missing = await startGateway(
                    "missing-token",
                    "true",
                    "",
                    null
                );

                const missingResponse = await request(
                    missing.port,
                    "GET",
                    "/api/admin/config"
                );

                assert.equal(
                    missingResponse.status,
                    503
                );

                await stopChild(missing.child);

                const reused = await startGateway(
                    "reused-token",
                    "true",
                    FAKE_HA_TOKEN,
                    null
                );

                const reusedResponse = await request(
                    reused.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    {
                        Authorization:
                            "Bearer " +
                            FAKE_HA_TOKEN
                    }
                );

                assert.equal(
                    reusedResponse.status,
                    503
                );

                await stopChild(reused.child);

            }
        );


        await t.test(
            "alle Kachelgrößen werden über die Admin-API validiert",
            async function () {

                const gateway = await startGateway(
                    "sizes",
                    "true",
                    FAKE_ADMIN_TOKEN,
                    null
                );

                const auth = {
                    Authorization:
                        "Bearer " +
                        FAKE_ADMIN_TOKEN
                };

                const widget = {
                    id: "default-size-test",
                    entity: "sensor.office_temperature",
                    type: "sensor",
                    title: "Büro",
                    subtitle: "Temperatur",
                    icon: "temperature",
                    iconClass: "temperature",
                    unit: "°C",
                    order: 70,
                    visible: true,
                    size: "normal"
                };

                const created = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/widgets",
                    widget,
                    auth
                );

                assert.equal(created.status, 201);
                assert.equal(created.json.size, "normal");

                for (const size of [
                    "compact",
                    "wide",
                    "tall",
                    "large"
                ]) {
                    const updated = await request(
                        gateway.port,
                        "PUT",
                        "/api/admin/dashboards/default/widgets/" +
                            widget.id,
                        {
                            size: size
                        },
                        auth
                    );

                    assert.equal(updated.status, 200);
                    assert.equal(updated.json.size, size);
                }

                const invalid = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/dashboards/default/widgets/" +
                        widget.id,
                    {
                        size: "2fr"
                    },
                    auth
                );

                assert.equal(invalid.status, 400);
                assert.equal(
                    invalid.json.error,
                    "invalid_widget_size"
                );

                const configuration = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );

                const persistedWidget =
                    configuration.json.dashboards[0]
                        .widgets.find(function (entry) {
                            return entry.id === widget.id;
                        });

                assert.equal(persistedWidget.size, "large");

                await stopChild(gateway.child);

            }
        );


        await t.test(
            "Rasterlayouts werden geschützt validiert und öffentlich bereinigt",
            async function () {

                const gateway = await startGateway(
                    "layouts",
                    "true",
                    FAKE_ADMIN_TOKEN,
                    null
                );
                const auth = {
                    Authorization: "Bearer " + FAKE_ADMIN_TOKEN
                };
                const initial = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );

                assert.equal(initial.status, 200);
                assert.equal(initial.json.schemaVersion, 9);
                assert.equal(
                    initial.json.dashboards[0].layouts.portrait.columns,
                    6
                );
                assert.equal(
                    initial.json.dashboards[0].layouts.landscape.columns,
                    12
                );

                const dashboard = initial.json.dashboards[0];
                const climate = dashboard.widgets.find(function (entry) {
                    return entry.type === "climate";
                });
                dashboard.layouts.portrait.items[climate.id] = {
                    x: 2,
                    y: 3,
                    w: 2,
                    h: 2
                };

                const saved = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/config",
                    initial.json,
                    auth
                );

                assert.equal(saved.status, 200);
                assert.deepEqual(
                    saved.json.dashboards[0]
                        .layouts.portrait.items[climate.id],
                    {x: 2, y: 3, w: 2, h: 2}
                );

                saved.json.systemDashboards.errors = Object.assign(
                    {},
                    saved.json.systemDashboards.errors,
                    {
                    securityEntities: [
                        "light.security_only",
                        "climate.security_only"
                    ],
                    ignoredEntities: ["sensor.test_status"],
                    criticalDetectionMode: "device_class",
                    criticalLabelId: null
                    }
                );

                const settingsSaved = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/config",
                    saved.json,
                    auth
                );

                assert.equal(settingsSaved.status, 200);
                assert.deepEqual(
                    settingsSaved.json.systemDashboards.errors,
                    saved.json.systemDashboards.errors
                );

                const settingsReloaded = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );

                assert.deepEqual(
                    settingsReloaded.json.systemDashboards.errors,
                    saved.json.systemDashboards.errors
                );

                const forbiddenLight = await request(
                    gateway.port,
                    "POST",
                    "/api/light/state",
                    {
                        entity_id: "light.security_only",
                        state: "on"
                    }
                );
                const forbiddenClimate = await request(
                    gateway.port,
                    "POST",
                    "/api/climate/temperature",
                    {
                        entity_id: "climate.security_only",
                        temperature: 21
                    }
                );

                assert.equal(forbiddenLight.status, 403);
                assert.equal(forbiddenClimate.status, 403);

                const invalid = JSON.parse(JSON.stringify(saved.json));
                const firstId = invalid.dashboards[0].widgets[0].id;
                const secondId = invalid.dashboards[0].widgets[1].id;
                invalid.dashboards[0].layouts.portrait.items[secondId] =
                    Object.assign(
                        {},
                        invalid.dashboards[0].layouts.portrait.items[firstId]
                    );

                const rejected = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/config",
                    invalid,
                    auth
                );

                assert.equal(rejected.status, 400);
                assert.equal(rejected.json.error, "invalid_layout");

                const persisted = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );
                assert.deepEqual(
                    persisted.json.dashboards[0]
                        .layouts.portrait.items[climate.id],
                    {x: 2, y: 3, w: 2, h: 2}
                );

                const publicConfig = await request(
                    gateway.port,
                    "GET",
                    "/api/dashboard/config"
                );

                assert.equal(publicConfig.status, 200);
                assert.deepEqual(
                    publicConfig.json.layouts.portrait.items[climate.id],
                    {x: 2, y: 3, w: 2, h: 2}
                );
                assert.equal(
                    JSON.stringify(publicConfig.json).indexOf(FAKE_ADMIN_TOKEN),
                    -1
                );

                await stopChild(gateway.child);

            }
        );


        await t.test(
            "Dashboard-Hintergründe sind geschützt, typgeprüft und sicher ersetzbar",
            async function () {

                const gateway = await startGateway(
                    "backgrounds",
                    "true",
                    FAKE_ADMIN_TOKEN,
                    null
                );

                const auth = {
                    Authorization:
                        "Bearer " +
                        FAKE_ADMIN_TOKEN,
                    "Content-Type": "image/png"
                };

                const png = Buffer.from(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                    "base64"
                );

                const unauthorized = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/background",
                    png,
                    {"Content-Type": "image/png"}
                );
                assert.equal(unauthorized.status, 401);

                const svg = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/background",
                    Buffer.from("<svg></svg>"),
                    Object.assign({}, auth, {
                        "Content-Type": "image/svg+xml"
                    })
                );
                assert.equal(svg.status, 400);
                assert.equal(
                    svg.json.error,
                    "background_content_type_invalid"
                );

                const mismatch = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/background",
                    png,
                    Object.assign({}, auth, {
                        "Content-Type": "image/jpeg"
                    })
                );
                assert.equal(mismatch.status, 400);

                const traversal = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/%2e%2e/background",
                    png,
                    auth
                );
                assert.equal(traversal.status, 404);

                const uploaded = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/background",
                    png,
                    auth
                );
                assert.equal(uploaded.status, 201);
                assert.match(
                    uploaded.json.background.imageId,
                    /^bg-[a-f0-9]{32}\.png$/
                );
                assert.equal(
                    uploaded.json.configuration.dashboards[0]
                        .background.imageId,
                    uploaded.json.background.imageId
                );

                const firstImageId =
                    uploaded.json.background.imageId;

                const failedReplacement = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/background",
                    JpegSamples.baseline.subarray(
                        0,
                        JpegSamples.baseline.length - 2
                    ),
                    Object.assign({}, auth, {
                        "Content-Type": "image/jpeg"
                    })
                );
                assert.equal(failedReplacement.status, 400);

                const preservedConfiguration = await request(
                    gateway.port,
                    "GET",
                    "/api/dashboard/config"
                );
                assert.equal(
                    preservedConfiguration.json.background.image_url,
                    "/assets/backgrounds/" + firstImageId
                );

                const backgroundDirectory = path.join(
                    temporaryDirectory,
                    "backgrounds-data",
                    "backgrounds"
                );
                assert.deepEqual(
                    fs.readdirSync(backgroundDirectory),
                    [firstImageId]
                );

                const publicConfiguration = await request(
                    gateway.port,
                    "GET",
                    "/api/dashboard/config"
                );
                assert.equal(
                    publicConfiguration.json.background.image_url,
                    "/assets/backgrounds/" + firstImageId
                );
                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        publicConfiguration.json.background,
                        "imageId"
                    ),
                    false
                );

                const firstAsset = await request(
                    gateway.port,
                    "GET",
                    "/assets/backgrounds/" + firstImageId
                );
                assert.equal(firstAsset.status, 200);
                assert.equal(firstAsset.headers["content-type"], "image/png");
                assert.match(
                    firstAsset.headers["cache-control"],
                    /immutable/
                );

                const replaced = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/default/background",
                    JpegSamples.progressive,
                    Object.assign({}, auth, {
                        "Content-Type": "image/jpeg"
                    })
                );
                assert.equal(replaced.status, 201);
                assert.notEqual(
                    replaced.json.background.imageId,
                    firstImageId
                );
                assert.match(
                    replaced.json.background.imageId,
                    /^bg-[a-f0-9]{32}\.jpg$/
                );

                const removedOldAsset = await request(
                    gateway.port,
                    "GET",
                    "/assets/backgrounds/" + firstImageId
                );
                assert.equal(removedOldAsset.status, 404);

                const removed = await request(
                    gateway.port,
                    "DELETE",
                    "/api/admin/dashboards/default/background",
                    undefined,
                    {Authorization: "Bearer " + FAKE_ADMIN_TOKEN}
                );
                assert.equal(removed.status, 200);
                assert.equal(
                    removed.json.configuration.dashboards[0].background,
                    null
                );

                await stopChild(gateway.child);

            }
        );


        await t.test(
            "Bearer-Authentifizierung, CRUD und Inventar",
            async function () {

                const gateway = await startGateway(
                    "enabled",
                    "true",
                    FAKE_ADMIN_TOKEN,
                    null
                );

                const auth = {
                    Authorization:
                        "Bearer " +
                        FAKE_ADMIN_TOKEN
                };

                const missingAuth = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config"
                );

                const invalidAuth = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    {
                        Authorization:
                            "Bearer invalid-admin-token"
                    }
                );

                assert.equal(missingAuth.status, 401);
                assert.equal(invalidAuth.status, 401);
                assert.equal(
                    invalidAuth.headers["www-authenticate"],
                    "Bearer"
                );

                const initialConfig = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );

                assert.equal(initialConfig.status, 200);
                assert.equal(
                    initialConfig.json.schemaVersion,
                    9
                );
                assert.equal(
                    initialConfig.json.defaultDashboardId,
                    "default"
                );
                assert.equal(
                    JSON.stringify(initialConfig.json)
                        .indexOf(FAKE_ADMIN_TOKEN),
                    -1
                );

                const createdDashboard = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards",
                    {
                        id: "office",
                        title: "Büro",
                        refreshIntervalMs: 7000,
                        widgets: []
                    },
                    auth
                );

                assert.equal(createdDashboard.status, 201);
                assert.equal(
                    createdDashboard.json.id,
                    "office"
                );
                assert.equal(
                    createdDashboard.headers[
                        "x-ratelimit-limit"
                    ],
                    "10"
                );

                const updatedDashboard = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/dashboards/office",
                    {
                        title: "Arbeitszimmer",
                        refreshIntervalMs: 8000
                    },
                    auth
                );

                assert.equal(updatedDashboard.status, 200);
                assert.equal(
                    updatedDashboard.json.title,
                    "Arbeitszimmer"
                );
                assert.equal(
                    updatedDashboard.json.refreshIntervalMs,
                    8000
                );

                const sensorWidget = {
                    id: "office-temperature",
                    entity: "sensor.office_temperature",
                    type: "sensor",
                    title: "Büro",
                    subtitle: "Temperatur",
                    icon: "temperature",
                    iconClass: "temperature",
                    unit: "",
                    order: 10,
                    visible: true
                };

                const createdWidget = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards/office/widgets",
                    sensorWidget,
                    auth
                );

                assert.equal(createdWidget.status, 201);
                assert.equal(
                    createdWidget.json.id,
                    "office-temperature"
                );
                assert.equal(createdWidget.json.size, "normal");

                const updatedWidget = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/dashboards/office/widgets/office-temperature",
                    {
                        title: "Bürotemperatur",
                        visible: false,
                        size: "compact"
                    },
                    auth
                );

                assert.equal(updatedWidget.status, 200);
                assert.equal(
                    updatedWidget.json.title,
                    "Bürotemperatur"
                );
                assert.equal(
                    updatedWidget.json.visible,
                    false
                );
                assert.equal(updatedWidget.json.size, "compact");

                const invalidConfig =
                    initialConfig.json;

                invalidConfig.dashboards[0].widgets[0].size =
                    "300px";

                const invalidWrite = await request(
                    gateway.port,
                    "PUT",
                    "/api/admin/config",
                    invalidConfig,
                    auth
                );

                assert.equal(invalidWrite.status, 400);
                assert.equal(
                    invalidWrite.json.error,
                    "invalid_widget_size"
                );

                const afterInvalidWrite = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );

                assert.equal(
                    afterInvalidWrite.json.defaultDashboardId,
                    "default"
                );
                assert.ok(
                    afterInvalidWrite.json.dashboards
                        .some(function (dashboard) {
                            return dashboard.id === "office";
                        })
                );

                const climateWidget = {
                    id: "office-climate",
                    entity: "climate.not_allowed",
                    type: "climate",
                    title: "Büro",
                    subtitle: "Heizung",
                    icon: "heating",
                    iconClass: "heating",
                    unit: "°C",
                    order: 20,
                    visible: true,
                    size: "wide"
                };

                const lightWidget = {
                    id: "office-light",
                    entity: "light.not_allowed",
                    type: "light",
                    title: "Büro",
                    subtitle: "Licht",
                    icon: "light",
                    iconClass: "light",
                    unit: "",
                    order: 30,
                    visible: true,
                    size: "large"
                };

                assert.equal(
                    (
                        await request(
                            gateway.port,
                            "POST",
                            "/api/admin/dashboards/office/widgets",
                            climateWidget,
                            auth
                        )
                    ).status,
                    201
                );

                assert.equal(
                    (
                        await request(
                            gateway.port,
                            "POST",
                            "/api/admin/dashboards/office/widgets",
                            lightWidget,
                            auth
                        )
                    ).status,
                    201
                );

                const publicOffice = await request(
                    gateway.port,
                    "GET",
                    "/api/dashboards/office/config"
                );

                assert.equal(publicOffice.status, 200);
                assert.deepEqual(
                    publicOffice.json.widgets.map(function (widget) {
                        return widget.entity;
                    }),
                    [
                        "climate.not_allowed",
                        "light.not_allowed"
                    ]
                );
                assert.deepEqual(
                    publicOffice.json.widgets.map(function (widget) {
                        return widget.size;
                    }),
                    ["wide", "large"]
                );

                const deniedClimate = await request(
                    gateway.port,
                    "POST",
                    "/api/climate/temperature",
                    {
                        entity_id:
                            "climate.not_allowed",
                        temperature: 21
                    }
                );

                const deniedLight = await request(
                    gateway.port,
                    "POST",
                    "/api/light/state",
                    {
                        entity_id: "light.not_allowed",
                        state: "on"
                    }
                );

                assert.equal(deniedClimate.status, 403);
                assert.equal(deniedLight.status, 403);

                const inventory = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/entities",
                    undefined,
                    auth
                );

                assert.equal(inventory.status, 200);
                assert.equal(
                    inventory.json.entities.length,
                    2
                );
                assert.deepEqual(
                    Object.keys(
                        inventory.json.entities[0]
                    ).sort(),
                    [
                        "area_name",
                        "device_class",
                        "device_id",
                        "device_name",
                        "domain",
                        "entity_id",
                        "friendly_name",
                        "unit_of_measurement"
                    ]
                );
                assert.equal(
                    JSON.stringify(inventory.json)
                        .indexOf("must-not-leak"),
                    -1
                );
                assert.equal(
                    JSON.stringify(inventory.json)
                        .indexOf("latitude"),
                    -1
                );

                const preview = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/preview",
                    undefined,
                    auth
                );

                assert.equal(preview.status, 200);
                assert.equal(preview.json.entities.length, 2);
                const sensorPreview =
                    preview.json.entities.find(function (entity) {
                        return entity.entity_id ===
                            "sensor.office_temperature";
                    });
                const lightPreview =
                    preview.json.entities.find(function (entity) {
                        return entity.entity_id === "light.office";
                    });
                assert.equal(
                    sensorPreview.state,
                    "21.5"
                );
                assert.equal(
                    sensorPreview.friendly_name,
                    "Bürotemperatur"
                );
                assert.equal(
                    lightPreview.current_temperature,
                    null
                );
                assert.equal(
                    lightPreview.target_temperature,
                    null
                );
                assert.equal(
                    JSON.stringify(preview.json).indexOf("must-not-leak"),
                    -1
                );
                assert.equal(
                    JSON.stringify(preview.json).indexOf("latitude"),
                    -1
                );
                assert.equal(
                    JSON.stringify(preview.json).indexOf("ALLOWED_"),
                    -1
                );
                assert.equal(
                    JSON.stringify(preview.json).indexOf(FAKE_HA_TOKEN),
                    -1
                );
                assert.equal(
                    JSON.stringify(preview.json).indexOf(FAKE_ADMIN_TOKEN),
                    -1
                );

                const defaultDelete = await request(
                    gateway.port,
                    "DELETE",
                    "/api/admin/dashboards/default",
                    undefined,
                    auth
                );

                assert.equal(defaultDelete.status, 409);

                const widgetDelete = await request(
                    gateway.port,
                    "DELETE",
                    "/api/admin/dashboards/office/widgets/office-temperature",
                    undefined,
                    auth
                );

                assert.equal(widgetDelete.status, 204);

                const dashboardDelete = await request(
                    gateway.port,
                    "DELETE",
                    "/api/admin/dashboards/office",
                    undefined,
                    auth
                );

                assert.equal(dashboardDelete.status, 204);

                const rateLimitedWrite = await request(
                    gateway.port,
                    "POST",
                    "/api/admin/dashboards",
                    {
                        id: "too-many-writes",
                        title: "Zu viele Befehle",
                        refreshIntervalMs: 5000,
                        widgets: []
                    },
                    auth
                );

                assert.equal(
                    rateLimitedWrite.status,
                    429
                );
                assert.equal(
                    rateLimitedWrite.json.error,
                    "admin_write_rate_limited"
                );

                const finalDashboards = await request(
                    gateway.port,
                    "GET",
                    "/api/admin/dashboards",
                    undefined,
                    auth
                );

                assert.deepEqual(
                    finalDashboards.json.dashboards
                        .map(function (dashboard) {
                            return dashboard.id;
                        }),
                    ["default", "esszimmer"]
                );

                assert.equal(
                    fs.existsSync(
                        gateway.configPath + ".bak"
                    ),
                    true
                );

                await stopChild(gateway.child);

                const restarted = await startGateway(
                    "enabled-restart",
                    "true",
                    FAKE_ADMIN_TOKEN,
                    gateway.configPath
                );

                const persistedConfig = await request(
                    restarted.port,
                    "GET",
                    "/api/admin/config",
                    undefined,
                    auth
                );

                assert.equal(persistedConfig.status, 200);
                assert.deepEqual(
                    persistedConfig.json.dashboards
                        .map(function (dashboard) {
                            return dashboard.id;
                        }),
                    ["default", "esszimmer"]
                );

                await stopChild(restarted.child);

                const combinedOutput =
                    gateway.getOutput() +
                    restarted.getOutput();

                assert.equal(
                    combinedOutput.indexOf(
                        FAKE_ADMIN_TOKEN
                    ),
                    -1
                );
                assert.equal(
                    combinedOutput.indexOf(
                        "invalid-admin-token"
                    ),
                    -1
                );

            }
        );


        assert.ok(
            mockAuthorizationHeaders.length > 0
        );
        mockAuthorizationHeaders.forEach(function (header) {
            assert.equal(
                header,
                "Bearer " + FAKE_HA_TOKEN
            );
        });

    }
);
