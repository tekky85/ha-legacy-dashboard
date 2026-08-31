/*
 * Climate capability and safe power-mode resolution.
 *
 * No entity ID is special here. Every decision is derived from the current
 * HA state plus an optional persisted, server-side preferred mode.
 */

const TARGET_TEMPERATURE_FEATURE = 1;
const lastNonOffModes = Object.create(null);

const MODE_PRIORITY = [
    "auto",
    "heat_cool",
    "heat",
    "cool",
    "dry",
    "fan_only"
];


function finiteNumber(value) {

    if (
        value === null ||
        typeof value === "undefined" ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;

}


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
            /^[a-z0-9_]+$/.test(mode) &&
            modes.indexOf(mode) === index
        );
    });

}


function rememberNonOffMode(entityId, state) {

    const currentMode =
        state && typeof state.state === "string"
            ? state.state
            : null;

    if (
        typeof entityId === "string" &&
        currentMode &&
        currentMode !== "off" &&
        currentMode !== "unknown" &&
        currentMode !== "unavailable" &&
        normalizedModes(state).indexOf(currentMode) !== -1
    ) {
        lastNonOffModes[entityId] = currentMode;
    }

}


function deterministicFallback(nonOffModes) {

    let index;

    for (index = 0; index < MODE_PRIORITY.length; index += 1) {
        if (nonOffModes.indexOf(MODE_PRIORITY[index]) !== -1) {
            return MODE_PRIORITY[index];
        }
    }

    return nonOffModes.length > 0
        ? nonOffModes[0]
        : null;

}


function resolvePowerOnMode(entityId, state, preferredOnMode) {

    const nonOffModes = normalizedModes(state)
        .filter(function (mode) {
            return mode !== "off";
        });

    const rememberedMode = lastNonOffModes[entityId];
    const currentMode =
        state && typeof state.state === "string"
            ? state.state
            : null;

    if (
        rememberedMode &&
        nonOffModes.indexOf(rememberedMode) !== -1
    ) {
        return rememberedMode;
    }

    if (
        typeof preferredOnMode === "string" &&
        nonOffModes.indexOf(preferredOnMode) !== -1
    ) {
        return preferredOnMode;
    }

    if (
        currentMode &&
        currentMode !== "off" &&
        nonOffModes.indexOf(currentMode) !== -1
    ) {
        return currentMode;
    }

    return deterministicFallback(nonOffModes);

}


function temperatureConstraints(state) {

    const attributes =
        state && state.attributes
            ? state.attributes
            : {};

    const minimum = finiteNumber(attributes.min_temp);
    const maximum = finiteNumber(attributes.max_temp);
    const step = finiteNumber(attributes.target_temp_step);
    const target = finiteNumber(attributes.temperature);
    const supportedFeatures = finiteNumber(
        attributes.supported_features
    );
    const featureSupported =
        supportedFeatures === null ||
        (
            (Math.floor(supportedFeatures) &
                TARGET_TEMPERATURE_FEATURE) !== 0
        );

    if (
        !featureSupported ||
        target === null ||
        minimum === null ||
        maximum === null ||
        step === null ||
        minimum >= maximum ||
        step <= 0
    ) {
        return null;
    }

    return {
        minimum: minimum,
        maximum: maximum,
        step: step,
        target: target
    };

}


function capabilities(entityId, state, authorization) {

    const currentState =
        state && typeof state.state === "string"
            ? state.state
            : "unavailable";

    const modes = normalizedModes(state);
    const nonOffModes = modes.filter(function (mode) {
        return mode !== "off";
    });
    const available =
        currentState !== "unavailable" &&
        currentState !== "unknown";
    const authorized = Boolean(
        authorization &&
        authorization.domain === "climate" &&
        authorization.entityId === entityId
    );
    const supportsPower =
        modes.indexOf("off") !== -1 &&
        nonOffModes.length > 0;
    const temperature = temperatureConstraints(state);

    rememberNonOffMode(entityId, state);

    return {
        authorized: authorized,
        available: available,
        supportsPower: supportsPower,
        canPowerOn: Boolean(
            authorized &&
            available &&
            supportsPower &&
            currentState === "off" &&
            resolvePowerOnMode(
                entityId,
                state,
                authorization.preferredOnMode
            )
        ),
        canPowerOff: Boolean(
            authorized &&
            available &&
            supportsPower &&
            nonOffModes.indexOf(currentState) !== -1
        ),
        canSetTemperature: Boolean(
            authorized &&
            available &&
            temperature
        ),
        temperature: temperature
    };

}


function resetRememberedModes() {

    Object.keys(lastNonOffModes).forEach(function (entityId) {
        delete lastNonOffModes[entityId];
    });

}


module.exports = {
    TARGET_TEMPERATURE_FEATURE: TARGET_TEMPERATURE_FEATURE,
    normalizedModes: normalizedModes,
    rememberNonOffMode: rememberNonOffMode,
    resolvePowerOnMode: resolvePowerOnMode,
    temperatureConstraints: temperatureConstraints,
    capabilities: capabilities,
    resetRememberedModes: resetRememberedModes
};
