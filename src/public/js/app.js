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

var pendingLightUpdate =
    null;

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


function setClimateControlsBusy(
    busy
) {

    var buttons =

        document.getElementsByClassName(

            "climate-control"

        );

    var index;

    var available;


    for (

        index = 0;

        index < buttons.length;

        index++

    ) {

        available =

            buttons[index]
                .getAttribute(
                    "data-available"
                ) === "true";


        if (busy) {

            buttons[index].disabled =
                true;

            addClass(

                buttons[index],

                "is-busy"

            );

        } else {

            buttons[index].disabled =
                !available;

            removeClass(

                buttons[index],

                "is-busy"

            );

        }

    }

}

function updateClimateTargetDisplay(
    entityId,
    temperature,
    step
) {

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

        button.disabled

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

        lightUpdateInProgress()

    );

}


function updateLightDisplay(
    entityId,
    state
) {

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
            "light-control is-" +
            stateClass;

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
            "light-control-label"
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
   EVENT DELEGATION
   ========================================================= */

var dashboardElement =

    Legacy.dom.byId(
        "dashboard"
    );


if (dashboardElement) {

    dashboardElement.onclick =

        function (event) {

            var currentElement;

            event =
                event || window.event;

            currentElement =

                event.target ||
                event.srcElement;


            while (

                currentElement &&

                currentElement !==
                    dashboardElement

            ) {

                if (

                    currentElement.tagName &&

                    currentElement.tagName
                        .toLowerCase() ===
                            "button" &&

                    hasClass(

                        currentElement,

                        "light-control"

                    )

                ) {

                    if (
                        event.preventDefault
                    ) {

                        event.preventDefault();

                    }

                    setLightState(

                        currentElement

                    );

                    return;

                }


                if (

                    currentElement.tagName &&

                    currentElement.tagName
                        .toLowerCase() ===
                            "button" &&

                    hasClass(

                        currentElement,

                        "climate-control"

                    )

                ) {

                    if (
                        event.preventDefault
                    ) {

                        event.preventDefault();

                    }

                    setClimateTemperature(

                        currentElement

                    );

                    return;

                }


                currentElement =

                    currentElement
                        .parentNode;

            }

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


    if (status) {

        status.innerHTML =
            "Lade Dashboard-Konfiguration …";

    }


    Legacy.http.get(

        "/api/dashboard/config",

        function (data) {

            var widgetCount = 0;


            dashboardConfigurationLoading =
                false;


            if (

                data &&
                data.widgets &&
                data.widgets.length

            ) {

                widgetCount =

                    Dashboard.configure(
                        data.widgets
                    );

            }


            if (!widgetCount) {

                dashboardConfigured =
                    false;


                if (status) {

                    status.innerHTML =
                        "Fehler: Keine Dashboard-Konfiguration";

                }


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

        "/api/dashboard",

        function (data) {

            if (

                dashboardControlUpdateInProgress() ||

                requestStartedAt <
                    dashboardRefreshBlockedUntil

            ) {

                return;

            }

            Dashboard.render(
                data
            );


            if (status) {

                status.innerHTML =

                    "Aktualisiert: " +

                    new Date()
                        .toLocaleTimeString();

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

                status.innerHTML =

                    "Fehler: " +

                    (
                        error &&
                        error.message

                            ? error.message

                            : "Keine Verbindung"
                    );

            }

        }

    );

}


/* Initial load */

loadDashboard();


/* Refresh every five seconds */

window.setInterval(

    loadDashboard,

    5000

);
