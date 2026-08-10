/*
 * Static dashboard configuration.
 *
 * Dashboards control only display and read access. Writable entities remain
 * separately allowlisted in src/routes/api.js.
 */

const DASHBOARD_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{0,62}$/;

const SUPPORTED_WIDGET_TYPES = [
    "sensor",
    "binary",
    "light",
    "climate"
];

const DEFAULT_REFRESH_INTERVAL_MS = 5000;
const MINIMUM_REFRESH_INTERVAL_MS = 3000;
const MAXIMUM_REFRESH_INTERVAL_MS = 300000;


const TEMPERATURE_WIDGET = {
    entity: "sensor.badezimmer_smart_indoor_module_temperatur",
    type: "sensor",
    title: "Badezimmer",
    subtitle: "Temperatur",
    icon: "temperature",
    iconClass: "temperature",
    unit: "",
    order: 10,
    visible: true
};

const HUMIDITY_WIDGET = {
    entity: "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit",
    type: "sensor",
    title: "Badezimmer",
    subtitle: "Luftfeuchtigkeit",
    icon: "humidity",
    iconClass: "humidity",
    unit: "",
    order: 20,
    visible: true
};

const RIGHT_WINDOW_WIDGET = {
    entity: "binary_sensor.kuche_fenster_rechts",
    type: "binary",
    title: "Küche",
    subtitle: "Fenster rechts",
    icon: "window",
    iconClass: "window",
    unit: "",
    order: 30,
    visible: true
};

const MIDDLE_WINDOW_WIDGET = {
    entity: "binary_sensor.kuche_fenster_mitte",
    type: "binary",
    title: "Küche",
    subtitle: "Fenster Mitte",
    icon: "window",
    iconClass: "window",
    unit: "",
    order: 35,
    visible: false
};

const LIGHT_WIDGET = {
    entity: "light.esszimmer_lampen",
    type: "light",
    title: "Esszimmer",
    subtitle: "Licht",
    icon: "light",
    iconClass: "light",
    unit: "",
    order: 40,
    visible: true
};

const CLIMATE_WIDGET = {
    entity: "climate.esszimmer_thermostate",
    type: "climate",
    title: "Esszimmer",
    subtitle: "Thermostate",
    icon: "heating",
    iconClass: "heating",
    unit: "°C",
    order: 50,
    visible: true
};


const CONFIGURATION = {
    defaultDashboardId: "default",
    dashboards: [
        {
            id: "default",
            title: "Übersicht",
            refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
            widgets: [
                TEMPERATURE_WIDGET,
                HUMIDITY_WIDGET,
                RIGHT_WINDOW_WIDGET,
                MIDDLE_WINDOW_WIDGET,
                LIGHT_WIDGET,
                CLIMATE_WIDGET
            ]
        },
        {
            id: "esszimmer",
            title: "Esszimmer",
            refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
            widgets: [
                LIGHT_WIDGET,
                CLIMATE_WIDGET
            ]
        }
    ]
};


function validateConfiguration(configuration) {

    const dashboards =
        configuration && configuration.dashboards;

    const defaultDashboardId =
        configuration && configuration.defaultDashboardId;

    const dashboardIds = Object.create(null);


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


        if (
            typeof dashboard.title !== "string" ||
            dashboard.title.trim() === ""
        ) {
            throw new Error(
                "Dashboard-Titel fehlt: " +
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
                typeof widget.entity !== "string" ||
                widget.entity.trim() === ""
            ) {
                throw new Error(
                    "Widget-Entity fehlt: " +
                    dashboard.id
                );
            }

            if (
                typeof widget.type !== "string" ||
                SUPPORTED_WIDGET_TYPES.indexOf(widget.type) === -1
            ) {
                throw new Error(
                    "Widget-Typ ist ungültig: " +
                    dashboard.id
                );
            }

            if (!Number.isFinite(Number(widget.order))) {
                throw new Error(
                    "Widget-Reihenfolge ist ungültig: " +
                    dashboard.id
                );
            }

            if (
                typeof widget.visible !== "undefined" &&
                typeof widget.visible !== "boolean"
            ) {
                throw new Error(
                    "Widget-Sichtbarkeit ist ungültig: " +
                    dashboard.id
                );
            }

        });

    });


    if (
        typeof defaultDashboardId !== "string" ||
        !dashboardIds[defaultDashboardId]
    ) {
        throw new Error("Standard-Dashboard ist ungültig");
    }


    return true;

}


function cloneWidget(widget) {

    return {
        entity: widget.entity,
        type: widget.type,
        title: widget.title,
        subtitle: widget.subtitle,
        icon: widget.icon,
        iconClass: widget.iconClass,
        unit: widget.unit,
        order: widget.order,
        visible: widget.visible !== false
    };

}


function findDashboard(dashboardId) {

    let index;


    for (index = 0; index < CONFIGURATION.dashboards.length; index++) {

        if (CONFIGURATION.dashboards[index].id === dashboardId) {
            return CONFIGURATION.dashboards[index];
        }

    }


    return null;

}


function resolveDashboard(dashboardId) {

    if (typeof dashboardId === "undefined") {
        return findDashboard(
            CONFIGURATION.defaultDashboardId
        );
    }

    return findDashboard(dashboardId);

}


function cloneDashboard(dashboard) {

    if (!dashboard) {
        return null;
    }

    return {
        id: dashboard.id,
        title: dashboard.title,
        refreshIntervalMs: dashboard.refreshIntervalMs,
        widgets: dashboard.widgets.map(cloneWidget)
    };

}


function getDashboards() {

    return CONFIGURATION.dashboards.map(cloneDashboard);

}


function getPublicDashboards() {

    return CONFIGURATION.dashboards.map(function (dashboard) {

        return {
            id: dashboard.id,
            title: dashboard.title
        };

    });

}


function getDefaultDashboard() {

    return cloneDashboard(
        findDashboard(
            CONFIGURATION.defaultDashboardId
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
            return widget.visible !== false;
        })

        .map(cloneWidget)

        .sort(function (first, second) {
            return Number(first.order) - Number(second.order);
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

    const configured =
        Number(
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

    return {
        id: dashboard.id,
        title: dashboard.title,
        refresh_interval_ms:
            getRefreshIntervalMs(dashboard.id),
        widgets:
            getVisibleWidgets(dashboard.id)
    };

}


function getPublicWidgets(dashboardId) {

    const configuration =
        getPublicDashboardConfig(dashboardId);

    return configuration
        ? configuration.widgets
        : [];

}


validateConfiguration(CONFIGURATION);


module.exports = {
    getDashboards: getDashboards,
    getPublicDashboards: getPublicDashboards,
    getDefaultDashboard: getDefaultDashboard,
    getDashboardById: getDashboardById,
    getPublicDashboardConfig: getPublicDashboardConfig,
    getVisibleWidgets: getVisibleWidgets,
    getPublicWidgets: getPublicWidgets,
    getVisibleEntityIds: getVisibleEntityIds,
    getRefreshIntervalMs: getRefreshIntervalMs,
    validateConfiguration: validateConfiguration
};
