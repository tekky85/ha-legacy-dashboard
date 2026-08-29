const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Backgrounds =
    require("../src/services/dashboard-backgrounds");
const DashboardConfig =
    require("../src/config/dashboard");
const Runtime = require("../src/config/runtime");
const JpegSamples = require("./fixtures/jpeg-samples");


const ROOT = path.join(__dirname, "..");

const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
);

const JPEG = JpegSamples.baseline;


function read(relativePath) {
    return fs.readFileSync(
        path.join(ROOT, relativePath),
        "utf8"
    );
}


function temporaryDirectory(t) {
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-background-test-")
    );

    t.after(function () {
        fs.rmSync(directory, {
            recursive: true,
            force: true
        });
    });

    return directory;
}


test("Bildprüfung akzeptiert ausschließlich stimmige JPEG- und PNG-Dateien", function () {
    assert.deepEqual(
        Backgrounds.inspectImage(PNG, "image/png"),
        {
            extension: "png",
            mimeType: "image/png",
            width: 1,
            height: 1,
            size: PNG.length
        }
    );
    assert.deepEqual(
        Backgrounds.inspectImage(JPEG, "image/jpeg"),
        {
            extension: "jpg",
            mimeType: "image/jpeg",
            width: 8,
            height: 8,
            size: JPEG.length
        }
    );

    assert.throws(
        function () {
            Backgrounds.inspectImage(
                Buffer.from("<svg></svg>"),
                "image/svg+xml"
            );
        },
        function (error) {
            return error.code ===
                "background_content_type_invalid";
        }
    );
    assert.throws(
        function () {
            Backgrounds.inspectImage(PNG, "image/jpeg");
        },
        function (error) {
            return error.code ===
                "background_file_invalid";
        }
    );
    assert.throws(
        function () {
            Backgrounds.inspectImage(
                Buffer.alloc(
                    Backgrounds.MAX_FILE_SIZE + 1
                ),
                "image/png"
            );
        },
        function (error) {
            return error.code ===
                "background_file_too_large";
        }
    );
});


test("Hintergrundspeicher schreibt atomar mit sicheren Namen und Rechten", function (t) {
    const dataDirectory = temporaryDirectory(t);
    const store = new Backgrounds.DashboardBackgroundStore({
        dataDirectory: dataDirectory
    });

    const stored = store.store(PNG, "image/png");
    assert.match(
        stored.imageId,
        /^bg-[a-f0-9]{32}\.png$/
    );

    const resolved = store.resolve(stored.imageId);
    assert.ok(resolved);
    assert.equal(
        path.dirname(resolved.filePath),
        path.join(dataDirectory, "backgrounds")
    );
    assert.equal(
        fs.statSync(resolved.filePath).mode & 0o777,
        0o600
    );
    assert.equal(
        fs.statSync(path.dirname(resolved.filePath)).mode & 0o777,
        0o700
    );
    assert.equal(
        fs.readdirSync(path.dirname(resolved.filePath))
            .some(function (name) {
                return /\.tmp$/.test(name);
            }),
        false
    );

    assert.equal(store.resolve("../dashboards.json"), null);
    assert.equal(store.resolve("bg-not-an-id.png"), null);
    assert.equal(store.remove(stored.imageId), true);
    assert.equal(store.resolve(stored.imageId), null);
    assert.equal(store.remove(stored.imageId), false);
});


test("Schema 8 migriert verlustfrei auf die Dashboard-Darstellung von Schema 9", function () {
    const previous = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );

    previous.schemaVersion = 8;
    previous.dashboards.forEach(function (dashboard) {
        delete dashboard.showTitle;
        delete dashboard.background;
    });

    const migrated = DashboardConfig.migrateConfiguration(previous);
    assert.equal(migrated.migrated, true);
    assert.equal(migrated.configuration.schemaVersion, 9);
    migrated.configuration.dashboards.forEach(function (dashboard) {
        assert.equal(dashboard.showTitle, true);
        assert.equal(dashboard.background, null);
    });
    assert.equal(
        DashboardConfig.validateConfiguration(
            migrated.configuration
        ),
        true
    );
});


test("Dashboard-Hintergründe und optionale Titel werden vollständig validiert", function () {
    const valid = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );

    valid.dashboards[0].showTitle = false;
    valid.dashboards[0].background = {
        imageId: "bg-0123456789abcdef0123456789abcdef.jpg",
        position: "center bottom",
        size: "contain",
        overlay: 30
    };
    assert.equal(DashboardConfig.validateConfiguration(valid), true);

    [
        ["showTitle", "yes"],
        ["position", "10px 20px"],
        ["size", "auto"],
        ["overlay", 25],
        ["imageId", "../../secret.jpg"]
    ].forEach(function (entry) {
        const invalid = DashboardConfig.cloneConfiguration(valid);

        if (entry[0] === "showTitle") {
            invalid.dashboards[0].showTitle = entry[1];
        } else {
            invalid.dashboards[0].background[entry[0]] = entry[1];
        }

        assert.throws(function () {
            DashboardConfig.validateConfiguration(invalid);
        });
    });
});


test("Öffentliche Konfiguration trennt Dashboard-Hintergründe und interne Asset-ID", function (t) {
    const dataDirectory = temporaryDirectory(t);
    const previousConfigPath =
        process.env.DASHBOARD_CONFIG_PATH;

    process.env.DASHBOARD_CONFIG_PATH = path.join(
        dataDirectory,
        "dashboards.json"
    );

    t.after(function () {
        if (typeof previousConfigPath === "undefined") {
            delete process.env.DASHBOARD_CONFIG_PATH;
        } else {
            process.env.DASHBOARD_CONFIG_PATH =
                previousConfigPath;
        }
    });

    DashboardConfig.initialize();

    const candidate = DashboardConfig.cloneConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );

    candidate.dashboards[0].showTitle = false;
    candidate.dashboards[0].background = {
        imageId: "bg-0123456789abcdef0123456789abcdef.png",
        position: "right center",
        size: "cover",
        overlay: 20
    };
    candidate.dashboards[1].showTitle = true;
    candidate.dashboards[1].background = null;

    DashboardConfig.replaceConfiguration(candidate);

    const first = DashboardConfig.getPublicDashboardConfig("default");
    const second = DashboardConfig.getPublicDashboardConfig("esszimmer");

    assert.equal(first.show_title, false);
    assert.equal(
        first.background.image_url,
        "/assets/backgrounds/bg-0123456789abcdef0123456789abcdef.png"
    );
    assert.equal(
        Object.prototype.hasOwnProperty.call(
            first.background,
            "imageId"
        ),
        false
    );
    assert.equal(second.show_title, true);
    assert.equal(second.background, null);

    DashboardConfig.replaceConfiguration(
        DashboardConfig.DEFAULT_CONFIGURATION
    );
});


test("DATA_DIR und Home-Assistant-App-Modus bestimmen ausschließlich die Assetablage", function () {
    assert.equal(
        Runtime.resolveDataDirectory({
            DATA_DIR: "/tmp/custom-dashboard-data",
            HA_RUNTIME_MODE: "standalone"
        }),
        "/tmp/custom-dashboard-data"
    );
    assert.equal(
        Runtime.resolveDataDirectory({
            HA_RUNTIME_MODE: "home_assistant_app"
        }),
        "/data"
    );
});


test("Wall-Display nutzt ES5-Flexbox, Vollhöhe und optionale Titel ohne Systemnavigation zu entfernen", function () {
    const html = read("src/public/index.html");
    const css = read("src/public/css/style.css");
    const app = read("src/public/js/app.js");

    assert.match(html, /id="dashboardBackgroundOverlay"/);
    assert.match(html, /id="systemSummaryLink"/);
    assert.match(html, /id="systemHealthLink"/);
    assert.match(html, /<footer id="updated"/);
    assert.doesNotMatch(html, /HA Legacy Dashboard v1\.0\.0<\/footer>/);
    assert.match(html, /\/js\/app\.js\?v=45/);

    assert.match(css, /\.app\s*\{[\s\S]*display: -webkit-flex;[\s\S]*-webkit-flex-direction: column;/);
    assert.match(css, /\.grid\s*\{[\s\S]*-webkit-flex: 1 0 auto;/);
    assert.match(css, /\.app-header\.is-title-hidden \.brand/);
    assert.match(css, /\.dashboard-background-overlay/);
    assert.doesNotMatch(css, /\.dashboard-footer\s*\{[\s\S]*position:\s*fixed/);

    assert.match(app, /function applyDashboardAppearance/);
    assert.match(app, /function applyDashboardViewportHeight/);
    assert.match(app, /data\.show_title === false/);
    assert.doesNotMatch(app, /\b(?:let|const|class)\s+[A-Za-z_$]/);
    assert.doesNotMatch(app, /=>|\bfetch\s*\(|\bPromise\b/);
});


test("Admin-Oberfläche bietet Upload, Vorschau, Ersetzen, Entfernen und Batch-Einstellungen", function () {
    const api = read("src/admin/js/api.js");
    const app = read("src/admin/js/app.js");
    const html = read("src/admin/index.html");

    assert.match(api, /uploadBackground/);
    assert.match(api, /removeBackground/);
    assert.match(api, /rawBody: file/);
    assert.match(app, /image\/jpeg/);
    assert.match(app, /image\/png/);
    assert.match(app, /dashboard-background-position/);
    assert.match(app, /dashboard-background-size/);
    assert.match(app, /dashboard-background-overlay/);
    assert.match(app, /dashboard-show-title/);
    assert.match(app, /background-image-preview/);
    assert.match(
        app,
        /button\.dataset\.action === "background-upload"[\s\S]*button\.disabled = false;/
    );
    assert.match(html, /Version 1\.0\.0-rc\.1/);
});


test("Hintergrundfunktion erweitert keine Home-Assistant-Schreibrechte", function () {
    const routes = read("src/routes/api.js");

    assert.match(
        routes,
        /const ALLOWED_CLIMATE_ENTITIES = \[[\s\S]*"climate\.esszimmer_thermostate"[\s\S]*\];/
    );
    assert.match(
        routes,
        /const ALLOWED_LIGHT_ENTITIES = \[[\s\S]*"light\.esszimmer_lampen"[\s\S]*\];/
    );
    assert.doesNotMatch(
        read("src/services/dashboard-backgrounds.js"),
        /HA_TOKEN|SUPERVISOR_TOKEN|callService/
    );
});
