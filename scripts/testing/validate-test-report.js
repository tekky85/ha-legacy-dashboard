"use strict";
const fs = require("node:fs");
const path = require("node:path");
const Model = require("../../testing/js/report");
const catalog = require("../../testing/data/test-catalog.json");

function read(file) {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > Model.MAX_BYTES) throw new Error("Regular .json file up to 2 MiB required");
    if (path.extname(file).toLowerCase() !== ".json") throw new Error("Only .json reports supported");
    return fs.readFileSync(file, "utf8");
}
function inputs(args) {
    if (!args.length) throw new Error("Usage: node scripts/testing/validate-test-report.js <directory|report.json> [...]");
    const files = [];
    for (const value of args) {
        const full = path.resolve(value), stat = fs.lstatSync(full);
        if (stat.isSymbolicLink()) throw new Error("Symbolic links are not report inputs");
        if (stat.isDirectory()) fs.readdirSync(full).sort().filter(name => name.endsWith(".json")).forEach(name => files.push(path.join(full, name)));
        else files.push(full);
    }
    if (!files.length || files.length > 500) throw new Error("Provide between 1 and 500 reports");
    return files;
}
function main() {
    let invalid = 0;
    for (const file of inputs(process.argv.slice(2))) {
        try {
            const result = Model.parse(read(file), catalog);
            console.log(JSON.stringify({file: path.basename(file), valid: true, testRunId: result.report.testRunId, warnings: result.warnings}));
        } catch (error) { invalid += 1; console.log(JSON.stringify({file: path.basename(file), valid: false, errors: error.message})); }
    }
    if (invalid) process.exitCode = 1;
}
if (require.main === module) { try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = {read, inputs};
