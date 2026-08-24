require('dotenv').config();

const express = require('express');
const path = require('path');
const dashboardConfig = require("./config/dashboard");
const dashboardReturnTarget =
    require("./services/dashboard-return-target");
const logger = require("./services/logger");
const Runtime = require("./config/runtime");


let runtimeMode;

try {
    runtimeMode =
        Runtime.resolveHomeAssistantConnection()
            .mode;
} catch (error) {
    logger.error(
        "home_assistant_connection_invalid",
        {
            error_type: error.name
        }
    );
    process.exit(1);
}


try {
    const initialization =
        dashboardConfig.initialize();

    if (initialization.migrated) {
        logger.info(
            "dashboard_config_migrated",
            {
                schema_version:
                    dashboardConfig.SCHEMA_VERSION
            }
        );
    } else if (initialization.recovered) {
        logger.warn(
            "dashboard_config_recovered",
            {
                schema_version:
                    dashboardConfig.SCHEMA_VERSION
            }
        );
    }
} catch (error) {
    logger.error(
        "dashboard_config_initialization_failed",
        {
            error_type: error.name
        }
    );
    process.exit(1);
}


const apiRoutes = require("./routes/api");
const app = express();

const PORT = process.env.PORT || 3000;
const BIND_ADDRESS =
    process.env.BIND_ADDRESS || "0.0.0.0";
const PUBLIC_PATH = path.join(__dirname, "public");
const ADMIN_PATH = path.join(__dirname, "admin");
const SYSTEM_PAGE_PATH = path.join(PUBLIC_PATH, "system.html");


function setStaticHeaders(res, filePath) {

    if (
        /(?:index|system)\.html$/.test(filePath) ||
        /manifest\.json$/.test(filePath)
    ) {

        res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
        );

        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        return;

    }


    res.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable"
    );

}


function setSecurityHeaders(req, res, next) {

    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "base-uri 'none'; " +
        "connect-src 'self'; " +
        "font-src 'self'; " +
        "frame-ancestors 'none'; " +
        "img-src 'self' data:; " +
        "object-src 'none'; " +
        "script-src 'self'; " +
        "style-src 'self'"
    );

    res.setHeader(
        "Referrer-Policy",
        "no-referrer"
    );

    res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
    );

    res.setHeader(
        "X-Frame-Options",
        "DENY"
    );

    next();

}


function setApiHeaders(req, res, next) {

    res.setHeader(
        "Cache-Control",
        "no-store"
    );

    next();

}


function setAdminHeaders(res) {

    res.setHeader(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

}


app.disable("x-powered-by");
app.use(setSecurityHeaders);
app.use(express.json({
    limit: "16kb",
    strict: true
}));
app.get("/health", function (req, res) {
    return res.json({
        status: "ok"
    });
});
app.use("/api", setApiHeaders, apiRoutes);
app.use("/api", function (req, res) {

    res.status(404).json({
        error: "API-Endpunkt nicht gefunden"
    });

});
app.get("/d/:dashboardId", function (req, res) {

    if (
        !dashboardConfig.getDashboardById(
            req.params.dashboardId
        )
    ) {
        return res.status(404)
            .type("text/plain")
            .send("Dashboard nicht gefunden");
    }


    const indexPath =
        path.join(PUBLIC_PATH, "index.html");

    setStaticHeaders(res, indexPath);

    return res.sendFile(indexPath);

});
app.get(
    ["/system/summary", "/system/errors"],
    function (req, res) {

        const requestedReturnTarget =
            req.query.returnTo;

        const validReturnTarget =
            dashboardReturnTarget.resolve(
                requestedReturnTarget,
                function (dashboardId) {
                    return Boolean(
                        dashboardConfig.getDashboardById(
                            dashboardId
                        )
                    );
                }
            );


        if (
            typeof requestedReturnTarget !== "undefined" &&
            validReturnTarget === null
        ) {
            return res.redirect(302, req.path);
        }

        setStaticHeaders(res, SYSTEM_PAGE_PATH);

        return res.sendFile(SYSTEM_PAGE_PATH);

    }
);
app.get(/^\/system(?:\/.*)?$/, function (req, res) {

    return res.status(404)
        .type("text/plain")
        .send("System-Dashboard nicht gefunden");

});
app.get(["/admin", "/admin/"], function (req, res) {

    const indexPath =
        path.join(ADMIN_PATH, "index.html");

    setAdminHeaders(res);

    return res.sendFile(indexPath);

});
app.use("/admin", express.static(
    ADMIN_PATH,
    {
        index: false,
        setHeaders: setAdminHeaders
    }
));
app.use(express.static(
    PUBLIC_PATH,
    {
        setHeaders: setStaticHeaders
    }
));

app.use(function (error, req, res, next) {

    let status = 500;
    let message = "Interner Gateway-Fehler";


    if (error && error.type === "entity.too.large") {
        status = 413;
        message = "Anfrage ist zu groß";
    } else if (
        error &&
        error.status === 400 &&
        error instanceof SyntaxError
    ) {
        status = 400;
        message = "Ungültiges JSON";
    }


    logger[status >= 500 ? "error" : "warn"](
        "request_failed",
        {
            method: req.method,
            path: req.path,
            status: status,
            error_type:
                error && error.type
                    ? error.type
                    : error && error.name
                        ? error.name
                        : "unknown"
        }
    );


    if (res.headersSent) {
        return next(error);
    }


    return res.status(status).json({
        error: message
    });

});


const server = app.listen(
    PORT,
    BIND_ADDRESS,
    function () {

        logger.info("server_started", {
            port: Number(PORT),
            runtime_mode: runtimeMode
        });

    }
);


let shuttingDown = false;


function shutdown(signal) {

    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    logger.info("server_stopping", {
        signal: signal
    });

    const forceTimer = setTimeout(function () {
        logger.error("server_shutdown_timeout", {});
        process.exit(1);
    }, 10000);

    forceTimer.unref();

    server.close(function () {
        clearTimeout(forceTimer);
        logger.info("server_stopped", {});
        process.exit(0);
    });
}


process.once("SIGTERM", function () {
    shutdown("SIGTERM");
});

process.once("SIGINT", function () {
    shutdown("SIGINT");
});
