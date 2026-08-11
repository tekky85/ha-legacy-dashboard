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
    ["media_content_type", "mediaContentType", 80]
];

const NUMBER_ATTRIBUTES = [
    ["current_position", "currentPosition"],
    ["battery_level", "batteryLevel"]
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

    return {
        entityId: entity.entityId,
        domain: entity.domain,
        state: entity.state,
        attributes: Object.assign({}, entity.attributes),
        lastChanged: entity.lastChanged,
        lastUpdated: entity.lastUpdated
    };

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
                ok: true,
                error: null
            }
        },
        entities: normalizeEntities(rawStates)
    };

}


function createStale(lastSuccessful, collectedAt, errorCode) {

    return {
        version: 1,
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
        sources: {
            states: {
                ok: false,
                error:
                    errorCode ||
                    "home_assistant_unavailable"
            }
        },
        entities:
            lastSuccessful
                ? lastSuccessful.entities.map(cloneEntity)
                : []
    };

}


function toPublicMeta(snapshot) {

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
        sources: {
            states: {
                ok: Boolean(
                    snapshot.sources &&
                    snapshot.sources.states &&
                    snapshot.sources.states.ok
                ),
                error:
                    snapshot.sources &&
                    snapshot.sources.states
                        ? snapshot.sources.states.error
                        : "system_snapshot_unavailable"
            }
        },
        entity_count: snapshot.entities.length
    };

}


module.exports = {
    createStale: createStale,
    createSuccessful: createSuccessful,
    normalizeAttributes: normalizeAttributes,
    normalizeEntities: normalizeEntities,
    normalizeEntity: normalizeEntity,
    toPublicMeta: toPublicMeta
};
