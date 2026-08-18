const Snapshot = require("../system/snapshot");
const Risk = require("./risk");
const Severity = require("./severity");


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


function entityLookup(entityIds) {

    const lookup = Object.create(null);

    (entityIds || []).forEach(function (entityId) {
        lookup[entityId] = true;
    });

    return lookup;

}


function createIssue(
    entity,
    settings,
    securityRelevant,
    nowMilliseconds,
    modeCriticalEligible
) {

    const attributes = entity.attributes || {};
    const context = entity.context || {};
    const state = String(entity.state || "").toLowerCase();
    const criticalMode = settings.criticalDetectionMode || "device_class";
    const inferredRiskClass = criticalMode === "ha_label"
        ? Risk.classifyWithoutAutomaticCritical(context.entityCategory)
        : Risk.classify(
            attributes.deviceClass,
            context.entityCategory,
            entity.domain
        );
    const riskClass = securityRelevant || modeCriticalEligible
        ? "security"
        : inferredRiskClass;
    const effectiveSecurityRelevant =
        securityRelevant || modeCriticalEligible || Risk.isCritical(riskClass);
    const severity = Severity.issueSeverity(
        state,
        effectiveSecurityRelevant,
        riskClass
    );
    const configuredTitle =
        settings.entityTitles &&
        settings.entityTitles[entity.entityId];
    const baseTitle =
        configuredTitle ||
        context.deviceName ||
        attributes.friendlyName ||
        entity.entityId;


    if (!severity || context.disabledBy) {
        return null;
    }

    return {
        id: "entity-" + state + "-" + entity.entityId,
        source: "entity_state",
        severity: severity,
        status: "active",
        title:
            state === "unavailable"
                ? baseTitle + " nicht erreichbar"
                : baseTitle + ": Zustand unbekannt",
        description:
            state === "unavailable"
                ? "Die Entity ist derzeit nicht verfügbar."
                : "Der aktuelle Zustand der Entity ist unbekannt.",
        entityId: entity.entityId,
        state: state,
        securityRelevant: effectiveSecurityRelevant,
        riskClass: riskClass,
        potentiallySecurityRelevant: effectiveSecurityRelevant,
        startedAt: entity.lastChanged,
        updatedAt: entity.lastUpdated,
        durationSeconds:
            durationSeconds(
                entity.lastChanged,
                nowMilliseconds
            ),
        domain: entity.domain,
        deviceClass: attributes.deviceClass || null,
        deviceName: context.deviceName || null,
        areaName: context.areaName || null,
        integration: context.integration || null,
        platform: context.platform || null,
        entityCategory: context.entityCategory || null,
        disabledBy: context.disabledBy || null,
        metadata: {
            state: state
        }
    };

}


function containsLabel(item, labelId) {
    return Boolean(
        item &&
        Array.isArray(item.labelIds) &&
        item.labelIds.indexOf(labelId) !== -1
    );
}


function criticalDetection(snapshot, settings) {
    const mode = settings.criticalDetectionMode || "device_class";

    if (mode !== "ha_label") {
        return {
            mode: "device_class",
            status: "available",
            labelId: null,
            labelName: null,
            eligibleEntities: Object.create(null)
        };
    }

    const metadata = snapshot.metadata || {};
    const labels = metadata.labels || {};
    const entities = metadata.entities || {};
    const devices = metadata.devices || {};
    const source = snapshot.sources && snapshot.sources.labelRegistry;
    const labelId = settings.criticalLabelId;
    const eligibleDevices = Object.create(null);
    const eligibleEntities = Object.create(null);
    let status = source && source.stale
        ? "stale"
        : source && source.ok
            ? "available"
            : source && source.supported === false
                ? "unsupported"
                : "error";

    if ((status === "available" || status === "stale") && !labels[labelId]) {
        status = "missing";
    }

    if (status === "available" || status === "stale") {
        Object.keys(devices).forEach(function (deviceId) {
            if (containsLabel(devices[deviceId], labelId)) {
                eligibleDevices[deviceId] = true;
            }
        });

        Object.keys(entities).forEach(function (entityId) {
            const registry = entities[entityId];
            if (
                containsLabel(registry, labelId) ||
                Boolean(registry.deviceId && eligibleDevices[registry.deviceId])
            ) {
                eligibleEntities[entityId] = true;
            }
        });
    }

    return {
        mode: "ha_label",
        status: status,
        labelId: labelId,
        labelName: labels[labelId] ? labels[labelId].name : null,
        eligibleEntities: eligibleEntities
    };
}


function criticalDetectionIssue(detection) {
    if (
        detection.mode !== "ha_label" ||
        detection.status === "available" ||
        detection.status === "stale"
    ) {
        return null;
    }

    return {
        id: "critical-detection-label-" + detection.status,
        source: "critical_detection",
        severity: "error",
        status: "active",
        title: "Critical-Label-Erkennung nicht verfügbar",
        description: detection.status === "missing"
            ? "Das konfigurierte Home-Assistant-Label existiert nicht mehr."
            : "Home-Assistant-Label-Metadaten konnten noch nicht zuverlässig geladen werden.",
        state: "diagnostic",
        securityRelevant: false,
        durationSeconds: null,
        domain: null,
        fixable: false
    };
}


function configEntrySeverity(state) {

    if (
        state === "setup_error" ||
        state === "migration_error" ||
        state === "failed_unload"
    ) {
        return "error";
    }

    if (state === "setup_retry") {
        return "warning";
    }

    return null;

}


function configEntryIssue(entry) {

    const state = String(entry.state || "").toLowerCase();
    const severity = configEntrySeverity(state);

    if (!severity || entry.disabledBy) {
        return null;
    }

    const descriptions = {
        setup_error: "Integration konnte nicht geladen werden.",
        migration_error: "Integration konnte nicht migriert werden.",
        failed_unload: "Integration konnte nicht sauber entladen werden.",
        setup_retry: "Einrichtung wird durch Home Assistant erneut versucht."
    };

    return {
        id: "config-entry-" + entry.entryId + "-" + state,
        source: "config_entry",
        severity: severity,
        status: "active",
        title: entry.title || entry.domain || "Home Assistant Integration",
        description: descriptions[state],
        state: state,
        securityRelevant: false,
        durationSeconds: null,
        domain: entry.domain || null,
        integration: entry.title || entry.domain || null,
        platform: entry.domain || null,
        fixable: false
    };

}


function repairIssue(repair) {

    if (!repair || repair.status !== "active") {
        return null;
    }

    return {
        id: repair.id,
        source: "home_assistant_repair",
        severity:
            Severity.LEVELS.indexOf(repair.severity) !== -1
                ? repair.severity
                : "info",
        status: "active",
        title: repair.title,
        description: repair.description,
        state: "repair",
        securityRelevant: false,
        durationSeconds: null,
        domain: repair.domain || null,
        fixable: repair.fixable === true
    };

}


function matterIssue(issue) {

    if (!issue || issue.status !== "active") {
        return null;
    }

    return {
        id: String(issue.id || "matter-diagnostic"),
        source: "matter_diagnostic",
        severity:
            Severity.LEVELS.indexOf(issue.severity) !== -1
                ? issue.severity
                : "warning",
        status: "active",
        title: String(issue.title || "Matter-Komponente beeinträchtigt"),
        description: String(issue.description || "Matter-Diagnose meldet eine Störung."),
        state: "diagnostic",
        securityRelevant: false,
        durationSeconds: null,
        domain: "matter",
        affectedDevices:
            Number.isInteger(issue.affectedDevices)
                ? issue.affectedDevices
                : null,
        affectedEntities:
            Number.isInteger(issue.affectedEntities)
                ? issue.affectedEntities
                : null,
        fixable: false
    };

}


function summarize(issues) {

    const summary = {
        total: issues.length,
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
        unavailable: 0,
        unknown: 0
    };


    issues.forEach(function (issue) {
        summary[issue.severity] += 1;
        if (
            issue.state === "unavailable" ||
            issue.state === "unknown"
        ) {
            summary[issue.state] += 1;
        }
    });

    return summary;

}


function overallStatus(snapshot, summary) {

    if (
        !snapshot ||
        snapshot.stale ||
        !snapshot.homeAssistant ||
        snapshot.homeAssistant.reachable !== true
    ) {
        return snapshot && snapshot.lastSuccessfulCollectionAt
            ? "stale"
            : "unknown";
    }

    if (summary.critical > 0) {
        return "critical";
    }

    if (summary.error > 0) {
        return "error";
    }

    if (summary.warning > 0 || summary.info > 0) {
        return "warning";
    }

    return "ok";

}


function groupIssues(issues) {

    const titles = {
        critical: "Kritisch",
        error: "Fehler",
        warning: "Warnungen",
        info: "Info"
    };

    return Severity.LEVELS.map(function (severity) {
        return {
            severity: severity,
            title: titles[severity],
            issues: issues.filter(function (issue) {
                return issue.severity === severity;
            })
        };
    }).filter(function (group) {
        return group.issues.length > 0;
    });

}


function buildIssues(snapshot, configuration) {

    const settings = configuration || {
        securityEntities: [],
        ignoredEntities: [],
        entityTitles: {}
    };

    const securityEntities = entityLookup(
        settings.securityEntities
    );

    const ignoredEntities = entityLookup(
        settings.ignoredEntities
    );

    const nowMilliseconds =
        Date.parse(snapshot.collectedAt || "") || Date.now();

    const issues = [];
    const detection = criticalDetection(snapshot, settings);


    (snapshot.entities || []).forEach(function (entity) {

        if (ignoredEntities[entity.entityId]) {
            return;
        }

        const issue = createIssue(
            entity,
            settings,
            Boolean(securityEntities[entity.entityId]),
            nowMilliseconds,
            Boolean(detection.eligibleEntities[entity.entityId])
        );

        if (issue) {
            issues.push(issue);
        }

    });

    const detectionIssue = criticalDetectionIssue(detection);
    if (detectionIssue) {
        issues.push(detectionIssue);
    }

    const configEntries = snapshot.metadata &&
        snapshot.metadata.configEntries
        ? snapshot.metadata.configEntries
        : {};

    Object.keys(configEntries).forEach(function (entryId) {
        const issue = configEntryIssue(configEntries[entryId]);
        if (issue) {
            issues.push(issue);
        }
    });

    const repairs = snapshot.diagnostics &&
        Array.isArray(snapshot.diagnostics.repairs)
        ? snapshot.diagnostics.repairs
        : [];

    repairs.forEach(function (repair) {
        const issue = repairIssue(repair);
        if (issue) {
            issues.push(issue);
        }
    });

    const matter = snapshot.diagnostics &&
        Array.isArray(snapshot.diagnostics.matter)
        ? snapshot.diagnostics.matter
        : [];

    matter.forEach(function (diagnostic) {
        const issue = matterIssue(diagnostic);
        if (issue) {
            issues.push(issue);
        }
    });

    Severity.sortIssues(issues);

    const summary = summarize(issues);
    const status = overallStatus(snapshot, summary);

    let message;

    if (status === "unknown") {
        message = "Fehlerstatus noch nicht verfügbar.";
    } else if (status === "stale") {
        message = "Daten nicht aktuell. Letzte bekannte Störungen werden angezeigt.";
    } else if (issues.length === 0) {
        message = "Keine aktiven Störungen erkannt.";
    } else if (issues.length === 1) {
        message = "1 aktive Störung erkannt.";
    } else {
        message = issues.length + " aktive Störungen erkannt.";
    }

    return {
        dashboard: "errors",
        title: "Systemstatus",
        message: message,
        overallStatus: status,
        summary: summary,
        groups: groupIssues(issues),
        issues: issues,
        criticalDetection: {
            mode: detection.mode,
            status: detection.status,
            labelId: detection.labelId,
            labelName: detection.labelName
        },
        meta: Snapshot.toPublicMeta(snapshot)
    };

}


module.exports = {
    buildIssues: buildIssues,
    configEntryIssue: configEntryIssue,
    configEntrySeverity: configEntrySeverity,
    criticalDetection: criticalDetection,
    createIssue: createIssue,
    groupIssues: groupIssues,
    overallStatus: overallStatus,
    repairIssue: repairIssue,
    summarize: summarize
};
