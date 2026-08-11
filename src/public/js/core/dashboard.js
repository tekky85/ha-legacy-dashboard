/*
 * Dashboard renderer.
 */

var Dashboard = {

    widgets: [],

    layouts: null,


    addWidget: function (widget) {

        this.widgets.push(
            widget
        );

    },


    createWidget: function (config) {

        if (!config || !config.type) {

            return null;

        }


        if (config.type === "sensor") {

            return new SensorWidget(config);

        }


        if (config.type === "binary") {

            return new BinaryWidget(config);

        }


        if (config.type === "light") {

            return new LightWidget(config);

        }


        if (config.type === "climate") {

            return new ClimateWidget(config);

        }


        return null;

    },


    configure: function (configs, layouts) {

        var orderedConfigs;
        var config;
        var widget;
        var index;


        this.widgets = [];
        this.layouts = layouts || null;


        if (!configs || !configs.length) {

            return 0;

        }


        orderedConfigs =

            configs.slice(0)

                .sort(function (first, second) {

                    return (

                        parseFloat(first.order) || 0

                    ) - (

                        parseFloat(second.order) || 0

                    );

                });


        for (

            index = 0;

            index < orderedConfigs.length;

            index++

        ) {

            config =
                orderedConfigs[index];


            if (

                !config ||
                config.visible === false ||
                typeof config.entity !== "string" ||
                !config.entity

            ) {

                continue;

            }


            widget =
                this.createWidget(config);


            if (widget) {

                this.addWidget(widget);

            }

        }


        if (typeof LegacyLayout !== "undefined") {
            LegacyLayout.configure(
                this.layouts,
                this.widgets
            );
        }


        return this.widgets.length;

    },


    render: function (states) {

        var container =
            document.getElementById(
                "dashboard"
            );

        var html = "";
        var index;
        var widget;
        var state;


        if (!container) {
            return;
        }


        states = states || {};


        for (
            index = 0;
            index < this.widgets.length;
            index++
        ) {

            widget =
                this.widgets[index];

            state =
                states[widget.entity];


            if (!state) {

                state = {

                    state: "unavailable",

                    attributes: {}

                };

            }


            html +=
                widget.render(
                    state
                );

        }


        /*
         * Nur ein DOM-Schreibvorgang.
         * Das ist insbesondere auf alten Geräten schneller.
         */

        container.innerHTML =
            html;


        this.applyLayout();

    },


    applyLayout: function () {

        var container =
            document.getElementById(
                "dashboard"
            );


        if (
            container &&
            typeof LegacyLayout !== "undefined"
        ) {
            LegacyLayout.apply(container);
        }

    }

};
