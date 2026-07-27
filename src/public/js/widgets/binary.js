function BinaryWidget(config) {

    Widget.call(this, config);

}

BinaryWidget.prototype =
    Object.create(Widget.prototype);

BinaryWidget.prototype.render =
    function (data) {

        var open =
            data.state === "on";

        var text =
            open
                ? "Offen"
                : "Geschlossen";

        var iconClass =
            open
                ? "red"
                : "green";

        var statusClass =
            open
                ? "status-danger"
                : "status-success";

        return "" +

            '<section class="card">' +

                '<div class="card-header">' +

                    '<div class="icon window ' +
                        iconClass +
                    '">' +

                    '</div>' +

                '</div>' +

                '<div class="status ' +
                    statusClass +
                '">' +

                    text +

                '</div>' +

                '<div class="title">' +

                    this.title +

                '</div>' +

                '<div class="subtitle">' +

                    "Fenster" +

                '</div>' +

            '</section>';

    };
