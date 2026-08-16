/*
 * Shared ES5 system-dashboard shell.
 */

var SystemDashboard = (function () {

    var refreshTimer = null;
    var refreshIntervalMs = 5000;
    var lastPayload = null;
    var connectionWasUnavailable = false;


    function byId(id) {
        return Legacy.dom.byId(id);
    }


    function setText(id, value) {

        var element = byId(id);

        if (element) {
            element.innerHTML =
                Legacy.html.escape(value);
        }

    }


    function twoDigits(value) {
        return value < 10
            ? "0" + value
            : String(value);
    }


    function updateClock() {

        var now = new Date();
        var weekdays = [
            "Sonntag", "Montag", "Dienstag", "Mittwoch",
            "Donnerstag", "Freitag", "Samstag"
        ];
        var months = [
            "Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember"
        ];

        setText(
            "wallClock",
            twoDigits(now.getHours()) +
                ":" +
                twoDigits(now.getMinutes())
        );

        setText(
            "wallDate",
            weekdays[now.getDay()] +
                ", " +
                now.getDate() +
                ". " +
                months[now.getMonth()]
        );

    }


    function formatTimestamp(value) {

        var date;

        if (!value) {
            return "Noch keine";
        }

        date = new Date(value);

        if (isNaN(date.getTime())) {
            return "Unbekannt";
        }

        return (
            twoDigits(date.getDate()) +
            "." +
            twoDigits(date.getMonth() + 1) +
            ". " +
            twoDigits(date.getHours()) +
            ":" +
            twoDigits(date.getMinutes())
        );

    }


    function setConnection(state, label) {

        var badge = byId("connectionBadge");

        if (badge) {
            badge.className =
                "connection-badge is-" + state;
        }

        setText("connectionLabel", label);

    }


    function setMessage(message, state) {

        var element = byId("systemMessage");

        if (!element) {
            return;
        }

        element.className =
            "system-message" +
            (state ? " is-" + state : "");

        element.innerHTML =
            Legacy.html.escape(message);

    }


    function setBanner(message, state) {

        var banner = byId("networkBanner");

        if (!banner) {
            return;
        }

        banner.className =
            "network-banner" +
            (state ? " is-visible is-" + state : "");

        banner.innerHTML =
            Legacy.html.escape(message || "");

    }


    function renderPayload(payload, emptyMessage) {

        var meta = payload && payload.meta
            ? payload.meta
            : {};

        var homeAssistant =
            meta.home_assistant || {};

        var reachable =
            homeAssistant.reachable === true;

        var stale = meta.stale === true;

        var sources = meta.sources || {};
        var metadataPartial = false;
        var sourceName;

        for (sourceName in sources) {
            if (
                Object.prototype.hasOwnProperty.call(sources, sourceName) &&
                sourceName !== "states" &&
                sources[sourceName] &&
                sources[sourceName].supported !== false &&
                sources[sourceName].ok !== true
            ) {
                metadataPartial = true;
            }
        }


        lastPayload = payload;

        setText(
            "entityCount",
            typeof meta.entity_count === "number"
                ? String(meta.entity_count)
                : "–"
        );

        setText(
            "lastSuccessfulUpdate",
            formatTimestamp(
                meta.last_successful_update
            )
        );

        setText(
            "updated",
            "Erfasst: " +
                formatTimestamp(meta.collected_at)
        );


        if (reachable && !stale) {

            var recovered = connectionWasUnavailable;

            setConnection("online", "Home Assistant online");
            setText("homeAssistantState", "Online");

            if (connectionWasUnavailable) {
                setBanner("Verbindung wiederhergestellt.", "success");
                setMessage(
                    "Verbindung wiederhergestellt. " + emptyMessage,
                    "recovered"
                );
            } else if (metadataPartial) {
                setBanner(
                    "Metadaten teilweise verfügbar. Zustandsdaten bleiben aktuell.",
                    "warning"
                );
                setMessage(emptyMessage, "");
            } else {
                setBanner("", "");
                setMessage(emptyMessage, "");
            }

            connectionWasUnavailable = false;
            return recovered
                ? "recovered"
                : "online";

        }


        connectionWasUnavailable = true;
        setConnection("offline", "Home Assistant offline");
        setText("homeAssistantState", "Offline");

        if (stale && meta.last_successful_update) {
            setBanner(
                "Home Assistant ist nicht erreichbar. Letzte Systemdaten bleiben sichtbar.",
                "warning"
            );
            setMessage(
                "Veraltete Systemdaten vom " +
                    formatTimestamp(meta.last_successful_update) +
                    ". " +
                    emptyMessage,
                "stale"
            );
            return "stale";
        }

        setBanner(
            "Home Assistant ist nicht erreichbar.",
            "error"
        );
        setMessage(
            "Noch keine Systemdaten verfügbar.",
            "offline"
        );

        return "offline";

    }


    function renderGatewayError(details) {

        connectionWasUnavailable = true;
        setConnection("offline", "Gateway offline");
        setBanner(
            details && details.message
                ? details.message
                : "Gateway nicht erreichbar.",
            "error"
        );

        if (!lastPayload) {
            setText("homeAssistantState", "Unbekannt");
            setMessage(
                "Gateway nicht erreichbar. Noch keine Systemdaten verfügbar.",
                "offline"
            );
        }

    }


    function scheduleRefresh(load) {

        if (refreshTimer) {
            window.clearTimeout(refreshTimer);
        }

        refreshTimer = window.setTimeout(
            load,
            refreshIntervalMs
        );

    }


    function start(settings) {

        var themeButton = byId("themeButton");
        var activeNavigation = byId(
            settings.kind === "summary"
                ? "summaryNavigation"
                : "errorsNavigation"
        );


        Theme.load();

        if (themeButton) {
            themeButton.onclick = function () {
                Theme.toggle();
            };
        }

        if (activeNavigation) {
            activeNavigation.className = "is-active";
            activeNavigation.setAttribute("aria-current", "page");
        }

        setText("systemTitle", settings.title);
        setText("systemCardTitle", settings.title);
        document.title =
            "HA Legacy Dashboard – " + settings.title;

        updateClock();
        window.setInterval(updateClock, 30000);


        function load() {

            Legacy.http.get(
                settings.endpoint,
                function (payload) {
                    var connectionState = renderPayload(
                        payload,
                        settings.emptyMessage
                    );

                    if (typeof settings.render === "function") {
                        settings.render(payload, connectionState);
                    }

                    scheduleRefresh(load);
                },
                function (details) {
                    renderGatewayError(details);
                    scheduleRefresh(load);
                }
            );

        }


        load();

    }


    return {
        byId: byId,
        setText: setText,
        setMessage: setMessage,
        formatTimestamp: formatTimestamp,
        start: start
    };

}());
