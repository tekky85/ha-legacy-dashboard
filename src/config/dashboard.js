/*
 * Versioned dashboard configuration.
 *
 * Dashboard visibility controls display and read access only. Writable
 * entities remain separately allowlisted in src/routes/api.js.
 */

const path = require("path");

const Runtime = require("./runtime");

const DashboardConfigStore =
    require("../services/dashboard-config-store");

const Layout =
    require("../services/layout");

const IssueRules =
    require("../services/issues/rule-engine");

const DashboardBackgrounds =
    require("../services/dashboard-backgrounds");

const SCHEMA_VERSION = 10;
const SECTION_SCHEMA_VERSION = 10;
const APPEARANCE_SCHEMA_VERSION = 9;
const RULES_SCHEMA_VERSION = 8;
const CRITICAL_DETECTION_SCHEMA_VERSION = 7;
const ERRORS_SCHEMA_VERSION = 6;
const SUMMARY_SCHEMA_VERSION = 5;
const LAYOUT_SCHEMA_VERSION = 4;
const GRID_SCHEMA_VERSION = 3;
const SIZE_SCHEMA_VERSION = 2;
const LEGACY_SCHEMA_VERSION = 1;

const DASHBOARD_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{0,62}$/;

const WIDGET_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{0,62}$/;

const SECTION_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{0,62}$/;

const ENTITY_ID_PATTERN =
    /^[a-z0-9_]+\.[a-z0-9_]+$/;

const LABEL_ID_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const DEVICE_ID_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const AREA_ID_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const DOMAIN_PATTERN =
    /^[a-z0-9_]+$/;

const RISK_CLASSES = [
    "safety",
    "security",
    "normal",
    "diagnostic"
];

const RULE_NUMBER_LIMITS = {
    unknownGraceMs: [0, 86400000],
    unavailableGraceMs: [0, 86400000],
    recoveryGraceMs: [0, 86400000],
    flapThreshold: [2, IssueRules.MAX_TRANSITIONS],
    flapWindowMs: [1000, 86400000]
};

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

const BACKGROUND_POSITIONS = [
    "center center",
    "center top",
    "center bottom",
    "left center",
    "right center"
];

const BACKGROUND_SIZES = [
    "cover",
    "contain"
];

const BACKGROUND_OVERLAYS = [
    0,
    10,
    20,
    30,
    40,
    50
];

const DEFAULT_SYSTEM_DASHBOARDS = {
    summary: {
        ignoredEntities: [],
        showMediaTitles: false
    },
    errors: {
        securityEntities: [],
        ignoredEntities: [],
        criticalDetectionMode: "device_class",
        criticalLabelId: null,
        rules: IssueRules.cloneRules(IssueRules.DEFAULT_RULES)
    }
};


const DEFAULT_CONFIGURATION = {
    schemaVersion: SCHEMA_VERSION,
    defaultDashboardId: "default",
    systemDashboards: DEFAULT_SYSTEM_DASHBOARDS,
    dashboards: [
        {
            id: "default",
            title: "Übersicht",
            showTitle: true,
            background: null,
            refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
            sections: [],
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
            showTitle: true,
            background: null,
            refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
            sections: [],
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

        const sectionIds = Object.create(null);

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

        if (schemaVersion >= APPEARANCE_SCHEMA_VERSION) {
            validateDashboardAppearance(dashboard);
        }

        if (schemaVersion >= SECTION_SCHEMA_VERSION) {
            validateDashboardSections(
                dashboard,
                sectionIds
            );
        }

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

            if (
                schemaVersion >= SECTION_SCHEMA_VERSION &&
                typeof widget.sectionId !== "undefined" &&
                widget.sectionId !== null &&
                (
                    typeof widget.sectionId !== "string" ||
                    !sectionIds[widget.sectionId]
                )
            ) {
                const error = new Error(
                    "Widget-Abschnitt ist ungültig: " +
                    widget.id
                );

                error.code = "invalid_widget_section";
                throw error;
            }

        });


        if (schemaVersion === GRID_SCHEMA_VERSION) {
            Layout.validateLegacyLayouts(dashboard);
        } else if (schemaVersion >= LAYOUT_SCHEMA_VERSION) {
            Layout.validateLayouts(dashboard);
        }

    });


    if (
        typeof candidate.defaultDashboardId !== "string" ||
        !dashboardIds[candidate.defaultDashboardId]
    ) {
        throw new Error("Standard-Dashboard ist ungültig");
    }

    if (schemaVersion >= SUMMARY_SCHEMA_VERSION) {
        validateSystemDashboards(
            candidate.systemDashboards,
            schemaVersion >= ERRORS_SCHEMA_VERSION,
            schemaVersion >= CRITICAL_DETECTION_SCHEMA_VERSION,
            schemaVersion >= RULES_SCHEMA_VERSION
        );
    }


    return true;

}


function validateDashboardSections(dashboard, sectionIds) {

    if (!Array.isArray(dashboard.sections)) {
        const error = new Error(
            "Dashboard-Abschnitte sind ungültig: " +
            dashboard.id
        );

        error.code = "invalid_dashboard_sections";
        throw error;
    }


    dashboard.sections.forEach(function (section) {

        if (
            !section ||
            typeof section.id !== "string" ||
            !SECTION_ID_PATTERN.test(section.id)
        ) {
            const error = new Error("Abschnitts-ID ist ungültig");

            error.code = "invalid_section_id";
            throw error;
        }

        if (sectionIds[section.id]) {
            const error = new Error(
                "Abschnitts-ID ist nicht eindeutig: " +
                section.id
            );

            error.code = "duplicate_section_id";
            throw error;
        }

        sectionIds[section.id] = true;

        validateText(section.title, "Abschnittstitel");

        if (
            typeof section.order !== "number" ||
            !Number.isFinite(section.order)
        ) {
            const error = new Error(
                "Abschnitts-Reihenfolge ist ungültig: " +
                section.id
            );

            error.code = "invalid_section_order";
            throw error;
        }

        if (typeof section.showTitle !== "boolean") {
            const error = new Error(
                "Abschnitts-Titelanzeige ist ungültig: " +
                section.id
            );

            error.code = "invalid_section_show_title";
            throw error;
        }

        if (
            section.areaId !== null &&
            (
                typeof section.areaId !== "string" ||
                !AREA_ID_PATTERN.test(section.areaId)
            )
        ) {
            const error = new Error(
                "Abschnitts-Area ist ungültig: " +
                section.id
            );

            error.code = "invalid_section_area";
            throw error;
        }

    });

}


function validateDashboardAppearance(dashboard) {

    if (typeof dashboard.showTitle !== "boolean") {
        const error = new Error(
            "Dashboard-Titelanzeige ist ungültig: " +
            dashboard.id
        );

        error.code = "invalid_dashboard_show_title";
        throw error;
    }

    if (dashboard.background === null) {
        return;
    }

    const background = dashboard.background;

    if (!background || typeof background !== "object") {
        const error = new Error(
            "Dashboard-Hintergrund ist ungültig: " +
            dashboard.id
        );

        error.code = "invalid_dashboard_background";
        throw error;
    }

    if (
        typeof background.imageId !== "string" ||
        !DashboardBackgrounds.IMAGE_ID_PATTERN.test(
            background.imageId
        ) ||
        BACKGROUND_POSITIONS.indexOf(
            background.position
        ) === -1 ||
        BACKGROUND_SIZES.indexOf(
            background.size
        ) === -1 ||
        BACKGROUND_OVERLAYS.indexOf(
            background.overlay
        ) === -1
    ) {
        const error = new Error(
            "Dashboard-Hintergrund ist ungültig: " +
            dashboard.id
        );

        error.code = "invalid_dashboard_background";
        throw error;
    }

}


function validateEntityList(list, fieldName) {

    const seen = Object.create(null);


    if (!Array.isArray(list)) {
        throw new Error(fieldName + " sind ungültig");
    }

    list.forEach(function (entityId) {
        if (
            typeof entityId !== "string" ||
            !ENTITY_ID_PATTERN.test(entityId)
        ) {
            throw new Error(fieldName + " enthalten eine ungültige Entity");
        }

        if (seen[entityId]) {
            throw new Error(fieldName + " enthalten eine nicht eindeutige Entity");
        }

        seen[entityId] = true;
    });

}


function validateSystemDashboards(
    systemDashboards,
    requireErrors,
    requireCriticalDetection,
    requireRules
) {

    const summary =
        systemDashboards && systemDashboards.summary;

    const ignored =
        summary && summary.ignoredEntities;

    if (!summary || typeof summary !== "object") {
        throw new Error("Summary-Konfiguration fehlt");
    }

    validateEntityList(ignored, "Ignorierte Summary-Entities");

    if (typeof summary.showMediaTitles !== "boolean") {
        throw new Error("Summary-Medientitel-Einstellung ist ungültig");
    }

    if (requireErrors) {
        const errors = systemDashboards.errors;

        if (!errors || typeof errors !== "object") {
            throw new Error("Error-Konfiguration fehlt");
        }

        validateEntityList(
            errors.securityEntities,
            "Sicherheitsrelevante Error-Entities"
        );
        validateEntityList(
            errors.ignoredEntities,
            "Ignorierte Error-Entities"
        );

        if (requireCriticalDetection) {
            if (
                errors.criticalDetectionMode !== "device_class" &&
                errors.criticalDetectionMode !== "ha_label"
            ) {
                throw new Error("Critical-Detection-Modus ist ungültig");
            }

            if (
                errors.criticalDetectionMode === "ha_label" &&
                (
                    typeof errors.criticalLabelId !== "string" ||
                    !LABEL_ID_PATTERN.test(errors.criticalLabelId)
                )
            ) {
                throw new Error("Critical Label fehlt oder ist ungültig");
            }

            if (
                errors.criticalDetectionMode === "device_class" &&
                errors.criticalLabelId !== null &&
                (
                    typeof errors.criticalLabelId !== "string" ||
                    !LABEL_ID_PATTERN.test(errors.criticalLabelId)
                )
            ) {
                throw new Error("Critical Label ist ungültig");
            }
        }

        if (requireRules) {
            validateErrorRules(errors.rules);
        }
    }

}


function validateRule(
    rule,
    fieldName,
    completeNumbers,
    requireExpectedOffline,
    allowCriticalOverride
) {

    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
        throw new Error(fieldName + " ist ungültig");
    }

    const allowedFields = Object.keys(RULE_NUMBER_LIMITS)
        .concat(["expectedOffline", "riskClass"]);

    if (allowCriticalOverride) {
        allowedFields.push("allowCriticalExpectedOffline");
    }

    Object.keys(rule).forEach(function (ruleField) {
        if (allowedFields.indexOf(ruleField) === -1) {
            throw new Error(fieldName + " enthält ein unbekanntes Feld");
        }
    });

    Object.keys(RULE_NUMBER_LIMITS).forEach(function (ruleField) {
        const limits = RULE_NUMBER_LIMITS[ruleField];

        if (
            completeNumbers &&
            !Object.prototype.hasOwnProperty.call(rule, ruleField)
        ) {
            throw new Error(fieldName + " ist unvollständig");
        }

        if (
            Object.prototype.hasOwnProperty.call(rule, ruleField) &&
            (
                typeof rule[ruleField] !== "number" ||
                !Number.isFinite(rule[ruleField]) ||
                !Number.isInteger(rule[ruleField]) ||
                rule[ruleField] < limits[0] ||
                rule[ruleField] > limits[1]
            )
        ) {
            throw new Error(fieldName + " enthält einen ungültigen Wert: " + ruleField);
        }
    });

    if (
        requireExpectedOffline &&
        typeof rule.expectedOffline !== "boolean"
    ) {
        throw new Error(fieldName + " enthält keine Expected-Offline-Einstellung");
    }

    if (
        Object.prototype.hasOwnProperty.call(rule, "expectedOffline") &&
        typeof rule.expectedOffline !== "boolean"
    ) {
        throw new Error(fieldName + " enthält eine ungültige Expected-Offline-Einstellung");
    }

    if (
        Object.prototype.hasOwnProperty.call(rule, "riskClass") &&
        RISK_CLASSES.indexOf(rule.riskClass) === -1
    ) {
        throw new Error(fieldName + " enthält eine ungültige Risk Class");
    }

    if (
        Object.prototype.hasOwnProperty.call(
            rule,
            "allowCriticalExpectedOffline"
        ) &&
        typeof rule.allowCriticalExpectedOffline !== "boolean"
    ) {
        throw new Error(fieldName + " enthält einen ungültigen Critical-Offline-Override");
    }

    if (
        rule.allowCriticalExpectedOffline === true &&
        rule.expectedOffline !== true
    ) {
        throw new Error(fieldName + " erlaubt Critical Offline ohne Expected Offline");
    }

}


function validateRuleMap(map, fieldName, pattern, allowCriticalOverride) {

    if (!map || typeof map !== "object" || Array.isArray(map)) {
        throw new Error(fieldName + " sind ungültig");
    }

    Object.keys(map).forEach(function (identifier) {
        if (!pattern.test(identifier)) {
            throw new Error(fieldName + " enthalten eine ungültige ID");
        }

        validateRule(
            map[identifier],
            fieldName + " " + identifier,
            false,
            false,
            allowCriticalOverride
        );
    });

}


function validateErrorRules(rules) {

    if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
        throw new Error("Error-Regelkonfiguration fehlt");
    }

    const expectedCollections = [
        "defaults",
        "riskClasses",
        "domains",
        "devices",
        "entities"
    ];

    Object.keys(rules).forEach(function (fieldName) {
        if (expectedCollections.indexOf(fieldName) === -1) {
            throw new Error("Error-Regelkonfiguration enthält ein unbekanntes Feld");
        }
    });

    expectedCollections.forEach(function (fieldName) {
        if (!Object.prototype.hasOwnProperty.call(rules, fieldName)) {
            throw new Error("Error-Regelkonfiguration ist unvollständig");
        }
    });

    validateRule(
        rules.defaults,
        "Globale Error-Regel",
        true,
        true,
        false
    );

    if (
        !rules.riskClasses ||
        typeof rules.riskClasses !== "object" ||
        Array.isArray(rules.riskClasses)
    ) {
        throw new Error("Risk-Class-Regeln sind ungültig");
    }

    if (
        Object.keys(rules.riskClasses).some(function (riskClass) {
            return RISK_CLASSES.indexOf(riskClass) === -1;
        })
    ) {
        throw new Error("Risk-Class-Regeln enthalten eine unbekannte Risk Class");
    }

    RISK_CLASSES.forEach(function (riskClass) {
        validateRule(
            rules.riskClasses[riskClass],
            "Risk-Class-Regel " + riskClass,
            true,
            false,
            false
        );
    });

    validateRuleMap(rules.domains, "Domain-Regeln", DOMAIN_PATTERN, false);
    validateRuleMap(rules.devices, "Device-Regeln", DEVICE_ID_PATTERN, true);
    validateRuleMap(rules.entities, "Entity-Regeln", ENTITY_ID_PATTERN, true);

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
        sectionId:
            typeof widget.sectionId === "string"
                ? widget.sectionId
                : null,
        size:
            typeof widget.size === "string"
                ? widget.size
                : DEFAULT_WIDGET_SIZE
    };

}


function cloneSection(section) {

    return {
        id: section.id,
        title: section.title,
        order: section.order,
        showTitle: section.showTitle,
        areaId:
            typeof section.areaId === "string"
                ? section.areaId
                : null
    };

}


function migrateConfiguration(candidate) {

    if (
        !candidate ||
        (
            candidate.schemaVersion !== LEGACY_SCHEMA_VERSION &&
            candidate.schemaVersion !== SIZE_SCHEMA_VERSION &&
            candidate.schemaVersion !== GRID_SCHEMA_VERSION &&
            candidate.schemaVersion !== LAYOUT_SCHEMA_VERSION &&
            candidate.schemaVersion !== SUMMARY_SCHEMA_VERSION &&
            candidate.schemaVersion !== ERRORS_SCHEMA_VERSION &&
            candidate.schemaVersion !== CRITICAL_DETECTION_SCHEMA_VERSION &&
            candidate.schemaVersion !== RULES_SCHEMA_VERSION &&
            candidate.schemaVersion !== APPEARANCE_SCHEMA_VERSION
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
    migrated.systemDashboards =
        candidate.schemaVersion >= SUMMARY_SCHEMA_VERSION
            ? cloneSystemDashboards(candidate.systemDashboards)
            : cloneSystemDashboards(DEFAULT_SYSTEM_DASHBOARDS);

    migrated.dashboards.forEach(function (dashboard) {

        dashboard.showTitle =
            typeof dashboard.showTitle === "boolean"
                ? dashboard.showTitle
                : true;

        dashboard.background =
            dashboard.background || null;

        dashboard.sections = [];

        dashboard.widgets.forEach(function (widget) {
            widget.sectionId = null;
        });

        if (candidate.schemaVersion === GRID_SCHEMA_VERSION) {
            dashboard.layouts =
                Layout.migrateLegacyLayouts(
                    dashboard.layouts
                );
        } else if (candidate.schemaVersion < LAYOUT_SCHEMA_VERSION) {
            dashboard.layouts =
                Layout.createLayouts(dashboard.widgets);
        }

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
        showTitle:
            typeof dashboard.showTitle === "boolean"
                ? dashboard.showTitle
                : true,
        background:
            dashboard.background
                ? {
                    imageId: dashboard.background.imageId,
                    position: dashboard.background.position,
                    size: dashboard.background.size,
                    overlay: dashboard.background.overlay
                }
                : null,
        refreshIntervalMs: dashboard.refreshIntervalMs,
        sections:
            Array.isArray(dashboard.sections)
                ? dashboard.sections.map(cloneSection)
                : [],
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
        systemDashboards:
            candidate.systemDashboards
                ? cloneSystemDashboards(candidate.systemDashboards)
                : undefined,
        dashboards: candidate.dashboards.map(cloneDashboard)
    };

}


function cloneSystemDashboards(systemDashboards) {

    const summary = systemDashboards.summary;
    const errors = systemDashboards.errors ||
        DEFAULT_SYSTEM_DASHBOARDS.errors;

    return {
        summary: {
            ignoredEntities:
                summary.ignoredEntities.slice(0),
            showMediaTitles:
                summary.showMediaTitles
        },
        errors: {
            securityEntities:
                errors.securityEntities.slice(0),
            ignoredEntities:
                errors.ignoredEntities.slice(0),
            criticalDetectionMode:
                errors.criticalDetectionMode || "device_class",
            criticalLabelId:
                typeof errors.criticalLabelId === "string"
                    ? errors.criticalLabelId
                    : null,
            rules: IssueRules.cloneRules(
                errors.rules || IssueRules.DEFAULT_RULES
            )
        }
    };

}


function getDefaultConfigPath() {

    return path.join(
        Runtime.resolveDataDirectory(),
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


function getSummaryConfiguration() {

    return cloneSystemDashboards(
        ensureConfiguration().systemDashboards
    ).summary;

}


function getErrorsConfiguration() {

    const current = ensureConfiguration();
    const settings = cloneSystemDashboards(
        current.systemDashboards
    ).errors;
    const entityTitles = Object.create(null);


    current.dashboards.forEach(function (dashboard) {
        dashboard.widgets.forEach(function (widget) {
            if (!entityTitles[widget.entity]) {
                entityTitles[widget.entity] =
                    widget.subtitle
                        ? widget.title + " " + widget.subtitle
                        : widget.title;
            }
        });
    });

    settings.entityTitles = entityTitles;

    return settings;

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


function getSections(dashboardId) {

    const dashboard =
        resolveDashboard(dashboardId);


    if (!dashboard) {
        return [];
    }

    return dashboard.sections
        .map(cloneSection)
        .sort(function (first, second) {
            if (first.order !== second.order) {
                return first.order - second.order;
            }

            return first.id.localeCompare(second.id);
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
        show_title: dashboard.showTitle !== false,
        background:
            dashboard.background
                ? {
                    image_url:
                        "/assets/backgrounds/" +
                        encodeURIComponent(
                            dashboard.background.imageId
                        ),
                    position:
                        dashboard.background.position,
                    size: dashboard.background.size,
                    overlay:
                        dashboard.background.overlay
                }
                : null,
        refresh_interval_ms:
            getRefreshIntervalMs(dashboard.id),
        sections: getSections(dashboard.id),
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
    SECTION_ID_PATTERN: SECTION_ID_PATTERN,
    ENTITY_ID_PATTERN: ENTITY_ID_PATTERN,
    AREA_ID_PATTERN: AREA_ID_PATTERN,
    DEVICE_ID_PATTERN: DEVICE_ID_PATTERN,
    DOMAIN_PATTERN: DOMAIN_PATTERN,
    RISK_CLASSES: RISK_CLASSES.slice(0),
    SUPPORTED_WIDGET_TYPES:
        SUPPORTED_WIDGET_TYPES.slice(0),
    SUPPORTED_WIDGET_SIZES:
        SUPPORTED_WIDGET_SIZES.slice(0),
    BACKGROUND_POSITIONS:
        BACKGROUND_POSITIONS.slice(0),
    BACKGROUND_SIZES:
        BACKGROUND_SIZES.slice(0),
    BACKGROUND_OVERLAYS:
        BACKGROUND_OVERLAYS.slice(0),
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
    getSummaryConfiguration: getSummaryConfiguration,
    getErrorsConfiguration: getErrorsConfiguration,
    getDashboards: getDashboards,
    getPublicDashboards: getPublicDashboards,
    getDefaultDashboard: getDefaultDashboard,
    getDashboardById: getDashboardById,
    getPublicDashboardConfig: getPublicDashboardConfig,
    getSections: getSections,
    getVisibleWidgets: getVisibleWidgets,
    getPublicWidgets: getPublicWidgets,
    getVisibleEntityIds: getVisibleEntityIds,
    getRefreshIntervalMs: getRefreshIntervalMs,
    validateConfiguration: validateConfiguration,
    cloneConfiguration: cloneConfiguration,
    migrateConfiguration: migrateConfiguration
};
