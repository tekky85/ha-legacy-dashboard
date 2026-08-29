const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Backgrounds =
    require("../src/services/dashboard-backgrounds");
const JpegSamples =
    require("./fixtures/jpeg-samples");


const ROOT = path.join(__dirname, "..");


function read(relativePath) {
    return fs.readFileSync(
        path.join(ROOT, relativePath),
        "utf8"
    );
}


function assertAcceptedJpeg(buffer) {

    assert.deepEqual(
        Backgrounds.inspectImage(
            buffer,
            "image/jpeg; charset=binary"
        ),
        {
            extension: "jpg",
            mimeType: "image/jpeg",
            width: 8,
            height: 8,
            size: buffer.length
        }
    );

}


test("reale Baseline- und Progressive-JPEGs mit Scandaten werden akzeptiert", function () {
    assert.ok(
        JpegSamples.baseline.indexOf(
            Buffer.from([0xff, 0x00])
        ) !== -1
    );
    assert.ok(
        JpegSamples.progressive.indexOf(
            Buffer.from([0xff, 0xc2])
        ) !== -1
    );

    assertAcceptedJpeg(JpegSamples.baseline);
    assertAcceptedJpeg(JpegSamples.progressive);
});


test("JFIF, EXIF-Orientation, EXIF-Thumbnail und ICC APP-Segmente bleiben gültig", function () {
    assert.ok(
        JpegSamples.baseline.indexOf(
            Buffer.from("JFIF\0", "binary")
        ) !== -1
    );
    assert.ok(
        JpegSamples.exifOrientation.indexOf(
            Buffer.from("Exif\0\0", "binary")
        ) !== -1
    );
    assert.ok(
        JpegSamples.exifThumbnail.indexOf(
            JpegSamples.baseline
        ) !== -1
    );
    assert.ok(
        JpegSamples.iccProfile.indexOf(
            Buffer.from("ICC_PROFILE\0", "binary")
        ) !== -1
    );

    assertAcceptedJpeg(JpegSamples.exifOrientation);
    assertAcceptedJpeg(JpegSamples.exifThumbnail);
    assertAcceptedJpeg(JpegSamples.iccProfile);
});


test("JPG und JPEG Dateiauswahl verwenden denselben geprüften MIME-Pfad", function () {
    const admin = read("src/admin/js/app.js");

    assert.match(
        admin,
        /accept = "image\/jpeg,image\/png,\.jpg,\.jpeg,\.png"/
    );
    assert.match(
        admin,
        /\["image\/jpeg", "image\/png"\]/
    );
    assert.equal(
        Backgrounds.inspectImage(
            JpegSamples.baseline,
            "image/jpeg"
        ).extension,
        "jpg"
    );
});


test("manipulierte, getarnte, unvollständige und übergroße JPEGs werden abgewiesen", function () {
    const truncated = JpegSamples.baseline.subarray(
        0,
        JpegSamples.baseline.length - 2
    );

    const malformedSegment = Buffer.from([
        0xff, 0xd8,
        0xff, 0xe1, 0xff, 0xff,
        0xff, 0xd9
    ]);

    [
        Buffer.from("<!doctype html><html></html>"),
        Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
        truncated,
        malformedSegment
    ].forEach(function (sample) {
        assert.throws(
            function () {
                Backgrounds.inspectImage(
                    sample,
                    "image/jpeg"
                );
            },
            function (error) {
                return error.code ===
                    "background_file_invalid";
            }
        );
    });

    assert.throws(
        function () {
            Backgrounds.inspectImage(
                Buffer.alloc(
                    Backgrounds.MAX_FILE_SIZE + 1,
                    0xff
                ),
                "image/jpeg"
            );
        },
        function (error) {
            return error.code ===
                "background_file_too_large";
        }
    );

    const oversizedDimensions = Buffer.from(
        JpegSamples.baseline
    );

    const frameOffset = oversizedDimensions.indexOf(
        Buffer.from([0xff, 0xc0])
    );

    assert.notEqual(frameOffset, -1);
    oversizedDimensions.writeUInt16BE(
        Backgrounds.MAX_DIMENSION + 1,
        frameOffset + 5
    );

    assert.throws(
        function () {
            Backgrounds.inspectImage(
                oversizedDimensions,
                "image/jpeg"
            );
        },
        function (error) {
            return error.code ===
                "background_dimensions_invalid";
        }
    );
});


test("fehlgeschlagene JPEG-Speicherung bewahrt Asset und hinterlässt keine Teildatei", function (t) {
    const dataDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-jpeg-hardening-")
    );

    const store = new Backgrounds.DashboardBackgroundStore({
        dataDirectory: dataDirectory
    });

    t.after(function () {
        fs.rmSync(dataDirectory, {
            recursive: true,
            force: true
        });
    });

    const existing = store.store(
        JpegSamples.baseline,
        "image/jpeg"
    );

    const before = fs.readdirSync(
        store.backgroundDirectory
    );

    assert.throws(function () {
        store.store(
            JpegSamples.progressive.subarray(
                0,
                JpegSamples.progressive.length - 2
            ),
            "image/jpeg"
        );
    });

    assert.deepEqual(
        fs.readdirSync(store.backgroundDirectory),
        before
    );
    assert.ok(store.resolve(existing.imageId));
    assert.equal(
        before.some(function (name) {
            return /\.tmp$/.test(name);
        }),
        false
    );
    assert.equal(
        store.resolve("../dashboards.json"),
        null
    );
});


test("App-Bind, Port und WebUI bleiben korrekt und ohne breite Netzwerkrechte", function () {
    const server = read("src/server.js");
    const run = read("ha_legacy_dashboard/run.sh");
    const config = read("ha_legacy_dashboard/config.yaml");

    assert.match(
        server,
        /process\.env\.BIND_ADDRESS \|\| "0\.0\.0\.0"/
    );
    assert.match(run, /export BIND_ADDRESS=0\.0\.0\.0/);
    assert.match(run, /export PORT=3000/);
    assert.match(config, /"3000\/tcp": 3000/);
    assert.match(
        config,
        /webui: http:\/\/\[HOST\]:\[PORT:3000\]\//
    );
    assert.match(config, /homeassistant_api: true/);
    assert.doesNotMatch(
        config + run,
        /full_access|docker_api|host_network|host_pid|privileged|hassio_role|network_mode/
    );
    assert.doesNotMatch(
        server + run + config,
        /homeassistant\.local/
    );
});


test("persistente Standalone-Hintergründe blockieren kein Git-Deployment", function () {
    const gitignore = read(".gitignore");

    assert.match(gitignore, /^data\/backgrounds\/$/m);
});


test("Sprint 25.5 erweitert weder Browser- noch Home-Assistant-Schreibfläche", function () {
    const backgrounds = read(
        "src/services/dashboard-backgrounds.js"
    );
    const routes = read("src/routes/api.js");

    assert.doesNotMatch(
        backgrounds,
        /HA_TOKEN|SUPERVISOR_TOKEN|callService|Authorization/
    );
    assert.match(
        routes,
        /const ALLOWED_CLIMATE_ENTITIES = \[[\s\S]*"climate\.esszimmer_thermostate"[\s\S]*\];/
    );
    assert.match(
        routes,
        /const ALLOWED_LIGHT_ENTITIES = \[[\s\S]*"light\.esszimmer_lampen"[\s\S]*\];/
    );
});
