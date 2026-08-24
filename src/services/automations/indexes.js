function emptyMap() {
    return Object.create(null);
}


function add(map, identifier, automationEntityId) {
    if (!map[identifier]) {
        map[identifier] = [];
    }

    if (map[identifier].indexOf(automationEntityId) === -1) {
        map[identifier].push(automationEntityId);
    }
}


function create(inventory) {
    const indexes = {
        automationsByEntityId: emptyMap(),
        automationsByDeviceId: emptyMap(),
        automationsByAreaId: emptyMap(),
        automationsByLabelId: emptyMap(),
        inventoryByEntityId: emptyMap(),
        dynamicAutomationEntityIds: []
    };
    const mappings = [
        ["entityIds", "automationsByEntityId"],
        ["deviceIds", "automationsByDeviceId"],
        ["areaIds", "automationsByAreaId"],
        ["labelIds", "automationsByLabelId"]
    ];

    (inventory || []).forEach(function (automation) {
        const references = automation.references || {};

        indexes.inventoryByEntityId[automation.entityId] = automation;

        mappings.forEach(function (mapping) {
            (references[mapping[0]] || []).forEach(function (identifier) {
                add(indexes[mapping[1]], identifier, automation.entityId);
            });
        });

        if (references.dynamicReferences === true) {
            indexes.dynamicAutomationEntityIds.push(automation.entityId);
        }
    });

    return indexes;
}


module.exports = {
    create: create,
    emptyMap: emptyMap
};
