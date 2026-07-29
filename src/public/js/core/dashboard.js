/*
 * Dashboard renderer.
 */

var Dashboard = {

    widgets: [],


    addWidget: function (widget) {

        this.widgets.push(
            widget
        );

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

    }

};
