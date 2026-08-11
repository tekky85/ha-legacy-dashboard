/*
 * Read-only activity rules for the Summary system dashboard.
 *
 * Rules only inspect the reduced Sprint-18 snapshot. They neither query Home
 * Assistant nor grant control permissions.
 */

const CATEGORY_DEFINITIONS = {
    security: { title: "Sicherheit", priority: 100 },
    open: { title: "Offen", priority: 90 },
    running: { title: "In Bewegung", priority: 80 },
    cleaning: { title: "Reinigung", priority: 80 },
    climate: { title: "Klima aktiv", priority: 70 },
    media: { title: "Medien", priority: 60 },
    powered: { title: "Eingeschaltet", priority: 50 },
    movement: { title: "Bewegung", priority: 40 },
    other: { title: "Weitere Aktivitäten", priority: 10 }
};

const CATEGORY_ORDER = [
    "security",
    "open",
    "running",
    "cleaning",
    "climate",
    "media",
    "powered",
    "movement",
    "other"
];

const OPEN_DEVICE_CLASSES = [
    "window",
    "door",
    "opening",
    "garage_door"
];

const CLIMATE_ACTIONS = [
    "heating",
    "cooling",
    "drying",
    "fan"
];

const ALARM_STATES = [
    "armed_home",
    "armed_away",
    "armed_night",
    "armed_vacation",
    "armed_custom_bypass",
    "pending",
    "arming",
    "triggered"
];


function lower(value) {
    return String(value || "").toLowerCase();
}


function compareText(first, second) {

    const left = lower(first);
    const right = lower(second);

    if (left < right) {
        return -1;
    }

    if (left > right) {
        return 1;
    }

    return 0;

}


function durationSeconds(startedAt, nowMilliseconds) {

    const started = Date.parse(startedAt || "");

    if (!Number.isFinite(started)) {
        return null;
    }

    return Math.max(
        0,
        Math.floor((nowMilliseconds - started) / 1000)
    );

}


function createItem(entity, definition, nowMilliseconds, details) {

    const attributes = entity.attributes || {};
    const categoryDefinition =
        CATEGORY_DEFINITIONS[definition.category];

    const item = {
        id: "summary-" + entity.entityId.replace(".", "-"),
        entityIds: [entity.entityId],
        category: definition.category,
        priority: categoryDefinition.priority,
        title: attributes.friendlyName || entity.entityId,
        state: entity.state,
        startedAt: entity.lastChanged,
        durationSeconds:
            durationSeconds(entity.lastChanged, nowMilliseconds),
        icon: definition.icon,
        metadata: {
            domain: entity.domain
        }
    };

    if (definition.description) {
        item.description = definition.description;
    }

    if (details && details.mediaTitle) {
        item.metadata.mediaTitle = details.mediaTitle;
    }

    return item;

}


function activityDefinition(entity, settings) {

    const state = lower(entity.state);
    const attributes = entity.attributes || {};
    const deviceClass = lower(attributes.deviceClass);
    const hvacAction = lower(attributes.hvacAction);
    const coverPosition =
        typeof attributes.currentPosition === "number"
            ? " (" + Math.round(attributes.currentPosition) + " %)"
            : "";

    if (state === "unknown" || state === "unavailable") {
        return null;
    }

    if (entity.domain === "light" && state === "on") {
        return {
            category: "powered",
            icon: "light",
            description: "Licht ist eingeschaltet"
        };
    }

    if (entity.domain === "switch" && state === "on") {
        return {
            category: "powered",
            icon: "power",
            description: "Schalter ist eingeschaltet"
        };
    }

    if (
        entity.domain === "binary_sensor" &&
        state === "on" &&
        OPEN_DEVICE_CLASSES.indexOf(deviceClass) !== -1
    ) {
        return {
            category: "open",
            icon: deviceClass === "window" ? "window" : "door",
            description: "Ist geöffnet"
        };
    }

    if (entity.domain === "cover") {
        if (state === "open") {
            return {
                category: "open",
                icon: "cover",
                description: "Ist geöffnet" + coverPosition
            };
        }

        if (state === "opening" || state === "closing") {
            return {
                category: "running",
                icon: "cover",
                description:
                    state === "opening"
                        ? "Wird geöffnet" + coverPosition
                        : "Wird geschlossen" + coverPosition
            };
        }
    }

    if (
        entity.domain === "vacuum" &&
        (
            state === "cleaning" ||
            state === "returning" ||
            state === "paused"
        )
    ) {
        return {
            category: "cleaning",
            icon: "vacuum",
            description:
                state === "returning"
                    ? "Fährt zur Station"
                    : state === "paused"
                        ? "Reinigung pausiert"
                        : "Reinigung läuft"
        };
    }

    if (
        entity.domain === "climate" &&
        CLIMATE_ACTIONS.indexOf(hvacAction) !== -1
    ) {
        return {
            category: "climate",
            icon: hvacAction === "heating" ? "heating" : "climate",
            description:
                hvacAction === "heating"
                    ? "Heizt"
                    : hvacAction === "cooling"
                        ? "Kühlt"
                        : hvacAction === "drying"
                            ? "Entfeuchtet"
                            : "Lüfter aktiv"
        };
    }

    if (entity.domain === "media_player" && state === "playing") {
        return {
            category: "media",
            icon: "media",
            description:
                settings.showMediaTitles && attributes.mediaTitle
                    ? "Spielt: " + attributes.mediaTitle
                    : "Wiedergabe läuft",
            mediaTitle:
                settings.showMediaTitles
                    ? attributes.mediaTitle
                    : null
        };
    }

    if (entity.domain === "fan" && state === "on") {
        return {
            category: "powered",
            icon: "fan",
            description: "Ventilator ist eingeschaltet"
        };
    }

    if (
        entity.domain === "lock" &&
        (
            state === "unlocked" ||
            state === "unlocking" ||
            state === "locking"
        )
    ) {
        return {
            category: "security",
            icon: "lock",
            description:
                state === "unlocked"
                    ? "Ist entriegelt"
                    : state === "unlocking"
                        ? "Wird entriegelt"
                        : "Wird verriegelt"
        };
    }

    if (
        entity.domain === "alarm_control_panel" &&
        ALARM_STATES.indexOf(state) !== -1
    ) {
        return {
            category: "security",
            icon: "security",
            description:
                state === "triggered"
                    ? "Alarm ausgelöst"
                    : "Alarmanlage ist aktiv"
        };
    }

    return null;

}


function sortItems(items) {

    return items.sort(function (first, second) {

        const priorityDifference =
            second.priority - first.priority;

        const categoryDifference =
            CATEGORY_ORDER.indexOf(first.category) -
            CATEGORY_ORDER.indexOf(second.category);

        const durationDifference =
            (second.durationSeconds || 0) -
            (first.durationSeconds || 0);


        return priorityDifference ||
            categoryDifference ||
            durationDifference ||
            compareText(first.title, second.title) ||
            compareText(first.entityIds[0], second.entityIds[0]);

    });

}


function collectActivities(entities, settings, nowMilliseconds) {

    const ignored = Object.create(null);
    const items = [];


    settings.ignoredEntities.forEach(function (entityId) {
        ignored[entityId] = true;
    });

    entities.forEach(function (entity) {

        if (ignored[entity.entityId]) {
            return;
        }

        const definition = activityDefinition(entity, settings);

        if (definition) {
            items.push(
                createItem(
                    entity,
                    definition,
                    nowMilliseconds,
                    definition
                )
            );
        }

    });

    return sortItems(items);

}


function groupActivities(items) {

    return CATEGORY_ORDER.map(function (category) {

        const definition = CATEGORY_DEFINITIONS[category];
        const categoryItems = items.filter(function (item) {
            return item.category === category;
        });

        return {
            category: category,
            title: definition.title,
            priority: definition.priority,
            items: categoryItems
        };

    }).filter(function (group) {
        return group.items.length > 0;
    });

}


module.exports = {
    CATEGORY_DEFINITIONS: CATEGORY_DEFINITIONS,
    CATEGORY_ORDER: CATEGORY_ORDER.slice(0),
    collectActivities: collectActivities,
    groupActivities: groupActivities,
    sortItems: sortItems
};
