/*
 * Light widget with an explicit on/off control.
 */

function LightWidget(config) {

    Widget.call(
        this,
        config
    );

}


LightWidget.prototype =

    Object.create(

        Widget.prototype

    );


LightWidget.prototype.constructor =
    LightWidget;


LightWidget.prototype.render =

    function (data) {

        var state =

            data && data.state

                ? data.state

                : "unavailable";


        var available =

            state === "on" ||
            state === "off";


        var isOn =
            state === "on";


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


        var stateClass =

            available

                ? isOn

                    ? "on"

                    : "off"

                : "neutral";


        var disabled =

            available

                ? ""

                : ' disabled="disabled"';


        return "" +

            '<section class="card card-light ' +
                this.getSizeClass() +
            '"' + this.getLayoutAttribute() + '>' +


                '<div class="card-header">' +


                    '<div class="icon light ' +

                        Legacy.html.escape(
                            stateClass
                        ) +

                    '">' +

                        this.getIcon() +

                    '</div>' +


                    '<div class="light-state light-state-' +

                        Legacy.html.escape(
                            stateClass
                        ) +

                    '">' +

                        Legacy.html.escape(
                            stateText
                        ) +

                    '</div>' +


                '</div>' +


                '<button ' +

                    'type="button" ' +

                    'class="light-control is-' +

                        Legacy.html.escape(
                            stateClass
                        ) +

                    '" ' +

                    'data-entity="' +

                        Legacy.html.escape(
                            this.entity
                        ) +

                    '" ' +

                    'data-state="' +

                        Legacy.html.escape(
                            state
                        ) +

                    '" ' +

                    'data-available="' +

                        (
                            available

                                ? "true"

                                : "false"
                        ) +

                    '" ' +

                    'aria-pressed="' +

                        (
                            isOn

                                ? "true"

                                : "false"
                        ) +

                    '" ' +

                    'aria-label="' +

                        Legacy.html.escape(
                            controlText
                        ) +

                    '"' +

                    disabled +

                '>' +


                    '<span class="light-control-track">' +

                        '<span class="light-control-knob"></span>' +

                    '</span>' +


                    '<span class="light-control-label">' +

                        Legacy.html.escape(
                            controlText
                        ) +

                    '</span>' +


                '</button>' +


                '<div class="title">' +

                    Legacy.html.escape(
                        this.title
                    ) +

                '</div>' +


                '<div class="subtitle">' +

                    Legacy.html.escape(
                        this.subtitle
                    ) +

                '</div>' +


            '</section>';

    };
