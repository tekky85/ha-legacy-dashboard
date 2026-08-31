/*
 * Native Room Card projection.
 *
 * This service consumes the existing normalized and cached system snapshot.
 * It never contacts Home Assistant and it deliberately reuses the central
 * issue, risk, severity and Summary activity semantics.
 */

const Issues = require("./issues/engine");
const IssueRules = require("./issues/rule-engine");
const Risk = require("./issues/risk");
const Severity = require("./issues/severity");
const SummaryRules = require("./summary/rules");

const LOW_BATTERY_PERCENT = 20;


function entityIndex(snapshot) {

    const result = Object.create(null);

    (snapshot.entities || []).forEach(function (entity) {
        result[entity.entityId] = entity;
    });

    return result;

}


function rawAttributes(entity) {

    const source = entity && entity.attributes
        ? entity.attributes
        : {};

    return {
        friendly_name: source.friendlyName || undefined,
        device_class: source.deviceClass || undefined,
        unit_of_measurement: source.unitOfMeasurement || undefined,
        current_temperature: source.currentTemperature,
        temperature: source.targetTemperature,
        min_temp: source.minimumTemperature,
        max_temp: source.maximumTemperature,
        target_temp_step: source.targetTemperatureStep,
        hvac_action: source.hvacAction || undefined,
        current_position: source.currentPosition,
        battery_level: source.batteryLevel
    };

}


function publicState(entity) {

    return {
        entity_id: entity.entityId,
        state: entity.state,
        attributes: rawAttributes(entity)
    };

}


function title(entity) {

    const attributes = entity.attributes || {};
    const context = entity.context || {};

    return attributes.friendlyName ||
        context.deviceName ||
        entity.entityId;

}


function configuredSecurity(settings, entityId) {

    return Boolean(
        settings &&
        Array.isArray(settings.securityEntities) &&
        settings.securityEntities.indexOf(entityId) !== -1
    );

}


function activeRisk(
    entity,
    settings,
    criticalDetection
) {

    return IssueRules.resolveRule(
        entity,
        settings,
        configuredSecurity(settings, entity.entityId),
        Boolean(
            criticalDetection &&
            criticalDetection.eligibleEntities[entity.entityId]
        )
    ).riskClass;

}


function createAlert(entity, kind, severity, riskClass, description) {

    return {
        id: "room-" + kind + "-" + entity.entityId.replace(".", "-"),
        entity_id: entity.entityId,
        title: title(entity),
        state: entity.state,
        kind: kind,
        severity: severity,
        risk_class: riskClass,
        description: description
    };

}


function issueAlert(issue) {

    return {
        id: issue.id,
        entity_id: issue.entityId,
        title: issue.title,
        state: issue.state,
        kind:
            issue.flapping
                ? "flapping"
                : issue.recoveryPending
                    ? "recovery"
                    : "availability",
        severity: issue.severity,
        risk_class: issue.riskClass || "normal",
        description: issue.description || null
    };

}


function batteryIsLow(entity) {

    const value = Number(entity.state);

    if (
        entity.domain === "binary_sensor" &&
        entity.state === "on"
    ) {
        return true;
    }

    return Number.isFinite(value) && value <= LOW_BATTERY_PERCENT;

}


function roomAlerts(
    snapshot,
    room,
    settings,
    entitiesById,
    centralIssues,
    criticalDetection
) {

    const configuredIds = require("../config/dashboard")
        .roomEntityIds(room);
    const configured = Object.create(null);
    const alerts = [];
    const seen = Object.create(null);
    const selectedEntities = [];

    configuredIds.forEach(function (entityId) {
        configured[entityId] = true;

        if (entitiesById[entityId]) {
            selectedEntities.push(entitiesById[entityId]);
        }
    });

    centralIssues
        .filter(function (issue) {
            return Boolean(issue.entityId && configured[issue.entityId]);
        })
        .forEach(function (issue) {
            const alert = issueAlert(issue);
            alerts.push(alert);
            seen[alert.entity_id] = true;
        });

    selectedEntities.forEach(function (entity) {
        const riskClass = activeRisk(
            entity,
            settings,
            criticalDetection
        );

        if (
            !seen[entity.entityId] &&
            entity.state === "on" &&
            Risk.isCritical(riskClass)
        ) {
            alerts.push(createAlert(
                entity,
                riskClass === "safety" ? "safety" : "security",
                riskClass === "safety" ? "critical" : "warning",
                riskClass,
                riskClass === "safety"
                    ? "Sicherheitsmelder ist aktiv"
                    : "Sicherheitsrelevanter Zustand ist aktiv"
            ));
            seen[entity.entityId] = true;
        }
    });

    SummaryRules.collectActivities(
        selectedEntities,
        {ignoredEntities: [], showMediaTitles: false},
        Date.parse(snapshot.collectedAt || "") || Date.now()
    )
        .filter(function (item) {
            return item.category === "open" ||
                item.category === "security";
        })
        .forEach(function (item) {
            const entity = entitiesById[item.entityIds[0]];

            if (!entity || seen[entity.entityId]) {
                return;
            }

            const riskClass = activeRisk(
                entity,
                settings,
                criticalDetection
            );
            alerts.push(createAlert(
                entity,
                item.category,
                Risk.isCritical(riskClass) ? "warning" : "info",
                riskClass,
                item.description || "Aktiver Raumzustand"
            ));
            seen[entity.entityId] = true;
        });

    (room.entities.batteries || []).forEach(function (entityId) {
        const entity = entitiesById[entityId];

        if (
            !entity ||
            seen[entityId] ||
            entity.state === "unknown" ||
            entity.state === "unavailable" ||
            !batteryIsLow(entity)
        ) {
            return;
        }

        alerts.push(createAlert(
            entity,
            "battery",
            "warning",
            "diagnostic",
            "Batteriestand ist niedrig"
        ));
        seen[entityId] = true;
    });

    return Severity.sortIssues(alerts);

}


function build(snapshot, widgets, settings) {

    const indexed = entityIndex(snapshot || {});
    const states = {};
    const alerts = {};
    const entityIds = [];
    const centralIssues = Issues.buildIssues(
        snapshot,
        settings
    ).issues;
    const criticalDetection = Issues.criticalDetection(
        snapshot,
        settings
    );

    (widgets || []).forEach(function (widget) {
        require("../config/dashboard")
            .roomEntityIds(widget.room)
            .forEach(function (entityId) {
                if (entityIds.indexOf(entityId) === -1) {
                    entityIds.push(entityId);
                }
            });

        alerts[widget.id] = roomAlerts(
            snapshot,
            widget.room,
            settings,
            indexed,
            centralIssues,
            criticalDetection
        );
    });

    entityIds.forEach(function (entityId) {
        states[entityId] = indexed[entityId]
            ? publicState(indexed[entityId])
            : {
                entity_id: entityId,
                state: "unavailable",
                attributes: {},
                gateway_error: true
            };
    });

    return {
        states: states,
        alerts: alerts,
        stale: Boolean(snapshot && snapshot.stale),
        homeAssistantReachable: Boolean(
            snapshot &&
            snapshot.homeAssistant &&
            snapshot.homeAssistant.reachable
        )
    };

}


module.exports = {
    LOW_BATTERY_PERCENT: LOW_BATTERY_PERCENT,
    build: build,
    batteryIsLow: batteryIsLow
};
