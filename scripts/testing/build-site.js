"use strict";
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const ROOT = path.resolve(__dirname, "../..");
const FILES = ["index.html", "help.html", "css/testing.css", "js/report.js", "js/pilot.js", "js/wording.js", "js/portal.js", "data/test-catalog.json", "data/test-guides.de.json"];
const GUIDES = ["TESTER_GUIDE.de.md", "TESTER_GUIDE.en.md", "TEST_COORDINATOR.md", "DATA_FORMAT.md", "PRIVACY_AND_SECURITY.md", "PILOT_PLAN.de.md", "PILOT_STATUS.md"];
const SCHEMAS = ["test-catalog.schema.json", "test-report.schema.json"];
function build(output) {
    const target = path.resolve(output);
    if (target === ROOT || !target.startsWith(path.join(ROOT, "dist") + path.sep)) throw new Error("Build output must be a dedicated directory inside dist/");
    if (fs.existsSync(target)) throw new Error("Output already exists; use a new empty build directory");
    cp.execFileSync(process.execPath, [path.join(__dirname, "build-test-catalog.js"), "--check"], {stdio: "inherit"});
    cp.execFileSync(process.execPath, [path.join(__dirname, "build-test-guides.js"), "--check"], {stdio: "inherit"});
    for (const file of FILES) {
        const destination = path.join(target, "testing", file);
        fs.mkdirSync(path.dirname(destination), {recursive: true});
        fs.copyFileSync(path.join(ROOT, "testing", file), destination);
    }
    for (const file of GUIDES) {
        const destination = path.join(target, "testing/guides", file);
        fs.mkdirSync(path.dirname(destination), {recursive: true});
        fs.copyFileSync(path.join(ROOT, "docs/testing", file), destination);
    }
    for (const file of SCHEMAS) {
        const destination = path.join(target, "testing/schemas", file);
        fs.mkdirSync(path.dirname(destination), {recursive: true});
        fs.copyFileSync(path.join(ROOT, "schemas", file), destination);
    }
    fs.writeFileSync(path.join(target, ".nojekyll"), "");
    console.log("Static Pages artifact: " + target + "/testing/ (explicit allowlist only)");
    return target;
}
if (require.main === module) { try { build(process.argv[2] || path.join(ROOT, "dist/community-site")); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = {build, FILES, GUIDES, SCHEMAS};
