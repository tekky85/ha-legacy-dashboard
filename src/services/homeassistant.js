const axios = require("axios");

const Runtime = require("../config/runtime");

const HA_REQUEST_TIMEOUT_MS = 10000;


function createService(options) {

    const settings = options || {};
    const connection = settings.connection ||
        Runtime.resolveHomeAssistantConnection();

    const client = settings.client || axios.create({
        baseURL: connection.restBaseUrl,
        timeout:
            settings.requestTimeoutMs ||
            HA_REQUEST_TIMEOUT_MS,
        headers: {
            Authorization:
                "Bearer " + connection.token,
            "Content-Type": "application/json"
        }
    });


    async function getEntity(entityId) {

        const response = await client.get(
            "/states/" +
            encodeURIComponent(entityId)
        );

        return response.data;
    }


    async function checkConnection() {

        try {
            await client.get("/");

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
            await client.get("/states");

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
            "/services/" +
            encodeURIComponent(domain) +
            "/" +
            encodeURIComponent(service),
            serviceData || {}
        );

        return response.data;
    }


    return {
        checkConnection: checkConnection,
        getEntity: getEntity,
        getEntities: getEntities,
        getAllEntities: getAllEntities,
        callService: callService
    };
}


let defaultService = null;


function getDefaultService() {

    if (!defaultService) {
        defaultService = createService();
    }

    return defaultService;
}


module.exports = {
    HA_REQUEST_TIMEOUT_MS: HA_REQUEST_TIMEOUT_MS,
    createService: createService,
    checkConnection: function () {
        return getDefaultService()
            .checkConnection();
    },
    getEntity: function (entityId) {
        return getDefaultService()
            .getEntity(entityId);
    },
    getEntities: function (entityIds) {
        return getDefaultService()
            .getEntities(entityIds);
    },
    getAllEntities: function () {
        return getDefaultService()
            .getAllEntities();
    },
    callService: function (
        domain,
        service,
        serviceData
    ) {
        return getDefaultService()
            .callService(
                domain,
                service,
                serviceData
            );
    }
};
