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
            "sensor.badezimmer_smart_indoor_module_temperatur",

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
            "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit",

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
            "binary_sensor.kuche_fenster_rechts",

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


/* =========================================================
   DATA LOADING
   ========================================================= */

function loadDashboard() {

    var status =
        Legacy.dom.byId(
            "updated"
        );


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

                if (
                    error &&
                    error.status
                ) {

                    status.innerHTML =
                        "Verbindungsfehler: HTTP " +
                        error.status;

                } else {

                    status.innerHTML =
                        "Keine Verbindung zum Gateway";

                }

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
