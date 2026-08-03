const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");


const PUBLIC_PATH = path.join(
    __dirname,
    "..",
    "src",
    "public"
);


function readPublicFile(fileName) {
    return fs.readFileSync(
        path.join(PUBLIC_PATH, fileName)
    );
}


function readPngSize(fileName) {

    const image = readPublicFile(fileName);

    assert.equal(
        image.subarray(0, 8).toString("hex"),
        "89504e470d0a1a0a"
    );

    return {
        width: image.readUInt32BE(16),
        height: image.readUInt32BE(20)
    };

}


test("iOS-Standalone-Metadaten sind vollständig", function () {

    const html = readPublicFile("index.html")
        .toString("utf8");

    assert.match(
        html,
        /name="apple-mobile-web-app-capable" content="yes"/
    );

    assert.match(
        html,
        /name="apple-mobile-web-app-status-bar-style" content="black"/
    );

    assert.match(
        html,
        /name="apple-mobile-web-app-title" content="HA Dashboard"/
    );

    assert.match(
        html,
        /rel="manifest" href="manifest\.json\?v=9"/
    );

    assert.match(
        html,
        /sizes="76x76"[\s\S]*app-icon-76\.png\?v=9/
    );

    assert.match(
        html,
        /sizes="152x152"[\s\S]*app-icon-152\.png\?v=9/
    );

    assert.doesNotMatch(html, /\?v=8/);

});


test("Manifest beschreibt eine Standalone-Web-App", function () {

    const manifest = JSON.parse(
        readPublicFile("manifest.json")
            .toString("utf8")
    );

    assert.equal(manifest.name, "HA Legacy Dashboard");
    assert.equal(manifest.short_name, "HA Dashboard");
    assert.equal(manifest.start_url, "./");
    assert.equal(manifest.scope, "./");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.orientation, "any");

    assert.deepEqual(
        manifest.icons.map(function (icon) {
            return icon.sizes;
        }),
        ["192x192", "512x512"]
    );

});


test("alle App-Icons sind gültige PNGs in der richtigen Größe", function () {

    [76, 120, 152, 180, 192, 512]
        .forEach(function (size) {

            const dimensions = readPngSize(
                path.join(
                    "icons",
                    "app-icon-" + size + ".png"
                )
            );

            assert.deepEqual(
                dimensions,
                {
                    width: size,
                    height: size
                }
            );

        });

});
