const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Traceability = require("./fixtures/sprint-27-1-f-traceability");

const ROOT = path.join(__dirname, "..");


function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}


function numberedRequirements(definition) {
    const specification = read(definition.spec);
    const start = specification.indexOf(definition.start);
    const matches = Array.from(
        specification.slice(start).matchAll(/^(\d+)\.\s+(.+)$/gm)
    );
    const requirements = [];
    let expected = 1;

    assert.notEqual(start, -1, definition.spec);

    matches.some(function (match) {
        if (Number(match[1]) !== expected) {
            return false;
        }
        requirements.push({
            number: expected,
            description: match[2]
        });
        expected += 1;
        return expected > definition.total;
    });

    return requirements;
}


function manualSection(queue, manualId) {
    const start = queue.indexOf("## " + manualId + "\n");
    const rest = queue.slice(start);
    const next = rest.indexOf("\n## ", 1);

    assert.notEqual(start, -1, manualId);
    return next === -1 ? rest : rest.slice(0, next);
}


test("Sprint-27.1-F-Traceability ordnet alle 521 nummerierten Anforderungen lückenlos zu", function () {
    const allowedCoverage = ["direct", "equivalent", "manual", "n/a"];
    const manualQueue = read("docs/audits/MANUAL_TEST_QUEUE.md");
    let total = 0;

    Object.keys(Traceability).forEach(function (sprintId) {
        const definition = Traceability[sprintId];
        const requirements = numberedRequirements(definition);
        const byNumber = Object.create(null);

        assert.equal(requirements.length, definition.total, sprintId);
        requirements.forEach(function (requirement, index) {
            assert.equal(requirement.number, index + 1, sprintId);
        });

        definition.blocks.forEach(function (block) {
            assert.ok(allowedCoverage.indexOf(block.coverage) !== -1);
            assert.ok(block.from >= 1 && block.to <= definition.total);
            assert.ok(block.from <= block.to);
            assert.ok(block.evidence.length > 0);

            for (let number = block.from; number <= block.to; number += 1) {
                assert.equal(byNumber[number], undefined, sprintId + "-" + number);
                byNumber[number] = block.coverage;
            }

            if (block.coverage === "manual") {
                block.evidence.forEach(function (manualId) {
                    const section = manualSection(manualQueue, manualId);

                    assert.match(manualId, /^MT-\d+$/);
                    assert.match(section, /### Result\s+NOT TESTED/);
                });
                return;
            }

            block.evidence.forEach(function (item) {
                const content = read(item.file);
                if (item.contains) {
                    assert.ok(
                        content.indexOf(item.contains) !== -1,
                        item.file + " enthält Evidenzmarker nicht: " + item.contains
                    );
                }
            });
        });

        requirements.forEach(function (requirement) {
            assert.notEqual(
                byNumber[requirement.number],
                undefined,
                sprintId + "-" + requirement.number
            );
        });
        assert.equal(Object.keys(byNumber).length, definition.total);
        total += definition.total;
    });

    assert.equal(total, 521);
});


test("Batch-F-Evidenz bewahrt Legacy- und Security-Grenzen", function () {
    const wallJavaScript = [
        "src/public/js/app.js",
        "src/public/js/core/theme.js",
        "src/public/js/core/system-navigation.js",
        "src/public/js/system/common.js",
        "src/public/js/system/summary.js",
        "src/public/js/system/errors.js"
    ].map(read).join("\n");
    const wallCss = [
        read("src/public/css/style.css"),
        read("src/public/css/system.css")
    ].join("\n");
    const publicSources = wallJavaScript + "\n" + wallCss + "\n" +
        read("src/public/index.html") + "\n" + read("src/public/system.html");
    const systemRoutes = read("src/routes/system-dashboards.js");
    const apiRoutes = read("src/routes/api.js");

    assert.doesNotMatch(
        wallJavaScript,
        /\bconst\b|\blet\b|=>|\bfetch\b|\bPromise\b|\basync\b|\bawait\b|\?\.|\?\?/
    );
    assert.doesNotMatch(
        wallCss,
        /display:\s*grid|grid-template|\bgap\s*:|ResizeObserver|container-type|@container/
    );
    assert.doesNotMatch(
        publicSources,
        /HA_TOKEN|SUPERVISOR_TOKEN|ADMIN_TOKEN|Authorization:\s*Bearer/
    );
    assert.doesNotMatch(
        systemRoutes,
        /router\.(?:post|put|patch|delete)\s*\(/i
    );
    assert.doesNotMatch(apiRoutes, /window\.open|browser.*websocket/i);
    assert.match(apiRoutes, /\/climate\/temperature/);
    assert.match(apiRoutes, /\/light\/state/);
});
