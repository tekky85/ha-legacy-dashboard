/*
 * Dashboard renderer.
 */

var Dashboard = {

    widgets: [],

    layouts: null,

    sections: [],

    sectionGroups: [],

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


    configure: function (configs, layouts, sections) {

        var orderedConfigs;
        var orderedSections;
        var sectionIds = {};
        var config;
        var widget;
        var index;


        this.widgets = [];
        this.layouts = layouts || null;
        this.sections = [];
        this.sectionGroups = [];
        this.states = {};
        this.controlsDisabled = false;


        orderedSections =
            sections && sections.slice
                ? sections.slice(0)
                : [];

        orderedSections.sort(function (first, second) {

            var orderDifference =
                (parseFloat(first.order) || 0) -
                (parseFloat(second.order) || 0);

            if (orderDifference) {
                return orderDifference;
            }

            return String(first.id).localeCompare(
                String(second.id)
            );

        });


        for (index = 0; index < orderedSections.length; index++) {

            config = orderedSections[index];

            if (
                !config ||
                typeof config.id !== "string" ||
                !/^[a-z0-9][a-z0-9-]{0,62}$/.test(config.id) ||
                sectionIds[config.id]
            ) {
                continue;
            }

            sectionIds[config.id] = true;
            this.sections.push({
                id: config.id,
                title:
                    typeof config.title === "string"
                        ? config.title
                        : config.id,
                order: parseFloat(config.order) || 0,
                showTitle: config.showTitle !== false,
                areaId:
                    typeof config.areaId === "string"
                        ? config.areaId
                        : null
            });

        }


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

            if (!sectionIds[config.sectionId]) {
                config.sectionId = null;
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
        var group;
        var section;
        var sectionIndex;


        if (!container) {
            return;
        }


        states = states || {};
        this.states = states;
        this.controlsDisabled = Boolean(
            states._meta &&
            states._meta.home_assistant === "offline"
        );


        this.sectionGroups = [];


        if (!this.sections.length) {

            for (
                index = 0;
                index < this.widgets.length;
                index++
            ) {
                html += this.renderWidget(
                    this.widgets[index],
                    states
                );
            }

            container.className = "grid";

        } else {

            for (
                sectionIndex = 0;
                sectionIndex <= this.sections.length;
                sectionIndex++
            ) {

                section =
                    sectionIndex < this.sections.length
                        ? this.sections[sectionIndex]
                        : null;

                group = {
                    id: section ? section.id : "",
                    widgets: []
                };


                for (index = 0; index < this.widgets.length; index++) {

                    widget = this.widgets[index];

                    if (
                        (section && widget.sectionId === section.id) ||
                        (!section && !widget.sectionId)
                    ) {
                        group.widgets.push(widget);
                    }

                }


                if (
                    !group.widgets.length &&
                    (!section || section.showTitle === false)
                ) {
                    continue;
                }


                this.sectionGroups.push(group);

                html +=
                    '<section class="dashboard-section" data-dashboard-section="' +
                    Legacy.html.escape(group.id || "unassigned") +
                    '">';

                if (section && section.showTitle) {
                    html +=
                        '<h2 class="dashboard-section-title">' +
                        Legacy.html.escape(section.title) +
                        "</h2>";
                } else if (!section) {
                    html +=
                        '<h2 class="dashboard-section-title dashboard-section-title-unassigned">' +
                        "Nicht zugeordnet" +
                        "</h2>";
                }

                html +=
                    '<div class="grid dashboard-section-grid" data-section-grid="' +
                    Legacy.html.escape(group.id) +
                    '">';

                for (index = 0; index < group.widgets.length; index++) {
                    html += this.renderWidget(
                        group.widgets[index],
                        states
                    );
                }

                html += "</div></section>";

            }

            container.className = "dashboard-sections";

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


    renderWidget: function (widget, states) {

        var state = states[widget.entity];


        if (!state) {
            state = {
                state: "unavailable",
                attributes: {}
            };
        }


        return widget.render(state);

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


        var grids;
        var gridIndex;
        var groupIndex;
        var group;
        var sectionId;


        if (!container || typeof LegacyLayout === "undefined") {
            return;
        }


        if (!this.sections.length) {
            LegacyLayout.apply(container);
            return;
        }


        grids = container.getElementsByClassName(
            "dashboard-section-grid"
        );


        for (gridIndex = 0; gridIndex < grids.length; gridIndex++) {

            sectionId = grids[gridIndex].getAttribute(
                "data-section-grid"
            ) || "";
            group = null;


            for (
                groupIndex = 0;
                groupIndex < this.sectionGroups.length;
                groupIndex++
            ) {
                if (this.sectionGroups[groupIndex].id === sectionId) {
                    group = this.sectionGroups[groupIndex];
                    break;
                }
            }


            if (group) {
                LegacyLayout.apply(
                    grids[gridIndex],
                    group.widgets,
                    group.id || "unassigned"
                );
            }
        }

    }

};
