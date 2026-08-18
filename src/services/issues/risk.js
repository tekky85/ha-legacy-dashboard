/*
 * Central read-only risk classification for entity-state issues.
 *
 * Only normalized Home Assistant metadata is used. Entity names and entity
 * IDs are deliberately not inspected.
 */

const SAFETY_DEVICE_CLASSES = [
    "smoke",
    "co",
    "carbon_monoxide",
    "gas",
    "moisture",
    "safety",
    "water"
];

const SECURITY_DEVICE_CLASSES = [
    "door",
    "window",
    "opening",
    "garage_door",
    "lock"
];

const SECURITY_DOMAINS = [
    "lock",
    "alarm_control_panel"
];

const COVER_SECURITY_DEVICE_CLASSES = [
    "door",
    "garage",
    "gate",
    "window"
];


function lower(value) {
    return String(value || "").toLowerCase();
}


function classify(deviceClass, entityCategory, domain) {

    const normalizedDeviceClass = lower(deviceClass);
    const normalizedCategory = lower(entityCategory);
    const normalizedDomain = lower(domain);

    if (
        SAFETY_DEVICE_CLASSES.indexOf(normalizedDeviceClass) !== -1
    ) {
        return "safety";
    }

    if (
        SECURITY_DOMAINS.indexOf(normalizedDomain) !== -1 ||
        (
            normalizedDomain === "cover" &&
            COVER_SECURITY_DEVICE_CLASSES.indexOf(normalizedDeviceClass) !== -1
        ) ||
        (
            normalizedDomain !== "cover" &&
            SECURITY_DEVICE_CLASSES.indexOf(normalizedDeviceClass) !== -1
        )
    ) {
        return "security";
    }

    if (normalizedCategory === "diagnostic") {
        return "diagnostic";
    }

    return "normal";

}


function classifyWithoutAutomaticCritical(entityCategory) {
    return lower(entityCategory) === "diagnostic"
        ? "diagnostic"
        : "normal";
}


function isCritical(riskClass) {
    return riskClass === "safety" || riskClass === "security";
}


module.exports = {
    SAFETY_DEVICE_CLASSES: SAFETY_DEVICE_CLASSES.slice(0),
    COVER_SECURITY_DEVICE_CLASSES: COVER_SECURITY_DEVICE_CLASSES.slice(0),
    SECURITY_DEVICE_CLASSES: SECURITY_DEVICE_CLASSES.slice(0),
    SECURITY_DOMAINS: SECURITY_DOMAINS.slice(0),
    classify: classify,
    classifyWithoutAutomaticCritical: classifyWithoutAutomaticCritical,
    isCritical: isCritical
};
