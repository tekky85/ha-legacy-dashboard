const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");


const RATE_LIMIT_PATH = path.join(
    __dirname,
    "..",
    "src",
    "services",
    "write-rate-limit.js"
);


test("Rate-Limit-Modul ist mit frischem Zustand isoliert ausführbar", function () {

    delete require.cache[
        require.resolve(RATE_LIMIT_PATH)
    ];

    const limiter =
        require(RATE_LIMIT_PATH);

    let result;
    let index;


    for (index = 0; index < 10; index += 1) {

        result = limiter.consume(
            "light:test-entity"
        );

        assert.equal(result.allowed, true);
        assert.equal(result.remaining, 9 - index);

    }


    result = limiter.consume(
        "light:test-entity"
    );

    assert.equal(result.allowed, false);
    assert.equal(result.limit, 10);
    assert.ok(result.retryAfterSeconds >= 1);

});
