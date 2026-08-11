/*
 * Versioned dashboard configuration.
 *
 * Dashboard visibility controls display and read access only. Writable
 * entities remain separately allowlisted in src/routes/api.js.
 */

const path = require("path");

const DashboardConfigStore =
    require("../services/dashboard-config-store");

const Layout =
    require("../services/layout");


const SCHEMA_VERSION = 3;
const SIZE_SCHEMA_VERSION = 2;
const LEGACY_SCHEMA_VERSION = 1;

const DASHBOARD_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{0,62}$/;

const WIDGET_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{0,62}$/;

const ENTITY_ID_PATTERN =
    /^[a-z0-9_]+\.[a-z0-9_]+$/;

const SUPPORTED_WIDGET_TYPES = [
    "sensor",
    "binary",
    "light",
    "climate"
];

const SUPPORTED_WIDGET_SIZES = [
    "compact",
    "normal",
    "wide",
    "tall",
    "large"
];

const DEFAULT_WIDGET_SIZE = "normal";

const DEFAULT_REFRESH_INTERVAL_MS = 5000;
const MINIMUM_REFRESH_INTERVAL_MS = 3000;
const MAXIMUM_REFRESH_INTERVAL_MS = 300000;


const DEFAULT_CONFIGURATION = {
    schemaVersion: SCHEMA_VERSION,
    defaultDashboardId: "default",
    dashboards: [
        {
            id: "default",
            title: "Übersicht",
            refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
            widgets: [
                {
                    id: "default-bathroom-temperature",
                    entity: "sensor.badezimmer_smart_indoor_module_temperatur",
                    type: "sensor",
                    title: "Badezimmer",
                    subtitle: "Temperatur",
                    icon: "temperature",
                    iconClass: "temperature",
                    unit: "",
                    order: 10,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                },
                {
                    id: "default-bathroom-humidity",
                    entity: "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit",
                    type: "sensor",
                    title: "Badezimmer",
                    subtitle: "Luftfeuchtigkeit",
                    icon: "humidity",
                    iconClass: "humidity",
                    unit: "",
                    order: 20,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                },
                {
                    id: "default-kitchen-window-right",
                    entity: "binary_sensor.kuche_fenster_rechts",
                    type: "binary",
                    title: "Küche",
                    subtitle: "Fenster rechts",
                    icon: "window",
                    iconClass: "window",
                    unit: "",
                    order: 30,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                },
                {
                    id: "default-kitchen-window-center",
                    entity: "binary_sensor.kuche_fenster_mitte",
                    type: "binary",
                    title: "Küche",
                    subtitle: "Fenster Mitte",
                    icon: "window",
                    iconClass: "window",
                    unit: "",
                    order: 35,
                    visible: false,
                    size: DEFAULT_WIDGET_SIZE
                },
                {
                    id: "default-dining-light",
                    entity: "light.esszimmer_lampen",
                    type: "light",
                    title: "Esszimmer",
                    subtitle: "Licht",
                    icon: "light",
                    iconClass: "light",
                    unit: "",
                    order: 40,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                },
                {
                    id: "default-dining-climate",
                    entity: "climate.esszimmer_thermostate",
                    type: "climate",
                    title: "Esszimmer",
                    subtitle: "Thermostate",
                    icon: "heating",
                    iconClass: "heating",
                    unit: "°C",
                    order: 50,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                }
            ]
        },
        {
            id: "esszimmer",
            title: "Esszimmer",
            refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
            widgets: [
                {
                    id: "dining-room-light",
                    entity: "light.esszimmer_lampen",
                    type: "light",
                    title: "Esszimmer",
                    subtitle: "Licht",
                    icon: "light",
                    iconClass: "light",
                    unit: "",
                    order: 40,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                },
                {
                    id: "dining-room-climate",
                    entity: "climate.esszimmer_thermostate",
                    type: "climate",
                    title: "Esszimmer",
                    subtitle: "Thermostate",
                    icon: "heating",
                    iconClass: "heating",
                    unit: "°C",
                    order: 50,
                    visible: true,
                    size: DEFAULT_WIDGET_SIZE
                }
            ]
        }
    ]
};


DEFAULT_CONFIGURATION.dashboards.forEach(function (dashboard) {
    dashboard.layouts =
        Layout.createLayouts(dashboard.widgets);
});


let configuration = null;
let configurationStore = null;


function validateText(value, fieldName) {

    if (
        typeof value !== "string" ||
        value.trim() === ""
    ) {
        throw new Error(fieldName + " fehlt");
    }

}


function validateConfigurationVersion(candidate, schemaVersion) {

    const dashboards =
        candidate && candidate.dashboards;

    const dashboardIds = Object.create(null);
    const widgetIds = Object.create(null);


    if (
        !candidate ||
        candidate.schemaVersion !== schemaVersion
    ) {
        throw new Error("Schema-Version wird nicht unterstützt");
    }

    if (!Array.isArray(dashboards) || dashboards.length === 0) {
        throw new Error("Mindestens ein Dashboard ist erforderlich");
    }


    dashboards.forEach(function (dashboard) {

        if (
            !dashboard ||
            typeof dashboard.id !== "string" ||
            !DASHBOARD_ID_PATTERN.test(dashboard.id)
        ) {
            throw new Error("Dashboard-ID ist ungültig");
        }

        if (dashboardIds[dashboard.id]) {
            throw new Error(
                "Dashboard-ID ist nicht eindeutig: " +
                dashboard.id
            );
        }

        dashboardIds[dashboard.id] = true;

        validateText(
            dashboard.title,
            "Dashboard-Titel"
        );

        if (
            typeof dashboard.refreshIntervalMs !== "number" ||
            !Number.isFinite(dashboard.refreshIntervalMs) ||
            dashboard.refreshIntervalMs < MINIMUM_REFRESH_INTERVAL_MS ||
            dashboard.refreshIntervalMs > MAXIMUM_REFRESH_INTERVAL_MS
        ) {
            throw new Error(
                "Dashboard-Refresh-Intervall ist ungültig: " +
                dashboard.id
            );
        }

        if (!Array.isArray(dashboard.widgets)) {
            throw new Error(
                "Dashboard-Widgets sind ungültig: " +
                dashboard.id
            );
        }


        dashboard.widgets.forEach(function (widget) {

            if (
                !widget ||
                typeof widget.id !== "string" ||
                !WIDGET_ID_PATTERN.test(widget.id)
            ) {
                throw new Error("Widget-ID ist ungültig");
            }

            if (widgetIds[widget.id]) {
                throw new Error(
                    "Widget-ID ist nicht eindeutig: " +
                    widget.id
                );
            }

            widgetIds[widget.id] = true;

            if (
                typeof widget.entity !== "string" ||
                !ENTITY_ID_PATTERN.test(widget.entity)
            ) {
                throw new Error(
                    "Widget-Entity ist ungültig: " +
                    widget.id
                );
            }

            if (
                typeof widget.type !== "string" ||
                SUPPORTED_WIDGET_TYPES.indexOf(widget.type) === -1
            ) {
                throw new Error(
                    "Widget-Typ ist ungültig: " +
                    widget.id
                );
            }

            validateText(widget.title, "Widget-Titel");

            [
                "subtitle",
                "icon",
                "iconClass",
                "unit"
            ].forEach(function (fieldName) {
                if (typeof widget[fieldName] !== "string") {
                    throw new Error(
                        "Widget-Feld ist ungültig: " +
                        fieldName
                    );
                }
            });

            if (
                typeof widget.order !== "number" ||
                !Number.isFinite(widget.order)
            ) {
                throw new Error(
                    "Widget-Reihenfolge ist ungültig: " +
                    widget.id
                );
            }

            if (typeof widget.visible !== "boolean") {
                throw new Error(
                    "Widget-Sichtbarkeit ist ungültig: " +
                    widget.id
                );
            }

            if (
                schemaVersion >= SIZE_SCHEMA_VERSION &&
                (
                    typeof widget.size !== "string" ||
                    SUPPORTED_WIDGET_SIZES.indexOf(
                        widget.size
                    ) === -1
                )
            ) {
                const error = new Error(
                    "Widget-Größe ist ungültig: " +
                    widget.id
                );

                error.code = "invalid_widget_size";
                throw error;
            }

        });


        if (schemaVersion >= SCHEMA_VERSION) {
            Layout.validateLayouts(dashboard);
        }

    });


    if (
        typeof candidate.defaultDashboardId !== "string" ||
        !dashboardIds[candidate.defaultDashboardId]
    ) {
        throw new Error("Standard-Dashboard ist ungültig");
    }


    return true;

}


function validateConfiguration(candidate) {

    return validateConfigurationVersion(
        candidate,
        SCHEMA_VERSION
    );

}


function cloneWidget(widget) {

    return {
        id: widget.id,
        entity: widget.entity,
        type: widget.type,
        title: widget.title,
        subtitle: widget.subtitle,
        icon: widget.icon,
        iconClass: widget.iconClass,
        unit: widget.unit,
        order: widget.order,
        visible: widget.visible,
        size:
            typeof widget.size === "string"
                ? widget.size
                : DEFAULT_WIDGET_SIZE
    };

}


function migrateConfiguration(candidate) {

    if (
        !candidate ||
        (
            candidate.schemaVersion !== LEGACY_SCHEMA_VERSION &&
            candidate.schemaVersion !== SIZE_SCHEMA_VERSION
        )
    ) {
        return {
            configuration: candidate,
            migrated: false
        };
    }


    validateConfigurationVersion(
        candidate,
        candidate.schemaVersion
    );

    const migrated =
        cloneConfiguration(candidate);

    migrated.schemaVersion = SCHEMA_VERSION;

    migrated.dashboards.forEach(function (dashboard) {
        dashboard.layouts =
            Layout.createLayouts(dashboard.widgets);
    });


    return {
        configuration: migrated,
        migrated: true
    };

}


function cloneDashboard(dashboard) {

    if (!dashboard) {
        return null;
    }

    return {
        id: dashboard.id,
        title: dashboard.title,
        refreshIntervalMs: dashboard.refreshIntervalMs,
        widgets: dashboard.widgets.map(cloneWidget),
        layouts:
            dashboard.layouts
                ? Layout.cloneLayouts(dashboard.layouts)
                : undefined
    };

}


function cloneConfiguration(candidate) {

    return {
        schemaVersion: candidate.schemaVersion,
        defaultDashboardId: candidate.defaultDashboardId,
        dashboards: candidate.dashboards.map(cloneDashboard)
    };

}


function getDefaultConfigPath() {

    return path.join(
        __dirname,
        "..",
        "..",
        "data",
        "dashboards.json"
    );

}


function initialize(options) {

    const configPath = path.resolve(
        options && options.configPath
            ? options.configPath
            : process.env.DASHBOARD_CONFIG_PATH ||
                getDefaultConfigPath()
    );


    configurationStore =
        new DashboardConfigStore({
            configPath: configPath,
            defaultConfiguration:
                DEFAULT_CONFIGURATION,
            validate: validateConfiguration,
            clone: cloneConfiguration,
            migrate: migrateConfiguration
        });

    const result =
        configurationStore.load();

    configuration =
        cloneConfiguration(
            result.configuration
        );

    return {
        migrated: result.migrated,
        recovered: result.recovered
    };

}


function ensureConfiguration() {

    if (!configuration) {
        configuration =
            cloneConfiguration(
                DEFAULT_CONFIGURATION
            );
    }

    return configuration;

}


function replaceConfiguration(candidate) {

    validateConfiguration(candidate);

    if (!configurationStore) {
        throw new Error(
            "Dashboard-Persistenz ist nicht initialisiert"
        );
    }

    const persisted =
        configurationStore.save(candidate);

    configuration =
        cloneConfiguration(persisted);

    return getConfiguration();

}


function getConfiguration() {

    return cloneConfiguration(
        ensureConfiguration()
    );

}


function findDashboard(dashboardId) {

    const dashboards =
        ensureConfiguration().dashboards;

    let index;


    for (index = 0; index < dashboards.length; index++) {
        if (dashboards[index].id === dashboardId) {
            return dashboards[index];
        }
    }

    return null;

}


function resolveDashboard(dashboardId) {

    if (typeof dashboardId === "undefined") {
        return findDashboard(
            ensureConfiguration()
                .defaultDashboardId
        );
    }

    return findDashboard(dashboardId);

}


function getDashboards() {

    return ensureConfiguration()
        .dashboards
        .map(cloneDashboard);

}


function getPublicDashboards() {

    return ensureConfiguration()
        .dashboards
        .map(function (dashboard) {
            return {
                id: dashboard.id,
                title: dashboard.title
            };
        });

}


function getDefaultDashboard() {

    return cloneDashboard(
        findDashboard(
            ensureConfiguration()
                .defaultDashboardId
        )
    );

}


function getDashboardById(dashboardId) {

    return cloneDashboard(
        findDashboard(dashboardId)
    );

}


function getVisibleWidgets(dashboardId) {

    const dashboard =
        resolveDashboard(dashboardId);


    if (!dashboard) {
        return [];
    }

    return dashboard.widgets
        .filter(function (widget) {
            return widget.visible;
        })
        .map(cloneWidget)
        .sort(function (first, second) {
            return first.order - second.order;
        });

}


function getVisibleEntityIds(dashboardId) {

    const entityIds = [];


    getVisibleWidgets(dashboardId)
        .forEach(function (widget) {
            if (entityIds.indexOf(widget.entity) === -1) {
                entityIds.push(widget.entity);
            }
        });

    return entityIds;

}


function getRefreshIntervalMs(dashboardId) {

    const dashboard =
        resolveDashboard(dashboardId);

    const configured = Number(
        process.env.DASHBOARD_REFRESH_INTERVAL_MS
    );


    if (!dashboard) {
        return null;
    }

    if (
        Number.isFinite(configured) &&
        configured >= MINIMUM_REFRESH_INTERVAL_MS &&
        configured <= MAXIMUM_REFRESH_INTERVAL_MS
    ) {
        return Math.round(configured);
    }

    return dashboard.refreshIntervalMs;

}


function getPublicDashboardConfig(dashboardId) {

    const dashboard =
        resolveDashboard(dashboardId);


    if (!dashboard) {
        return null;
    }

    const visibleWidgets =
        getVisibleWidgets(dashboard.id);


    return {
        id: dashboard.id,
        title: dashboard.title,
        refresh_interval_ms:
            getRefreshIntervalMs(dashboard.id),
        widgets: visibleWidgets,
        layouts:
            Layout.publicLayouts(
                dashboard,
                visibleWidgets
            )
    };

}


function getPublicWidgets(dashboardId) {

    const publicConfiguration =
        getPublicDashboardConfig(dashboardId);

    return publicConfiguration
        ? publicConfiguration.widgets
        : [];

}


validateConfiguration(DEFAULT_CONFIGURATION);


module.exports = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    DASHBOARD_ID_PATTERN: DASHBOARD_ID_PATTERN,
    WIDGET_ID_PATTERN: WIDGET_ID_PATTERN,
    ENTITY_ID_PATTERN: ENTITY_ID_PATTERN,
    SUPPORTED_WIDGET_TYPES:
        SUPPORTED_WIDGET_TYPES.slice(0),
    SUPPORTED_WIDGET_SIZES:
        SUPPORTED_WIDGET_SIZES.slice(0),
    DEFAULT_WIDGET_SIZE: DEFAULT_WIDGET_SIZE,
    LAYOUT_PROFILES:
        Layout.PROFILES.slice(0),
    LAYOUT_COLUMNS:
        Object.assign({}, Layout.PROFILE_COLUMNS),
    DEFAULT_CONFIGURATION:
        cloneConfiguration(DEFAULT_CONFIGURATION),
    initialize: initialize,
    replaceConfiguration: replaceConfiguration,
    getConfiguration: getConfiguration,
    getDashboards: getDashboards,
    getPublicDashboards: getPublicDashboards,
    getDefaultDashboard: getDefaultDashboard,
    getDashboardById: getDashboardById,
    getPublicDashboardConfig: getPublicDashboardConfig,
    getVisibleWidgets: getVisibleWidgets,
    getPublicWidgets: getPublicWidgets,
    getVisibleEntityIds: getVisibleEntityIds,
    getRefreshIntervalMs: getRefreshIntervalMs,
    validateConfiguration: validateConfiguration,
    cloneConfiguration: cloneConfiguration,
    migrateConfiguration: migrateConfiguration
};
