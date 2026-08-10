const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const dashboardConfig =
    require("../src/config/dashboard");

const DashboardConfigStore =
    require("../src/services/dashboard-config-store");


function createTemporaryConfigPath(t) {

    const directory = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "ha-dashboard-config-test-"
        )
    );

    t.after(function () {
        fs.rmSync(
            directory,
            {
                recursive: true,
                force: true
            }
        );
    });

    return path.join(
        directory,
        "dashboards.json"
    );

}


function writeConfiguration(
    configPath,
    configuration
) {

    fs.writeFileSync(
        configPath,
        JSON.stringify(configuration, null, 2) + "\n",
        {
            encoding: "utf8",
            mode: 0o600
        }
    );

}


test("fehlende Persistenz wird aus Sprint 13 migriert", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    const result =
        dashboardConfig.initialize({
            configPath: configPath
        });


    assert.equal(result.migrated, true);
    assert.equal(result.recovered, false);
    assert.equal(fs.existsSync(configPath), true);

    const persisted = JSON.parse(
        fs.readFileSync(configPath, "utf8")
    );

    assert.equal(persisted.schemaVersion, 2);
    assert.equal(
        persisted.defaultDashboardId,
        "default"
    );
    assert.deepEqual(
        persisted.dashboards.map(function (dashboard) {
            return dashboard.id;
        }),
        ["default", "esszimmer"]
    );

    const widgetIds = [];

    persisted.dashboards.forEach(function (dashboard) {
        dashboard.widgets.forEach(function (widget) {
            assert.equal(typeof widget.id, "string");
            assert.equal(widget.size, "normal");
            assert.equal(
                widgetIds.indexOf(widget.id),
                -1
            );
            widgetIds.push(widget.id);
        });
    });

    assert.equal(
        fs.statSync(configPath).mode & 0o777,
        0o600
    );

});


test("Schema 1 wird ohne fachliche Änderungen auf Schema 2 migriert", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    const legacy =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    legacy.schemaVersion = 1;
    legacy.dashboards.forEach(function (dashboard) {
        dashboard.widgets.forEach(function (widget) {
            delete widget.size;
        });
    });

    const identities = legacy.dashboards.map(function (dashboard) {
        return {
            id: dashboard.id,
            widgets: dashboard.widgets.map(function (widget) {
                return {
                    id: widget.id,
                    entity: widget.entity,
                    order: widget.order,
                    visible: widget.visible
                };
            })
        };
    });

    writeConfiguration(configPath, legacy);

    const result = dashboardConfig.initialize({
        configPath: configPath
    });

    const persisted = JSON.parse(
        fs.readFileSync(configPath, "utf8")
    );

    assert.equal(result.migrated, true);
    assert.equal(result.recovered, false);
    assert.equal(persisted.schemaVersion, 2);
    assert.deepEqual(
        persisted.dashboards.map(function (dashboard) {
            return {
                id: dashboard.id,
                widgets: dashboard.widgets.map(function (widget) {
                    return {
                        id: widget.id,
                        entity: widget.entity,
                        order: widget.order,
                        visible: widget.visible
                    };
                })
            };
        }),
        identities
    );
    persisted.dashboards.forEach(function (dashboard) {
        dashboard.widgets.forEach(function (widget) {
            assert.equal(widget.size, "normal");
        });
    });
    assert.equal(fs.existsSync(configPath + ".bak"), true);
    const backup = JSON.parse(
        fs.readFileSync(configPath + ".bak", "utf8")
    );
    assert.equal(backup.schemaVersion, 1);
    assert.equal(
        Object.prototype.hasOwnProperty.call(
            backup.dashboards[0].widgets[0],
            "size"
        ),
        false
    );

});


test("nur bekannte Kachelgrößen werden akzeptiert", function () {

    [
        "compact",
        "normal",
        "wide",
        "tall",
        "large"
    ].forEach(function (size) {
        const candidate =
            dashboardConfig.cloneConfiguration(
                dashboardConfig.DEFAULT_CONFIGURATION
            );

        candidate.dashboards[0].widgets[0].size = size;
        assert.equal(
            dashboardConfig.validateConfiguration(candidate),
            true
        );
    });

    ["", "huge", "300px", "javascript:alert(1)"].forEach(function (size) {
        const candidate =
            dashboardConfig.cloneConfiguration(
                dashboardConfig.DEFAULT_CONFIGURATION
            );

        candidate.dashboards[0].widgets[0].size = size;
        assert.throws(
            function () {
                dashboardConfig.validateConfiguration(candidate);
            },
            function (error) {
                return error.code === "invalid_widget_size";
            }
        );
    });

});


test("gültige persistierte Konfiguration wird geladen", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    const persisted =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    persisted.dashboards[0].title =
        "Persistierte Übersicht";

    writeConfiguration(
        configPath,
        persisted
    );

    const result =
        dashboardConfig.initialize({
            configPath: configPath
        });


    assert.equal(result.migrated, false);
    assert.equal(result.recovered, false);
    assert.equal(
        dashboardConfig
            .getDefaultDashboard()
            .title,
        "Persistierte Übersicht"
    );

});


test("ungültiges JSON wird nicht überschrieben", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    const invalidContent =
        "{ungueltig";

    fs.writeFileSync(
        configPath,
        invalidContent,
        "utf8"
    );

    assert.throws(function () {
        dashboardConfig.initialize({
            configPath: configPath
        });
    }, SyntaxError);

    assert.equal(
        fs.readFileSync(configPath, "utf8"),
        invalidContent
    );
    assert.equal(
        fs.existsSync(configPath + ".bak"),
        false
    );

});


test("nicht unterstützte Schema-Version wird abgewiesen", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    const persisted =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    persisted.schemaVersion = 99;

    writeConfiguration(
        configPath,
        persisted
    );

    assert.throws(function () {
        dashboardConfig.initialize({
            configPath: configPath
        });
    }, /Schema-Version/);

    assert.equal(
        JSON.parse(
            fs.readFileSync(configPath, "utf8")
        ).schemaVersion,
        99
    );

});


test("doppelte Dashboard- und Widget-IDs werden abgewiesen", function () {

    const duplicateDashboard =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    duplicateDashboard.dashboards[1].id =
        duplicateDashboard.dashboards[0].id;

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            duplicateDashboard
        );
    }, /Dashboard-ID ist nicht eindeutig/);

    const duplicateWidget =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    duplicateWidget.dashboards[1].widgets[0].id =
        duplicateWidget.dashboards[0].widgets[0].id;

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            duplicateWidget
        );
    }, /Widget-ID ist nicht eindeutig/);

});


test("ungültige IDs, Entities und Standard-Dashboards werden abgewiesen", function () {

    const invalidDashboard =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    invalidDashboard.dashboards[0].id =
        "Nicht gültig";

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            invalidDashboard
        );
    }, /Dashboard-ID ist ungültig/);

    const invalidWidget =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    invalidWidget.dashboards[0].widgets[0].id =
        "Widget_1";

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            invalidWidget
        );
    }, /Widget-ID ist ungültig/);

    const invalidEntity =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    invalidEntity.dashboards[0].widgets[0].entity =
        "sensor/secret";

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            invalidEntity
        );
    }, /Widget-Entity ist ungültig/);

    const invalidDefault =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    invalidDefault.defaultDashboardId =
        "nicht-vorhanden";

    assert.throws(function () {
        dashboardConfig.validateConfiguration(
            invalidDefault
        );
    }, /Standard-Dashboard ist ungültig/);

});


test("atomare Speicherung behält genau eine gültige Vorgängerversion", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    dashboardConfig.initialize({
        configPath: configPath
    });

    const before =
        dashboardConfig.getConfiguration();

    const updated =
        dashboardConfig.getConfiguration();

    updated.dashboards[0].title =
        "Neue Übersicht";

    dashboardConfig.replaceConfiguration(
        updated
    );

    const primary = JSON.parse(
        fs.readFileSync(configPath, "utf8")
    );

    const backup = JSON.parse(
        fs.readFileSync(
            configPath + ".bak",
            "utf8"
        )
    );


    assert.equal(
        primary.dashboards[0].title,
        "Neue Übersicht"
    );
    assert.deepEqual(backup, before);

    const temporaryFiles =
        fs.readdirSync(
            path.dirname(configPath)
        ).filter(function (fileName) {
            return /\.tmp$/.test(fileName);
        });

    assert.deepEqual(temporaryFiles, []);

    const invalid =
        dashboardConfig.getConfiguration();

    invalid.dashboards[0].widgets[0].visible =
        "yes";

    const primaryBeforeFailure =
        fs.readFileSync(configPath, "utf8");

    const backupBeforeFailure =
        fs.readFileSync(
            configPath + ".bak",
            "utf8"
        );


    assert.throws(function () {
        dashboardConfig.replaceConfiguration(
            invalid
        );
    }, /Widget-Sichtbarkeit/);

    assert.equal(
        fs.readFileSync(configPath, "utf8"),
        primaryBeforeFailure
    );
    assert.equal(
        fs.readFileSync(
            configPath + ".bak",
            "utf8"
        ),
        backupBeforeFailure
    );

});


test("gültiges Backup stellt eine beschädigte Primärdatei wieder her", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    dashboardConfig.initialize({
        configPath: configPath
    });

    const valid =
        dashboardConfig.getConfiguration();

    writeConfiguration(
        configPath + ".bak",
        valid
    );

    fs.writeFileSync(
        configPath,
        "{defekt",
        "utf8"
    );

    const result =
        dashboardConfig.initialize({
            configPath: configPath
        });


    assert.equal(result.recovered, true);
    assert.deepEqual(
        JSON.parse(
            fs.readFileSync(configPath, "utf8")
        ),
        valid
    );
    assert.deepEqual(
        JSON.parse(
            fs.readFileSync(
                configPath + ".bak",
                "utf8"
            )
        ),
        valid
    );

});


test("Schreibfehler bewahrt die letzte gültige Primärdatei", function (t) {

    const configPath =
        createTemporaryConfigPath(t);

    const store =
        new DashboardConfigStore({
            configPath: configPath,
            defaultConfiguration:
                dashboardConfig.DEFAULT_CONFIGURATION,
            validate:
                dashboardConfig.validateConfiguration,
            clone:
                dashboardConfig.cloneConfiguration
        });

    store.load();

    const before =
        fs.readFileSync(configPath, "utf8");

    const candidate =
        dashboardConfig.cloneConfiguration(
            dashboardConfig.DEFAULT_CONFIGURATION
        );

    candidate.dashboards[0].title =
        "Darf nicht gespeichert werden";

    store.writeTemporaryFile = function () {
        throw new Error("simulierter Schreibfehler");
    };


    assert.throws(function () {
        store.save(candidate);
    }, /simulierter Schreibfehler/);

    assert.equal(
        fs.readFileSync(configPath, "utf8"),
        before
    );
    assert.equal(
        fs.existsSync(configPath + ".bak"),
        false
    );

});
