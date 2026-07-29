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

Dashboard.addWidget(

    new SensorWidget({

        entity:

            "sensor.badezimmer_" +
            "smart_indoor_module_" +
            "temperatur",

        title:
            "Badezimmer",

        subtitle:
            "Temperatur",

        icon:
            "temperature",

        iconClass:
            "temperature"

    })

);


Dashboard.addWidget(

    new SensorWidget({

        entity:

            "sensor.badezimmer_" +
            "smart_indoor_module_" +
            "luftfeuchtigkeit",

        title:
            "Badezimmer",

        subtitle:
            "Luftfeuchtigkeit",

        icon:
            "humidity",

        iconClass:
            "humidity"

    })

);


Dashboard.addWidget(

    new BinaryWidget({

        entity:

            "binary_sensor." +
            "kuche_fenster_rechts",

        title:
            "Küche",

        subtitle:
            "Fenster rechts",

        icon:
            "window",

        iconClass:
            "window"

    })

);


Dashboard.addWidget(

    new ClimateWidget({

        entity:

            "climate." +
            "esszimmer_thermostate",

        title:
            "Esszimmer",

        subtitle:
            "Thermostate",

        icon:
            "heating",

        iconClass:
            "heating",

        unit:
            "°C"

    })

);


/* =========================================================
   HELPERS
   ========================================================= */

var climateRequestActive =
    false;


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


/* =========================================================
   CLIMATE CONTROL
   ========================================================= */

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

        climateRequestActive ||

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


    climateRequestActive =
        true;


    setClimateControlsBusy(
        true
    );


    if (status) {

        status.innerHTML =

            "Setze Zieltemperatur auf " +

            nextTemperature.toFixed(
                displayDecimals
            ) +

            " °C …";

    }


    Legacy.http.post(

        "/api/climate/temperature",

        {

            entity_id:
                entityId,

            temperature:
                nextTemperature

        },

        function () {

            climateRequestActive =
                false;


            if (status) {

                status.innerHTML =

                    "Zieltemperatur wurde gesetzt";

            }


            loadDashboard();

        },

        function (error) {

            climateRequestActive =
                false;


            setClimateControlsBusy(
                false
            );


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

        }

    );

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

function loadDashboard() {

    var status =

        Legacy.dom.byId(
            "updated"
        );


    /*
     * Während eines Steuerbefehls darf der
     * automatische Refresh die Buttons nicht
     * neu erzeugen.
     */

    if (climateRequestActive) {

        return;

    }


    if (status) {

        status.innerHTML =

            "Aktualisiere …";

    }


    Legacy.http.get(

        "/api/dashboard",

        function (data) {

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
