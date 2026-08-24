const ENTITY_ID_PATTERN = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;
const TEMPLATE_PATTERN = /{{|{%|{#/;
const MAX_WALK_DEPTH = 64;
const MAX_WALK_NODES = 10000;


function text(value, maximumLength) {
    return typeof value === "string" && value !== ""
        ? value.slice(0, maximumLength)
        : null;
}


function timestamp(value) {
    const parsed = Date.parse(value || "");

    return Number.isFinite(parsed)
        ? new Date(parsed).toISOString()
        : null;
}


function nonNegativeInteger(value) {
    const number = Number(value);

    return Number.isInteger(number) && number >= 0
        ? number
        : null;
}


function normalizeState(value) {
    const state = String(value || "").toLowerCase();

    if (
        state === "on" ||
        state === "off" ||
        state === "unavailable" ||
        state === "unknown" ||
        state === "missing"
    ) {
        return state;
    }

    return "unknown";
}


function inventory(entities) {
    return (entities || []).filter(function (entity) {
        return entity && entity.domain === "automation";
    }).map(function (entity) {
        const attributes = entity.attributes || {};
        const state = normalizeState(entity.state);

        return {
            entityId: entity.entityId,
            itemId: text(attributes.automationId, 128),
            name:
                text(attributes.friendlyName, 160) ||
                entity.entityId,
            state: state,
            available: state === "on" || state === "off",
            lastTriggered: timestamp(attributes.lastTriggered),
            mode: text(attributes.mode, 32),
            currentRuns: nonNegativeInteger(attributes.currentRuns),
            maxRuns: nonNegativeInteger(attributes.maxRuns),
            references: emptyReferences()
        };
    }).sort(function (first, second) {
        return first.entityId.localeCompare(second.entityId);
    });
}


function emptyReferenceCollection() {
    return {
        entityIds: [],
        deviceIds: [],
        areaIds: [],
        labelIds: []
    };
}


function emptyReferences() {
    return {
        entityIds: [],
        deviceIds: [],
        areaIds: [],
        labelIds: [],
        dynamicReferences: false,
        sections: {
            trigger: emptyReferenceCollection(),
            condition: emptyReferenceCollection(),
            action: emptyReferenceCollection()
        }
    };
}


function addUnique(list, value) {
    if (list.indexOf(value) === -1) {
        list.push(value);
    }
}


function validIdentifier(value, type) {
    if (type === "entityIds") {
        return ENTITY_ID_PATTERN.test(value);
    }

    return value.length <= 128 && IDENTIFIER_PATTERN.test(value);
}


function addReference(references, section, type, value) {
    if (typeof value !== "string") {
        return;
    }

    if (TEMPLATE_PATTERN.test(value)) {
        references.dynamicReferences = true;
        return;
    }

    if (!validIdentifier(value, type)) {
        return;
    }

    addUnique(references[type], value);
    addUnique(references.sections[section][type], value);
}


function collectReferenceValue(references, section, type, value) {
    let index;

    if (Array.isArray(value)) {
        for (index = 0; index < value.length; index++) {
            collectReferenceValue(references, section, type, value[index]);
        }
        return;
    }

    addReference(references, section, type, value);
}


function referenceType(key) {
    const names = {
        entity_id: "entityIds",
        device_id: "deviceIds",
        area_id: "areaIds",
        label_id: "labelIds"
    };

    return names[key] || null;
}


function walk(root, section, references) {
    const stack = [{value: root, depth: 0}];
    let visited = 0;

    while (stack.length > 0) {
        const entry = stack.pop();
        const value = entry.value;
        let index;

        visited += 1;
        if (visited > MAX_WALK_NODES || entry.depth > MAX_WALK_DEPTH) {
            references.dynamicReferences = true;
            return;
        }

        if (typeof value === "string") {
            if (TEMPLATE_PATTERN.test(value)) {
                references.dynamicReferences = true;
            }
            continue;
        }

        if (!value || typeof value !== "object") {
            continue;
        }

        if (Array.isArray(value)) {
            for (index = value.length - 1; index >= 0; index--) {
                stack.push({value: value[index], depth: entry.depth + 1});
            }
            continue;
        }

        Object.keys(value).forEach(function (key) {
            const type = referenceType(String(key).toLowerCase());

            if (type) {
                collectReferenceValue(
                    references,
                    section,
                    type,
                    value[key]
                );
                return;
            }

            stack.push({value: value[key], depth: entry.depth + 1});
        });
    }
}


function references(rawResult) {
    const raw = rawResult && rawResult.config
        ? rawResult.config
        : rawResult;
    const result = emptyReferences();
    const sections = [
        ["trigger", "triggers", "trigger"],
        ["condition", "conditions", "condition"],
        ["action", "actions", "action"]
    ];

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return result;
    }

    if (raw.use_blueprint && typeof raw.use_blueprint === "object") {
        result.dynamicReferences = true;
    }

    sections.forEach(function (definition) {
        const modern = raw[definition[1]];
        const legacy = raw[definition[2]];

        if (typeof modern !== "undefined") {
            walk(modern, definition[0], result);
        }
        if (
            definition[1] !== definition[2] &&
            typeof legacy !== "undefined"
        ) {
            walk(legacy, definition[0], result);
        }
    });

    ["entityIds", "deviceIds", "areaIds", "labelIds"].forEach(
        function (name) {
            result[name].sort();
            Object.keys(result.sections).forEach(function (section) {
                result.sections[section][name].sort();
            });
        }
    );

    return result;
}


function trace(raw) {
    if (!raw || typeof raw !== "object") {
        return null;
    }

    const runId = text(raw.run_id, 128);
    const startedAt = timestamp(raw.timestamp && raw.timestamp.start);
    const finishedAt = timestamp(raw.timestamp && raw.timestamp.finish);
    const execution = text(raw.script_execution, 40);
    const notTriggered = raw.not_triggered === true ||
        execution === "not_triggered";
    const conditionFalse = execution === "failed_conditions";
    const hasError = !notTriggered && !conditionFalse && (
        execution === "error" ||
        typeof raw.error === "string" && raw.error !== ""
    );
    let durationSeconds = null;

    if (startedAt && finishedAt) {
        durationSeconds = Math.max(
            0,
            (Date.parse(finishedAt) - Date.parse(startedAt)) / 1000
        );
    }

    if (!runId || !startedAt) {
        return null;
    }

    return {
        runId: runId,
        startedAt: startedAt,
        finishedAt: finishedAt,
        durationSeconds: durationSeconds,
        result: notTriggered
            ? "not_triggered"
            : conditionFalse
                ? "condition_false"
                : execution || text(raw.state, 40) || "unknown",
        hasError: hasError,
        error: hasError ? "Ausführungsfehler" : null,
        triggerDescription: text(raw.trigger, 160)
    };
}


function traces(rawList, limit) {
    const maximum = Number.isInteger(limit) && limit > 0 ? limit : 3;

    return (Array.isArray(rawList) ? rawList : [])
        .map(trace)
        .filter(Boolean)
        .sort(function (first, second) {
            return Date.parse(second.startedAt) - Date.parse(first.startedAt);
        })
        .slice(0, maximum);
}


module.exports = {
    ENTITY_ID_PATTERN: ENTITY_ID_PATTERN,
    emptyReferences: emptyReferences,
    inventory: inventory,
    normalizeState: normalizeState,
    references: references,
    trace: trace,
    traces: traces
};
