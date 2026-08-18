const crypto = require("crypto");
const express = require("express");

const dashboardConfig =
    require("../config/dashboard");

const ha =
    require("../services/homeassistant");

const logger =
    require("../services/logger");

const Layout =
    require("../services/layout");

const System =
    require("../services/system");

const writeRateLimit =
    require("../services/write-rate-limit");


const router = express.Router();


function tokenDigest(value) {

    return crypto
        .createHash("sha256")
        .update(value, "utf8")
        .digest();

}


function tokensEqual(first, second) {

    if (
        typeof first !== "string" ||
        typeof second !== "string"
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        tokenDigest(first),
        tokenDigest(second)
    );

}


function requireAdmin(req, res, next) {

    if (process.env.ADMIN_API_ENABLED !== "true") {
        return res.status(404).json({
            error: "admin_api_disabled"
        });
    }

    const adminToken =
        process.env.ADMIN_TOKEN;


    if (
        typeof adminToken !== "string" ||
        adminToken === "" ||
        tokensEqual(
            adminToken,
            process.env.HA_TOKEN || ""
        )
    ) {
        return res.status(503).json({
            error: "admin_api_not_configured"
        });
    }

    const authorization =
        req.get("authorization") || "";

    const match =
        /^Bearer ([^\s]+)$/.exec(
            authorization
        );


    if (
        !match ||
        !tokensEqual(match[1], adminToken)
    ) {
        res.setHeader(
            "WWW-Authenticate",
            "Bearer"
        );

        return res.status(401).json({
            error: "admin_authentication_required"
        });
    }

    return next();

}


function limitAdminWrites(req, res, next) {

    if (req.method === "GET") {
        return next();
    }

    const result =
        writeRateLimit.consume(
            "admin:" + req.ip
        );

    res.setHeader(
        "X-RateLimit-Limit",
        String(result.limit)
    );


    if (result.allowed) {
        res.setHeader(
            "X-RateLimit-Remaining",
            String(result.remaining)
        );

        return next();
    }

    res.setHeader(
        "Retry-After",
        String(result.retryAfterSeconds)
    );
    res.setHeader(
        "X-RateLimit-Remaining",
        "0"
    );

    logger.warn(
        "admin_write_rate_limited",
        {
            retry_after_seconds:
                result.retryAfterSeconds
        }
    );

    return res.status(429).json({
        error: "admin_write_rate_limited"
    });

}


function findDashboardIndex(
    configuration,
    dashboardId
) {

    let index;


    for (
        index = 0;
        index < configuration.dashboards.length;
        index++
    ) {
        if (
            configuration.dashboards[index].id ===
                dashboardId
        ) {
            return index;
        }
    }

    return -1;

}


function findWidgetIndex(
    dashboard,
    widgetId
) {

    let index;


    for (
        index = 0;
        index < dashboard.widgets.length;
        index++
    ) {
        if (dashboard.widgets[index].id === widgetId) {
            return index;
        }
    }

    return -1;

}


function persistConfiguration(res, candidate) {

    try {
        dashboardConfig.validateConfiguration(
            candidate
        );
    } catch (error) {
        res.status(400).json({
            error:
                error.code ||
                "configuration_invalid",
            message: error.message
        });

        return null;
    }


    try {
        return dashboardConfig
            .replaceConfiguration(candidate);
    } catch (error) {
        logger.error(
            "dashboard_config_write_failed",
            {
                error_type: error.name
            }
        );

        res.status(500).json({
            error: "configuration_write_failed"
        });

        return null;
    }

}


function sanitizeEntity(state) {

    const attributes =
        state && state.attributes
            ? state.attributes
            : {};

    const entityId =
        state.entity_id;

    return {
        entity_id: entityId,
        domain: entityId.split(".")[0],
        friendly_name:
            typeof attributes.friendly_name === "string"
                ? attributes.friendly_name
                : null,
        device_class:
            typeof attributes.device_class === "string"
                ? attributes.device_class
                : null,
        unit_of_measurement:
            typeof attributes.unit_of_measurement === "string"
                ? attributes.unit_of_measurement
                : null
    };

}


function finiteOrNull(value) {

    if (
        value === null ||
        typeof value === "undefined" ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;

}


function sanitizePreviewEntity(state) {

    const entity = sanitizeEntity(state);
    const attributes =
        state && state.attributes
            ? state.attributes
            : {};


    entity.state =
        state && typeof state.state === "string"
            ? state.state
            : "unknown";

    entity.current_temperature =
        finiteOrNull(attributes.current_temperature);
    entity.target_temperature =
        finiteOrNull(attributes.temperature);
    entity.minimum_temperature =
        finiteOrNull(attributes.min_temp);
    entity.maximum_temperature =
        finiteOrNull(attributes.max_temp);
    entity.target_temperature_step =
        finiteOrNull(attributes.target_temp_step);
    entity.hvac_action =
        typeof attributes.hvac_action === "string"
            ? attributes.hvac_action
            : null;

    return entity;

}


router.use(requireAdmin);
router.use(limitAdminWrites);


router.get("/config", function (req, res) {
    res.json(
        dashboardConfig.getConfiguration()
    );
});


router.put("/config", function (req, res) {

    const persisted =
        persistConfiguration(
            res,
            req.body
        );

    if (persisted) {
        res.json(persisted);
    }

});


router.get("/dashboards", function (req, res) {
    res.json({
        defaultDashboardId:
            dashboardConfig
                .getConfiguration()
                .defaultDashboardId,
        dashboards:
            dashboardConfig.getDashboards()
    });
});


router.post("/dashboards", function (req, res) {

    const body = req.body || {};

    const candidate =
        dashboardConfig.getConfiguration();


    const dashboard = {
        id: body.id,
        title: body.title,
        refreshIntervalMs:
            body.refreshIntervalMs,
        widgets:
            Array.isArray(body.widgets)
                ? body.widgets
                : []
    };

    dashboard.layouts =
        typeof body.layouts !== "undefined"
            ? body.layouts
            : Layout.createLayouts(
                dashboard.widgets
            );

    candidate.dashboards.push(dashboard);

    const persisted =
        persistConfiguration(res, candidate);


    if (persisted) {
        res.status(201).json(
            dashboardConfig.getDashboardById(
                body.id
            )
        );
    }

});


router.put("/dashboards/:dashboardId", function (req, res) {

    const body = req.body || {};

    const candidate =
        dashboardConfig.getConfiguration();

    const dashboardIndex =
        findDashboardIndex(
            candidate,
            req.params.dashboardId
        );


    if (dashboardIndex === -1) {
        return res.status(404).json({
            error: "dashboard_not_found"
        });
    }

    if (
        typeof body.id !== "undefined" &&
        body.id !== req.params.dashboardId
    ) {
        return res.status(400).json({
            error: "dashboard_id_immutable"
        });
    }

    const current =
        candidate.dashboards[dashboardIndex];


    candidate.dashboards[dashboardIndex] = {
        id: current.id,
        title:
            typeof body.title !== "undefined"
                ? body.title
                : current.title,
        refreshIntervalMs:
            typeof body.refreshIntervalMs !== "undefined"
                ? body.refreshIntervalMs
                : current.refreshIntervalMs,
        widgets:
            typeof body.widgets !== "undefined"
                ? body.widgets
                : current.widgets,
        layouts:
            typeof body.layouts !== "undefined"
                ? body.layouts
                : current.layouts
    };

    const persisted =
        persistConfiguration(res, candidate);


    if (persisted) {
        res.json(
            dashboardConfig.getDashboardById(
                current.id
            )
        );
    }

});


router.delete("/dashboards/:dashboardId", function (req, res) {

    const candidate =
        dashboardConfig.getConfiguration();

    const dashboardIndex =
        findDashboardIndex(
            candidate,
            req.params.dashboardId
        );


    if (dashboardIndex === -1) {
        return res.status(404).json({
            error: "dashboard_not_found"
        });
    }

    if (
        candidate.defaultDashboardId ===
            req.params.dashboardId
    ) {
        return res.status(409).json({
            error: "default_dashboard_required"
        });
    }

    candidate.dashboards.splice(
        dashboardIndex,
        1
    );

    const persisted =
        persistConfiguration(res, candidate);


    if (persisted) {
        res.status(204).end();
    }

});


router.post(
    "/dashboards/:dashboardId/widgets",
    function (req, res) {

        const candidate =
            dashboardConfig.getConfiguration();

        const dashboardIndex =
            findDashboardIndex(
                candidate,
                req.params.dashboardId
            );


        if (dashboardIndex === -1) {
            return res.status(404).json({
                error: "dashboard_not_found"
            });
        }

        const widget = Object.assign(
            {},
            req.body || {}
        );

        if (typeof widget.size === "undefined") {
            widget.size =
                dashboardConfig.DEFAULT_WIDGET_SIZE;
        }

        const dashboard =
            candidate.dashboards[dashboardIndex];

        dashboard.widgets.push(widget);
        Layout.addWidget(dashboard, widget);

        const persisted =
            persistConfiguration(res, candidate);


        if (persisted) {
            const widgetIndex =
                findWidgetIndex(
                    dashboardConfig
                        .getDashboardById(
                            req.params.dashboardId
                        ),
                    widget.id
                );

            res.status(201).json(
                dashboardConfig
                    .getDashboardById(
                        req.params.dashboardId
                    )
                    .widgets[widgetIndex]
            );
        }

    }
);


router.put(
    "/dashboards/:dashboardId/widgets/:widgetId",
    function (req, res) {

        const body = req.body || {};

        const candidate =
            dashboardConfig.getConfiguration();

        const dashboardIndex =
            findDashboardIndex(
                candidate,
                req.params.dashboardId
            );


        if (dashboardIndex === -1) {
            return res.status(404).json({
                error: "dashboard_not_found"
            });
        }

        const dashboard =
            candidate.dashboards[dashboardIndex];

        const widgetIndex =
            findWidgetIndex(
                dashboard,
                req.params.widgetId
            );


        if (widgetIndex === -1) {
            return res.status(404).json({
                error: "widget_not_found"
            });
        }

        if (
            typeof body.id !== "undefined" &&
            body.id !== req.params.widgetId
        ) {
            return res.status(400).json({
                error: "widget_id_immutable"
            });
        }

        const current =
            dashboard.widgets[widgetIndex];


        dashboard.widgets[widgetIndex] = {
            id: current.id,
            entity:
                typeof body.entity !== "undefined"
                    ? body.entity
                    : current.entity,
            type:
                typeof body.type !== "undefined"
                    ? body.type
                    : current.type,
            title:
                typeof body.title !== "undefined"
                    ? body.title
                    : current.title,
            subtitle:
                typeof body.subtitle !== "undefined"
                    ? body.subtitle
                    : current.subtitle,
            icon:
                typeof body.icon !== "undefined"
                    ? body.icon
                    : current.icon,
            iconClass:
                typeof body.iconClass !== "undefined"
                    ? body.iconClass
                    : current.iconClass,
            unit:
                typeof body.unit !== "undefined"
                    ? body.unit
                    : current.unit,
            order:
                typeof body.order !== "undefined"
                    ? body.order
                    : current.order,
            visible:
                typeof body.visible !== "undefined"
                    ? body.visible
                    : current.visible,
            size:
                typeof body.size !== "undefined"
                    ? body.size
                    : current.size
        };

        Layout.ensureVisibleWidgetPlacement(
            dashboard,
            dashboard.widgets[widgetIndex]
        );

        const persisted =
            persistConfiguration(res, candidate);


        if (persisted) {
            res.json(
                dashboardConfig
                    .getDashboardById(
                        req.params.dashboardId
                    )
                    .widgets[widgetIndex]
            );
        }

    }
);


router.delete(
    "/dashboards/:dashboardId/widgets/:widgetId",
    function (req, res) {

        const candidate =
            dashboardConfig.getConfiguration();

        const dashboardIndex =
            findDashboardIndex(
                candidate,
                req.params.dashboardId
            );


        if (dashboardIndex === -1) {
            return res.status(404).json({
                error: "dashboard_not_found"
            });
        }

        const dashboard =
            candidate.dashboards[dashboardIndex];

        const widgetIndex =
            findWidgetIndex(
                dashboard,
                req.params.widgetId
            );


        if (widgetIndex === -1) {
            return res.status(404).json({
                error: "widget_not_found"
            });
        }

        dashboard.widgets.splice(
            widgetIndex,
            1
        );

        Layout.removeWidget(
            dashboard,
            req.params.widgetId
        );

        const persisted =
            persistConfiguration(res, candidate);


        if (persisted) {
            res.status(204).end();
        }

    }
);


router.get("/entities", async function (req, res) {

    try {
        const states =
            await ha.getAllEntities();

        const entities = states
            .filter(function (state) {
                return Boolean(
                    state &&
                    typeof state.entity_id === "string" &&
                    dashboardConfig.ENTITY_ID_PATTERN.test(
                        state.entity_id
                    )
                );
            })
            .map(sanitizeEntity)
            .sort(function (first, second) {
                return first.entity_id.localeCompare(
                    second.entity_id
                );
            });

        return res.json({
            entities: entities
        });
    } catch (error) {
        logger.error(
            "admin_entity_inventory_failed",
            {
                upstream_status:
                    error.response &&
                    error.response.status
                        ? error.response.status
                        : null,
                error_type: error.name
            }
        );

        return res.status(502).json({
            error: "entity_inventory_unavailable"
        });
    }

});


router.get("/preview", async function (req, res) {

    try {
        const states = await ha.getAllEntities();

        const entities = states
            .filter(function (state) {
                return Boolean(
                    state &&
                    typeof state.entity_id === "string" &&
                    dashboardConfig.ENTITY_ID_PATTERN.test(
                        state.entity_id
                    )
                );
            })
            .map(sanitizePreviewEntity)
            .sort(function (first, second) {
                return first.entity_id.localeCompare(
                    second.entity_id
                );
            });

        return res.json({
            entities: entities,
            fetched_at: new Date().toISOString()
        });
    } catch (error) {
        logger.error(
            "admin_preview_failed",
            {
                upstream_status:
                    error.response && error.response.status
                        ? error.response.status
                        : null,
                error_type: error.name
            }
        );

        return res.status(502).json({
            error: "preview_unavailable"
        });
    }

});


router.get("/system-diagnostics/status", async function (req, res) {

    try {
        return res.json(
            await System.getDiagnosticsStatus()
        );
    } catch (error) {
        logger.warn(
            "admin_system_diagnostics_failed",
            {
                error_code:
                    error && error.code
                        ? error.code
                        : "diagnostics_unavailable"
            }
        );

        return res.status(503).json({
            error: "diagnostics_status_unavailable"
        });
    }

});


router.get("/labels", async function (req, res) {

    try {
        return res.json(await System.getCriticalLabels());
    } catch (error) {
        logger.warn("admin_label_inventory_failed", {
            error_code: error && error.code
                ? error.code
                : "label_inventory_unavailable"
        });
        return res.status(503).json({
            error: "label_inventory_unavailable"
        });
    }

});


module.exports = router;
