const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");


const ROOT = path.join(__dirname, "..");


function read(relativePath) {
    return fs.readFileSync(
        path.join(ROOT, relativePath),
        "utf8"
    );
}


function versions(source) {
    const result = [];
    const pattern = /(?:src|href)="[^"]+\?v=([0-9]+)"/g;
    let match;


    while ((match = pattern.exec(source)) !== null) {
        result.push(Number(match[1]));
    }


    return result;
}


function versionFor(source, assetPath) {
    const escapedPath = assetPath.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
    const match = new RegExp(
        escapedPath + "\\?v=([0-9]+)"
    ).exec(source);


    assert.ok(match, "Asset fehlt: " + assetPath);
    return Number(match[1]);
}


test("Dashboard, System, Admin und Manifest verwenden eine gemeinsame Assetversion", function () {
    const dashboard = read("src/public/index.html");
    const system = read("src/public/system.html");
    const admin = read("src/admin/index.html");
    const manifest = read("src/public/manifest.json");
    const allVersions = versions(dashboard)
        .concat(versions(system))
        .concat(versions(admin))
        .concat(versions(manifest));


    assert.ok(allVersions.length > 0);
    assert.ok(allVersions.every(function (value) {
        return value === allVersions[0];
    }));
    assert.ok(allVersions[0] > 51);

    [
        "/js/core/theme.js",
        "/css/style.css",
        "/js/core/compat.js",
        "/js/core/system-navigation.js"
    ].forEach(function (assetPath) {
        assert.equal(
            versionFor(dashboard, assetPath),
            versionFor(system, assetPath)
        );
    });

    [
        "/js/core/icons.js",
        "/js/core/presentation.js"
    ].forEach(function (assetPath) {
        assert.equal(
            versionFor(dashboard, assetPath),
            versionFor(admin, assetPath)
        );
    });
});
