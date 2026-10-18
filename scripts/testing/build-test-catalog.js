"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const cp = require("node:child_process");
const ROOT = path.resolve(__dirname, "../..");
const SOURCE = "docs/audits/MANUAL_TEST_QUEUE.md";
const OUTPUT = "testing/data/test-catalog.json";
const hash = text => crypto.createHash("sha256").update(text).digest("hex");

function validateCatalog(catalog) {
    const fail = message => { throw new Error("Invalid catalog: " + message); };
    const object = (value, allowed, name) => {
        if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== allowed.length || Object.keys(value).some(key => !allowed.includes(key))) fail(name + " fields");
    };
    const string = value => typeof value === "string";
    const strings = value => Array.isArray(value) && value.every(string);
    object(catalog, ["schemaVersion", "catalogVersion", "catalogHash", "sourceFile", "sourceHash", "sourceCommit", "testCount", "testIds", "diagnostics", "tests"], "root");
    if (catalog.schemaVersion !== "1.0" || catalog.sourceFile !== SOURCE || !/^[a-f0-9]{64}$/.test(catalog.sourceHash) || !/^[a-f0-9]{64}$/.test(catalog.catalogHash)) fail("identity");
    if (catalog.catalogVersion !== "27.3-" + catalog.catalogHash.slice(0, 12) || (catalog.sourceCommit !== null && !/^[a-f0-9]{40}$/.test(catalog.sourceCommit))) fail("version/provenance");
    if (!Number.isInteger(catalog.testCount) || catalog.testCount < 1 || catalog.testCount > 1000 || !strings(catalog.testIds) || !Array.isArray(catalog.tests) || catalog.tests.length !== catalog.testCount || catalog.testIds.length !== catalog.testCount || new Set(catalog.testIds).size !== catalog.testCount) fail("counts/unique IDs");
    if (!Array.isArray(catalog.diagnostics)) fail("diagnostics");
    catalog.diagnostics.forEach(item => {
        object(item, ["testId", "line", "message"], "diagnostic");
        if (!catalog.testIds.includes(item.testId) || !Number.isInteger(item.line) || item.line < 1 || !string(item.message)) fail("diagnostic value");
    });
    const testKeys = ["id", "sourceTestId", "title", "sprints", "requirement", "category", "device", "deployments", "prerequisites", "metadata", "sections", "steps", "expected", "failureCriteria", "evidence", "repairs", "readiness", "executionState", "blockedBy", "source"];
    catalog.tests.forEach((item, index) => {
        object(item, testKeys, "test");
        if (item.id !== catalog.testIds[index] || !/^MT-\d+$/.test(item.id)) fail("ordered IDs");
        for (const key of ["sourceTestId", "title", "requirement", "category", "device", "prerequisites", "metadata", "expected", "failureCriteria", "evidence"]) if (!string(item[key])) fail(key);
        for (const key of ["sprints", "deployments", "steps", "repairs", "blockedBy"]) if (!strings(item[key])) fail(key);
        if (item.deployments.some(value => !["ha-app", "standalone", "coordinator"].includes(value)) || !["READY", "NOT READY"].includes(item.readiness) || !["CAN RUN NOW", "BLOCKED"].includes(item.executionState)) fail("test enums");
        object(item.source, ["file", "heading", "line", "endLine"], "source");
        if (item.source.file !== SOURCE || item.source.heading !== "## " + item.id || !Number.isInteger(item.source.line) || !Number.isInteger(item.source.endLine) || item.source.line < 1 || item.source.endLine < item.source.line) fail("source reference");
        if (!Array.isArray(item.sections)) fail("sections");
        item.sections.forEach(section => { object(section, ["title", "text"], "section"); if (!string(section.title) || !string(section.text)) fail("section values"); });
        if (item.readiness === "READY" && (!item.steps.length || !item.expected || !item.failureCriteria || !item.prerequisites || !item.evidence)) fail("READY without prerequisites");
    });
    if (hash(JSON.stringify({tests: catalog.tests, diagnostics: catalog.diagnostics})) !== catalog.catalogHash) fail("content hash");
    return true;
}

// This is a deliberately bounded parser for the documented queue contract,
// not a general Markdown renderer. Result sections never enter the public catalog.
function parse(source) {
    const lines = source.replace(/\r\n/g, "\n").split("\n");
    const summaries = new Map();
    const execution = new Map();
    const headings = [];
    lines.forEach((line, index) => {
        const cells = line.split("|").slice(1, -1).map(cell => cell.trim());
        if (/^MT-\d+$/.test(cells[0] || "")) {
            if (cells.length === 6) {
                if (summaries.has(cells[0])) throw new Error("Duplicate summary ID " + cells[0]);
                summaries.set(cells[0], cells);
            } else if (cells.length === 3) {
                if (execution.has(cells[0])) throw new Error("Duplicate execution ID " + cells[0]);
                execution.set(cells[0], cells);
            }
        }
        const match = /^## (MT-\d+)\s*$/.exec(line);
        if (match) headings.push({id: match[1], line: index + 1, start: index});
    });
    const ids = new Set();
    const diagnostics = [];
    const tests = headings.map(heading => {
        if (ids.has(heading.id)) throw new Error("Duplicate detail ID " + heading.id);
        ids.add(heading.id);
        let end = heading.start + 1;
        while (end < lines.length && !/^## /.test(lines[end])) end += 1;
        const body = lines.slice(heading.start + 1, end).join("\n").split(/^### Result\s*$/m)[0].trim();
        const parts = body.split(/^### (.+)\s*$/m);
        const metadata = parts[0].trim();
        const fields = Object.create(null);
        let field = "";
        const labels = /^(Test ID|Sprint|Requirement|Device\/System|Device|System|Preconditions|Exact[^:]*|Test data\/entity\/card required|Entity state\/capabilities|Card size\/orientation|Configuration required|Deployment mode|Orientation(?:\/mode)?|Required[^:]*):\s*(.*)$/;
        metadata.split("\n").forEach(line => {
            const match = labels.exec(line);
            if (match) {
                field = match[1];
                if (Object.hasOwn(fields, field)) throw new Error(heading.id + ": duplicate field " + field);
                fields[field] = match[2];
            } else if (field) fields[field] += "\n" + line;
        });
        Object.keys(fields).forEach(key => { fields[key] = fields[key].trim(); });
        const sections = [];
        for (let index = 1; index < parts.length; index += 2) {
            sections.push({title: parts[index].trim(), text: parts[index + 1].trim()});
        }
        const find = pattern => sections.filter(section => pattern.test(section.title)).map(section => section.text).join("\n\n");
        const stepText = find(/^Steps$/);
        const steps = [];
        stepText.split("\n").forEach(line => {
            const match = /^(\d+)\.\s+(.+)$/.exec(line);
            if (match) {
                if (Number(match[1]) !== steps.length + 1) {
                    diagnostics.push({testId: heading.id, line: heading.line, message: "Non-sequential Steps; NOT READY"});
                }
                steps.push(match[2]);
            } else if (steps.length) steps[steps.length - 1] += "\n" + line;
        });
        const summary = summaries.get(heading.id);
        const state = execution.get(heading.id);
        const missing = [];
        const device = fields["Device/System"] || fields.Device || fields.System || "";
        const expected = find(/^Expected/);
        const failureCriteria = find(/^Fail If$/);
        [ ["summary", summary], ["Test ID", fields["Test ID"]], ["Sprint", fields.Sprint],
          ["Requirement", fields.Requirement], ["Device/System", device],
          ["Preconditions", fields.Preconditions], ["Steps", steps.length],
          ["Expected", expected], ["Fail If", failureCriteria], ["Evidence", find(/^Evidence$/)]
        ].forEach(([name, value]) => { if (!value) missing.push(name); });
        if (missing.length) diagnostics.push({testId: heading.id, line: heading.line, message: "Missing: " + missing.join(", ")});
        const repairs = [...new Set((body.match(/RQ-\d+-\d+/g) || []).concat((state?.[2] || "").match(/RQ-\d+-\d+/g) || []))].sort();
        const blocked = Boolean(state && /BLOCKED|FAIL/.test(state[1]));
        const appSpecific = /HAOS|Home Assistant OS|HA-App|Home Assistant App|HA App|Supervisor/.test(device);
        const coordinator = /GitHub Actions|GHCR|GitHub Release/.test(device);
        const standaloneOnly = /Standalone|LXC|Linux|Debian/.test(device) && !appSpecific && !/oder HA|oder App/.test(device);
        const both = appSpecific && /Standalone|LXC/.test(device);
        const deployments = coordinator ? ["coordinator"] : both ? ["ha-app", "standalone"] : appSpecific ? ["ha-app"] : standaloneOnly ? ["standalone"] : ["ha-app", "standalone"];
        const category = coordinator ? "Release" : /iPad|iOS/.test(device) ? "iPad / Legacy" : appSpecific ? "HA App / HAOS" : /LXC|Linux|Debian/.test(device) ? "Standalone / LXC" : "Desktop / Admin";
        return {
            id: heading.id, sourceTestId: fields["Test ID"] || heading.id,
            title: summary?.[2] || fields.Requirement || heading.id,
            sprints: (fields.Sprint || "").split(",").map(value => value.trim()).filter(Boolean),
            requirement: fields.Requirement || "", category, device, deployments,
            prerequisites: fields.Preconditions || "", metadata, sections,
            steps: steps.map(step => step.trim()), expected, failureCriteria,
            evidence: find(/^Evidence$/), repairs,
            readiness: missing.length || diagnostics.some(item => item.testId === heading.id) ? "NOT READY" : "READY",
            executionState: blocked ? "BLOCKED" : "CAN RUN NOW",
            blockedBy: blocked ? (state[2].match(/RQ-\d+-\d+/g) || []) : [],
            source: {file: SOURCE, heading: "## " + heading.id, line: heading.line, endLine: end}
        };
    }).sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));
    for (const id of summaries.keys()) if (!ids.has(id)) throw new Error("Missing detail for " + id);
    for (const id of ids) if (!summaries.has(id)) throw new Error("Missing summary for " + id);
    if (!tests.length) throw new Error("No manual tests found");
    return {tests, diagnostics};
}

function build(source, sourceCommit = null) {
    const parsed = parse(source);
    const catalogHash = hash(JSON.stringify(parsed));
    return {
        schemaVersion: "1.0", catalogVersion: "27.3-" + catalogHash.slice(0, 12),
        catalogHash, sourceFile: SOURCE, sourceHash: hash(source), sourceCommit,
        testCount: parsed.tests.length, testIds: parsed.tests.map(test => test.id),
        diagnostics: parsed.diagnostics, tests: parsed.tests
    };
}

function sourceText(workingTree) {
    return workingTree ? fs.readFileSync(path.join(ROOT, SOURCE), "utf8") :
        cp.execFileSync("git", ["show", "HEAD:" + SOURCE], {cwd: ROOT, encoding: "utf8", maxBuffer: 2 * 1024 * 1024});
}

function main() {
    const source = sourceText(process.argv.includes("--working-tree"));
    const output = path.join(ROOT, OUTPUT);
    const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, "utf8")) : null;
    let sourceCommit = null;
    // Retain known provenance, including an explicit null for definitions generated
    // before their source commit exists. This avoids self-referencing commit hashes.
    if (previous?.sourceHash === hash(source) && Object.hasOwn(previous, "sourceCommit")) sourceCommit = previous.sourceCommit;
    else if (source === sourceText(false)) sourceCommit = cp.execFileSync("git", ["log", "-1", "--format=%H", "--", SOURCE], {cwd: ROOT, encoding: "utf8"}).trim() || null;
    const catalog = build(source, sourceCommit);
    validateCatalog(catalog);
    const bytes = JSON.stringify(catalog, null, 2) + "\n";
    if (process.argv.includes("--check")) {
        if (!fs.existsSync(output) || fs.readFileSync(output, "utf8") !== bytes) throw new Error("Catalog drift: regenerate from the intended canonical queue revision (see DATA_FORMAT.md)");
    } else {
        fs.mkdirSync(path.dirname(output), {recursive: true});
        fs.writeFileSync(output, bytes);
    }
    console.log(JSON.stringify({version: catalog.catalogVersion, hash: catalog.catalogHash, unique: catalog.testCount,
        complete: catalog.tests.filter(test => test.readiness === "READY").length,
        incomplete: catalog.diagnostics, blocked: catalog.tests.filter(test => test.executionState === "BLOCKED").length}));
    if (catalog.diagnostics.length) process.exitCode = 1;
}
if (require.main === module) { try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = {parse, build, validateCatalog, sourceText, SOURCE, ROOT, hash};
