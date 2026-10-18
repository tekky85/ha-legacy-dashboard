"use strict";
// Every observation below is fabricated test data, never a human pilot result.
const Model = require("../../../testing/js/report");
const catalog = require("../../../testing/data/test-catalog.json");
const CREATED = "2026-10-18T10:00:00.000Z";
const UPDATED = "2026-10-18T11:00:00.000Z";
function base(alias, suffix, version, core, architecture) {
    const report = Model.create(catalog, alias, {deployment: "ha-app", dashboardVersion: version,
        homeAssistantVersion: core, architecture, browser: "Synthetic Browser", device: "Synthetic Tablet", os: "Synthetic OS"},
    "RUN-pilot-synthetic-" + suffix, CREATED);
    report.dataKind = "synthetic";
    report.updatedAt = UPDATED;
    report.notes = "SYNTHETIC TOOLING FIXTURE. No HA installation/person was tested. Not real pilot evidence.";
    return report;
}
function result(report, id, status, notes = "") {
    const entry = report.results.find(item => item.testId === id) || Model.blank(id);
    Object.assign(entry, {status, testedAt: status === "NOT_TESTED" ? null : UPDATED, notes});
    if (status === "FAIL") Object.assign(entry, {expected: "Synthetisch: erwarteter Zustand bleibt erhalten.", actual: "Synthetisch: Abweichung mit Umlauten äöü und °C; keine echte Gerätebeobachtung.", reproductionSteps: "Nur Fixture öffnen und Berichtspfad prüfen; keine HA-Aktion ausführen."});
    return entry;
}
function pilotReports() {
    const a = base("Synthetic-A", "A", "1.0.0-rc.7", "Synthetic Core A", "amd64");
    result(a, "MT-50", "PASS"); result(a, "MT-04", "PASS"); result(a, "MT-16", "FAIL"); result(a, "MT-58", "FAIL");
    result(a, "MT-53", "N/A", "Synthetic amd64 setup: no aarch64 hardware in this run's scope.");
    result(a, "MT-52", "BLOCKED", "Synthetic setup: no compatible prior release/backup approved for update.");
    const b = base("Synthetic-B", "B", "1.0.0-rc.7", "Synthetic Core B", "amd64");
    for (const id of ["MT-50", "MT-04", "MT-16", "MT-13"]) result(b, id, "PASS");
    result(b, "MT-58", "FAIL"); result(b, "MT-53", "N/A", "Synthetic amd64 setup: aarch64 test not applicable.");
    result(b, "MT-52", "BLOCKED", "Synthetic setup: no safe update window/previous installation.");
    const c = base("Synthetic-C", "C", "1.0.0-rc.3", "Synthetic Core C", "aarch64");
    c.catalogVersion = "synthetic-older-catalog"; c.catalogHash = "0".repeat(64);
    result(c, "MT-50", "PASS"); result(c, "MT-16", "FAIL"); result(c, "MT-53", "PASS");
    result(c, "MT-52", "N/A", "Synthetic fresh installation; update outside this run's scope.");
    const unknown = base("Synthetic-Unknown", "unknown", "1.0.0-rc.7", "Synthetic Core B", "");
    unknown.results = [result(unknown, "MT-999", "FAIL")];
    const exported = report => Model.prepareExport(report, "2026-10-18T12:00:00.000Z");
    const first = exported(a);
    return [
        {name: "tester-a.json", report: first}, {name: "tester-b.json", report: exported(b)},
        {name: "tester-c-old-version.json", report: exported(c)},
        {name: "tester-a-duplicate.json", report: JSON.parse(JSON.stringify(first))},
        {name: "unknown-id.json", report: exported(unknown)},
        {name: "corrupted.json", raw: '{"schemaVersion":"1.0",'}
    ];
}
module.exports = {pilotReports};
