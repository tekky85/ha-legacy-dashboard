const axios = require("axios");

const client = axios.create({
    baseURL: process.env.HA_URL,
    headers: {
        Authorization: `Bearer ${process.env.HA_TOKEN}`,
        "Content-Type": "application/json"
    }
});

async function getEntity(entityId) {
    const response = await client.get(`/api/states/${entityId}`);
    return response.data;
}

async function getEntities(entityIds) {
    const result = {};

    for (const id of entityIds) {
        try {
            result[id] = await getEntity(id);
        } catch (err) {
            result[id] = {
                error: err.message
            };
        }
    }

    return result;
}

module.exports = {
    getEntity,
    getEntities
};
