const SAFE_POWER_ON_MODES = Object.freeze({
    "climate.esszimmer_thermostate": "heat"
});


function normalizedModes(state) {

    const attributes =
        state && state.attributes
            ? state.attributes
            : {};

    const modes = Array.isArray(attributes.hvac_modes)
        ? attributes.hvac_modes
        : [];

    return modes.filter(function (mode, index) {
        return (
            typeof mode === "string" &&
            mode !== "" &&
            modes.indexOf(mode) === index
        );
    });

}


function resolvePowerOnMode(entityId, state) {

    const nonOffModes = normalizedModes(state)
        .filter(function (mode) {
            return mode !== "off";
        });

    const configuredMode =
        SAFE_POWER_ON_MODES[entityId];


    if (nonOffModes.length === 1) {
        return nonOffModes[0];
    }

    if (
        nonOffModes.length > 1 &&
        configuredMode &&
        nonOffModes.indexOf(configuredMode) !== -1
    ) {
        return configuredMode;
    }

    return null;

}


function capabilities(entityId, state) {

    const currentState =
        state && typeof state.state === "string"
            ? state.state
            : "unavailable";

    const modes = normalizedModes(state);
    const available =
        currentState !== "unavailable" &&
        currentState !== "unknown";

    return {
        canPowerOn: Boolean(
            available &&
            currentState === "off" &&
            resolvePowerOnMode(entityId, state)
        ),
        canPowerOff: Boolean(
            available &&
            currentState !== "off" &&
            modes.indexOf("off") !== -1
        )
    };

}


module.exports = {
    capabilities: capabilities,
    resolvePowerOnMode: resolvePowerOnMode
};
