"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const cp = require("node:child_process");
const Builder = require("../scripts/testing/build-test-catalog");
const Model = require("../testing/js/report");
const Aggregator = require("../scripts/testing/aggregate-test-reports");
const IO = require("../scripts/testing/validate-test-report");
const Site = require("../scripts/testing/build-site");
const catalog = require("../testing/data/test-catalog.json");
const root = path.resolve(__dirname, "..");
const fixture = require("./fixtures/community-testing/all-statuses.json");
const clone = value => JSON.parse(JSON.stringify(value));
function run(id, version) {
    return Model.create(catalog, "Tester-" + id, {deployment: "ha-app", dashboardVersion: version || "1.0.0-rc.7", homeAssistantVersion: "2026.10.0", architecture: "", browser: "Test Browser", device: "Demo Tablet", os: "Demo OS"}, "RUN-synthetic-" + id, "2026-10-18T10:00:00.000Z");
}
function observed(report, id, status) {
    const result = report.results.find(item => item.testId === id);
    Object.assign(result, {status, testedAt: status === "NOT_TESTED" ? null : report.updatedAt, expected: "Expected demo", actual: "Observed demo", reproductionSteps: "Open demo", notes: "Synthetic note"});
    return report;
}
function files(t, values) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "community-test-"));
    t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
    return values.map((value, index) => { const file = path.join(directory, "report-" + index + ".json"); fs.writeFileSync(file, typeof value === "string" ? value : JSON.stringify(value)); return file; });
}

test("Catalog retains all 72 canonical IDs, complete steps and exact source mapping", () => {
    const source = Builder.sourceText(false), parsed = Builder.parse(source);
    assert.equal(parsed.tests.length, 72); assert.deepEqual(parsed.diagnostics, []);
    assert.equal(new Set(parsed.tests.map(item => item.id)).size, 72);
    assert.equal(parsed.tests.find(item => item.id === "MT-01").steps.length, 7);
    assert.equal(parsed.tests.find(item => item.id === "MT-55").steps.length, 12);
    assert.ok(parsed.tests.every(item => item.expected && item.failureCriteria && item.prerequisites && item.evidence && item.source.line > 0));
    assert.ok(!JSON.stringify(parsed).includes("### Result"));
    const local = Builder.parse(fs.readFileSync(path.join(root, Builder.SOURCE), "utf8"));
    assert.equal(local.tests.length, 72); // local field observations do not leak into catalog
    assert.ok(!JSON.stringify(local).includes("Datum: 17. September 2026"));
});
test("Catalog build is reproducible and committed catalog drift is checked", () => {
    assert.equal(Builder.validateCatalog(catalog), true);
    assert.deepEqual(Builder.build(Builder.sourceText(false), catalog.sourceCommit), catalog);
    assert.equal(JSON.stringify(Builder.build(Builder.sourceText(false))), JSON.stringify(Builder.build(Builder.sourceText(false))));
    cp.execFileSync(process.execPath, ["scripts/testing/build-test-catalog.js", "--check"], {cwd: root});
});
test("Strict catalog validator rejects forged counts, versions, fields and content", () => {
    for (const mutate of [data => { data.testCount = 1; }, data => { data.schemaVersion = "2.0"; }, data => { data.extra = true; }, data => { data.tests[0].steps[0] = "modified"; }, data => { data.tests[0].deployments = ["unknown"]; }]) {
        const data = clone(catalog); mutate(data); assert.throws(() => Builder.validateCatalog(data), /Invalid catalog/);
    }
});
test("Parser rejects duplicate/missing IDs and flags incomplete steps NOT READY", () => {
    const source = Builder.sourceText(false);
    assert.throws(() => Builder.parse(source + "\n## MT-01\n"), /Duplicate detail/);
    assert.throws(() => Builder.parse(source.replace("## MT-01\n", "## OMITTED\n")), /Missing detail/);
    const missing = Builder.parse(source.replace("### Fail If", "### Other"));
    assert.ok(missing.diagnostics.length); assert.ok(missing.tests.some(item => item.readiness === "NOT READY"));
    const unrelated = Builder.parse(source + "\n## Random unrelated section\n1. Not a test.\n");
    assert.equal(unrelated.tests.length, 72);
});
test("Catalog preserves blocked repairs without treating results or N/A as readiness", () => {
    const source = Builder.sourceText(false).replace("| MT-01 | CAN RUN NOW | – |", "| MT-01 | BLOCKED | RQ-20-01 |");
    const item = Builder.parse(source).tests[0];
    assert.equal(item.executionState, "BLOCKED"); assert.deepEqual(item.blockedBy, ["RQ-20-01"]);
    assert.ok(catalog.tests.find(item => item.id === "MT-50").deployments.includes("ha-app"));
    assert.deepEqual(catalog.tests.find(item => item.id === "MT-56").deployments, ["standalone"]);
    assert.deepEqual(catalog.tests.find(item => item.id === "MT-55").deployments, ["coordinator"]);
    assert.deepEqual(catalog.tests.find(item => item.id === "MT-67").deployments, ["ha-app", "standalone"]);
});
test("Report contract round trip, all statuses, counts and incomplete coverage", () => {
    assert.equal(Model.validate(fixture, catalog).valid, true);
    const report = run("00000001"); Model.STATUSES.forEach((status, index) => observed(report, catalog.testIds[index], status));
    assert.equal(Model.validate(report, catalog).valid, true);
    assert.deepEqual(Model.parse(JSON.stringify(report), catalog).report, report);
    assert.deepEqual(Model.counts(report, catalog), {PASS: 1, FAIL: 1, BLOCKED: 1, NOT_TESTED: 68, "N/A": 1});
    assert.equal(Model.counts({results: []}, catalog).NOT_TESTED, 72);
    assert.match(Model.summary(report, catalog), /Failed Test IDs: MT-02/);
});
test("FAIL/BLOCKED/N/A enforce explanations and observations, not assumptions", () => {
    for (const status of ["FAIL", "BLOCKED", "N/A"]) {
        const report = run("00000001"); report.results[0].status = status; report.results[0].testedAt = report.updatedAt;
        assert.equal(Model.validate(report, catalog).valid, false, status);
    }
    assert.equal(Model.validate(observed(run("00000001"), "MT-01", "PASS"), catalog).valid, true);
});
test("Strict import rejects malformed/oversized/version/prototype/status/duplicate/timestamp/field attacks", () => {
    for (const text of ["{", " ".repeat(Model.MAX_BYTES + 1), fs.readFileSync(path.join(__dirname, "fixtures/community-testing/invalid-prototype.json"), "utf8")]) assert.throws(() => Model.parse(text, catalog));
    for (const mutate of [
        report => { report.schemaVersion = "0.9"; }, report => { report.results[0].status = "SUCCESS"; },
        report => { report.results.push(clone(report.results[0])); }, report => { report.extra = true; },
        report => { report.updatedAt = "yesterday"; }, report => { report.createdAt = "2027-10-18T10:00:00.000Z"; },
        report => { report.issueUrl = "javascript:alert(1)"; }, report => { report.environment.device = "x".repeat(161); },
        report => { report.results[0].testedAt = "2020-01-01T00:00:00.000Z"; }
    ]) { const report = run("00000001"); mutate(report); assert.equal(Model.validate(report, catalog).valid, false); }
    assert.equal({}.polluted, undefined);
});
test("Unknown test IDs and catalog mismatch are visible and retained", () => {
    const report = run("00000001"); report.catalogHash = "0".repeat(64); report.results[0].testId = "MT-999";
    const parsed = Model.parse(JSON.stringify(report), catalog);
    assert.ok(parsed.mismatch); assert.match(parsed.warnings.join(" "), /Unknown test ID: MT-999/);
    assert.deepEqual(parsed.report, report); assert.ok(parsed.warnings.length >= 3);
});
test("Search, platform, device, category, Sprint, status and readiness filters compose", () => {
    const report = observed(run("00000001"), "MT-50", "FAIL");
    assert.equal(Model.select(catalog, report, {search: "MT-50", deployment: "ha-app", status: "FAIL"}).length, 1);
    assert.equal(Model.select(catalog, report, {search: "MT-50", deployment: "standalone"}).length, 0);
    const item = catalog.tests[0];
    assert.equal(Model.select(catalog, report, {category: item.category, sprint: item.sprints[0], device: item.device, search: item.id, readiness: "READY"}).length, 1);
    assert.equal(Model.select(catalog, report, {status: "NOT_TESTED"}).length, 71);
});
test("Aggregator retains versions/testers, dedupes exact reports, surfaces run and observation conflicts", t => {
    const first = observed(run("00000001"), "MT-01", "FAIL");
    const second = observed(run("00000002"), "MT-01", "FAIL");
    const third = observed(run("00000003", "1.0.0-rc.8"), "MT-01", "PASS");
    const conflict = observed(clone(first), "MT-01", "PASS");
    const summary = Aggregator.aggregate(files(t, [first, first, second, third, conflict]), catalog);
    assert.equal(summary.distinctRuns, 3); assert.equal(summary.distinctTesters, 3); assert.equal(summary.reportVariants, 4);
    assert.equal(summary.inventory.filter(item => item.duplicate).length, 1);
    assert.equal(summary.runConflicts.length, 1); assert.equal(summary.versions.length, 2);
    assert.equal(summary.repeatedFailures.length, 0); // conflicting first run is quarantined
    assert.equal(summary.failureGroups.length, 1); assert.equal(summary.failureGroups[0].runIds.length, 1);
    assert.equal(summary.conflictingResults.length, 0);
    assert.equal(summary.countedRuns, 2); assert.equal(summary.totals.FAIL, 1); assert.equal(summary.totals.PASS, 1);
    assert.equal(summary.versions.find(item => item.version === "1.0.0-rc.8").totals.FAIL, 0);
    assert.match(Aggregator.matrix(summary), /MT-01/); assert.match(Aggregator.markdown(summary), /No pass percentage/);
});
test("Aggregator reports invalid/unknown inputs and sanitizes public Markdown/CSV contexts", t => {
    const report = observed(run("00000001"), "MT-01", "FAIL"); report.testerId = "=SUM(1,2)"; report.results[0].actual = "<img src=x onerror=alert(1)>";
    report.results[0].issueUrl = "#12";
    const summary = Aggregator.aggregate(files(t, [report, "{"]), catalog);
    assert.equal(summary.inventory[1].valid, false); assert.equal(summary.observations[0].issueUrl, "#12");
    assert.ok(!JSON.stringify(summary).includes("onerror"));
    assert.match(Aggregator.csv("=1+2"), /'=1\+2/); assert.doesNotMatch(Aggregator.markdown(summary), /<img/);
    const missing = clone(report); missing.results[0].testId = "MT-999";
    const unknown = Aggregator.aggregate(files(t, [missing]), catalog);
    assert.match(unknown.inventory[0].warnings.join(" "), /Unknown test ID/);
});
test("CLI rejects symlinks and aggregates privately without overwriting outputs", t => {
    const [file] = files(t, [fixture]);
    const link = path.join(path.dirname(file), "link.json"); fs.symlinkSync(file, link);
    assert.throws(() => IO.read(link), /Regular/);
    cp.execFileSync(process.execPath, ["scripts/testing/validate-test-report.js", file], {cwd: root});
    const out = path.join(path.dirname(file), "summary");
    cp.execFileSync(process.execPath, ["scripts/testing/aggregate-test-reports.js", file, "--out", out], {cwd: root});
    assert.ok(fs.existsSync(path.join(out, "summary.md")));
    assert.throws(() => cp.execFileSync(process.execPath, ["scripts/testing/aggregate-test-reports.js", file, "--out", out], {cwd: root, stdio: "pipe"}));
});
test("Static build exposes only reviewed allowlist; portal is independent and safely renders text", t => {
    const directory = path.join(root, "dist/community-unit-" + process.pid);
    t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
    Site.build(directory);
    assert.deepEqual(fs.readdirSync(directory).sort(), [".nojekyll", "testing"]);
    const html = fs.readFileSync(path.join(directory, "testing/index.html"), "utf8");
    assert.match(html, /href="css\/testing.css"/); assert.match(html, /script-src 'self'/);
    const portal = fs.readFileSync(path.join(directory, "testing/js/portal.js"), "utf8");
    assert.doesNotMatch(portal, /innerHTML|fetch\(|\/api\/|\.env\b|HA_TOKEN|SUPERVISOR_TOKEN|https:\/\/api\.github/);
    assert.match(portal, /textContent/); assert.match(portal, /confirm\(/);
    assert.doesNotMatch(JSON.stringify(catalog), /Ausgeführte Teilprüfungen|2507f6955b17740da8edbd36925b3338ca080383/);
    assert.match(fs.readFileSync(path.join(root, ".gitignore"), "utf8"), /test-results\//);
});
test("GitHub forms and Pages workflow preserve narrow permissions and manual submission", () => {
    const form = fs.readFileSync(path.join(root, ".github/ISSUE_TEMPLATE/manual_test_run.yml"), "utf8");
    assert.match(form, /name: Manual Test Run Report/); assert.match(form, /\.zip\/\.txt/); assert.match(form, /required: true/);
    const workflow = fs.readFileSync(path.join(root, ".github/workflows/testing-pages.yml"), "utf8");
    assert.match(workflow, /pages: write/); assert.match(workflow, /id-token: write/); assert.match(workflow, /github.ref == 'refs\/heads\/main'/);
    assert.doesNotMatch(workflow, /packages: write|contents: write|release create|git tag/);
});
