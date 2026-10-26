(function (root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.TestReports = factory();
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";
    const STATUSES = ["PASS", "FAIL", "BLOCKED", "NOT_TESTED", "N/A"];
    const MAX_BYTES = 2 * 1024 * 1024;
    const TEST_CENTER_VERSION = "27.4.1";
    const RUN = /^RUN-[A-Za-z0-9-]{8,80}$/;
    const HASH = /^[a-f0-9]{64}$/;
    const ISSUE = /^(?:#[1-9][0-9]{0,9}|https:\/\/github\.com\/tekky85\/ha-legacy-dashboard\/issues\/[1-9][0-9]{0,9})?$/;
    const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    function size(text) { return new TextEncoder().encode(text).length; }
    function record(value) { return value && typeof value === "object" && !Array.isArray(value); }
    function keys(value, allowed, name, errors) {
        if (!record(value)) { errors.push(name + " must be an object"); return false; }
        Object.keys(value).forEach(key => { if (!allowed.includes(key)) errors.push(name + ": unexpected field " + key); });
        return true;
    }
    function text(value, maximum, name, errors, required) {
        if (typeof value !== "string" || value.length > maximum || (required && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) errors.push(name + " must be " + (required ? "nonempty " : "") + "text (max " + maximum + ")");
    }
    function time(value) { return typeof value === "string" && ISO.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString() === value; }
    function unsafe(value, depth) {
        if (depth > 30) return true;
        if (value && typeof value === "object") return Object.keys(value).some(key => ["__proto__", "prototype", "constructor"].includes(key) || unsafe(value[key], depth + 1));
        return false;
    }
    function validate(report, catalog) {
        const errors = [], warnings = [];
        if (unsafe(report, 0)) return {valid: false, errors: ["Unsafe object key or nesting depth"], warnings};
        if (!keys(report, ["schemaVersion", "testRunId", "testerId", "createdAt", "updatedAt", "catalogVersion", "catalogHash", "environment", "notes", "issueUrl", "results", "exportedAt", "testCenterVersion", "dataKind"], "report", errors)) return {valid: false, errors, warnings};
        if (report.schemaVersion !== "1.0") errors.push("Unsupported schemaVersion; supported: 1.0. Export the original file and ask the coordinator for migration.");
        if (!RUN.test(report.testRunId || "")) errors.push("Invalid testRunId");
        text(report.testerId, 80, "testerId", errors, true);
        text(report.catalogVersion, 100, "catalogVersion", errors, true);
        if (!HASH.test(report.catalogHash || "")) errors.push("Invalid catalogHash");
        if (!time(report.createdAt) || !time(report.updatedAt) || report.updatedAt < report.createdAt) errors.push("Inconsistent UTC timestamps");
        if (Object.hasOwn(report, "exportedAt") && (!time(report.exportedAt) || report.exportedAt < report.updatedAt)) errors.push("exportedAt must be UTC and at or after updatedAt");
        if (Object.hasOwn(report, "testCenterVersion")) text(report.testCenterVersion, 80, "testCenterVersion", errors, true);
        if (Object.hasOwn(report, "dataKind") && !["manual", "synthetic"].includes(report.dataKind)) errors.push("Invalid dataKind");
        if (!Object.hasOwn(report, "exportedAt")) warnings.push("Legacy/draft report: export time is not recorded.");
        if (!Object.hasOwn(report, "dataKind")) warnings.push("Legacy report: provenance is unspecified; coordinator review required.");
        text(report.notes, 4000, "notes", errors);
        text(report.issueUrl, 150, "issueUrl", errors);
        if (!ISSUE.test(report.issueUrl || "")) errors.push("issueUrl must reference this repository's Issue URL or #number");
        const env = report.environment;
        if (keys(env, ["deployment", "dashboardVersion", "homeAssistantVersion", "architecture", "browser", "device", "os"], "environment", errors)) {
            if (!["ha-app", "standalone"].includes(env.deployment)) errors.push("Invalid deployment");
            ["dashboardVersion", "browser", "device", "os"].forEach(key => text(env[key], 160, "environment." + key, errors, true));
            ["homeAssistantVersion", "architecture"].forEach(key => text(env[key], 160, "environment." + key, errors));
            if (typeof env.dashboardVersion === "string" && !/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(env.dashboardVersion)) errors.push("dashboardVersion must be the installed version, e.g. 1.0.0-rc.7");
        }
        const known = new Set(catalog?.testIds || []);
        const mismatch = Boolean(catalog && (catalog.catalogHash !== report.catalogHash || catalog.catalogVersion !== report.catalogVersion));
        if (mismatch) warnings.push("Catalog mismatch: results belong to " + report.catalogVersion + "; not equivalent to the current catalog. Import read-only.");
        if (!Array.isArray(report.results) || report.results.length > 1000) errors.push("results must be an array with at most 1000 entries");
        else {
            const seen = new Set();
            report.results.forEach((result, index) => {
                const label = "results[" + index + "]";
                if (!keys(result, ["testId", "status", "testedAt", "expected", "actual", "reproductionSteps", "notes", "issueUrl", "evidence"], label, errors)) return;
                if (!/^MT-\d{2,4}$/.test(result.testId || "") || seen.has(result.testId)) errors.push(label + ": invalid or duplicate testId");
                seen.add(result.testId);
                if (catalog && !known.has(result.testId)) warnings.push("Unknown test ID: " + result.testId);
                if (!STATUSES.includes(result.status)) errors.push(label + ": invalid status");
                ["expected", "actual", "reproductionSteps", "notes", "evidence"].forEach(key => text(result[key], 4000, label + "." + key, errors));
                text(result.issueUrl, 150, label + ".issueUrl", errors);
                if (!ISSUE.test(result.issueUrl || "")) errors.push(label + ": invalid issueUrl");
                if (result.testedAt !== null && (!time(result.testedAt) || result.testedAt < report.createdAt || result.testedAt > report.updatedAt)) errors.push(label + ": inconsistent testedAt");
                if (result.status !== "NOT_TESTED" && !time(result.testedAt)) errors.push(label + ": testedAt required");
                if (["BLOCKED", "N/A"].includes(result.status) && !(result.notes || "").trim()) errors.push(label + ": explanation required");
                if (result.status === "FAIL" && ["expected", "actual", "reproductionSteps"].some(key => !(result[key] || "").trim())) errors.push(label + ": FAIL requires expected, actual and reproductionSteps");
            });
            if (catalog && catalog.testIds.some(id => !seen.has(id))) warnings.push("Incomplete submission: missing IDs remain NOT_TESTED; no PASS inferred.");
        }
        return {valid: errors.length === 0, errors, warnings, mismatch};
    }
    function parse(input, catalog) {
        if (typeof input !== "string" || size(input) > MAX_BYTES) throw new Error("Report exceeds 2 MiB");
        let report;
        try { report = JSON.parse(input); } catch (_) { throw new Error("Invalid JSON"); }
        const result = validate(report, catalog);
        if (!result.valid) throw new Error(result.errors.join("\n"));
        return {report, ...result};
    }
    function blank(testId) { return {testId, status: "NOT_TESTED", testedAt: null, expected: "", actual: "", reproductionSteps: "", notes: "", issueUrl: "", evidence: ""}; }
    function create(catalog, testerId, environment, id, now) {
        return {schemaVersion: "1.0", testCenterVersion: TEST_CENTER_VERSION, dataKind: "manual", testRunId: id, testerId, createdAt: now, updatedAt: now,
            catalogVersion: catalog.catalogVersion, catalogHash: catalog.catalogHash, environment: {...environment}, notes: "", issueUrl: "", results: catalog.testIds.map(blank)};
    }
    function counts(report, catalog) {
        const totals = Object.fromEntries(STATUSES.map(status => [status, 0]));
        const byId = new Map(report.results.map(result => [result.testId, result]));
        const ids = new Set([...(catalog?.testIds || []), ...byId.keys()]);
        ids.forEach(id => { totals[byId.get(id)?.status || "NOT_TESTED"] += 1; });
        return totals;
    }
    function prepareExport(report, now) {
        const result = JSON.parse(JSON.stringify(report));
        result.exportedAt = now;
        return result;
    }
    // Export time is transport metadata, not a new tester observation. Object
    // key order also must not turn an identical report into another observation.
    function observationJSON(report) {
        function sorted(value) {
            if (Array.isArray(value)) return value.map(sorted);
            if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])]));
            return value;
        }
        const copy = {...report}; delete copy.exportedAt;
        return JSON.stringify(sorted(copy));
    }
    function select(catalog, report, filters) {
        const status = new Map((report?.results || []).map(result => [result.testId, result.status]));
        return catalog.tests.filter(test => (!filters.testIds || filters.testIds.includes(test.id)) && (!filters.search || (test.id + " " + test.sourceTestId + " " + test.title).toLowerCase().includes(filters.search.toLowerCase())) &&
            (!filters.category || test.category === filters.category) && (!filters.sprint || test.sprints.includes(filters.sprint)) &&
            (!filters.deployment || test.deployments.includes(filters.deployment)) && (!filters.device || test.device === filters.device) &&
            (!filters.status || (status.get(test.id) || "NOT_TESTED") === filters.status) &&
            (!filters.readiness || test.readiness === filters.readiness || test.executionState === filters.readiness));
    }
    function summary(report, catalog) {
        const totals = counts(report, catalog);
        return [(report.dataKind === "synthetic" ? "SYNTHETIC TOOLING FIXTURE – NOT REAL ACCEPTANCE\n" : "") + "Manual Test Run " + report.testRunId, "Version: " + report.environment.dashboardVersion,
            "Test-Center: " + (report.testCenterVersion || "legacy/unknown") + "; exportedAt: " + (report.exportedAt || "not exported/unknown"),
            "Deployment: " + report.environment.deployment, "Catalog: " + report.catalogVersion + " / " + report.catalogHash,
            "PASS " + totals.PASS + "; FAIL " + totals.FAIL + "; BLOCKED " + totals.BLOCKED + "; NOT_TESTED " + totals.NOT_TESTED + "; N/A " + totals["N/A"],
            "Failed Test IDs: " + (report.results.filter(result => result.status === "FAIL").map(result => result.testId).join(", ") || "none"),
            "Manual observations only; incomplete coverage is not a passed RC gate."].join("\n");
    }
    return {STATUSES, MAX_BYTES, TEST_CENTER_VERSION, validate, parse, create, counts, select, summary, blank, prepareExport, observationJSON};
}));
