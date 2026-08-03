require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRoutes = require("./routes/api");
const logger = require("./services/logger");
const app = express();

const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = path.join(__dirname, "public");


function setStaticHeaders(res, filePath) {

    if (
        /index\.html$/.test(filePath) ||
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


app.disable("x-powered-by");
app.use(setSecurityHeaders);
app.use(express.json({
    limit: "16kb",
    strict: true
}));
app.use("/api", setApiHeaders, apiRoutes);
app.use("/api", function (req, res) {

    res.status(404).json({
        error: "API-Endpunkt nicht gefunden"
    });

});
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


app.listen(PORT, function () {

    logger.info("server_started", {
        port: Number(PORT)
    });

});
