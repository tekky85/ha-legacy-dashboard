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
function aggregate(files, activeCatalog, options = {}) {
    const inventory = [], reports = [], byRun = new Map();
    for (const file of files) {
        try {
            const raw = IO.read(file), contentHash = Catalog.hash(raw);
            const parsed = Model.parse(raw, activeCatalog);
            const report = parsed.report;
            const same = byRun.get(report.testRunId) || [];
            const canonicalHash = Catalog.hash(Model.observationJSON(report));
            // Raw source hashes remain available. Re-export timestamps and JSON
            // key order are not independent observations of the same run.
            const duplicate = same.find(item => item.canonicalHash === canonicalHash);
            const dataKind = report.dataKind || "unspecified";
            const item = {file: safe(path.basename(file)), sourceHash: contentHash, canonicalHash, valid: true,
                runId: report.testRunId, version: report.environment.dashboardVersion,
                catalogVersion: report.catalogVersion, catalogHash: report.catalogHash,
                dataKind, duplicate: Boolean(duplicate), warnings: parsed.warnings};
            inventory.push(item);
            if (!duplicate) { const entry = {report, canonicalHash, sourceHash: contentHash, dataKind}; same.push(entry); byRun.set(report.testRunId, same); reports.push(entry); }
        } catch (error) { inventory.push({file: safe(path.basename(file)), valid: false, errors: [safe(error.message)]}); }
    }
    const runConflicts = [...byRun.entries()].filter(([, variants]) => variants.length > 1).map(([runId, variants]) => ({runId, variants: variants.map(item => item.sourceHash)}));
    const conflictIds = new Set(runConflicts.map(item => item.runId));
    const excludedReports = [];
    const eligible = reports.filter(entry => {
        const reasons = [];
        if (conflictIds.has(entry.report.testRunId)) reasons.push("CONFLICTING_RUN_QUARANTINED");
        if (entry.dataKind === "synthetic" && !options.includeSynthetic) reasons.push("SYNTHETIC_EXCLUDED");
        if (reasons.length) excludedReports.push({runId: entry.report.testRunId, sourceHash: entry.sourceHash, reasons});
        return !reasons.length;
    });
    const eligibleHashes = new Set(eligible.map(entry => entry.sourceHash));
    const observations = [];
    const versions = new Map();
    const zero = () => Object.fromEntries(Model.STATUSES.map(status => [status, 0]));
    reports.forEach(entry => {
        const {report, sourceHash, dataKind} = entry;
        const counted = eligibleHashes.has(sourceHash);
        const env = report.environment, versionKey = JSON.stringify([env.dashboardVersion, report.catalogVersion, report.catalogHash, dataKind]);
        const group = versions.get(versionKey) || {version: env.dashboardVersion, catalogVersion: report.catalogVersion, catalogHash: report.catalogHash, dataKind,
            variants: 0, runIds: new Set(), testerIds: new Set(), totals: zero(), categories: Object.create(null), systems: Object.create(null)};
        if (counted) {
            group.variants += 1; group.runIds.add(report.testRunId); group.testerIds.add(report.testerId);
            const count = Model.counts(report, activeCatalog); Model.STATUSES.forEach(status => { group.totals[status] += count[status]; });
        }
        const results = new Map(report.results.map(result => [result.testId, result]));
        const allIds = new Set([...activeCatalog.testIds, ...results.keys()]);
        for (const testId of allIds) {
            const result = results.get(testId) || Model.blank(testId);
            const definition = activeCatalog.tests.find(test => test.id === testId);
            const category = definition?.category || "UNKNOWN";
            const system = [env.deployment, env.device, env.os, env.browser, env.architecture || "unknown"].map(safe).join(" / ");
            if (counted) for (const [target, key] of [[group.categories, category], [group.systems, system]]) {
                if (!target[key]) target[key] = zero(); target[key][result.status] += 1;
            }
            observations.push({testId, runId: report.testRunId, testerId: safe(report.testerId), version: env.dashboardVersion,
                dataKind, counted, sourceHash, resultIndex: report.results.findIndex(item => item.testId === testId),
                homeAssistantVersion: safe(env.homeAssistantVersion || "unknown"), environment: system,
                catalogVersion: report.catalogVersion, catalogHash: report.catalogHash, catalogMatched: report.catalogHash === activeCatalog.catalogHash && report.catalogVersion === activeCatalog.catalogVersion,
                status: result.status, issueUrl: result.issueUrl || report.issueUrl,
                sprints: definition?.sprints || [], requirement: definition?.requirement || "unknown test",
                limitation: ["BLOCKED", "N/A"].includes(result.status) ? safe(result.notes) : "",
                repairs: definition?.repairs || [], triage: result.status === "FAIL" ? definition?.repairs.length ? "Review existing RQ mapping; no root cause inferred" : "Candidate new finding for human review" : ""});
        }
        if (counted) versions.set(versionKey, group);
    });
    const grouped = new Map();
    observations.forEach(obs => {
        // Catalogs and software versions never become equivalent implicitly.
        const key = JSON.stringify([obs.testId, obs.version, obs.catalogVersion, obs.catalogHash, obs.dataKind]);
        if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(obs);
    });
    const repeatedFailures = [], conflictingResults = [];
    grouped.forEach(items => {
        const failedRuns = new Set(items.filter(item => item.counted && item.status === "FAIL").map(item => item.runId));
        const failedTesters = new Set(items.filter(item => item.counted && item.status === "FAIL").map(item => item.testerId));
        const base = {testId: items[0].testId, version: items[0].version, catalogVersion: items[0].catalogVersion, catalogHash: items[0].catalogHash, dataKind: items[0].dataKind};
        if (failedRuns.size >= 2) repeatedFailures.push({...base, runCount: failedRuns.size, testerCount: failedTesters.size, runIds: [...failedRuns]});
        const counted = items.filter(item => item.counted && item.status !== "NOT_TESTED");
        if (new Set(counted.map(item => item.status)).size > 1) conflictingResults.push({...base, observations: counted.map(item => ({runId: item.runId, status: item.status, counted: true, sourceHash: item.sourceHash}))});
    });
    const failureGroups = new Map();
    observations.filter(obs => obs.counted && obs.status === "FAIL").forEach(obs => {
        const key = JSON.stringify([obs.testId, obs.version, obs.catalogVersion, obs.catalogHash, obs.dataKind, obs.homeAssistantVersion, obs.environment]);
        if (!failureGroups.has(key)) failureGroups.set(key, {testId: obs.testId, version: obs.version, catalogVersion: obs.catalogVersion, catalogHash: obs.catalogHash, dataKind: obs.dataKind, homeAssistantVersion: obs.homeAssistantVersion, environment: obs.environment, runIds: new Set(), testerIds: new Set(), issueUrls: new Set(), repairs: obs.repairs});
        const group = failureGroups.get(key); group.runIds.add(obs.runId); group.testerIds.add(obs.testerId); if (obs.issueUrl) group.issueUrls.add(obs.issueUrl);
    });
    const totals = zero(), perTest = [];
    observations.filter(obs => obs.counted).forEach(obs => { totals[obs.status] += 1; });
    grouped.forEach(items => {
        const counted = items.filter(item => item.counted), counts = zero();
        counted.forEach(item => { counts[item.status] += 1; });
        const first = items[0];
        perTest.push({testId: first.testId, version: first.version, catalogVersion: first.catalogVersion, catalogHash: first.catalogHash, dataKind: first.dataKind,
            counts, executed: counts.PASS + counts.FAIL, noCoverage: counts.PASS + counts.FAIL === 0,
            details: items.map(item => ({runId: item.runId, sourceHash: item.sourceHash, resultIndex: item.resultIndex, counted: item.counted}))});
    });
    const executedCurrent = new Set(observations.filter(obs => obs.counted && obs.catalogMatched && ["PASS", "FAIL"].includes(obs.status)).map(obs => obs.testId));
    return {schemaVersion: "1.1", sourceCatalog: {version: activeCatalog.catalogVersion, hash: activeCatalog.catalogHash},
        dataScope: options.includeSynthetic ? "SYNTHETIC_INCLUDED_NOT_REAL_ACCEPTANCE" : "NON_SYNTHETIC_ONLY", inventory, excludedReports,
        distinctRuns: byRun.size, distinctTesters: new Set(reports.map(entry => entry.report.testerId)).size,
        countedRuns: eligible.length, countedTesters: new Set(eligible.map(entry => entry.report.testerId)).size,
        reportVariants: reports.length, totals, runConflicts, repeatedFailures, conflictingResults,
        catalogs: [...new Map(reports.map(entry => [entry.report.catalogVersion + "/" + entry.report.catalogHash, {version: entry.report.catalogVersion, hash: entry.report.catalogHash}])).values()],
        perTest: perTest.sort((a, b) => (a.version + a.catalogHash + a.dataKind + a.testId).localeCompare(b.version + b.catalogHash + b.dataKind + b.testId)),
        uncoveredTestIds: activeCatalog.testIds.filter(id => !executedCurrent.has(id)),
        limitations: observations.filter(obs => obs.counted && ["BLOCKED", "N/A"].includes(obs.status)).map(obs => ({testId: obs.testId, runId: obs.runId, version: obs.version, status: obs.status, explanation: obs.limitation, sourceHash: obs.sourceHash, resultIndex: obs.resultIndex})),
        failureGroups: [...failureGroups.values()].map(group => ({...group, runIds: [...group.runIds], testerIds: [...group.testerIds], issueUrls: [...group.issueUrls]})),
        versions: [...versions.values()].map(group => ({...group, runIds: [...group.runIds], testerIds: [...group.testerIds].map(safe)})),
        observations, acceptance: "NOT APPROVED: review coverage, catalog mismatches, conflicts, required manual gates and open repairs. No queue item is closed automatically."};
}
function markdown(summary) {
    const lines = ["# Community test summary", "", summary.acceptance, "", "Data scope: " + summary.dataScope,
        "", "Input distinct runs: " + summary.distinctRuns + "; input aliases: " + summary.distinctTesters + "; variants: " + summary.reportVariants + ". Counted runs: " + summary.countedRuns + "; counted aliases: " + summary.countedTesters + ".",
        "", "Synthetic reports are excluded by default. Conflicting run variants are quarantined and never counted twice.", "", "## Input inventory", "", "| File | Valid | Duplicate | Version | Warnings |", "|---|---|---|---|---|"];
    summary.inventory.forEach(item => lines.push("| " + [item.file, item.valid, item.duplicate || false, item.version || "", (item.warnings || item.errors || []).join("; ")].map(md).join(" | ") + " |"));
    lines.push("", "## Software/catalog versions and provenance (kept separate)", "", "| Version | Catalog | Data kind | Runs | Testers | PASS | FAIL | BLOCKED | N/A | NOT_TESTED |", "|---|---|---|---|---|---|---|---|---|---|");
    summary.versions.forEach(group => lines.push("| " + [group.version, group.catalogVersion, group.dataKind, group.runIds.length, group.testerIds.length, group.totals.PASS, group.totals.FAIL, group.totals.BLOCKED, group.totals["N/A"], group.totals.NOT_TESTED].map(md).join(" | ") + " |"));
    lines.push("", "No pass percentage is asserted. Missing coverage and N/A are not PASS.", "", "## Repeated failures", "");
    summary.repeatedFailures.forEach(item => lines.push("- " + md(item.testId) + " / " + md(item.version) + ": " + item.runCount + " runs; " + item.testerCount + " aliases."));
    lines.push("", "## Conflicts", "");
    summary.runConflicts.forEach(item => lines.push("- Run ID " + md(item.runId) + ": " + item.variants.length + " conflicting variants; retain all originals."));
    summary.conflictingResults.forEach(item => lines.push("- " + md(item.testId) + " / " + md(item.version) + ": " + item.observations.map(obs => md(obs.runId) + " " + md(obs.status)).join("; ")));
    lines.push("", "## Failed observations for human triage", "", "| Test | Version | HA | Environment | Run | RQ candidates | Issue |", "|---|---|---|---|---|---|---|");
    summary.observations.filter(obs => obs.counted && obs.status === "FAIL").sort((a, b) => a.version.localeCompare(b.version) || a.testId.localeCompare(b.testId)).forEach(obs => lines.push("| " + [obs.testId, obs.version, obs.homeAssistantVersion, obs.environment, obs.runId, obs.repairs.join(", ") || "new finding candidate", obs.issueUrl].map(md).join(" | ") + " |"));
    lines.push("", "## No executed coverage in matched current catalog", "", summary.uncoveredTestIds.map(md).join(", "), "", "## BLOCKED / N/A limitations", "");
    summary.limitations.forEach(item => lines.push("- " + md(item.testId) + " / " + md(item.version) + " / " + md(item.status) + ": " + md(item.explanation)));
    lines.push("", "## Excluded reports", "");
    summary.excludedReports.forEach(item => lines.push("- " + md(item.runId) + ": " + item.reasons.map(md).join(", ")));
    lines.push("", "Per-Test counts, detail references, full category/device coverage and source hashes: summary.json. General notes are omitted; only bounded BLOCKED/N/A explanations are summarized. Raw reports and all exports remain private by default.", "");
    return lines.join("\n");
}
function matrix(summary) {
    const column = obs => obs.runId + " / " + obs.version + " / " + obs.catalogHash + " / " + obs.dataKind;
    const columns = [...new Set(summary.observations.map(column))];
    const ids = [...new Set(summary.observations.map(obs => obs.testId))].sort();
    return [["Test ID", ...columns].map(csv).join(","), ...ids.map(id => [id, ...columns.map(key => summary.observations.filter(obs => obs.testId === id && column(obs) === key).map(obs => (obs.counted ? "" : "EXCLUDED:") + obs.status).join(";"))].map(csv).join(","))].join("\n") + "\n";
}
function main() {
    const args = process.argv.slice(2), index = args.indexOf("--out");
    const output = path.resolve(index >= 0 ? args.splice(index, 2)[1] || "" : "test-results/summary");
    const includeSynthetic = args.includes("--include-synthetic");
    if (includeSynthetic) args.splice(args.indexOf("--include-synthetic"), 1);
    if (output === Catalog.ROOT || output === path.parse(output).root) throw new Error("Choose a dedicated output directory");
    const summary = aggregate(IO.inputs(args), catalog, {includeSynthetic});
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
