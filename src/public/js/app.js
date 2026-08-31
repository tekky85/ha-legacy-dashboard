/*
 * HA Legacy Dashboard application.
 */


/* =========================================================
   THEME
   ========================================================= */

Theme.load();


var themeButton =

    Legacy.dom.byId(
        "themeButton"
    );


if (themeButton) {

    themeButton.onclick =

        function () {

            Theme.toggle();

        };

}


/* =========================================================
   WIDGET CONFIGURATION
   ========================================================= */

var dashboardConfigured =
    false;

var dashboardConfigurationLoading =
    false;

var dashboardHasData =
    false;

var lastSuccessfulRefreshText =
    "";


function getDashboardIdFromPath(pathname) {

    var match =
        /^\/d\/([a-z0-9][a-z0-9-]{0,62})\/?$/.exec(
            pathname || ""
        );

    return match
        ? match[1]
        : null;

}


var dashboardId =
    getDashboardIdFromPath(
        window.location &&
        window.location.pathname
    );

var dashboardConfigurationUrl =

    dashboardId

        ? "/api/dashboards/" +
            encodeURIComponent(dashboardId) +
            "/config"

        : "/api/dashboard/config";

var dashboardStateUrl =

    dashboardId

        ? "/api/dashboards/" +
            encodeURIComponent(dashboardId) +
            "/state"

        : "/api/dashboard";


function applyDashboardViewportHeight() {

    var appElement =
        document.getElementsByClassName("app")[0];

    var viewportHeight =
        window.innerHeight ||
        (
            document.documentElement
                ? document.documentElement.clientHeight
                : 0
        ) ||
        0;


    if (appElement && viewportHeight > 0) {
        appElement.style.minHeight =
            viewportHeight + "px";
    }

}


function applyDashboardAppearance(data) {

    var body = document.body;

    var header =
        document.getElementsByClassName(
            "app-header"
        )[0];

    var overlay =
        Legacy.dom.byId(
            "dashboardBackgroundOverlay"
        );

    var background =
        data && data.background
            ? data.background
            : null;

    var allowedPositions = [
        "center center",
        "center top",
        "center bottom",
        "left center",
        "right center"
    ];

    var allowedSizes = [
        "cover",
        "contain"
    ];


    if (body && !body.style) {
        body.style = {};
    }


    if (header) {
        if (data && data.show_title === false) {
            addClass(header, "is-title-hidden");
        } else {
            removeClass(header, "is-title-hidden");
        }
    }

    if (
        !body ||
        !background ||
        typeof background.image_url !== "string" ||
        background.image_url.indexOf(
            "/assets/backgrounds/bg-"
        ) !== 0 ||
        allowedPositions.indexOf(
            background.position
        ) === -1 ||
        allowedSizes.indexOf(
            background.size
        ) === -1
    ) {
        if (body) {
            body.style.backgroundImage = "none";
            body.style.backgroundPosition = "";
            body.style.backgroundSize = "";
            body.style.backgroundRepeat = "";
        }

        if (overlay) {
            overlay.setAttribute("hidden", "hidden");
            overlay.style.opacity = "0";
        }

        return;
    }


    body.style.backgroundImage =
        "url(\"" + background.image_url + "\")";
    body.style.backgroundPosition =
        background.position;
    body.style.backgroundSize = background.size;
    body.style.backgroundRepeat = "no-repeat";

    if (overlay) {
        overlay.style.opacity =
            String(
                Math.max(
                    0,
                    Math.min(
                        50,
                        Number(background.overlay) || 0
                    )
                ) / 100
            );
        overlay.removeAttribute("hidden");
    }

}


applyDashboardViewportHeight();


if (typeof SystemNavigation !== "undefined") {
    SystemNavigation.initializeDashboard();
}


/* =========================================================
   HELPERS
   ========================================================= */

var climateRequestActive =
    false;

var dashboardRefreshBlockedUntil =
    0;

var pendingClimateUpdate =
    null;

var climateUpdateTimer =
    null;

var climateUpdateDelay =
    500;

var lightRequestActive =
    false;

var climatePowerRequestActive =
    false;

var pendingLightUpdate =
    null;

var dashboardRefreshIntervalMs =
    5000;

var dashboardRefreshTimer =
    null;


function twoDigits(value) {

    return value < 10

        ? "0" + value

        : String(value);

}


function updateWallClock() {

    var clock =

        Legacy.dom.byId(
            "wallClock"
        );


    var date =

        Legacy.dom.byId(
            "wallDate"
        );


    var now =
        new Date();


    var weekdays = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
    ];


    var months = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ];


    if (clock) {

        clock.innerHTML =

            twoDigits(
                now.getHours()
            ) +
            ":" +
            twoDigits(
                now.getMinutes()
            );

    }


    if (date) {

        date.innerHTML =

            weekdays[now.getDay()] +
            ", " +
            now.getDate() +
            ". " +
            months[now.getMonth()];

    }

}


function setConnectionDisplay(
    state,
    label,
    message
) {

    var badge =

        Legacy.dom.byId(
            "connectionBadge"
        );


    var labelElement =

        Legacy.dom.byId(
            "connectionLabel"
        );


    var banner =

        Legacy.dom.byId(
            "networkBanner"
        );


    if (
        state !== "online" &&
        state !== "degraded" &&
        state !== "offline"
    ) {

        state = "connecting";

    }


    if (badge) {

        badge.className =
            "connection-badge is-" + state;

    }


    if (labelElement) {

        labelElement.innerHTML =
            Legacy.html.escape(label);

    }


    if (banner) {

        banner.className =

            message

                ? "network-banner is-visible is-" +
                    state

                : "network-banner";


        banner.innerHTML =

            message

                ? Legacy.html.escape(message)

                : "";

    }

}


function normalizeRefreshInterval(value) {

    var parsed =
        Number(value);


    if (
        !isFinite(parsed) ||
        parsed < 3000 ||
        parsed > 300000
    ) {

        return 5000;

    }


    return Math.round(parsed);

}


function startDashboardRefreshTimer() {

    if (
        dashboardRefreshTimer !== null &&
        window.clearInterval
    ) {

        window.clearInterval(
            dashboardRefreshTimer
        );

    }


    dashboardRefreshTimer =

        window.setInterval(

            loadDashboard,

            dashboardRefreshIntervalMs

        );

}

function hasClass(
    element,
    className
) {

    if (!element || !element.className) {

        return false;

    }

    return (

        (" " + element.className + " ")
            .indexOf(
                " " + className + " "
            ) !== -1

    );

}


function addClass(
    element,
    className
) {

    if (

        element &&

        !hasClass(
            element,
            className
        )

    ) {

        element.className +=

            element.className

                ? " " + className

                : className;

    }

}


function removeClass(
    element,
    className
) {

    if (!element || !element.className) {

        return;

    }

    element.className =

        (" " + element.className + " ")

            .replace(

                " " + className + " ",

                " "

            )

            .replace(

                /^\s+|\s+$/g,

                ""

            );

}


function decimalPlaces(value) {

    var text =
        String(value);

    var position =
        text.indexOf(".");

    if (position === -1) {

        return 0;

    }

    return text.length - position - 1;

}


function normalizeTemperature(
    value,
    minimum,
    step
) {

    var places = Math.max(

        decimalPlaces(step),

        decimalPlaces(minimum)

    );

    var normalized =

        minimum +

        Math.round(

            (value - minimum) /
            step

        ) * step;

    return parseFloat(

        normalized.toFixed(
            places
        )

    );

}


function updateClimateTargetDisplay(
    entityId,
    temperature,
    step
) {

    if (
        typeof Dashboard !== "undefined" &&
        typeof Dashboard.updateEntityAttribute === "function"
    ) {
        Dashboard.updateEntityAttribute(
            entityId,
            "temperature",
            temperature
        );
    }

    var buttons =

        document.getElementsByClassName(

            "climate-control"

        );


    var card = null;

    var display = null;

    var currentElement = null;

    var decimals = Math.max(

        1,

        decimalPlaces(step)

    );


    var index;


    /*
     * Neuen Zielwert in beiden Buttons speichern.
     * Dadurch funktioniert der nächste Plus-/Minus-
     * Klick bereits mit dem neuen Wert.
     */

    for (

        index = 0;

        index < buttons.length;

        index++

    ) {

        if (

            buttons[index].getAttribute(
                "data-entity"
            ) === entityId

        ) {

            buttons[index].setAttribute(

                "data-target",

                String(temperature)

            );


            if (!card) {

                currentElement =
                    buttons[index];


                while (

                    currentElement &&

                    currentElement !==
                        document.body

                ) {

                    if (

                        hasClass(

                            currentElement,

                            "card-climate"

                        )

                    ) {

                        card =
                            currentElement;

                        break;

                    }


                    currentElement =

                        currentElement.parentNode;

                }

            }

        }

    }


    if (!card) {

        if (
            typeof Dashboard !== "undefined" &&
            typeof Dashboard.render === "function" &&
            Dashboard.states
        ) {
            Dashboard.render(
                Dashboard.states
            );
        }

        return;

    }


    display =

        card.getElementsByClassName(

            "climate-target-value"

        )[0];


    if (!display) {

        return;

    }


    display.innerHTML =

        Legacy.html.escape(

            Number(temperature).toFixed(
                decimals
            )

        ) +

        "<small>°C</small>";


    if (typeof LegacyFocus !== "undefined") {
        LegacyFocus.refresh();
    }

}

/* =========================================================
   CLIMATE CONTROL
   ========================================================= */

function climateUpdateInProgress() {

    return (

        climateRequestActive ||

        pendingClimateUpdate !== null ||

        climateUpdateTimer !== null

    );

}


function scheduleClimateTemperatureUpdate() {

    if (climateUpdateTimer !== null) {

        window.clearTimeout(
            climateUpdateTimer
        );

    }


    climateUpdateTimer =

        window.setTimeout(

            function () {

                climateUpdateTimer =
                    null;

                sendPendingClimateTemperature();

            },

            climateUpdateDelay

        );

}


function sendPendingClimateTemperature() {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    var update;


    if (

        climateRequestActive ||

        pendingClimateUpdate === null

    ) {

        return;

    }


    update =
        pendingClimateUpdate;

    pendingClimateUpdate =
        null;

    climateRequestActive =
        true;


    Legacy.http.post(

        "/api/climate/temperature",

        {

            entity_id:
                update.entityId,

            temperature:
                update.temperature

        },

        function (response) {

            var acceptedTemperature =
                update.temperature;


            climateRequestActive =
                false;


            if (pendingClimateUpdate !== null) {

                scheduleClimateTemperatureUpdate();

                return;

            }


            if (

                response &&

                typeof response.temperature ===
                    "number" &&

                isFinite(
                    response.temperature
                )

            ) {

                acceptedTemperature =
                    response.temperature;

            }


            dashboardRefreshBlockedUntil =

                new Date().getTime() +
                5000;


            updateClimateTargetDisplay(

                update.entityId,

                acceptedTemperature,

                update.step

            );


            if (status) {

                status.innerHTML =

                    "Zieltemperatur wurde gesetzt";

            }


            window.setTimeout(

                loadDashboard,

                5000

            );

        },

        function (error) {

            climateRequestActive =
                false;

            pendingClimateUpdate =
                null;


            if (climateUpdateTimer !== null) {

                window.clearTimeout(
                    climateUpdateTimer
                );

                climateUpdateTimer =
                    null;

            }


            dashboardRefreshBlockedUntil =

                new Date().getTime() +
                3000;


            if (status) {

                status.innerHTML =

                    "Fehler: " +

                    (
                        error &&
                        error.message

                            ? error.message

                            : "Befehl fehlgeschlagen"
                    );

            }


            window.setTimeout(

                loadDashboard,

                3000

            );

        }

    );

}

function setClimateTemperature(
    button
) {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    var entityId =

        button.getAttribute(
            "data-entity"
        );


    var direction =

        parseFloat(

            button.getAttribute(
                "data-direction"
            )

        );


    var target =

        parseFloat(

            button.getAttribute(
                "data-target"
            )

        );


    var step =

        parseFloat(

            button.getAttribute(
                "data-step"
            )

        );


    var minimum =

        parseFloat(

            button.getAttribute(
                "data-min"
            )

        );


    var maximum =

        parseFloat(

            button.getAttribute(
                "data-max"
            )

        );


    var nextTemperature;

    var displayDecimals;


    if (

        button.disabled ||
        climatePowerRequestActive

    ) {

        return;

    }


    if (

        !entityId ||

        isNaN(direction) ||

        isNaN(target) ||

        isNaN(step) ||

        isNaN(minimum) ||

        isNaN(maximum)

    ) {

        if (status) {

            status.innerHTML =

                "Thermostat-Daten sind ungültig";

        }

        return;

    }


    nextTemperature =

        normalizeTemperature(

            target +
            direction * step,

            minimum,

            step

        );


    if (nextTemperature < minimum) {

        nextTemperature =
            minimum;

    }


    if (nextTemperature > maximum) {

        nextTemperature =
            maximum;

    }


    displayDecimals = Math.max(

        1,

        decimalPlaces(step)

    );


    updateClimateTargetDisplay(

        entityId,

        nextTemperature,

        step

    );


    pendingClimateUpdate = {

        entityId:
            entityId,

        temperature:
            nextTemperature,

        step:
            step

    };


    dashboardRefreshBlockedUntil =

        new Date().getTime() +
        5000;


    if (status) {

        status.innerHTML =

            "Zieltemperatur " +

            nextTemperature.toFixed(
                displayDecimals
            ) +

            " °C wird gespeichert …";

    }


    if (!climateRequestActive) {

        scheduleClimateTemperatureUpdate();

    }

}


/* =========================================================
   LIGHT CONTROL
   ========================================================= */

function lightUpdateInProgress() {

    return (

        lightRequestActive ||

        pendingLightUpdate !== null

    );

}


function dashboardControlUpdateInProgress() {

    return (

        climateUpdateInProgress() ||

        lightUpdateInProgress() ||

        climatePowerRequestActive

    );

}


function updateLightDisplay(
    entityId,
    state
) {

    if (
        typeof Dashboard !== "undefined" &&
        typeof Dashboard.updateEntityState === "function"
    ) {
        Dashboard.updateEntityState(
            entityId,
            state
        );
    }

    var buttons =

        document.getElementsByClassName(

            "light-control"

        );


    var available =

        state === "on" ||
        state === "off";


    var isOn =
        state === "on";


    var stateClass =

        available

            ? isOn

                ? "on"

                : "off"

            : "neutral";


    var stateText =

        available

            ? isOn

                ? "An"

                : "Aus"

            : "Nicht verfügbar";


    var controlText =

        available

            ? isOn

                ? "Ausschalten"

                : "Einschalten"

            : "Nicht verfügbar";


    var card = null;
    var currentElement;
    var icon;
    var label;
    var stateBadge;
    var index;


    for (

        index = 0;

        index < buttons.length;

        index++

    ) {

        if (

            buttons[index].getAttribute(
                "data-entity"
            ) !== entityId

        ) {

            continue;

        }


        buttons[index].setAttribute(
            "data-state",
            state
        );

        buttons[index].setAttribute(
            "data-available",
            available
                ? "true"
                : "false"
        );

        buttons[index].setAttribute(
            "aria-pressed",
            isOn
                ? "true"
                : "false"
        );

        buttons[index].setAttribute(
            "aria-label",
            controlText
        );

        buttons[index].className =
            "dashboard-control dashboard-control-power " +
            "dashboard-power-control light-control is-" +
            (available ? stateClass : "unavailable") +
            (available ? "" : " is-disabled");

        buttons[index].disabled =
            !available;


        if (!card) {

            currentElement =
                buttons[index];


            while (

                currentElement &&

                currentElement !==
                    document.body

            ) {

                if (

                    hasClass(

                        currentElement,

                        "card-light"

                    )

                ) {

                    card =
                        currentElement;

                    break;

                }


                currentElement =
                    currentElement.parentNode;

            }

        }

    }


    if (!card) {

        return;

    }


    icon =

        card.getElementsByClassName(
            "icon"
        )[0];


    stateBadge =

        card.getElementsByClassName(
            "light-state"
        )[0];


    label =

        card.getElementsByClassName(
            "dashboard-power-label"
        )[0];


    if (icon) {

        icon.className =
            "icon light " +
            stateClass;

    }


    if (stateBadge) {

        stateBadge.className =
            "light-state light-state-" +
            stateClass;

        stateBadge.innerHTML =
            Legacy.html.escape(
                stateText
            );

    }


    if (label) {

        label.innerHTML =
            Legacy.html.escape(
                controlText
            );

    }


    if (typeof LegacyFocus !== "undefined") {
        LegacyFocus.refresh();
    }

}


function sendPendingLightState() {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    var update;


    if (

        lightRequestActive ||

        pendingLightUpdate === null

    ) {

        return;

    }


    update =
        pendingLightUpdate;

    pendingLightUpdate =
        null;

    lightRequestActive =
        true;


    Legacy.http.post(

        "/api/light/state",

        {

            entity_id:
                update.entityId,

            state:
                update.state

        },

        function () {

            lightRequestActive =
                false;


            if (

                pendingLightUpdate !== null &&

                pendingLightUpdate.entityId ===
                    update.entityId &&

                pendingLightUpdate.state ===
                    update.state

            ) {

                pendingLightUpdate =
                    null;

            }


            if (pendingLightUpdate !== null) {

                sendPendingLightState();

                return;

            }


            dashboardRefreshBlockedUntil =

                new Date().getTime() +
                1500;


            if (status) {

                status.innerHTML =

                    update.state === "on"

                        ? "Licht wurde eingeschaltet"

                        : "Licht wurde ausgeschaltet";

            }


            window.setTimeout(

                loadDashboard,

                1500

            );

        },

        function (error) {

            lightRequestActive =
                false;

            pendingLightUpdate =
                null;


            dashboardRefreshBlockedUntil =

                new Date().getTime() +
                1000;


            if (status) {

                status.innerHTML =

                    "Fehler: " +

                    (
                        error &&
                        error.message

                            ? error.message

                            : "Befehl fehlgeschlagen"
                    );

            }


            window.setTimeout(

                loadDashboard,

                1000

            );

        }

    );

}


function setLightState(button) {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    var entityId =

        button.getAttribute(
            "data-entity"
        );


    var currentState =

        button.getAttribute(
            "data-state"
        );


    var available =

        button.getAttribute(
            "data-available"
        ) === "true";


    var nextState;


    if (

        button.disabled ||
        !available ||
        !entityId ||

        (
            currentState !== "on" &&
            currentState !== "off"
        )

    ) {

        return;

    }


    nextState =

        currentState === "on"

            ? "off"

            : "on";


    updateLightDisplay(

        entityId,

        nextState

    );


    pendingLightUpdate = {

        entityId:
            entityId,

        state:
            nextState

    };


    dashboardRefreshBlockedUntil =

        new Date().getTime() +
        3000;


    if (status) {

        status.innerHTML =

            nextState === "on"

                ? "Licht wird eingeschaltet …"

                : "Licht wird ausgeschaltet …";

    }


    if (!lightRequestActive) {

        sendPendingLightState();

    }

}


/* =========================================================
   CLIMATE POWER AND FOCUS INTERACTIONS
   ========================================================= */

function setClimatePowerState(button) {

    var status = Legacy.dom.byId("updated");
    var entityId = button.getAttribute("data-entity");
    var currentState = button.getAttribute("data-state");
    var available =
        button.getAttribute("data-available") === "true";
    var nextState;
    var buttons;
    var index;


    if (
        climatePowerRequestActive ||
        climateUpdateInProgress() ||
        button.disabled ||
        !available ||
        !entityId ||
        (currentState !== "on" && currentState !== "off")
    ) {
        return;
    }

    nextState = currentState === "on" ? "off" : "on";
    climatePowerRequestActive = true;
    dashboardRefreshBlockedUntil =
        new Date().getTime() + 3000;

    buttons = document.getElementsByTagName("button");

    for (index = 0; index < buttons.length; index++) {
        if (
            (
                hasClass(buttons[index], "climate-power-control") ||
                hasClass(buttons[index], "focus-climate-power-control")
            ) &&
            buttons[index].getAttribute("data-entity") === entityId
        ) {
            buttons[index].disabled = true;
            addClass(buttons[index], "is-busy");
        }
    }

    if (status) {
        status.innerHTML = nextState === "on"
            ? "Thermostat wird eingeschaltet …"
            : "Thermostat wird ausgeschaltet …";
    }

    Legacy.http.post(
        "/api/climate/power",
        {
            entity: entityId,
            state: nextState
        },
        function () {
            climatePowerRequestActive = false;
            dashboardRefreshBlockedUntil =
                new Date().getTime() + 1200;

            if (status) {
                status.innerHTML = nextState === "on"
                    ? "Thermostat wurde eingeschaltet"
                    : "Thermostat wurde ausgeschaltet";
            }

            window.setTimeout(loadDashboard, 1200);
        },
        function (error) {
            climatePowerRequestActive = false;
            dashboardRefreshBlockedUntil =
                new Date().getTime() + 1000;

            if (status) {
                status.innerHTML =
                    "Fehler: " +
                    (error && error.message
                        ? error.message
                        : "Befehl fehlgeschlagen");
            }

            window.setTimeout(loadDashboard, 1000);
        }
    );

}


function disableDashboardControls() {

    var controls = document.getElementsByTagName("button");
    var index;


    if (
        typeof Dashboard !== "undefined" &&
        typeof Dashboard.setControlsDisabled === "function"
    ) {
        Dashboard.setControlsDisabled(true);
    }


    for (index = 0; index < controls.length; index++) {
        if (
            hasClass(controls[index], "light-control") ||
            hasClass(controls[index], "climate-control") ||
            hasClass(controls[index], "climate-power-control") ||
            hasClass(controls[index], "focus-light-control") ||
            hasClass(controls[index], "focus-climate-control") ||
            hasClass(controls[index], "focus-climate-power-control")
        ) {
            controls[index].disabled = true;
        }
    }

    if (typeof LegacyFocus !== "undefined") {
        LegacyFocus.refresh();
    }

}


function handleDashboardInteraction(event, boundary) {

    var currentElement;


    event = event || window.event;
    currentElement = event.target || event.srcElement;


    while (currentElement && currentElement !== boundary) {

        if (
            currentElement.tagName &&
            currentElement.tagName.toLowerCase() === "button"
        ) {

            if (event.preventDefault) {
                event.preventDefault();
            }

            if (event.stopPropagation) {
                event.stopPropagation();
            }

            if (
                hasClass(currentElement, "light-control") ||
                hasClass(currentElement, "focus-light-control")
            ) {
                setLightState(currentElement);
            } else if (
                hasClass(currentElement, "climate-control") ||
                hasClass(currentElement, "focus-climate-control")
            ) {
                setClimateTemperature(currentElement);
            } else if (
                hasClass(currentElement, "climate-power-control") ||
                hasClass(currentElement, "focus-climate-power-control")
            ) {
                setClimatePowerState(currentElement);
            } else if (
                hasClass(currentElement, "room-expand-control") &&
                typeof Dashboard !== "undefined"
            ) {
                Dashboard.toggleRoom(
                    currentElement.getAttribute("data-room-widget") || ""
                );
            }

            return;
        }

        if (
            hasClass(currentElement, "card") &&
            typeof LegacyFocus !== "undefined"
        ) {
            LegacyFocus.open(
                currentElement.getAttribute("data-widget-id") || ""
            );
            return;
        }

        currentElement = currentElement.parentNode;
    }

}


var dashboardElement = Legacy.dom.byId("dashboard");
var focusContentElement = Legacy.dom.byId("focusContent");


if (typeof LegacyFocus !== "undefined") {
    LegacyFocus.initialize(function (widgetId) {
        return Dashboard.getFocusSource(widgetId);
    });
}

if (dashboardElement) {
    dashboardElement.onclick = function (event) {
        handleDashboardInteraction(event, dashboardElement);
    };
}

if (focusContentElement) {
    focusContentElement.onclick = function (event) {
        handleDashboardInteraction(event, focusContentElement);
    };
}


/* =========================================================
   DATA LOADING
   ========================================================= */

function loadDashboardConfiguration() {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    if (dashboardConfigurationLoading) {

        return;

    }


    dashboardConfigurationLoading =
        true;


    setConnectionDisplay(
        "connecting",
        "Verbinde …",
        ""
    );


    if (status) {

        status.innerHTML =
            "Lade Dashboard-Konfiguration …";

    }


    Legacy.http.get(

        dashboardConfigurationUrl,

        function (data) {

            var widgetCount = 0;

            var configuredRefreshInterval =

                normalizeRefreshInterval(

                    data &&
                    data.refresh_interval_ms

                );

            var dashboardTitle =

                data &&
                typeof data.title === "string" &&
                data.title

                    ? data.title

                    : "HA Dashboard";

            var dashboardTitleElement =

                Legacy.dom.byId(
                    "dashboardTitle"
                );


            dashboardConfigurationLoading =
                false;


            applyDashboardAppearance(data);


            if (dashboardTitleElement) {

                dashboardTitleElement.innerHTML =
                    Legacy.html.escape(
                        dashboardTitle
                    );

            }


            document.title =
                dashboardTitle +
                " – HA Dashboard";


            if (
                configuredRefreshInterval !==
                    dashboardRefreshIntervalMs
            ) {

                dashboardRefreshIntervalMs =
                    configuredRefreshInterval;

                startDashboardRefreshTimer();

            }


            if (

                data &&
                data.widgets &&
                data.widgets.length

            ) {

                widgetCount =

                    Dashboard.configure(
                        data.widgets,
                        data.layouts,
                        data.sections
                    );

            }


            if (!widgetCount) {

                dashboardConfigured =
                    false;


                if (status) {

                    status.innerHTML =
                        "Fehler: Keine Dashboard-Konfiguration";

                }


                setConnectionDisplay(
                    "offline",
                    "Konfiguration fehlt",
                    "Dashboard-Konfiguration ist nicht verfügbar."
                );


                return;

            }


            dashboardConfigured =
                true;


            loadDashboard();

        },

        function (error) {

            dashboardConfigurationLoading =
                false;

            dashboardConfigured =
                false;


            if (status) {

                status.innerHTML =

                    "Fehler: " +

                    (
                        error &&
                        error.message

                            ? error.message

                            : "Konfiguration nicht verfügbar"
                    );

            }


            setConnectionDisplay(
                "offline",
                "Gateway offline",
                "Keine Verbindung zum Dashboard-Gateway. Neuer Versuch läuft automatisch."
            );

        }

    );

}


function loadDashboard() {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    var requestStartedAt;


    if (!dashboardConfigured) {

        loadDashboardConfiguration();

        return;

    }


    if (typeof SystemNavigation !== "undefined") {
        SystemNavigation.refreshHealth();
    }


    /*
     * Während und kurz nach einem Steuerbefehl
     * darf der automatische Refresh die Buttons
     * nicht neu erzeugen.
     */

    if (

        dashboardControlUpdateInProgress() ||

        new Date().getTime() <
            dashboardRefreshBlockedUntil

    ) {

        return;

    }


    requestStartedAt =
        new Date().getTime();


    if (status) {

        status.innerHTML =

            "Aktualisiere …";

    }


    Legacy.http.get(

        dashboardStateUrl,

        function (data) {

            var metadata =

                data && data._meta

                    ? data._meta

                    : {};


            var homeAssistantStatus =

                metadata.home_assistant ||
                "online";

            if (

                dashboardControlUpdateInProgress() ||

                requestStartedAt <
                    dashboardRefreshBlockedUntil

            ) {

                return;

            }

            if (homeAssistantStatus === "offline") {

                disableDashboardControls();

                setConnectionDisplay(
                    "offline",
                    "Home Assistant offline",
                    "Home Assistant ist nicht erreichbar. Die letzten Werte bleiben sichtbar."
                );

                if (!dashboardHasData) {

                    Dashboard.render(
                        data
                    );

                    dashboardHasData =
                        true;

                }


                if (status) {

                    addClass(
                        status,
                        "is-stale"
                    );

                    status.innerHTML =

                        "Verbindung unterbrochen" +

                        (
                            lastSuccessfulRefreshText

                                ? " – letzter Erfolg: " +
                                    lastSuccessfulRefreshText

                                : ""
                        );

                }


                return;

            }


            Dashboard.render(
                data
            );

            dashboardHasData =
                true;


            if (status) {

                if (homeAssistantStatus === "degraded") {

                    setConnectionDisplay(
                        "degraded",
                        "Teilweise online",
                        "Einige Home-Assistant-Entitäten sind derzeit nicht erreichbar."
                    );

                    addClass(
                        status,
                        "is-stale"
                    );

                    status.innerHTML =

                        "Teilweise verfügbar" +

                        (
                            lastSuccessfulRefreshText

                                ? " – letzter voller Erfolg: " +
                                    lastSuccessfulRefreshText

                                : ""
                        );

                    return;

                }


                lastSuccessfulRefreshText =

                    new Date()
                        .toLocaleTimeString();


                removeClass(
                    status,
                    "is-stale"
                );

                status.innerHTML =

                    "Aktualisiert: " +

                    lastSuccessfulRefreshText;


                setConnectionDisplay(
                    "online",
                    "Online",
                    ""
                );

            }

        },

        function (error) {

            if (

                dashboardControlUpdateInProgress() ||

                requestStartedAt <
                    dashboardRefreshBlockedUntil

            ) {

                return;

            }

            if (status) {

                addClass(
                    status,
                    "is-stale"
                );

                status.innerHTML =

                    "Verbindung unterbrochen" +

                    (
                        lastSuccessfulRefreshText

                            ? " – letzter Erfolg: " +
                                lastSuccessfulRefreshText

                            : ""
                    );

            }


            disableDashboardControls();


            setConnectionDisplay(
                "offline",
                "Gateway offline",
                "Keine Verbindung zum Dashboard-Gateway. Neuer Versuch läuft automatisch."
            );

        }

    );

}


/* Initial load */

loadDashboard();


/* Configurable automatic refresh and wall clock */

startDashboardRefreshTimer();


updateWallClock();


window.setInterval(

    updateWallClock,

    30000

);


window.ononline =

    function () {

        setConnectionDisplay(
            "connecting",
            "Verbinde …",
            ""
        );

        loadDashboard();

    };


window.onoffline =

    function () {

        if (typeof SystemNavigation !== "undefined") {
            SystemNavigation.markUnavailable();
        }

        disableDashboardControls();

        setConnectionDisplay(
            "offline",
            "Netzwerk offline",
            "Dieses Gerät hat derzeit keine Netzwerkverbindung. Neuer Versuch läuft automatisch."
        );

    };


var layoutResizeTimer = null;


function applyDashboardLayoutAfterResize() {

    if (layoutResizeTimer !== null) {
        window.clearTimeout(layoutResizeTimer);
    }

    layoutResizeTimer = window.setTimeout(
        function () {
            layoutResizeTimer = null;
            applyDashboardViewportHeight();
            Dashboard.applyLayout();
        },
        120
    );

}


if (window.addEventListener) {
    window.addEventListener(
        "resize",
        applyDashboardLayoutAfterResize,
        false
    );
}
