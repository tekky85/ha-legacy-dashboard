/*
 * Sensor widget.
 */

function SensorWidget(config) {

    Widget.call(
        this,
        config
    );

}


SensorWidget.prototype =
    Object.create(
        Widget.prototype
    );


SensorWidget.prototype.constructor =
    SensorWidget;


SensorWidget.prototype.render =
    function (data) {

        var state = "";
        var unit = "";

        var unavailable = false;
        var valueClass = "value";

        if (!data) {

            unavailable = true;

        } else {

            state = data.state;

            if (
                state === "unknown" ||
                state === "unavailable" ||
                state === null ||
                typeof state === "undefined"
            ) {

                unavailable = true;

            }

        }


        if (
            !unavailable &&
            data.attributes &&
            data.attributes.unit_of_measurement
        ) {

            unit =
                data.attributes.unit_of_measurement;

        }


        if (unavailable) {

            state = "–";
            unit = "";
            valueClass += " value-unavailable";

        }


        return "" +

            '<section class="card card-sensor ' +
                this.getSizeClass() +
            '"' + this.getLayoutAttribute() +
                this.getPresentationAttribute(data) + '>' +

                '<div class="card-header">' +

                    '<div class="icon ' +
                        Legacy.html.escape(
                            this.iconClass
                        ) +
                    '">' +

                        this.getIcon() +

                    '</div>' +

                '</div>' +


                '<div class="' +
                    valueClass +
                '">' +

                    Legacy.html.escape(
                        state
                    ) +

                    '<span>' +

                        Legacy.html.escape(
                            unit
                        ) +

                    '</span>' +

                '</div>' +


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
