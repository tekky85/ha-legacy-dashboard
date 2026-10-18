"use strict";
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {ROOT, hash} = require("./build-test-catalog");
const {pilotReports} = require("../../test/fixtures/community-testing/pilot-reports");

function run(output) {
    const destination = path.resolve(output || "test-results/pilot-27-4");
    if (!destination.startsWith(path.join(ROOT, "test-results") + path.sep)) throw new Error("Use a dedicated ignored test-results/ output directory");
    if (fs.existsSync(destination)) throw new Error("Output exists; choose a new directory to preserve prior evidence");
    const incoming = path.join(destination, "synthetic-input");
    fs.mkdirSync(incoming, {recursive: true, mode: 0o700});
    const fixtures = pilotReports();
    fixtures.forEach(entry => fs.writeFileSync(path.join(incoming, entry.name), entry.raw || JSON.stringify(entry.report, null, 2) + "\n", {flag: "wx", mode: 0o600}));
    const commands = [];
    function command(script, args, expectedStatus) {
        const result = cp.spawnSync(process.execPath, ["scripts/testing/" + script, ...args], {cwd: ROOT, encoding: "utf8"});
        assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
        commands.push({script, arguments: args.map(arg => arg.replace(ROOT + path.sep, "")), status: result.status,
            note: expectedStatus === 1 ? "Expected rejection: intentionally corrupted synthetic input" : "Tooling validation"});
        return result;
    }
    const validation = command("validate-test-report.js", [incoming], 1);
    fs.writeFileSync(path.join(destination, "validation.jsonl"), validation.stdout, {flag: "wx", mode: 0o600});
    command("aggregate-test-reports.js", [incoming, "--out", path.join(destination, "synthetic-summary"), "--include-synthetic"], 1);
    command("aggregate-test-reports.js", [incoming, "--out", path.join(destination, "default-summary")], 1);
    const synthetic = JSON.parse(fs.readFileSync(path.join(destination, "synthetic-summary/summary.json"), "utf8"));
    const normal = JSON.parse(fs.readFileSync(path.join(destination, "default-summary/summary.json"), "utf8"));
    assert.equal(synthetic.inventory.filter(item => !item.valid).length, 1);
    assert.equal(synthetic.inventory.filter(item => item.duplicate).length, 1);
    assert.equal(synthetic.countedRuns, 4); assert.equal(synthetic.distinctTesters, 4);
    assert.deepEqual(synthetic.totals, {PASS: 8, FAIL: 5, BLOCKED: 2, NOT_TESTED: 271, "N/A": 3});
    assert.equal(synthetic.repeatedFailures.find(item => item.testId === "MT-58").runCount, 2);
    assert.ok(synthetic.conflictingResults.some(item => item.testId === "MT-16"));
    assert.equal(synthetic.versions.length, 2); assert.equal(synthetic.catalogs.length, 2);
    assert.ok(synthetic.inventory.some(item => item.warnings?.some(warning => warning.includes("Unknown test ID"))));
    assert.equal(normal.countedRuns, 0); assert.equal(normal.totals.PASS, 0); assert.equal(normal.totals.FAIL, 0);
    const evidence = {schemaVersion: "1.0", result: "TOOLING VERIFIED – SYNTHETIC ONLY", humanPilot: "NOT TESTED",
        inputHashes: fixtures.map(entry => ({file: entry.name, sha256: hash(fs.readFileSync(path.join(incoming, entry.name)))})), commands,
        summary: {syntheticCountedRuns: synthetic.countedRuns, defaultCountedRuns: normal.countedRuns, corruptedInputsRejected: 1, identicalDuplicate: 1}};
    fs.writeFileSync(path.join(destination, "tooling-validation.json"), JSON.stringify(evidence, null, 2) + "\n", {flag: "wx", mode: 0o600});
    console.log(JSON.stringify({result: evidence.result, humanPilot: evidence.humanPilot, output: destination, ...evidence.summary}));
    return evidence;
}
if (require.main === module) { try { run(process.argv[2]); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = {run};
