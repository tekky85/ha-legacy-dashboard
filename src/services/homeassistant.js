const axios = require("axios");

const HA_URL = (process.env.HA_URL || "").replace(/\/$/, "");
const HA_TOKEN = process.env.HA_TOKEN || "";

if (!HA_URL || !HA_TOKEN) {
    throw new Error(
        "HA_URL oder HA_TOKEN fehlt in der .env-Datei"
    );
}

const client = axios.create({

    baseURL: HA_URL,

    timeout: 10000,

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

    getEntity: getEntity,

    getEntities: getEntities,

    callService: callService

};
