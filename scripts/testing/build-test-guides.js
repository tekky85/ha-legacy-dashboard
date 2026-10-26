"use strict";
// Presentation helpers remain in the canonical queue, never a second test inventory.
const fs = require("node:fs");
const path = require("node:path");
const Builder = require("./build-test-catalog");
const OUTPUT = path.join(Builder.ROOT, "testing/data/test-guides.de.json");
function definitionHash(test) {
    return Builder.hash(JSON.stringify({metadata: test.metadata, steps: test.steps, expected: test.expected,
        failureCriteria: test.failureCriteria, evidence: test.evidence}));
}
function build(source, catalog) {
    const marker = "<!-- TEST-CENTER-GUIDES-DE -->";
    if (source.split(marker).length !== 2) throw new Error("Exactly one German guide appendix required");
    const block = /^\s*```json\s*\n([\s\S]*?)\n```\s*$/.exec(source.split(marker)[1]);
    if (!block) throw new Error("Invalid guide appendix");
    const data = JSON.parse(block[1]);
    if (data.schemaVersion !== "1.0" || !Array.isArray(data.guides) || data.guides.length < 1 || Object.keys(data).length !== 2) throw new Error("Invalid guide structure");
    const seen = new Set();
    const keys = ["testId", "title", "goal", "preparation", "steps", "expected", "failIf", "record", "definitionHash"];
    for (const guide of data.guides) {
        const test = catalog.tests.find(test => test.id === guide.testId);
        if (!test || seen.has(guide.testId)) throw new Error("Unknown/duplicate guide ID");
        seen.add(guide.testId);
        if (Object.keys(guide).length !== keys.length || Object.keys(guide).some(key => !keys.includes(key))) throw new Error("Invalid guide fields");
        for (const key of keys.filter(key => key !== "steps")) {
            if (typeof guide[key] !== "string" || !guide[key].trim() || guide[key].length > 4000) throw new Error("Invalid guide text");
        }
        if (!Array.isArray(guide.steps) || guide.steps.length !== test.steps.length || !guide.steps.every(step => typeof step === "string" && step.trim() && step.length <= 4000)) throw new Error("Guide steps must match complete original steps");
        if (guide.definitionHash !== definitionHash(test)) throw new Error("Guide needs semantic review: " + test.id);
    }
    return {schemaVersion: "1.0", catalogHash: catalog.catalogHash, guides: data.guides};
}
if (require.main === module) {
    try {
        const catalog = JSON.parse(fs.readFileSync(path.join(Builder.ROOT, "testing/data/test-catalog.json"), "utf8"));
        const data = build(Builder.sourceText(process.argv.includes("--working-tree")), catalog);
        const bytes = JSON.stringify(data, null, 2) + "\n";
        if (process.argv.includes("--check")) {
            if (fs.readFileSync(OUTPUT, "utf8") !== bytes) throw new Error("German guide drift: regenerate after semantic review");
        } else fs.writeFileSync(OUTPUT, bytes);
        console.log("German guides: " + data.guides.length + " explained existing tests; no new results or IDs");
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {build, definitionHash};
