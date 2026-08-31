const express = require("express");

const router = express.Router();

const adminRoutes =
    require("./admin");

const systemDashboardRoutes =
    require("./system-dashboards");

const ha =
    require("../services/homeassistant");

const dashboardConfig =
    require("../config/dashboard");

const logger =
    require("../services/logger");

const writeRateLimit =
    require("../services/write-rate-limit");

const climatePower =
    require("../services/climate-power");

const controlAuthorization =
    require("../services/control-authorization");

const System =
    require("../services/system");

const Rooms =
    require("../services/rooms");

const projectPackage =
    require("../../package.json");


router.use("/admin", adminRoutes);
router.use(
    "/system-dashboards",
    systemDashboardRoutes
);


function allowWrite(res, key) {

    const result =
        writeRateLimit.consume(key);


    res.setHeader(
        "X-RateLimit-Limit",
        String(result.limit)
    );


    if (result.allowed) {

        res.setHeader(
            "X-RateLimit-Remaining",
            String(result.remaining)
        );

        return true;

    }


    res.setHeader(
        "Retry-After",
        String(result.retryAfterSeconds)
    );

    res.setHeader(
        "X-RateLimit-Remaining",
        "0"
    );

    logger.warn(
        "write_rate_limited",
        {
            key: key,
            retry_after_seconds:
                result.retryAfterSeconds
        }
    );

    res.status(429).json({
        error:
            "Zu viele Steuerbefehle. " +
            "Bitte kurz warten."
    });

    return false;

}


function addDashboardMeta(
    entities,
    dashboardEntities
) {

    const failedEntities =

        dashboardEntities.filter(

            function (entityId) {

                return Boolean(
                    entities[entityId] &&
                    entities[entityId]
                        .gateway_error
                );

            }

        );


    let status = "online";


    if (
        dashboardEntities.length > 0 &&
        failedEntities.length ===
            dashboardEntities.length
    ) {

        status = "offline";

    } else if (failedEntities.length > 0) {

        status = "degraded";

    }

    if (entities._room_meta) {
        if (entities._room_meta.home_assistant === "offline") {
            status = "offline";
        } else if (
            entities._room_meta.stale &&
            status === "online"
        ) {
            status = "degraded";
        }
    }


    entities._meta = {
        home_assistant: status,
        fetched_at: new Date().toISOString(),
        failed_entities: failedEntities
    };


    return entities;

}


async function sendDashboardState(
    res,
    dashboardId
) {

    const dashboardEntities =
        dashboardConfig.getVisibleEntityIds(
            dashboardId
        );

    const directEntities =
        dashboardConfig.getDirectVisibleEntityIds(
            dashboardId
        );

    const roomWidgets =
        dashboardConfig.getRoomWidgets(
            dashboardId
        );


    try {

        const entities =
            await ha.getEntities(
                directEntities
            );

        if (roomWidgets.length > 0) {
            const roomProjection = Rooms.build(
                await System.getSnapshot(),
                roomWidgets,
                dashboardConfig.getErrorsConfiguration()
            );

            Object.keys(roomProjection.states)
                .forEach(function (entityId) {
                    if (!entities[entityId]) {
                        entities[entityId] =
                            roomProjection.states[entityId];
                    }
                });

            entities._room_alerts =
                roomProjection.alerts;
            entities._room_meta = {
                stale: roomProjection.stale,
                home_assistant:
                    roomProjection.homeAssistantReachable
                        ? "online"
                        : "offline"
            };
        }

        return res.json(
            addDashboardMeta(
                controlAuthorization.addCapabilities(entities),
                dashboardEntities
            )
        );

    } catch (error) {

        logger.error(
            "dashboard_load_failed",
            {
                dashboard_id: dashboardId,
                error: error.message
            }
        );

        return res.status(502).json({
            error:
                "Home Assistant ist nicht erreichbar"
        });

    }

}


function toFiniteNumber(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {

        return null;

    }

    return number;

}


function decimalPlaces(value) {

    const text =
        String(value);

    const position =
        text.indexOf(".");

    if (position === -1) {

        return 0;

    }

    return text.length - position - 1;

}


function normalizeToStep(
    value,
    minimum,
    step
) {

    const places = Math.max(

        decimalPlaces(step),

        decimalPlaces(minimum)

    );

    const normalized =

        minimum +

        Math.round(

            (value - minimum) / step

        ) * step;

    return Number(

        normalized.toFixed(places)

    );

}

function sleep(milliseconds) {

    return new Promise(function (resolve) {

        setTimeout(
            resolve,
            milliseconds
        );

    });

}


function temperaturesEqual(
    firstValue,
    secondValue
) {

    const first =
        toFiniteNumber(firstValue);

    const second =
        toFiniteNumber(secondValue);


    if (
        first === null ||
        second === null
    ) {

        return false;

    }


    return Math.abs(
        first - second
    ) < 0.001;

}


async function waitForTargetTemperature(
    entityId,
    requestedTemperature
) {

    let state = null;

    /*
     * Sofort prüfen und anschließend bis zu
     * fünf weitere Male im Abstand von 500 ms.
     *
     * Maximale zusätzliche Wartezeit:
     * ungefähr 2,5 Sekunden.
     */

    for (
        let attempt = 0;
        attempt < 6;
        attempt++
    ) {

        state =
            await ha.getEntity(entityId);


        if (

            state &&

            state.attributes &&

            temperaturesEqual(

                state.attributes.temperature,

                requestedTemperature

            )

        ) {

            return {

                confirmed: true,

                state: state

            };

        }


        if (attempt < 5) {

            await sleep(500);

        }

    }


    return {

        confirmed: false,

        state: state

    };

}

/* =========================================================
   GATEWAY AND HOME ASSISTANT STATUS
   ========================================================= */

router.get(

    "/status",

    async function (req, res) {

        const homeAssistant =
            await ha.checkConnection();


        res.json({
            status:
                homeAssistant.status === "online"
                    ? "online"
                    : "degraded",
            service: "ha-dashboard-gateway",
            version: projectPackage.version,
            timestamp: new Date().toISOString(),
            home_assistant: homeAssistant
        });

    }

);


/* =========================================================
   SET CLIMATE POWER STATE
   ========================================================= */

router.post(

    "/climate/power",

    async function (req, res) {

        const body = req.body || {};
        const entityId = body.entity;
        const requestedState = body.state;


        if (
            typeof entityId !== "string" ||
            entityId.split(".")[0] !== "climate" ||
            !controlAuthorization.authorization(
                entityId,
                "climate"
            )
        ) {
            return res.status(403).json({
                error:
                    "Diese Klima-Entität ist nicht freigegeben"
            });
        }

        if (
            requestedState !== "on" &&
            requestedState !== "off"
        ) {
            return res.status(400).json({
                error: "Der Klimazustand ist ungültig"
            });
        }

        if (
            Object.prototype.hasOwnProperty.call(body, "hvac_mode") ||
            Object.prototype.hasOwnProperty.call(body, "mode") ||
            Object.prototype.hasOwnProperty.call(body, "preferred_on_mode")
        ) {
            return res.status(400).json({
                error:
                    "Der Einschaltmodus wird ausschließlich serverseitig bestimmt"
            });
        }


        if (
            !allowWrite(
                res,
                "climate:" + entityId
            )
        ) {
            return;
        }


        try {

            const currentState =
                await ha.getEntity(entityId);

            const powerCapabilities =
                controlAuthorization.climateCapabilities(
                    entityId,
                    currentState
                ).details;

            let targetMode;


            if (
                currentState.state === "unavailable" ||
                currentState.state === "unknown"
            ) {
                return res.status(503).json({
                    error:
                        "Das Thermostat ist nicht verfügbar"
                });
            }

            if (requestedState === "on") {
                targetMode = climatePower.resolvePowerOnMode(
                    entityId,
                    currentState,
                    controlAuthorization.authorization(
                        entityId,
                        "climate"
                    ).preferredOnMode
                );

                if (!powerCapabilities.canPowerOn || !targetMode) {
                    return res.status(409).json({
                        error:
                            "Das Thermostat kann nicht eindeutig eingeschaltet werden"
                    });
                }
            } else {
                targetMode = "off";

                if (!powerCapabilities.canPowerOff) {
                    return res.status(409).json({
                        error:
                            "Das Thermostat kann nicht sicher ausgeschaltet werden"
                    });
                }
            }


            await ha.callService(
                "climate",
                "set_hvac_mode",
                {
                    entity_id: entityId,
                    hvac_mode: targetMode
                }
            );


            logger.info(
                "climate_power_set",
                {
                    entity_id: entityId,
                    state: requestedState
                }
            );


            return res.status(202).json({
                ok: true,
                entity: entityId,
                state: requestedState
            });

        } catch (error) {

            if (
                error.response &&
                error.response.status === 404
            ) {
                return res.status(404).json({
                    error: "Die Klima-Entität wurde nicht gefunden"
                });
            }

            logger.error(
                "climate_power_failed",
                {
                    entity_id: entityId,
                    upstream_status:
                        error.response && error.response.status
                            ? error.response.status
                            : null,
                    error: error.message
                }
            );

            return res.status(502).json({
                error:
                    "Home Assistant konnte den Befehl nicht ausführen"
            });

        }

    }

);


/* =========================================================
   DASHBOARD CONFIGURATION
   ========================================================= */

router.get(

    "/dashboards",

    function (req, res) {

        res.json({
            default_dashboard:
                dashboardConfig
                    .getDefaultDashboard()
                    .id,
            dashboards:
                dashboardConfig
                    .getPublicDashboards()
        });

    }

);


router.get(

    "/dashboards/:dashboardId/config",

    function (req, res) {

        const configuration =
            dashboardConfig
                .getPublicDashboardConfig(
                    req.params.dashboardId
                );


        if (!configuration) {
            return res.status(404).json({
                error: "dashboard_not_found"
            });
        }


        return res.json(configuration);

    }

);


router.get(

    "/dashboard/config",

    function (req, res) {

        res.json(
            dashboardConfig
                .getPublicDashboardConfig()
        );

    }

);


/* =========================================================
   DASHBOARD DATA
   ========================================================= */

router.get(

    "/dashboards/:dashboardId/state",

    async function (req, res) {

        const dashboardId =
            req.params.dashboardId;


        if (
            !dashboardConfig
                .getDashboardById(dashboardId)
        ) {
            return res.status(404).json({
                error: "dashboard_not_found"
            });
        }


        return sendDashboardState(
            res,
            dashboardId
        );

    }

);


router.get(

    "/dashboard",

    async function (req, res) {

        return sendDashboardState(
            res,
            dashboardConfig
                .getDefaultDashboard()
                .id
        );

    }

);


/* =========================================================
   SET CLIMATE TARGET TEMPERATURE
   ========================================================= */

router.post(

    "/climate/temperature",

    async function (req, res) {

        const body =
            req.body || {};

        const entityId =
            body.entity_id;

        const requestedTemperature =
            toFiniteNumber(

                body.temperature

            );

        let attemptedWhileOff = false;


        /*
         * Keine beliebigen Entity-IDs aus dem
         * Browser akzeptieren.
         */

        if (

            typeof entityId !== "string" ||
            entityId.split(".")[0] !== "climate" ||
            !controlAuthorization.authorization(
                entityId,
                "climate"
            )

        ) {

            return res.status(403).json({

                error:
                    "Diese Klima-Entität ist " +
                    "nicht freigegeben"

            });

        }


        if (requestedTemperature === null) {

            return res.status(400).json({

                error:
                    "Die Zieltemperatur ist ungültig"

            });

        }


        try {

            const currentState =
                await ha.getEntity(entityId);

            attemptedWhileOff =
                currentState.state === "off";

            const capabilities =
                controlAuthorization.climateCapabilities(
                    entityId,
                    currentState
                ).details;


            if (

                currentState.state ===
                    "unavailable" ||

                currentState.state ===
                    "unknown"

            ) {

                return res.status(503).json({

                    error:
                        "Das Thermostat ist " +
                        "nicht verfügbar"

                });

            }


            if (!capabilities.canSetTemperature) {

                return res.status(409).json({

                    error:
                        "Das Thermostat unterstützt keine sicher validierbare Zieltemperatur"

                });

            }


            const minimum =
                capabilities.temperature.minimum;

            const maximum =
                capabilities.temperature.maximum;

            const step =
                capabilities.temperature.step;


            if (

                requestedTemperature < minimum ||

                requestedTemperature > maximum

            ) {

                return res.status(400).json({

                    error:

                        "Die Zieltemperatur muss " +
                        "zwischen " +

                        minimum +

                        " und " +

                        maximum +

                        " liegen"

                });

            }


            let temperature =
                normalizeToStep(

                    requestedTemperature,

                    minimum,

                    step

                );


            if (temperature < minimum) {

                temperature = minimum;

            }


            if (temperature > maximum) {

                temperature = maximum;

            }


            if (
                !allowWrite(
                    res,
                    "climate:" + entityId
                )
            ) {

                return;

            }


            await ha.callService(

    "climate",

    "set_temperature",

    {

        entity_id:
            entityId,

        temperature:
            temperature

    }

);


const confirmation =

    await waitForTargetTemperature(

        entityId,

        temperature

    );


logger.info(
    "climate_target_set",
    {
        entity_id: entityId,
        temperature: temperature,
        confirmed: confirmation.confirmed
    }
);


/*
 * HTTP 200:
 * Home Assistant meldet bereits den neuen Wert.
 *
 * HTTP 202:
 * Der Befehl wurde angenommen, aber die Entity
 * meldet noch den vorherigen Sollwert.
 */

return res

    .status(

        confirmation.confirmed

            ? 200

            : 202

    )

    .json({

        ok: true,

        confirmed:
            confirmation.confirmed,

        entity_id:
            entityId,

        temperature:
            temperature,

        state:
            confirmation.state

    });

        } catch (error) {

            const upstreamStatus =

                error.response &&
                error.response.status

                    ? error.response.status

                    : null;


            if (upstreamStatus === 404) {
                return res.status(404).json({
                    error: "Die Klima-Entität wurde nicht gefunden"
                });
            }


            logger.error(
                "climate_target_failed",
                {
                    entity_id: entityId,
                    upstream_status: upstreamStatus,
                    error: error.message
                }
            );


            return res.status(502).json({

                error:

                    attemptedWhileOff
                        ? "Die Climate-Integration hat die Zieltemperatur im ausgeschalteten Zustand abgelehnt"
                        : "Home Assistant konnte den Befehl nicht ausführen"

            });

        }

    }

);


/* =========================================================
   SET LIGHT STATE
   ========================================================= */

router.post(

    "/light/state",

    async function (req, res) {

        const body =
            req.body || {};

        const entityId =
            body.entity_id;

        const requestedState =
            body.state;


        if (

            typeof entityId !== "string" ||
            entityId.split(".")[0] !== "light" ||
            !controlAuthorization.authorization(
                entityId,
                "light"
            )

        ) {

            return res.status(403).json({

                error:
                    "Diese Licht-Entität ist " +
                    "nicht freigegeben"

            });

        }


        if (

            requestedState !== "on" &&
            requestedState !== "off"

        ) {

            return res.status(400).json({

                error:
                    "Der Lichtzustand ist ungültig"

            });

        }


        try {

            const currentState =
                await ha.getEntity(entityId);

            const capabilities =
                controlAuthorization.lightCapabilities(
                    entityId,
                    currentState
                );


            if (

                !capabilities.available

            ) {

                return res.status(503).json({

                    error:
                        "Das Licht ist nicht verfügbar"

                });

            }


            if (
                !allowWrite(
                    res,
                    "light:" + entityId
                )
            ) {

                return;

            }


            await ha.callService(

                "light",

                requestedState === "on"
                    ? "turn_on"
                    : "turn_off",

                {

                    entity_id:
                        entityId

                }

            );


            logger.info(
                "light_state_set",
                {
                    entity_id: entityId,
                    state: requestedState
                }
            );


            return res.status(202).json({

                ok: true,

                entity_id:
                    entityId,

                state:
                    requestedState

            });

        } catch (error) {

            const upstreamStatus =

                error.response &&
                error.response.status

                    ? error.response.status

                    : null;


            if (upstreamStatus === 404) {
                return res.status(404).json({
                    error: "Die Licht-Entität wurde nicht gefunden"
                });
            }


            logger.error(
                "light_state_failed",
                {
                    entity_id: entityId,
                    upstream_status: upstreamStatus,
                    error: error.message
                }
            );


            return res.status(502).json({

                error:

                    "Home Assistant konnte " +
                    "den Befehl nicht ausführen"

            });

        }

    }

);


module.exports = router;
