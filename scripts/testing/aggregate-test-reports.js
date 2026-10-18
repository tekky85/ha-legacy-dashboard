"use strict";
const fs = require("node:fs");
const path = require("node:path");
const Model = require("../../testing/js/report");
const Catalog = require("./build-test-catalog");
const IO = require("./validate-test-report");
const catalog = require("../../testing/data/test-catalog.json");

function safe(value) {
    return String(value).replace(/Bearer\s+\S+/gi, "[REDACTED]").replace(/(?:token|password|secret)\s*[=:]\s*\S+/gi, "[REDACTED]")
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]").replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[ADDRESS]")
        .replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 200);
}
function md(value) { return safe(value).replace(/[\\`*_[\]<>|#]/g, "\\$&"); }
function csv(value) { let text = safe(value); if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; }
function aggregate(files, activeCatalog) {
    const inventory = [], reports = [], byRun = new Map();
    for (const file of files) {
        try {
            const raw = IO.read(file), contentHash = Catalog.hash(raw);
            const parsed = Model.parse(raw, activeCatalog);
            const report = parsed.report;
            const same = byRun.get(report.testRunId) || [];
            const canonicalHash = Catalog.hash(JSON.stringify(report));
            // Only byte-identical submissions with the same run ID deduplicate.
            // Differing content is retained even if parsed JSON looks equivalent.
            const duplicate = same.find(item => item.sourceHash === contentHash);
            const item = {file: safe(path.basename(file)), sourceHash: contentHash, canonicalHash, valid: true,
                runId: report.testRunId, version: report.environment.dashboardVersion,
                catalogVersion: report.catalogVersion, catalogHash: report.catalogHash,
                duplicate: Boolean(duplicate), warnings: parsed.warnings};
            inventory.push(item);
            if (!duplicate) { same.push({report, canonicalHash, sourceHash: contentHash}); byRun.set(report.testRunId, same); reports.push(report); }
        } catch (error) { inventory.push({file: safe(path.basename(file)), valid: false, errors: [safe(error.message)]}); }
    }
    const runConflicts = [...byRun.entries()].filter(([, variants]) => variants.length > 1).map(([runId, variants]) => ({runId, variants: variants.map(item => item.sourceHash)}));
    const observations = [];
    const versions = new Map();
    reports.forEach(report => {
        const env = report.environment, versionKey = env.dashboardVersion;
        const group = versions.get(versionKey) || {version: versionKey, variants: 0, runIds: new Set(), testerIds: new Set(), totals: Object.fromEntries(Model.STATUSES.map(status => [status, 0])), categories: {}, systems: {}};
        group.variants += 1; group.runIds.add(report.testRunId); group.testerIds.add(report.testerId);
        const count = Model.counts(report, activeCatalog); Model.STATUSES.forEach(status => { group.totals[status] += count[status]; });
        const results = new Map(report.results.map(result => [result.testId, result]));
        const allIds = new Set([...activeCatalog.testIds, ...results.keys()]);
        for (const testId of allIds) {
            const result = results.get(testId) || Model.blank(testId);
            const definition = activeCatalog.tests.find(test => test.id === testId);
            const category = definition?.category || "UNKNOWN";
            const system = [env.deployment, env.device, env.os, env.browser, env.architecture || "unknown"].map(safe).join(" / ");
            for (const [target, key] of [[group.categories, category], [group.systems, system]]) {
                if (!target[key]) target[key] = Object.fromEntries(Model.STATUSES.map(status => [status, 0]));
                target[key][result.status] += 1;
            }
            observations.push({testId, runId: report.testRunId, testerId: safe(report.testerId), version: versionKey,
                homeAssistantVersion: safe(env.homeAssistantVersion || "unknown"), environment: system,
                catalogHash: report.catalogHash, catalogMatched: report.catalogHash === activeCatalog.catalogHash && report.catalogVersion === activeCatalog.catalogVersion,
                status: result.status, issueUrl: result.issueUrl || report.issueUrl,
                sprints: definition?.sprints || [], requirement: definition?.requirement || "unknown test",
                repairs: definition?.repairs || [], triage: result.status === "FAIL" ? definition?.repairs.length ? "Review existing RQ mapping; no root cause inferred" : "Candidate new finding for human review" : ""});
        }
        versions.set(versionKey, group);
    });
    const grouped = new Map();
    observations.forEach(obs => {
        // Catalogs and software versions never become equivalent implicitly.
        const key = obs.testId + "/" + obs.version + "/" + obs.catalogHash;
        if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(obs);
    });
    const repeatedFailures = [], conflictingResults = [];
    grouped.forEach(items => {
        const failedRuns = new Set(items.filter(item => item.status === "FAIL").map(item => item.runId));
        const failedTesters = new Set(items.filter(item => item.status === "FAIL").map(item => item.testerId));
        const base = {testId: items[0].testId, version: items[0].version, catalogHash: items[0].catalogHash};
        if (failedRuns.size >= 2) repeatedFailures.push({...base, runCount: failedRuns.size, testerCount: failedTesters.size, runIds: [...failedRuns]});
        if (new Set(items.map(item => item.status).filter(status => status !== "NOT_TESTED")).size > 1) conflictingResults.push({...base, observations: items.filter(item => item.status !== "NOT_TESTED").map(item => ({runId: item.runId, status: item.status}))});
    });
    const failureGroups = new Map();
    observations.filter(obs => obs.status === "FAIL").forEach(obs => {
        const key = JSON.stringify([obs.testId, obs.version, obs.catalogHash, obs.homeAssistantVersion, obs.environment]);
        if (!failureGroups.has(key)) failureGroups.set(key, {testId: obs.testId, version: obs.version, catalogHash: obs.catalogHash, homeAssistantVersion: obs.homeAssistantVersion, environment: obs.environment, runIds: new Set(), testerIds: new Set(), issueUrls: new Set(), repairs: obs.repairs});
        const group = failureGroups.get(key); group.runIds.add(obs.runId); group.testerIds.add(obs.testerId); if (obs.issueUrl) group.issueUrls.add(obs.issueUrl);
    });
    const totals = Object.fromEntries(Model.STATUSES.map(status => [status, 0]));
    observations.forEach(obs => { totals[obs.status] += 1; });
    return {schemaVersion: "1.0", sourceCatalog: {version: activeCatalog.catalogVersion, hash: activeCatalog.catalogHash}, inventory,
        distinctRuns: byRun.size, distinctTesters: new Set(reports.map(report => report.testerId)).size,
        reportVariants: reports.length, totals, runConflicts, repeatedFailures, conflictingResults,
        failureGroups: [...failureGroups.values()].map(group => ({...group, runIds: [...group.runIds], testerIds: [...group.testerIds], issueUrls: [...group.issueUrls]})),
        versions: [...versions.values()].map(group => ({...group, runIds: [...group.runIds], testerIds: [...group.testerIds].map(safe)})),
        observations, acceptance: "NOT APPROVED: review coverage, catalog mismatches, conflicts, required manual gates and open repairs. No queue item is closed automatically."};
}
function markdown(summary) {
    const lines = ["# Community test summary", "", summary.acceptance, "", "Distinct runs: " + summary.distinctRuns + "; distinct tester aliases: " + summary.distinctTesters + "; variants: " + summary.reportVariants + ".", "", "## Input inventory", "", "| File | Valid | Duplicate | Version | Warnings |", "|---|---|---|---|---|"];
    summary.inventory.forEach(item => lines.push("| " + [item.file, item.valid, item.duplicate || false, item.version || "", (item.warnings || item.errors || []).join("; ")].map(md).join(" | ") + " |"));
    lines.push("", "## Software versions (kept separate)", "", "| Version | Runs | Testers | PASS | FAIL | BLOCKED | N/A | NOT_TESTED |", "|---|---|---|---|---|---|---|---|");
    summary.versions.forEach(group => lines.push("| " + [group.version, group.runIds.length, group.testerIds.length, group.totals.PASS, group.totals.FAIL, group.totals.BLOCKED, group.totals["N/A"], group.totals.NOT_TESTED].map(md).join(" | ") + " |"));
    lines.push("", "No pass percentage is asserted. Missing coverage and N/A are not PASS.", "", "## Repeated failures", "");
    summary.repeatedFailures.forEach(item => lines.push("- " + md(item.testId) + " / " + md(item.version) + ": " + item.runCount + " runs; " + item.testerCount + " aliases."));
    lines.push("", "## Conflicts", "");
    summary.runConflicts.forEach(item => lines.push("- Run ID " + md(item.runId) + ": " + item.variants.length + " conflicting variants; retain all originals."));
    summary.conflictingResults.forEach(item => lines.push("- " + md(item.testId) + " / " + md(item.version) + ": " + item.observations.map(obs => md(obs.runId) + " " + md(obs.status)).join("; ")));
    lines.push("", "## Failed observations for human triage", "", "| Test | Version | HA | Environment | Run | RQ candidates | Issue |", "|---|---|---|---|---|---|---|");
    summary.observations.filter(obs => obs.status === "FAIL").forEach(obs => lines.push("| " + [obs.testId, obs.version, obs.homeAssistantVersion, obs.environment, obs.runId, obs.repairs.join(", ") || "new finding candidate", obs.issueUrl].map(md).join(" | ") + " |"));
    lines.push("", "Full structured coverage by category/device and per-source hashes: summary.json. Raw notes are omitted; raw reports and all exports remain private by default.", "");
    return lines.join("\n");
}
function matrix(summary) {
    const columns = [...new Set(summary.observations.map(obs => obs.runId + " / " + obs.version + " / " + obs.catalogHash))];
    const ids = [...new Set(summary.observations.map(obs => obs.testId))].sort();
    return [["Test ID", ...columns].map(csv).join(","), ...ids.map(id => [id, ...columns.map(column => summary.observations.filter(obs => obs.testId === id && obs.runId + " / " + obs.version + " / " + obs.catalogHash === column).map(obs => obs.status).join(";"))].map(csv).join(","))].join("\n") + "\n";
}
function main() {
    const args = process.argv.slice(2), index = args.indexOf("--out");
    const output = path.resolve(index >= 0 ? args.splice(index, 2)[1] || "" : "test-results/summary");
    if (output === Catalog.ROOT || output === path.parse(output).root) throw new Error("Choose a dedicated output directory");
    const summary = aggregate(IO.inputs(args), catalog);
    fs.mkdirSync(output, {recursive: true, mode: 0o700});
    for (const [name, content] of [["summary.json", JSON.stringify(summary, null, 2) + "\n"], ["summary.md", markdown(summary)], ["matrix.csv", matrix(summary)]]) {
        const target = path.join(output, name);
        // Never overwrite a prior coordinator output or follow a symlink.
        fs.writeFileSync(target, content, {flag: "wx", mode: 0o600});
    }
    console.log(JSON.stringify({output, reports: summary.inventory.length, distinctRuns: summary.distinctRuns, conflicts: summary.runConflicts.length}));
    if (summary.inventory.some(item => !item.valid) || summary.runConflicts.length) process.exitCode = 1;
}
if (require.main === module) { try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = {aggregate, markdown, matrix, csv};
