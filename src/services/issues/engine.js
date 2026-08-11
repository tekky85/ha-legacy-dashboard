const Snapshot = require("../system/snapshot");
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


function createIssue(entity, settings, securityRelevant, nowMilliseconds) {

    const attributes = entity.attributes || {};
    const state = String(entity.state || "").toLowerCase();
    const severity = Severity.issueSeverity(
        state,
        securityRelevant
    );
    const configuredTitle =
        settings.entityTitles &&
        settings.entityTitles[entity.entityId];
    const baseTitle =
        configuredTitle ||
        attributes.friendlyName ||
        entity.entityId;


    if (!severity) {
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
        securityRelevant: securityRelevant,
        potentiallySecurityRelevant:
            Severity.potentiallySecurityRelevant(
                attributes.deviceClass
            ),
        startedAt: entity.lastChanged,
        updatedAt: entity.lastUpdated,
        durationSeconds:
            durationSeconds(
                entity.lastChanged,
                nowMilliseconds
            ),
        domain: entity.domain,
        deviceClass: attributes.deviceClass || null,
        metadata: {
            state: state
        }
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
        summary[issue.state] += 1;
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
        info: "Unbekannt"
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


    (snapshot.entities || []).forEach(function (entity) {

        if (ignoredEntities[entity.entityId]) {
            return;
        }

        const issue = createIssue(
            entity,
            settings,
            Boolean(securityEntities[entity.entityId]),
            nowMilliseconds
        );

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
        meta: Snapshot.toPublicMeta(snapshot)
    };

}


module.exports = {
    buildIssues: buildIssues,
    createIssue: createIssue,
    groupIssues: groupIssues,
    overallStatus: overallStatus,
    summarize: summarize
};
