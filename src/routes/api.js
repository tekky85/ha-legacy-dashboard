const express = require("express");

const router = express.Router();

const ha =
    require("../services/homeassistant");


const DASHBOARD_ENTITIES = [

    "sensor.badezimmer_smart_indoor_module_temperatur",

    "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit",

    "binary_sensor.kuche_fenster_rechts",

    "climate.esszimmer_thermostate"

];


/*
 * Nur diese Climate-Entitäten dürfen über
 * das Gateway gesteuert werden.
 */

const ALLOWED_CLIMATE_ENTITIES = [

    "climate.esszimmer_thermostate"

];


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
   DASHBOARD DATA
   ========================================================= */

router.get(

    "/dashboard",

    async function (req, res) {

        try {

            const entities =
                await ha.getEntities(

                    DASHBOARD_ENTITIES

                );

            res.json(entities);

        } catch (error) {

            console.error(

                "Dashboard-Daten konnten " +
                "nicht geladen werden:",

                error.message

            );

            res.status(502).json({

                error:
                    "Home Assistant ist nicht erreichbar"

            });

        }

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


        /*
         * Keine beliebigen Entity-IDs aus dem
         * Browser akzeptieren.
         */

        if (

            typeof entityId !== "string" ||

            ALLOWED_CLIMATE_ENTITIES
                .indexOf(entityId) === -1

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

            const attributes =
                currentState.attributes || {};


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


            const minimumValue =
                toFiniteNumber(

                    attributes.min_temp

                );

            const maximumValue =
                toFiniteNumber(

                    attributes.max_temp

                );

            const stepValue =
                toFiniteNumber(

                    attributes.target_temp_step

                );


            const minimum =

                minimumValue !== null

                    ? minimumValue

                    : 5;


            const maximum =

                maximumValue !== null

                    ? maximumValue

                    : 35;


            const step =

                stepValue !== null &&
                stepValue > 0

                    ? stepValue

                    : 0.5;


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


console.log(

    "Climate target:",

    entityId,

    temperature,

    "confirmed:",

    confirmation.confirmed

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


            console.error(

                "Zieltemperatur konnte " +
                "nicht gesetzt werden:",

                upstreamStatus ||
                    "kein HTTP-Status",

                error.message

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
