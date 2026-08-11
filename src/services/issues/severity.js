/*
 * Central Sprint-20 severity policy.
 *
 * Explicit security configuration is authoritative. Device classes may be
 * exposed as a hint, but never elevate an entity by themselves.
 */

const LEVELS = [
    "critical",
    "error",
    "warning",
    "info"
];

const SECURITY_DEVICE_CLASSES = [
    "smoke",
    "carbon_monoxide",
    "gas",
    "moisture",
    "safety"
];


function issueSeverity(state, securityRelevant) {

    if (state === "unavailable") {
        return securityRelevant
            ? "critical"
            : "warning";
    }

    if (state === "unknown") {
        return securityRelevant
            ? "error"
            : "info";
    }

    return null;

}


function potentiallySecurityRelevant(deviceClass) {

    return SECURITY_DEVICE_CLASSES.indexOf(
        String(deviceClass || "").toLowerCase()
    ) !== -1;

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
