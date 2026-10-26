"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const CatalogBuilder = require("../scripts/testing/build-test-catalog");
const GuideBuilder = require("../scripts/testing/build-test-guides");
const Words = require("../testing/js/wording");
const Model = require("../testing/js/report");
const Pilot = require("../testing/js/pilot");
const catalog = require("../testing/data/test-catalog.json");
const guides = require("../testing/data/test-guides.de.json");
const clone = value => JSON.parse(JSON.stringify(value));
const source = () => CatalogBuilder.sourceText(false);
const wrap = value => "<!-- TEST-CENTER-GUIDES-DE -->\n```json\n" + JSON.stringify(value) + "\n```\n";
test("German explanations cover MT-01 and all eleven pilot tests without new IDs or partial steps", () => {
    assert.deepEqual(new Set(guides.guides.map(guide => guide.testId)), new Set(["MT-01", ...Pilot.testIds]));
    assert.deepEqual(GuideBuilder.build(source(), catalog), guides);
    for (const guide of guides.guides) {
        const original = catalog.tests.find(test => test.id === guide.testId);
        assert.equal(guide.steps.length, original.steps.length, guide.testId);
        assert.equal(guide.definitionHash, GuideBuilder.definitionHash(original));
        for (const key of ["goal", "preparation", "expected", "failIf", "record"]) assert.ok(guide[key].length > 40, guide.testId + key);
    }
});
test("Stale criteria, omitted steps, unknown/duplicate IDs and malformed guide structures are rejected", () => {
    for (const mutate of [
        data => { data.guides[0].steps.pop(); }, data => { data.guides[0].definitionHash = "0".repeat(64); },
        data => { data.guides[0].testId = "MT-999"; }, data => { data.guides.push(clone(data.guides[0])); },
        data => { data.guides[0].record = ""; }, data => { data.guides[0].extra = true; },
        data => { data.schemaVersion = "9"; }
    ]) {
        const data = {schemaVersion: "1.0", guides: clone(guides.guides)}; mutate(data);
        assert.throws(() => GuideBuilder.build(wrap(data), catalog));
    }
    const changed = clone(catalog); changed.tests[0].failureCriteria += " Extra criterion";
    assert.throws(() => GuideBuilder.build(source(), changed), /semantic review/);
    assert.throws(() => GuideBuilder.build(source() + source(), catalog), /Exactly one/);
});
test("Presentation appendix leaves the entire canonical test inventory and old report identity unchanged", () => {
    const before = source().split("\n## Verständliche Hilfetexte für das Test-Center")[0] + "\n";
    assert.deepEqual(CatalogBuilder.parse(before), CatalogBuilder.parse(source()));
    const legacy = clone(require("./fixtures/community-testing/all-statuses.json"));
    const previous = CatalogBuilder.build(before);
    legacy.catalogHash = previous.catalogHash; legacy.catalogVersion = previous.catalogVersion;
    const check = Model.validate(legacy, catalog);
    assert.equal(check.valid, true); assert.equal(check.mismatch, false);
    assert.equal(catalog.catalogHash, "1c6d7088096c68bfd4758fb85e882ec06b56131ad68f7ca7c8683beea9a2976a");
});
test("German result labels preserve machine status codes and distinguish obstacles from defects", () => {
    assert.deepEqual(Object.keys(Words.labels), Model.STATUSES);
    assert.equal(Words.labels.FAIL, "Etwas stimmt nicht");
    assert.equal(Words.labels.BLOCKED, "Ich komme nicht weiter");
    assert.match(Words.error("FAIL requires expected, actual, reproductionSteps"), /alle drei Punkte/);
    assert.match(Words.error("explanation required"), /was fehlt/);
    assert.doesNotMatch(Words.error("Unsafe prototype"), /Unsafe/);
    assert.match(Words.error("Catalog mismatch"), /nicht verändern/);
});
test("German summaries keep exact counts, mark exercises and exclude private freeform notes", () => {
    const report = clone(require("./fixtures/community-testing/all-statuses.json"));
    report.dataKind = "synthetic"; report.notes = "private-general-note";
    report.results[0].notes = "private-result-note";
    const summary = Words.summary(report, catalog, Model);
    assert.match(summary, /NUR ÜBUNG/); assert.match(summary, /Testbericht/);
    assert.match(summary, /Etwas stimmt nicht: 1/); assert.match(summary, /MT-02/);
    assert.doesNotMatch(summary, /private-general-note|private-result-note/);
});
test("User-facing context explains reported ambiguities and keeps technical safety checks explicit", () => {
    const first = guides.guides.find(guide => guide.testId === "MT-01");
    assert.match(first.preparation, /ausdrücklich/); assert.match(first.preparation, /Ansprechpartner/);
    assert.match(first.steps[2], /protokoll/i); assert.match(first.steps[3], /nicht bestätigt/);
    assert.match(first.record, /nicht ausgeführt/);
    const runtime = fs.readFileSync(path.join(__dirname, "../testing/js/portal.js"), "utf8");
    assert.match(runtime, /complete-check/); assert.match(runtime, /Teilerfolg/);
    assert.match(runtime, /selected\.sections\.map/); // all original evidence/criteria still available
    assert.doesNotMatch(runtime, /innerHTML|https:\/\/api\.github|\/api\//);
    const help = fs.readFileSync(path.join(__dirname, "../testing/help.html"), "utf8");
    assert.match(help, /Was ist stattdessen passiert/); assert.match(help, /kein neues Testergebnis/);
    assert.match(help, /Safari-Adressleiste/); assert.match(help, /Ohne GitHub-Konto/);
    for (const file of ["index.html", "help.html"]) {
        const html = fs.readFileSync(path.join(__dirname, "../testing", file), "utf8");
        const versions = [...html.matchAll(/(?:src|href)="(?:js|css)\/[^"?]+\?v=([^"]+)"/g)].map(match => match[1]);
        assert.ok(versions.length); assert.ok(versions.every(version => version === Model.TEST_CENTER_VERSION));
    }
});
