/*
 * Central Sprint-20 severity policy.
 *
 * Explicit security configuration is authoritative. Reliable normalized
 * risk metadata may additionally elevate safety/security entities.
 */

const Risk = require("./risk");

const LEVELS = [
    "critical",
    "error",
    "warning",
    "info"
];

function issueSeverity(state, securityRelevant, riskClass) {

    const criticalRisk =
        securityRelevant === true ||
        Risk.isCritical(riskClass);

    if (state === "unavailable") {
        return criticalRisk
            ? "critical"
            : "warning";
    }

    if (state === "unknown") {
        return criticalRisk
            ? "critical"
            : "info";
    }

    return null;

}


function potentiallySecurityRelevant(deviceClass, entityCategory, domain) {

    return Risk.isCritical(
        Risk.classify(deviceClass, entityCategory, domain)
    );

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


function sortIssues(issues) {

    return issues.sort(function (first, second) {

        const severityDifference =
            LEVELS.indexOf(first.severity) -
            LEVELS.indexOf(second.severity);

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
            compareText(first.entityId, second.entityId);

    });

}


module.exports = {
    LEVELS: LEVELS.slice(0),
    issueSeverity: issueSeverity,
    potentiallySecurityRelevant: potentiallySecurityRelevant,
    sortIssues: sortIssues
};
