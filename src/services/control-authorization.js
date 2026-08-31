/*
 * Shared server-side control authorization and public capability projection.
 * Visibility never grants writes; only persisted widget control grants do.
 */

const dashboardConfig = require("../config/dashboard");
const climatePower = require("./climate-power");


function authorization(entityId, domain) {

    const granted =
        dashboardConfig.getControlAuthorization(entityId);

    if (
        !granted ||
        granted.domain !== domain ||
        entityId.split(".")[0] !== domain
    ) {
        return null;
    }

    return granted;

}


function lightCapabilities(entityId, state) {

    const granted = authorization(entityId, "light");
    const available = Boolean(
        state &&
        (state.state === "on" || state.state === "off")
    );
    const allowed = Boolean(granted && available);

    return {
        authorized: Boolean(granted),
        available: available,
        public: {
            can_light_power_on: allowed,
            can_light_power_off: allowed
        }
    };

}


function climateCapabilities(entityId, state) {

    const granted = authorization(entityId, "climate");
    const capabilities = climatePower.capabilities(
        entityId,
        state,
        granted
    );

    return {
        authorization: granted,
        details: capabilities,
        public: {
            can_set_temperature:
                capabilities.canSetTemperature,
            supports_power:
                capabilities.supportsPower,
            can_power_on:
                capabilities.canPowerOn,
            can_power_off:
                capabilities.canPowerOff
        }
    };

}


function addCapabilities(entities) {

    Object.keys(entities || {}).forEach(function (entityId) {
        const state = entities[entityId];
        const domain = entityId.split(".")[0];

        if (!state || typeof state !== "object") {
            return;
        }

        if (domain === "light") {
            state.gateway_capabilities =
                lightCapabilities(entityId, state).public;
        } else if (domain === "climate") {
            state.gateway_capabilities =
                climateCapabilities(entityId, state).public;
        }
    });

    return entities;

}


module.exports = {
    authorization: authorization,
    lightCapabilities: lightCapabilities,
    climateCapabilities: climateCapabilities,
    addCapabilities: addCapabilities
};
