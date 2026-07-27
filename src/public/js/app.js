Theme.load();

var themeButton =
    Legacy.dom.byId("themeButton");

if (themeButton) {

    themeButton.onclick = function () {

        Theme.toggle();

    };

}

function loadDashboard() {

    var status = Legacy.dom.byId("updated");

    status.innerHTML = "Aktualisiere…";

    Legacy.http.get(

        "/api/dashboard",

        function (data) {

            Dashboard.render(data);

            status.innerHTML =
                "Aktualisiert " +
                new Date().toLocaleTimeString();

        },

        function () {

            status.innerHTML =
                "Keine Verbindung";

        }

    );

}

// Widgets registrieren

Dashboard.addWidget(
    new SensorWidget({
        title: "Badezimmer",
        entity: "sensor.badezimmer_smart_indoor_module_temperatur"
    })
);

Dashboard.addWidget(
    new SensorWidget({
        title: "Luftfeuchtigkeit",
        entity: "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit"
    })
);

Dashboard.addWidget(
    new BinaryWidget({
        title: "Küchenfenster",
        entity: "binary_sensor.kuche_fenster_rechts"
    })
);


// Initial laden

loadDashboard();


// Alle 5 Sekunden aktualisieren

setInterval(loadDashboard, 5000);
