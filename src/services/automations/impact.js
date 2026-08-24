const CONFIDENCE_ORDER = {
    direct: 0,
    indirect: 1,
    unknown: 2
};


function addReason(result, inventory, automationEntityId, confidence, reason) {
    const automation = inventory[automationEntityId];

    if (!automation) {
        return;
    }

    if (!result[automationEntityId]) {
        result[automationEntityId] = {
            entityId: automation.entityId,
            name: automation.name,
            state: automation.state,
            available: automation.available,
            disabled: automation.state === "off",
            lastTriggered: automation.lastTriggered,
            confidence: confidence,
            reasons: [reason],
            dynamicReferences:
                automation.references &&
                automation.references.dynamicReferences === true
        };
        return;
    }

    const current = result[automationEntityId];

    if (
        CONFIDENCE_ORDER[confidence] <
        CONFIDENCE_ORDER[current.confidence]
    ) {
        current.confidence = confidence;
    }

    if (current.reasons.indexOf(reason) === -1) {
        current.reasons.push(reason);
    }
}


function addFromIndex(result, inventory, index, identifier, confidence, reason) {
    if (!identifier || !index[identifier]) {
        return;
    }

    index[identifier].forEach(function (automationEntityId) {
        addReason(
            result,
            inventory,
            automationEntityId,
            confidence,
            reason
        );
    });
}


function identifiersForIssue(snapshot, issue, knownEntity) {
    const metadata = snapshot.metadata || {};
    const entities = metadata.entities || {};
    const devices = metadata.devices || {};
    const registry = issue.entityId
        ? entities[issue.entityId] || null
        : null;
    const device = registry && registry.deviceId
        ? devices[registry.deviceId] || null
        : null;
    const entity = knownEntity || (snapshot.entities || []).find(
        function (item) {
            return item.entityId === issue.entityId;
        }
    );
    const context = entity && entity.context ? entity.context : {};
    const areaId = registry && registry.areaId ||
        context.areaId ||
        device && device.areaId ||
        null;
    const area = areaId && metadata.areas
        ? metadata.areas[areaId] || null
        : null;
    const labelIds = [];

    (registry && registry.labelIds || []).forEach(function (labelId) {
        if (labelIds.indexOf(labelId) === -1) {
            labelIds.push(labelId);
        }
    });
    (device && device.labelIds || []).forEach(function (labelId) {
        if (labelIds.indexOf(labelId) === -1) {
            labelIds.push(labelId);
        }
    });
    (area && area.labelIds || []).forEach(function (labelId) {
        if (labelIds.indexOf(labelId) === -1) {
            labelIds.push(labelId);
        }
    });

    return {
        entityId: issue.entityId || null,
        deviceId: registry && registry.deviceId || context.deviceId || null,
        areaId: areaId,
        labelIds: labelIds
    };
}


function forIssue(snapshot, issue, knownEntity) {
    const automation = snapshot.automations || {};
    const indexes = automation.indexes || {};
    const inventory = indexes.inventoryByEntityId || {};
    const identifiers = identifiersForIssue(
        snapshot,
        issue,
        knownEntity
    );
    const result = Object.create(null);

    addFromIndex(
        result,
        inventory,
        indexes.automationsByEntityId || {},
        identifiers.entityId,
        "direct",
        "entity"
    );
    addFromIndex(
        result,
        inventory,
        indexes.automationsByDeviceId || {},
        identifiers.deviceId,
        "direct",
        "device"
    );
    addFromIndex(
        result,
        inventory,
        indexes.automationsByAreaId || {},
        identifiers.areaId,
        "indirect",
        "area"
    );
    identifiers.labelIds.forEach(function (labelId) {
        addFromIndex(
            result,
            inventory,
            indexes.automationsByLabelId || {},
            labelId,
            "indirect",
            "label"
        );
    });

    return Object.keys(result).map(function (entityId) {
        return result[entityId];
    }).sort(function (first, second) {
        return CONFIDENCE_ORDER[first.confidence] -
            CONFIDENCE_ORDER[second.confidence] ||
            first.name.localeCompare(second.name) ||
            first.entityId.localeCompare(second.entityId);
    });
}


function merge(first, second) {
    const result = Object.create(null);

    (first || []).concat(second || []).forEach(function (impact) {
        const current = result[impact.entityId];

        if (!current) {
            result[impact.entityId] = Object.assign({}, impact, {
                reasons: (impact.reasons || []).slice(0)
            });
            return;
        }

        if (
            CONFIDENCE_ORDER[impact.confidence] <
            CONFIDENCE_ORDER[current.confidence]
        ) {
            current.confidence = impact.confidence;
        }

        (impact.reasons || []).forEach(function (reason) {
            if (current.reasons.indexOf(reason) === -1) {
                current.reasons.push(reason);
            }
        });
    });

    return Object.keys(result).map(function (entityId) {
        return result[entityId];
    }).sort(function (left, right) {
        return CONFIDENCE_ORDER[left.confidence] -
            CONFIDENCE_ORDER[right.confidence] ||
            left.name.localeCompare(right.name);
    });
}


function analysis(snapshot) {
    const automation = snapshot.automations || {};
    const inventory = automation.inventory || [];
    const indexes = automation.indexes || {};
    const configSource = snapshot.sources &&
        snapshot.sources.automationConfig || {};

    return {
        inventoryCount: inventory.length,
        configuredCount: inventory.filter(function (item) {
            const references = item.references || {};
            return references.entityIds && (
                references.entityIds.length > 0 ||
                references.deviceIds.length > 0 ||
                references.areaIds.length > 0 ||
                references.labelIds.length > 0 ||
                references.dynamicReferences === true
            );
        }).length,
        dynamicCount:
            (indexes.dynamicAutomationEntityIds || []).length,
        unknownConfidence: "unknown",
        configStatus: configSource.supported === false
            ? "unsupported"
            : configSource.stale
                ? "stale"
                : configSource.ok
                    ? "available"
                    : configSource.supported === null
                        ? "unknown"
                        : "error"
    };
}


module.exports = {
    CONFIDENCE_ORDER: CONFIDENCE_ORDER,
    analysis: analysis,
    forIssue: forIssue,
    identifiersForIssue: identifiersForIssue,
    merge: merge
};
