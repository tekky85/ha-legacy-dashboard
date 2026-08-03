/*
 * Visible dashboard configuration.
 *
 * This file controls only which entities are displayed and how their
 * widgets look. Writable entities remain separately allowlisted in
 * src/routes/api.js.
 */

const WIDGETS = [

    {
        entity: "sensor.badezimmer_smart_indoor_module_temperatur",
        type: "sensor",
        title: "Badezimmer",
        subtitle: "Temperatur",
        icon: "temperature",
        iconClass: "temperature",
        unit: "",
        order: 10,
        visible: true
    },

    {
        entity: "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit",
        type: "sensor",
        title: "Badezimmer",
        subtitle: "Luftfeuchtigkeit",
        icon: "humidity",
        iconClass: "humidity",
        unit: "",
        order: 20,
        visible: true
    },

    {
        entity: "binary_sensor.kuche_fenster_rechts",
        type: "binary",
        title: "Küche",
        subtitle: "Fenster rechts",
        icon: "window",
        iconClass: "window",
        unit: "",
        order: 30,
        visible: true
    },

    {
        entity: "binary_sensor.kuche_fenster_mitte",
        type: "binary",
        title: "Küche",
        subtitle: "Fenster Mitte",
        icon: "window",
        iconClass: "window",
        unit: "",
        order: 35,
        visible: false
    },

    {
        entity: "light.esszimmer_lampen",
        type: "light",
        title: "Esszimmer",
        subtitle: "Licht",
        icon: "light",
        iconClass: "light",
        unit: "",
        order: 40,
        visible: true
    },

    {
        entity: "climate.esszimmer_thermostate",
        type: "climate",
        title: "Esszimmer",
        subtitle: "Thermostate",
        icon: "heating",
        iconClass: "heating",
        unit: "°C",
        order: 50,
        visible: true
    }

];


function getVisibleWidgets() {

    return WIDGETS

        .filter(function (widget) {

            return widget.visible !== false;

        })

        .slice(0)

        .sort(function (first, second) {

            return first.order - second.order;

        });

}


function getVisibleEntityIds() {

    return getVisibleWidgets()

        .map(function (widget) {

            return widget.entity;

        });

}


function getPublicWidgets() {

    return getVisibleWidgets()

        .map(function (widget) {

            return {
                entity: widget.entity,
                type: widget.type,
                title: widget.title,
                subtitle: widget.subtitle,
                icon: widget.icon,
                iconClass: widget.iconClass,
                unit: widget.unit,
                order: widget.order,
                visible: true
            };

        });

}


module.exports = {

    getPublicWidgets: getPublicWidgets,
    getVisibleEntityIds: getVisibleEntityIds

};
