/*
 * Dashboard renderer.
 */

var Dashboard = {

    widgets: [],

    layouts: null,

    states: {},

    controlsDisabled: false,


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
        this.states = {};
        this.controlsDisabled = false;


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
        this.states = states;
        this.controlsDisabled = Boolean(
            states._meta &&
            states._meta.home_assistant === "offline"
        );


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

        if (typeof LegacyFocus !== "undefined") {
            LegacyFocus.refresh();
        }

    },


    getWidget: function (widgetId) {

        var index;


        for (index = 0; index < this.widgets.length; index++) {
            if (this.widgets[index].id === widgetId) {
                return this.widgets[index];
            }
        }


        return null;

    },


    getFocusSource: function (widgetId) {

        var widget = this.getWidget(widgetId);
        var state;


        if (!widget) {
            return null;
        }


        state = this.states[widget.entity];

        if (!state) {
            state = {
                state: "unavailable",
                attributes: {}
            };
        }


        return {
            widget: widget,
            state: state,
            controlsDisabled: this.controlsDisabled,
            stale: this.controlsDisabled || Boolean(state.gateway_error)
        };

    },


    setControlsDisabled: function (disabled) {

        this.controlsDisabled = Boolean(disabled);

    },


    updateEntityState: function (entityId, stateValue) {

        if (!this.states[entityId]) {
            this.states[entityId] = {
                state: "unavailable",
                attributes: {}
            };
        }


        this.states[entityId].state = stateValue;

    },


    updateEntityAttribute: function (entityId, name, value) {

        if (!this.states[entityId]) {
            this.states[entityId] = {
                state: "unavailable",
                attributes: {}
            };
        }


        if (!this.states[entityId].attributes) {
            this.states[entityId].attributes = {};
        }


        this.states[entityId].attributes[name] = value;

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
