/*
 * Shared system-dashboard navigation for legacy wall displays.
 *
 * The browser only accepts internal dashboard paths. The server performs the
 * authoritative dashboard-existence check before serving a return target.
 */

var SystemNavigation = (function () {

    var DASHBOARD_PATH_PATTERN =
        /^\/d\/[a-z0-9][a-z0-9-]{0,62}\/?$/;

    var requestActive = false;
    var lastHealthPayload = null;
    var lastHealthSignature = "";
    var hasKnownHealth = false;


    function byId(id) {

        return Legacy.dom.byId(id);

    }


    function validateDashboardPath(pathname) {

        if (pathname === "/") {
            return pathname;
        }

        if (
            typeof pathname === "string" &&
            DASHBOARD_PATH_PATTERN.test(pathname)
        ) {
            return pathname;
        }

        return null;

    }


    function queryValue(name, search) {

        var query = String(search || "");
        var parts;
        var pair;
        var index;
        var key;


        if (query.charAt(0) === "?") {
            query = query.substring(1);
        }


        if (!query) {
            return null;
        }


        parts = query.split("&");

        for (index = 0; index < parts.length; index++) {

            pair = parts[index].split("=");

            try {
                key = decodeURIComponent(
                    String(pair.shift() || "").replace(/\+/g, " ")
                );

                if (key === name) {
                    return decodeURIComponent(
                        pair.join("=").replace(/\+/g, " ")
                    );
                }
            } catch (error) {
                return null;
            }

        }


        return null;

    }


    function returnContext() {

        var raw = queryValue(
            "returnTo",
            window.location && window.location.search
        );

        var target =
            validateDashboardPath(raw);


        return {
            explicit: target !== null,
            target: target || "/"
        };

    }


    function systemUrl(pathname, returnTarget) {

        var target =
            validateDashboardPath(returnTarget) || "/";


        return pathname +
            "?returnTo=" +
            encodeURIComponent(target);

    }


    function setLink(id, href) {

        var link = byId(id);

        if (link) {
            link.href = href;
            link.setAttribute("href", href);
        }

    }


    function count(value) {

        var parsed = Number(value);

        return isFinite(parsed) && parsed > 0
            ? Math.floor(parsed)
            : 0;

    }


    function severityFromCounts(errors) {

        if (count(errors.critical) > 0) {
            return "critical";
        }

        if (count(errors.error) > 0) {
            return "error";
        }

        if (count(errors.warning) > 0) {
            return "warning";
        }

        if (count(errors.info) > 0) {
            return "info";
        }

        return "none";

    }


    function healthLabel(severity, relevant, freshness) {

        var problemText = relevant === 1
            ? "1 aktuelles Problem"
            : relevant + " aktuelle Probleme";

        var severityText = {
            warning: "Warnung",
            error: "Fehler",
            critical: "Kritischer Systemstatus"
        }[severity] || "Systemstatus";


        if (freshness === "unknown") {
            return "Systemstatus unbekannt öffnen";
        }

        if (freshness === "stale") {
            return relevant > 0
                ? severityText + ": " + problemText +
                    "; Status nicht aktuell – Systemstatus öffnen"
                : "Systemstatus nicht aktuell öffnen";
        }

        return severityText + ": " +
            problemText + " öffnen";

    }


    function renderHealth(payload, forceStale) {

        var link = byId("systemHealthLink");
        var symbol = byId("systemHealthSymbol");
        var freshnessSymbol = byId("systemHealthFreshness");
        var meta = payload && payload.meta
            ? payload.meta
            : {};
        var homeAssistant = meta.home_assistant || {};
        var errors = payload && payload.errors
            ? payload.errors
            : {};
        var severity = severityFromCounts(errors);
        var relevant =
            count(errors.critical) +
            count(errors.error) +
            count(errors.warning);
        var fresh =
            forceStale !== true &&
            meta.stale !== true &&
            homeAssistant.reachable === true;
        var freshness = fresh
            ? "fresh"
            : meta.last_successful_update || hasKnownHealth
                ? "stale"
                : "unknown";
        var hidden = fresh && relevant === 0;
        var visualSeverity = relevant > 0
            ? severity
            : freshness;
        var label = healthLabel(
            severity,
            relevant,
            freshness
        );
        var signature = [
            hidden ? "hidden" : "visible",
            visualSeverity,
            freshness,
            relevant,
            label
        ].join("|");


        if (!link || signature === lastHealthSignature) {
            return;
        }


        lastHealthSignature = signature;
        link.hidden = hidden;

        if (hidden) {
            link.className = "system-health-link";
            return;
        }


        link.className =
            "system-health-link is-" +
            visualSeverity +
            (freshness === "stale" ? " is-stale" : "");

        link.setAttribute("aria-label", label);
        link.setAttribute("title", label);

        if (symbol) {
            symbol.innerHTML = relevant > 0 ? "!" : "?";
        }

        if (freshnessSymbol) {
            freshnessSymbol.hidden =
                freshness !== "stale" || relevant === 0;
        }

    }


    function refreshHealth() {

        if (requestActive) {
            return;
        }


        requestActive = true;

        Legacy.http.get(
            "/api/system-dashboards/status",
            function (payload) {
                requestActive = false;
                renderHealth(payload, false);
                lastHealthPayload = payload;
                hasKnownHealth = Boolean(
                    payload &&
                    payload.meta &&
                    (
                        payload.meta.last_successful_update ||
                        (
                            payload.meta.stale !== true &&
                            payload.meta.home_assistant &&
                            payload.meta.home_assistant.reachable === true
                        )
                    )
                );
            },
            function () {
                requestActive = false;
                renderHealth(lastHealthPayload, true);
            }
        );

    }


    function markUnavailable() {

        renderHealth(lastHealthPayload, true);

    }


    function safeHistoryTarget() {

        var referrer = String(document.referrer || "");
        var location = window.location || {};
        var origin = String(location.protocol || "") +
            "//" + String(location.host || "");
        var path;


        if (
            !referrer ||
            !location.protocol ||
            !location.host ||
            referrer.indexOf(origin) !== 0
        ) {
            return null;
        }


        path = referrer.substring(origin.length).split(/[?#]/)[0];

        return validateDashboardPath(path);

    }


    function initializeDashboard() {

        var currentPath =
            validateDashboardPath(
                window.location && window.location.pathname
            ) || "/";


        setLink(
            "systemSummaryLink",
            systemUrl("/system/summary", currentPath)
        );

        setLink(
            "systemHealthLink",
            systemUrl("/system/errors", currentPath)
        );

        renderHealth(null, true);

    }


    function initializeSystemPage() {

        var context = returnContext();
        var historyTarget = safeHistoryTarget();
        var back = byId("dashboardReturnNavigation");


        setLink(
            "summaryNavigation",
            systemUrl("/system/summary", context.target)
        );

        setLink(
            "errorsNavigation",
            systemUrl("/system/errors", context.target)
        );

        setLink(
            "dashboardReturnNavigation",
            context.target
        );


        if (back && !context.explicit && historyTarget) {
            back.onclick = function (event) {

                if (event && event.preventDefault) {
                    event.preventDefault();
                }

                if (
                    window.history &&
                    typeof window.history.back === "function"
                ) {
                    window.history.back();
                    return false;
                }

                window.location.href = "/";
                return false;

            };
        }


        return context.target;

    }


    return {
        initializeDashboard: initializeDashboard,
        initializeSystemPage: initializeSystemPage,
        markUnavailable: markUnavailable,
        refreshHealth: refreshHealth,
        renderHealth: renderHealth,
        returnContext: returnContext,
        systemUrl: systemUrl,
        validateDashboardPath: validateDashboardPath
    };

}());
