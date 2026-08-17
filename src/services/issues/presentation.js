const Severity = require("./severity");


function emptyCounts() {

    return {
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
        unknown: 0
    };

}


function incrementCounts(counts, issue) {

    if (Severity.LEVELS.indexOf(issue.severity) !== -1) {
        counts[issue.severity] += 1;
    }

    if (issue.state === "unknown") {
        counts.unknown += 1;
    }

}


function compareText(first, second) {

    const left = String(first || "").toLowerCase();
    const right = String(second || "").toLowerCase();

    if (left < right) {
        return -1;
    }

    if (left > right) {
        return 1;
    }

    return 0;

}


function compareGroups(first, second) {

    const severityDifference =
        Severity.LEVELS.indexOf(first.severity) -
        Severity.LEVELS.indexOf(second.severity);

    const securityDifference =
        Number(second.securityRelevant) -
        Number(first.securityRelevant);

    const durationDifference =
        (second.durationSeconds || 0) -
        (first.durationSeconds || 0);

    return severityDifference ||
        securityDifference ||
        durationDifference ||
        compareText(first.title, second.title) ||
        compareText(first.id, second.id);

}


function entityIndex(snapshot) {

    const result = Object.create(null);

    (snapshot.entities || []).forEach(function (entity) {
        result[entity.entityId] = entity;
    });

    return result;

}


function publicChild(issue, entity, registry) {

    const attributes = entity && entity.attributes
        ? entity.attributes
        : {};

    return {
        id: issue.id,
        title:
            attributes.friendlyName ||
            (registry && (registry.name || registry.originalName)) ||
            issue.entityId ||
            issue.title ||
            "Unbenannte Störung",
        entityId: issue.entityId || null,
        state: issue.state || null,
        severity: issue.severity,
        durationSeconds:
            typeof issue.durationSeconds === "number"
                ? issue.durationSeconds
                : null,
        securityRelevant: issue.securityRelevant === true,
        description: issue.description || null,
        source: issue.source || null,
        fixable: issue.fixable === true
    };

}


function deviceTitle(device, entity, registry) {

    const attributes = entity && entity.attributes
        ? entity.attributes
        : {};

    return device && device.nameByUser ||
        device && device.name ||
        attributes.friendlyName ||
        registry && (registry.name || registry.originalName) ||
        "Gerät mit Störungen";

}


function deviceContext(device, entity, metadata) {

    const context = entity && entity.context
        ? entity.context
        : {};

    const area = device && device.areaId && metadata.areas
        ? metadata.areas[device.areaId] || null
        : null;

    const configEntry =
        device && device.configEntryId && metadata.configEntries
            ? metadata.configEntries[device.configEntryId] || null
            : null;

    return {
        areaName:
            context.areaName ||
            (area && area.name) ||
            null,
        integration:
            context.integration ||
            (configEntry && (configEntry.title || configEntry.domain)) ||
            null
    };

}


function createDeviceGroup(deviceId, issue, entity, metadata) {

    const devices = metadata.devices || {};
    const entities = metadata.entities || {};
    const device = devices[deviceId] || null;
    const registry = entities[issue.entityId] || null;
    const context = deviceContext(device, entity, metadata);
    const counts = emptyCounts();

    incrementCounts(counts, issue);

    return {
        id: "device-" + deviceId,
        type: "device",
        deviceId: deviceId,
        title: deviceTitle(device, entity, registry),
        areaName: context.areaName,
        integration: context.integration,
        severity: issue.severity,
        securityRelevant: issue.securityRelevant === true,
        issueCount: 1,
        durationSeconds:
            typeof issue.durationSeconds === "number"
                ? issue.durationSeconds
                : null,
        counts: counts,
        issues: [publicChild(issue, entity, registry)]
    };

}


function addToDeviceGroup(group, issue, entity, registry, metadata) {

    const severity = Severity.LEVELS.indexOf(issue.severity);
    const currentSeverity = Severity.LEVELS.indexOf(group.severity);
    const context = deviceContext(
        metadata.devices && metadata.devices[group.deviceId],
        entity,
        metadata
    );

    group.issues.push(publicChild(issue, entity, registry));
    group.issueCount += 1;
    incrementCounts(group.counts, issue);

    if (severity !== -1 && severity < currentSeverity) {
        group.severity = issue.severity;
    }

    if (issue.securityRelevant === true) {
        group.securityRelevant = true;
    }

    if (!group.areaName && context.areaName) {
        group.areaName = context.areaName;
    }

    if (!group.integration && context.integration) {
        group.integration = context.integration;
    }

    if (
        typeof issue.durationSeconds === "number" &&
        (
            typeof group.durationSeconds !== "number" ||
            issue.durationSeconds > group.durationSeconds
        )
    ) {
        group.durationSeconds = issue.durationSeconds;
    }

}


function createStandalone(issue, entity, registry) {

    const counts = emptyCounts();
    const child = publicChild(issue, entity, registry);

    incrementCounts(counts, issue);

    return {
        id: issue.id,
        type: "standalone",
        title: issue.title || child.title,
        description: issue.description || null,
        source: issue.source || null,
        entityId: issue.entityId || null,
        state: issue.state || null,
        areaName: issue.areaName || null,
        deviceName: issue.deviceName || null,
        integration: issue.integration || null,
        severity: issue.severity,
        securityRelevant: issue.securityRelevant === true,
        issueCount: 1,
        durationSeconds: child.durationSeconds,
        counts: counts,
        fixable: issue.fixable === true,
        issues: [child]
    };

}


function filterCounts(issues) {

    const counts = {
        all: issues.length,
        critical: 0,
        error: 0,
        warning: 0,
        unknown: 0
    };

    issues.forEach(function (issue) {
        if (Object.prototype.hasOwnProperty.call(counts, issue.severity)) {
            counts[issue.severity] += 1;
        }
        if (issue.state === "unknown") {
            counts.unknown += 1;
        }
    });

    return counts;

}


function aggregate(snapshot, issues) {

    const metadata = snapshot.metadata || {};
    const snapshotEntities = entityIndex(snapshot);
    const registryEntities = metadata.entities || {};
    const issuesByDeviceId = Object.create(null);
    const deviceGroups = [];
    const standaloneIssues = [];

    issues.forEach(function (issue) {

        const entity = issue.entityId
            ? snapshotEntities[issue.entityId] || null
            : null;

        const context = entity && entity.context
            ? entity.context
            : {};

        const registry = issue.entityId
            ? registryEntities[issue.entityId] || null
            : null;

        const deviceId =
            issue.source === "entity_state" &&
            typeof (context.deviceId || registry && registry.deviceId) === "string" &&
            (context.deviceId || registry && registry.deviceId) !== ""
                ? context.deviceId || registry.deviceId
                : null;

        if (!deviceId) {
            standaloneIssues.push(
                createStandalone(
                    issue,
                    entity,
                    registry
                )
            );
            return;
        }

        if (!issuesByDeviceId[deviceId]) {
            issuesByDeviceId[deviceId] = createDeviceGroup(
                deviceId,
                issue,
                entity,
                metadata
            );
            deviceGroups.push(issuesByDeviceId[deviceId]);
            return;
        }

        addToDeviceGroup(
            issuesByDeviceId[deviceId],
            issue,
            entity,
            registry,
            metadata
        );

    });

    return deviceGroups
        .concat(standaloneIssues)
        .sort(compareGroups);

}


function build(snapshot, detected) {

    const issues = detected && Array.isArray(detected.issues)
        ? detected.issues
        : [];

    return Object.assign({}, detected, {
        groups: aggregate(snapshot || {}, issues),
        filters: filterCounts(issues),
        presentationVersion: 1
    });

}


module.exports = {
    aggregate: aggregate,
    build: build,
    compareGroups: compareGroups,
    filterCounts: filterCounts
};
