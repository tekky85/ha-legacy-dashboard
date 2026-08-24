/*
 * Normalized, reduced system snapshot.
 *
 * This is an internal read-only model. Public APIs receive only metadata
 * derived by toPublicMeta(), never the complete entity list.
 */

const ENTITY_ID_PATTERN =
    /^[a-z0-9_]+\.[a-z0-9_]+$/;

const TEXT_ATTRIBUTES = [
    ["friendly_name", "friendlyName", 160],
    ["device_class", "deviceClass", 80],
    ["unit_of_measurement", "unitOfMeasurement", 40],
    ["icon", "icon", 120],
    ["hvac_action", "hvacAction", 80],
    ["media_title", "mediaTitle", 256],
    ["media_content_type", "mediaContentType", 80],
    ["id", "automationId", 128],
    ["mode", "mode", 32],
    ["last_triggered", "lastTriggered", 64]
];

const NUMBER_ATTRIBUTES = [
    ["current_position", "currentPosition"],
    ["battery_level", "batteryLevel"],
    ["current", "currentRuns"],
    ["max", "maxRuns"]
];


function normalizeText(value, maximumLength) {

    if (
        typeof value !== "string" &&
        typeof value !== "number" &&
        typeof value !== "boolean"
    ) {
        return null;
    }

    return String(value).slice(0, maximumLength);

}


function normalizeNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;

}


function normalizeTimestamp(value) {

    if (typeof value !== "string" || value === "") {
        return null;
    }

    const milliseconds = Date.parse(value);

    if (!Number.isFinite(milliseconds)) {
        return null;
    }

    return new Date(milliseconds).toISOString();

}


function normalizeAttributes(attributes) {

    const source =
        attributes && typeof attributes === "object"
            ? attributes
            : {};

    const normalized = {};


    TEXT_ATTRIBUTES.forEach(function (definition) {

        const value = normalizeText(
            source[definition[0]],
            definition[2]
        );

        if (value !== null) {
            normalized[definition[1]] = value;
        }

    });


    NUMBER_ATTRIBUTES.forEach(function (definition) {

        const value = normalizeNumber(
            source[definition[0]]
        );

        if (value !== null) {
            normalized[definition[1]] = value;
        }

    });


    return normalized;

}


function normalizeEntity(rawState) {

    if (!rawState || typeof rawState !== "object") {
        return null;
    }

    const entityId = rawState.entity_id;

    if (
        typeof entityId !== "string" ||
        !ENTITY_ID_PATTERN.test(entityId)
    ) {
        return null;
    }

    return {
        entityId: entityId,
        domain: entityId.split(".", 1)[0],
        state: normalizeText(rawState.state, 512) || "",
        attributes: normalizeAttributes(rawState.attributes),
        lastChanged: normalizeTimestamp(rawState.last_changed),
        lastUpdated: normalizeTimestamp(rawState.last_updated)
    };

}


function normalizeEntities(rawStates) {

    if (!Array.isArray(rawStates)) {
        return [];
    }

    return rawStates
        .map(normalizeEntity)
        .filter(Boolean)
        .sort(function (first, second) {
            return first.entityId.localeCompare(second.entityId);
        });

}


function cloneEntity(entity) {

    const clone = {
        entityId: entity.entityId,
        domain: entity.domain,
        state: entity.state,
        attributes: Object.assign({}, entity.attributes),
        lastChanged: entity.lastChanged,
        lastUpdated: entity.lastUpdated
    };

    if (entity.context) {
        clone.context = Object.assign({}, entity.context);
    }

    return clone;

}


function cloneSources(sources, stale) {

    const result = {};

    Object.keys(sources || {}).forEach(function (name) {
        const source = sources[name] || {};
        result[name] = Object.assign({}, source);

        if (name !== "states" && stale && source.ok) {
            result[name].ok = false;
            result[name].stale = true;
        }
    });

    return result;

}


function createSuccessful(rawStates, collectedAt) {

    return {
        version: 1,
        collectedAt: collectedAt,
        lastSuccessfulCollectionAt: collectedAt,
        stale: false,
        gateway: {
            reachable: true
        },
        homeAssistant: {
            reachable: true
        },
        sources: {
            states: {
                supported: true,
                ok: true,
                stale: false,
                lastSuccessfulAt: collectedAt,
                errorCode: null,
                error: null
            }
        },
        entities: normalizeEntities(rawStates)
    };

}


function createStale(lastSuccessful, collectedAt, errorCode) {

    return {
        version: lastSuccessful && lastSuccessful.version
            ? lastSuccessful.version
            : 1,
        collectedAt: collectedAt,
        lastSuccessfulCollectionAt:
            lastSuccessful
                ? lastSuccessful.lastSuccessfulCollectionAt
                : null,
        stale: true,
        gateway: {
            reachable: true
        },
        homeAssistant: {
            reachable: false
        },
        sources: Object.assign(
            cloneSources(
                lastSuccessful ? lastSuccessful.sources : {},
                true
            ),
            {
                states: {
                    supported: true,
                    ok: false,
                    stale: true,
                    lastSuccessfulAt:
                        lastSuccessful
                            ? lastSuccessful.lastSuccessfulCollectionAt
                            : null,
                    errorCode:
                        errorCode ||
                        "home_assistant_unavailable",
                    error:
                        errorCode ||
                        "home_assistant_unavailable"
                }
            }
        ),
        entities:
            lastSuccessful
                ? lastSuccessful.entities.map(cloneEntity)
                : [],
        metadata:
            lastSuccessful && lastSuccessful.metadata
                ? lastSuccessful.metadata
                : undefined,
        diagnostics:
            lastSuccessful && lastSuccessful.diagnostics
                ? lastSuccessful.diagnostics
                : undefined,
        capabilities:
            lastSuccessful && lastSuccessful.capabilities
                ? lastSuccessful.capabilities
                : undefined,
        automations:
            lastSuccessful && lastSuccessful.automations
                ? lastSuccessful.automations
                : undefined
    };

}


function publicSource(source) {

    const errorCode =
        source.errorCode || source.error || null;

    return {
        supported:
            typeof source.supported === "boolean"
                ? source.supported
                : null,
        ok: source.ok === true,
        stale: source.stale === true,
        last_successful_at:
            source.lastSuccessfulAt || null,
        error_code: errorCode,
        error: errorCode
    };

}


function toPublicMeta(snapshot) {

    const sources = {};

    Object.keys(snapshot.sources || {}).forEach(function (name) {
        sources[name] = publicSource(snapshot.sources[name] || {});
    });

    return {
        gateway: {
            reachable: Boolean(
                snapshot.gateway &&
                snapshot.gateway.reachable
            )
        },
        home_assistant: {
            reachable: Boolean(
                snapshot.homeAssistant &&
                snapshot.homeAssistant.reachable
            )
        },
        stale: Boolean(snapshot.stale),
        collected_at: snapshot.collectedAt,
        last_successful_update:
            snapshot.lastSuccessfulCollectionAt,
        sources: sources,
        capabilities: Object.assign({}, snapshot.capabilities || {}),
        entity_count: snapshot.entities.length
    };

}


module.exports = {
    createStale: createStale,
    createSuccessful: createSuccessful,
    normalizeAttributes: normalizeAttributes,
    normalizeEntities: normalizeEntities,
    normalizeEntity: normalizeEntity,
    publicSource: publicSource,
    toPublicMeta: toPublicMeta
};
