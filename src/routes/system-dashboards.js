const express = require("express");

const DashboardConfig = require("../config/dashboard");
const Issues = require("../services/issues/engine");
const Snapshot = require("../services/system/snapshot");
const System = require("../services/system");
const Summary = require("../services/summary/engine");
const logger = require("../services/logger");

const router = express.Router();


async function loadSnapshot(res, transform) {

    try {

        const snapshot = await System.getSnapshot();

        return res.json(transform(snapshot));

    } catch (error) {

        logger.error(
            "system_dashboard_request_failed",
            {
                error_type:
                    error && error.name
                        ? error.name
                        : "unknown"
            }
        );

        return res.status(503).json({
            error: "system_snapshot_unavailable"
        });

    }

}


router.get("/status", async function (req, res) {

    return loadSnapshot(
        res,
        function (snapshot) {

            const meta =
                Snapshot.toPublicMeta(snapshot);

            return {
                status:
                    meta.home_assistant.reachable
                        ? "online"
                        : "offline",
                cache_ttl_ms:
                    System.CACHE_TTL_MS,
                meta: meta
            };

        }
    );

});


router.get("/summary", async function (req, res) {

    return loadSnapshot(
        res,
        function (snapshot) {
            return Summary.buildSummary(
                snapshot,
                DashboardConfig.getSummaryConfiguration()
            );
        }
    );

});


router.get("/errors", async function (req, res) {

    return loadSnapshot(
        res,
        function (snapshot) {
            return Issues.buildIssues(
                snapshot,
                DashboardConfig.getErrorsConfiguration()
            );
        }
    );

});


router.use(function (req, res) {
    return res.status(404).json({
        error: "system_dashboard_not_found"
    });
});


module.exports = router;
