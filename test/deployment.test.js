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
        "deploy/rollback.sh",
        "deploy/prepare-home-assistant-app.sh",
        "release/test-gate.sh",
        "release/smoke-container.sh"
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

    assert.match(
        readProjectFile("deploy/deploy.sh"),
        /chmod 700 data/
    );

    assert.match(
        readProjectFile("deploy/deploy.sh"),
        /DASHBOARD_CONFIG_PATH=/
    );

    assert.match(
        readProjectFile(
            "deploy/systemd/ha-legacy-dashboard.service"
        ),
        /ReadWritePaths=\/home\/dashboard\/ha-legacy-dashboard\/data/
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
    assert.match(workflow, /\.\/release\/test-gate\.sh/);
    assert.doesNotMatch(workflow, /HA_TOKEN/);
    assert.doesNotMatch(workflow, /secrets\./);

});
