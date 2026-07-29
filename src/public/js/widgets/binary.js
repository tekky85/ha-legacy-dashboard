/*
 * Binary sensor widget.
 */

function BinaryWidget(config) {

    Widget.call(
        this,
        config
    );

}


BinaryWidget.prototype =
    Object.create(
        Widget.prototype
    );


BinaryWidget.prototype.constructor =
    BinaryWidget;


BinaryWidget.prototype.render =
    function (data) {

        var state =
            data && data.state
                ? data.state
                : "unknown";

        var text = "";
        var iconClass = "";
        var statusClass = "";


        if (state === "on") {

            text = "Offen";

            iconClass =
                this.iconClass + " red";

            statusClass =
                "status-danger";

        } else if (state === "off") {

            text = "Geschlossen";

            iconClass =
                this.iconClass + " green";

            statusClass =
                "status-success";

        } else {

            text = "Nicht verfügbar";

            iconClass =
                this.iconClass;

            statusClass =
                "status-neutral";

        }


        return "" +

            '<section class="card">' +

                '<div class="card-header">' +

                    '<div class="icon ' +
                        Legacy.html.escape(
                            iconClass
                        ) +
                    '">' +

                        this.getIcon() +

                    '</div>' +

                '</div>' +


                '<div class="status ' +
                    statusClass +
                '">' +

                    Legacy.html.escape(
                        text
                    ) +

                '</div>' +


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
