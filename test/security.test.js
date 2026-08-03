const assert = require("node:assert/strict");
const test = require("node:test");

const logger = require("../src/services/logger");


test("strukturierte Logs redigieren Secret-Felder", function () {

    const originalLog =
        console.log;

    const lines = [];


    console.log = function (line) {
        lines.push(line);
    };


    try {

        logger.info(
            "security_test",
            {
                entity_id: "light.example",
                home_assistant_token:
                    "must-not-appear"
            }
        );

    } finally {

        console.log =
            originalLog;

    }


    assert.equal(lines.length, 1);
    assert.equal(
        lines[0].indexOf("must-not-appear"),
        -1
    );

    const entry =
        JSON.parse(lines[0]);

    assert.equal(entry.level, "info");
    assert.equal(entry.event, "security_test");
    assert.equal(entry.entity_id, "light.example");
    assert.equal(
        entry.home_assistant_token,
        "[redacted]"
    );

});
