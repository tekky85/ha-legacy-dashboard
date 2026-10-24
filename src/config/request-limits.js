"use strict";

const CONTROL_JSON_MAX_BYTES = 16 * 1024;
const DEFAULT_ADMIN_CONFIG_MAX_BYTES = 1024 * 1024;
const MAX_ADMIN_CONFIG_MAX_BYTES = 16 * 1024 * 1024;

function resolveAdminConfigMaxBytes(environment) {
    const env = environment || process.env;
    const configured = env.ADMIN_CONFIG_MAX_BYTES;

    if (typeof configured === "undefined" || configured === "") {
        return DEFAULT_ADMIN_CONFIG_MAX_BYTES;
    }

    if (
        !/^[0-9]+$/.test(String(configured)) ||
        !Number.isSafeInteger(Number(configured)) ||
        Number(configured) < CONTROL_JSON_MAX_BYTES ||
        Number(configured) > MAX_ADMIN_CONFIG_MAX_BYTES
    ) {
        throw new RangeError(
            "ADMIN_CONFIG_MAX_BYTES must be an integer between " +
            CONTROL_JSON_MAX_BYTES + " and " + MAX_ADMIN_CONFIG_MAX_BYTES
        );
    }

    return Number(configured);
}

module.exports = {
    CONTROL_JSON_MAX_BYTES: CONTROL_JSON_MAX_BYTES,
    DEFAULT_ADMIN_CONFIG_MAX_BYTES: DEFAULT_ADMIN_CONFIG_MAX_BYTES,
    MAX_ADMIN_CONFIG_MAX_BYTES: MAX_ADMIN_CONFIG_MAX_BYTES,
    resolveAdminConfigMaxBytes: resolveAdminConfigMaxBytes
};
