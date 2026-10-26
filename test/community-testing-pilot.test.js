"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const cp = require("node:child_process");
const Model = require("../testing/js/report");
const Pilot = require("../testing/js/pilot");
const Catalog = require("../testing/data/test-catalog.json");
const Aggregate = require("../scripts/testing/aggregate-test-reports");
const Site = require("../scripts/testing/build-site");
const {ROOT} = require("../scripts/testing/build-test-catalog");
const {pilotReports} = require("./fixtures/community-testing/pilot-reports");
const clone = value => JSON.parse(JSON.stringify(value));
function inputs(t, entries) {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), "pilot-reports-"));
    t.after(() => fs.rmSync(folder, {recursive: true, force: true}));
    return entries.map((entry, index) => {
        const file = path.join(folder, index + ".json");
        fs.writeFileSync(file, typeof entry === "string" ? entry : JSON.stringify(entry)); return file;
    });
}
function reports() { return pilotReports().filter(entry => entry.report).map(entry => entry.report); }

test("Pilot selects eleven existing canonical IDs, with no competing definitions", () => {
    assert.equal(Pilot.version, "27.4"); assert.equal(Pilot.testIds.length, 11);
    assert.equal(new Set(Pilot.testIds).size, 11);
    const selected = Model.select(Catalog, null, {testIds: Pilot.testIds});
    assert.equal(selected.length, 11);
    const plan = fs.readFileSync(path.join(ROOT, "docs/testing/PILOT_PLAN.de.md"), "utf8");
    for (const id of Pilot.testIds) { assert.ok(Catalog.testIds.includes(id)); assert.match(plan, new RegExp(id)); }
    assert.deepEqual(Object.keys(Pilot).sort(), ["testIds", "version"]);
    assert.equal(Model.select(Catalog, null, {testIds: Pilot.testIds, search: "MT-50", deployment: "ha-app"}).length, 1);
});
test("Report 1.0 additive metadata and German export/import preserve observations and old files", () => {
    const report = reports()[0], before = clone(report);
    const exported = Model.prepareExport(report, "2026-10-18T13:00:00.000Z");
    assert.deepEqual(report, before); assert.equal(exported.testCenterVersion, Model.TEST_CENTER_VERSION);
    assert.equal(exported.dataKind, "synthetic");
    assert.deepEqual(Model.parse(JSON.stringify(exported), Catalog).report, exported);
    assert.match(exported.results.find(item => item.status === "FAIL").actual, /äöü.*°C/);
    assert.equal(Model.observationJSON(exported), Model.observationJSON(report));
    const legacy = clone(report); delete legacy.exportedAt; delete legacy.dataKind; delete legacy.testCenterVersion;
    const parsed = Model.parse(JSON.stringify(legacy), Catalog);
    assert.deepEqual(parsed.report, legacy); assert.match(parsed.warnings.join(" "), /Legacy/);
    assert.match(Model.summary(exported, Catalog), /SYNTHETIC/);
});
test("Metadata, schema and bounded hostile input validation fail safely", () => {
    for (const mutate of [
        value => { value.schemaVersion = "0.9"; }, value => { value.exportedAt = "yesterday"; },
        value => { value.exportedAt = "2020-01-01T00:00:00.000Z"; }, value => { value.dataKind = "verified-human"; },
        value => { value.testCenterVersion = ""; }, value => { value.results.push(clone(value.results[0])); },
        value => { value.issueUrl = "javascript:alert(1)"; }, value => { value.results[0].notes = "ü".repeat(4001); }
    ]) { const value = reports()[0]; mutate(value); assert.equal(Model.validate(value, Catalog).valid, false); }
    assert.throws(() => Model.parse('{"schemaVersion":"1.0",', Catalog), /JSON/);
    assert.throws(() => Model.parse("ü".repeat(Model.MAX_BYTES), Catalog));
    assert.throws(() => Model.parse('{"__proto__":{"polluted":true}}', Catalog), /Unsafe/);
    assert.equal({}.polluted, undefined);
});
test("Same observations re-exported/reordered count once; conflicting run variants never count", t => {
    const first = reports()[0]; first.dataKind = "manual"; // validator exercise, not human evidence
    const reexport = Model.prepareExport(first, "2026-10-18T13:00:00.000Z");
    const reordered = Object.fromEntries(Object.entries(reexport).reverse());
    const summary = Aggregate.aggregate(inputs(t, [first, reordered]), Catalog);
    assert.equal(summary.countedRuns, 1); assert.equal(summary.inventory[1].duplicate, true);
    assert.equal(summary.totals.PASS, 2); assert.equal(summary.totals.FAIL, 2);
    const conflicting = clone(first); conflicting.notes += " Changed observation.";
    const quarantined = Aggregate.aggregate(inputs(t, [first, reordered, conflicting]), Catalog);
    assert.equal(quarantined.reportVariants, 2); assert.equal(quarantined.runConflicts.length, 1);
    assert.equal(quarantined.countedRuns, 0); assert.equal(quarantined.totals.PASS, 0);
    assert.equal(quarantined.observations.length, 144);
    assert.ok(quarantined.observations.every(item => !item.counted));
    assert.ok(quarantined.excludedReports.every(item => item.reasons.includes("CONFLICTING_RUN_QUARANTINED")));
});
test("Synthetic multi-tester matrix separates versions/catalogs and preserves every status/conflict", t => {
    const fixture = pilotReports();
    const files = inputs(t, fixture.map(entry => entry.raw || entry.report));
    const result = Aggregate.aggregate(files, Catalog, {includeSynthetic: true});
    assert.equal(result.schemaVersion, "1.1"); assert.equal(result.countedRuns, 4);
    assert.equal(result.distinctTesters, 4); assert.equal(result.inventory.filter(item => item.duplicate).length, 1);
    assert.equal(result.inventory.filter(item => !item.valid).length, 1);
    assert.deepEqual(result.totals, {PASS: 8, FAIL: 5, BLOCKED: 2, NOT_TESTED: 271, "N/A": 3});
    assert.equal(result.versions.length, 2); assert.equal(result.catalogs.length, 2);
    const climate = result.perTest.find(item => item.testId === "MT-16" && item.version === "1.0.0-rc.7");
    assert.equal(climate.counts.PASS, 1); assert.equal(climate.counts.FAIL, 1);
    assert.equal(climate.executed, 2); assert.equal(climate.details.length, 3); // unknown-ID run has no MT-16 observation
    assert.equal(result.repeatedFailures.find(item => item.testId === "MT-58").runCount, 2);
    assert.ok(result.conflictingResults.some(item => item.testId === "MT-16" && item.version === "1.0.0-rc.7"));
    assert.ok(!result.conflictingResults.some(item => item.version === "1.0.0-rc.3"));
    assert.ok(result.inventory.some(item => item.warnings?.some(warning => /Unknown test ID/.test(warning))));
    assert.ok(result.inventory.some(item => item.warnings?.some(warning => /Catalog mismatch/.test(warning))));
    assert.equal(result.limitations.length, 5); assert.ok(result.limitations.every(item => item.explanation && item.sourceHash));
    assert.ok(result.uncoveredTestIds.includes("MT-01"));
    assert.ok(result.uncoveredTestIds.includes("MT-53")); // only old catalog executed this test
    assert.ok(!result.uncoveredTestIds.includes("MT-16"));
    assert.ok(result.observations.some(item => item.testId === "MT-999" && item.triage.includes("new finding")));
    const normal = Aggregate.aggregate(files, Catalog);
    assert.equal(normal.countedRuns, 0); assert.equal(normal.excludedReports.length, 4);
    assert.ok(Object.values(normal.totals).every(value => value === 0));
    assert.ok(normal.observations.every(item => !item.counted));
    assert.match(Aggregate.matrix(normal), /EXCLUDED:/);
    assert.match(Aggregate.markdown(result), /SYNTHETIC_INCLUDED_NOT_REAL_ACCEPTANCE/);
    assert.match(Aggregate.markdown(result), /No pass percentage/);
});
test("Limitations are bounded/redacted and Markdown/CSV never execute untrusted content", t => {
    const report = reports()[0];
    const item = report.results.find(value => value.status === "BLOCKED");
    item.notes = '<script>alert(1)</script> token=fake-value private@example.invalid 10.2.3.4 ' + "x".repeat(300);
    const summary = Aggregate.aggregate(inputs(t, [report]), Catalog, {includeSynthetic: true});
    const reason = summary.limitations.find(value => value.status === "BLOCKED").explanation;
    assert.ok(reason.length <= 200); assert.doesNotMatch(reason, /fake-value|private@|10\.2\.3\.4/);
    assert.doesNotMatch(Aggregate.markdown(summary), /<script>/);
    assert.match(Aggregate.csv("=SUM(1,2)"), /'=SUM/);
});
test("Deterministic offline CLI exercises validator, duplicate, corrupt input and synthetic exclusion", t => {
    const destination = path.join(ROOT, "test-results/pilot-cli-" + process.pid);
    t.after(() => fs.rmSync(destination, {recursive: true, force: true}));
    const first = cp.spawnSync(process.execPath, ["scripts/testing/run-pilot-validation.js", destination], {cwd: ROOT, encoding: "utf8"});
    assert.equal(first.status, 0, first.stderr); assert.match(first.stdout, /SYNTHETIC ONLY/);
    const evidence = JSON.parse(fs.readFileSync(path.join(destination, "tooling-validation.json"), "utf8"));
    assert.equal(evidence.humanPilot, "NOT TESTED"); assert.equal(evidence.inputHashes.length, 6);
    assert.ok(evidence.commands.every(item => item.status === 1 && item.note.includes("Expected rejection")));
    assert.equal(cp.spawnSync(process.execPath, ["scripts/testing/run-pilot-validation.js", destination], {cwd: ROOT}).status, 1);
    assert.deepEqual(pilotReports(), pilotReports());
});
test("Built portal resolves all static links under project subpath and publishes no results", t => {
    const destination = path.join(ROOT, "dist/community-pilot-" + process.pid);
    t.after(() => fs.rmSync(destination, {recursive: true, force: true})); Site.build(destination);
    const base = path.join(destination, "testing");
    const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
        if (/^(https?:|#)/.test(match[1])) continue;
        assert.ok(fs.existsSync(path.join(base, match[1].split("?")[0])), match[1]);
    }
    assert.ok(fs.existsSync(path.join(base, "js/pilot.js")));
    const publicFiles = fs.readdirSync(base, {recursive: true}).filter(file => fs.statSync(path.join(base, file)).isFile());
    assert.equal(publicFiles.length, 18);
    assert.ok(publicFiles.every(file => !/test-results|pilot-reports|\.env|incoming/.test(file)));
    const portal = fs.readFileSync(path.join(base, "js/portal.js"), "utf8");
    assert.doesNotMatch(portal, /innerHTML|api\.github|\/api\/|SUPERVISOR_TOKEN|fetch\(/);
});
