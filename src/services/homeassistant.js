const axios = require("axios");

const HA_URL = (process.env.HA_URL || "").replace(/\/$/, "");
const HA_TOKEN = process.env.HA_TOKEN || "";
const HA_REQUEST_TIMEOUT_MS = 10000;

if (!HA_URL || !HA_TOKEN) {
    throw new Error(
        "HA_URL oder HA_TOKEN fehlt in der .env-Datei"
    );
}

const client = axios.create({

    baseURL: HA_URL,

    timeout: HA_REQUEST_TIMEOUT_MS,

    headers: {

        Authorization:
            "Bearer " + HA_TOKEN,

        "Content-Type":
            "application/json"

    }

});


async function getEntity(entityId) {

    const response = await client.get(

        "/api/states/" +
        encodeURIComponent(entityId)

    );

    return response.data;

}


async function checkConnection() {

    try {

        await client.get("/api/");

        return {
            status: "online"
        };

    } catch (error) {

        return {
            status: "offline",
            http_status:
                error.response &&
                error.response.status

                    ? error.response.status

                    : null
        };

    }

}


async function getEntities(entityIds) {

    const result = {};

    await Promise.all(

        entityIds.map(

            async function (entityId) {

                try {

                    result[entityId] =
                        await getEntity(entityId);

                } catch (error) {

                    result[entityId] = {

                        entity_id: entityId,

                        state: "unavailable",

                        attributes: {},

                        gateway_error: true

                    };

                }

            }

        )

    );

    return result;

}


async function getAllEntities() {

    const response =
        await client.get("/api/states");

    return Array.isArray(response.data)
        ? response.data
        : [];

}


async function callService(
    domain,
    service,
    serviceData
) {

    const response = await client.post(

        "/api/services/" +
        encodeURIComponent(domain) +
        "/" +
        encodeURIComponent(service),

        serviceData || {}

    );

    return response.data;

}


module.exports = {

    checkConnection: checkConnection,

    getEntity: getEntity,

    getEntities: getEntities,

    getAllEntities: getAllEntities,

    callService: callService

};
