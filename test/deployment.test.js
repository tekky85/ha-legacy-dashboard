const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");


const PROJECT_PATH = path.join(
    __dirname,
    ".."
);


function readProjectFile(fileName) {

    return fs.readFileSync(
        path.join(PROJECT_PATH, fileName),
        "utf8"
    );

}


test("Deployment-Skripte sind ausführbar und nicht destruktiv", function () {

    const scripts = [
        "deploy/check.sh",
        "deploy/deploy.sh",
        "deploy/health-check.sh",
        "deploy/rollback.sh"
    ];


    scripts.forEach(function (fileName) {

        const filePath =
            path.join(PROJECT_PATH, fileName);

        const content =
            readProjectFile(fileName);


        assert.ok(
            fs.statSync(filePath).mode & 0o111,
            fileName + " ist nicht ausführbar"
        );

        assert.doesNotMatch(
            content,
            /git\s+reset\s+--hard/
        );

        assert.doesNotMatch(
            content,
            /git\s+push\s+--force/
        );

    });


    assert.match(
        readProjectFile("deploy/deploy.sh"),
        /git merge --ff-only origin\/main/
    );

    assert.match(
        readProjectFile("deploy/rollback.sh"),
        /git switch --detach/
    );

});


test("sudoers-Regel erlaubt nur den Dashboard-Neustart", function () {

    const sudoers =
        readProjectFile(
            "deploy/sudoers/ha-legacy-dashboard"
        ).trim();


    assert.equal(
        sudoers,
        "dashboard ALL=(root) NOPASSWD: " +
        "/usr/bin/systemctl restart " +
        "ha-legacy-dashboard.service"
    );

});


test("GitHub-CI verwendet keine produktiven Credentials", function () {

    const workflow =
        readProjectFile(
            ".github/workflows/test.yml"
        );


    assert.match(workflow, /npm ci/);
    assert.match(workflow, /npm test/);
    assert.doesNotMatch(workflow, /HA_TOKEN/);
    assert.doesNotMatch(workflow, /secrets\./);

});
