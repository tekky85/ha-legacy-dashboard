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


        var capabilities =

            data && data.gateway_capabilities

                ? data.gateway_capabilities

                : {};


        var canControl =

            isOn

                ? capabilities.can_light_power_off === true

                : capabilities.can_light_power_on === true;


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


                LegacyControls.powerButton({
                    className: "light-control",
                    entity: this.entity,
                    state: state,
                    available: available && canControl,
                    disabled: !canControl,
                    label: controlText
                }) +


                '<div class="title card-identity">' +

                    Legacy.html.escape(
                        this.getCardIdentity(data)
                    ) +

                '</div>' +


                '<div class="subtitle">' +

                    Legacy.html.escape(
                        this.subtitle
                    ) +

                '</div>' +


            '</section>';

    };
