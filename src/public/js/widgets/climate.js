/*
 * Climate widget with target-temperature controls.
 */

function ClimateWidget(config) {

    Widget.call(
        this,
        config
    );

    config =
        config || {};

    this.unit =
        config.unit || "°C";

}


ClimateWidget.prototype =

    Object.create(

        Widget.prototype

    );


ClimateWidget.prototype.constructor =

    ClimateWidget;


ClimateWidget.prototype.toNumber =

    function (value) {

        var number =
            parseFloat(value);

        if (isNaN(number)) {

            return null;

        }

        return number;

    };


ClimateWidget.prototype.decimalPlaces =

    function (value) {

        var text =
            String(value);

        var position =
            text.indexOf(".");

        if (position === -1) {

            return 0;

        }

        return text.length - position - 1;

    };


ClimateWidget.prototype.formatTemperature =

    function (
        value,
        minimumDecimals
    ) {

        var number =
            this.toNumber(value);

        var decimals =
            minimumDecimals || 0;


        if (number === null) {

            return "–";

        }


        if (

            Math.round(number) !== number

        ) {

            decimals =
                Math.max(
                    decimals,
                    1
                );

        }


        return number.toFixed(
            decimals
        );

    };


ClimateWidget.prototype.getStateInfo =

    function (
        state,
        hvacAction
    ) {

        if (

            state === "unavailable" ||

            state === "unknown"

        ) {

            return {

                text:
                    "Nicht verfügbar",

                cssClass:
                    "neutral"

            };

        }


        if (state === "off") {

            return {

                text:
                    "Aus",

                cssClass:
                    "off"

            };

        }


        if (hvacAction === "heating") {

            return {

                text:
                    "Heizt",

                cssClass:
                    "heating"

            };

        }


        if (hvacAction === "cooling") {

            return {

                text:
                    "Kühlt",

                cssClass:
                    "cooling"

            };

        }


        if (hvacAction === "idle") {

            return {

                text:
                    "Bereit",

                cssClass:
                    "idle"

            };

        }


        if (state === "auto") {

            return {

                text:
                    "Automatik",

                cssClass:
                    "idle"

            };

        }


        if (state === "heat") {

            return {

                text:
                    "Heizen",

                cssClass:
                    "idle"

            };

        }


        return {

            text:
                state || "Unbekannt",

            cssClass:
                "neutral"

        };

    };


ClimateWidget.prototype.render =

    function (data) {

        var attributes =

            data &&
            data.attributes

                ? data.attributes

                : {};


        var state =

            data &&
            data.state

                ? data.state

                : "unavailable";


        var currentTemperature =

            this.toNumber(

                attributes
                    .current_temperature

            );


        var targetTemperature =

            this.toNumber(

                attributes.temperature

            );


        var minimum =

            this.toNumber(

                attributes.min_temp

            );


        var maximum =

            this.toNumber(

                attributes.max_temp

            );


        var step =

            this.toNumber(

                attributes
                    .target_temp_step

            );


        var stateInfo =

            this.getStateInfo(

                state,

                attributes.hvac_action

            );


        var available =

            state !== "unavailable" &&

            state !== "unknown" &&

            targetTemperature !== null;


        var capabilities =

            data && data.gateway_capabilities

                ? data.gateway_capabilities

                : {};


        var temperatureAvailable =

            available &&
            state !== "off" &&
            capabilities.can_set_temperature === true;


        var canPower =

            state === "off"

                ? capabilities.can_power_on === true

                : capabilities.can_power_off === true;


        var buttonDisabled =

            temperatureAvailable

                ? ""

                : ' disabled="disabled"';


        var availableValue =

            temperatureAvailable

                ? "true"

                : "false";


        var targetDecimals;

        var currentText;

        var targetText;

        var iconClass;


        if (minimum === null) {

            minimum = 5;

        }


        if (maximum === null) {

            maximum = 35;

        }


        if (

            step === null ||

            step <= 0

        ) {

            step = 0.5;

        }


        targetDecimals = Math.max(

            1,

            this.decimalPlaces(step)

        );


        currentText =

            this.formatTemperature(

                currentTemperature,

                1

            );


        targetText =

            this.formatTemperature(

                targetTemperature,

                targetDecimals

            );


        iconClass =

            this.iconClass +

            " " +

            stateInfo.cssClass;


        return "" +

            '<section class="card card-climate ' +
                this.getSizeClass() +
            '"' + this.getLayoutAttribute() +
                this.getPresentationAttribute(data) + '>' +


                '<div class="card-header">' +


                    '<div class="climate-heading">' +


                        '<div class="icon ' +

                            Legacy.html.escape(
                                iconClass
                            ) +

                        '">' +

                            this.getIcon() +

                        '</div>' +


                        '<div class="climate-heading-copy">' +


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


                        '</div>' +


                    '</div>' +


                    '<div class="climate-state ' +

                        'climate-state-' +

                        Legacy.html.escape(
                            stateInfo.cssClass
                        ) +

                    '">' +

                        Legacy.html.escape(
                            stateInfo.text
                        ) +

                    '</div>' +


                '</div>' +


                '<div class="climate-values">' +


                    '<div class="climate-current">' +


                        '<span class="climate-current-value">' +

                            Legacy.html.escape(
                                currentText
                            ) +

                        '</span>' +


                        '<span class="climate-current-unit">' +

                            Legacy.html.escape(
                                this.unit
                            ) +

                        '</span>' +


                        '<span class="climate-current-label">' +

                            "Aktuell" +

                        '</span>' +


                    '</div>' +


                    '<div class="climate-target-row dashboard-control-row">' +


                    '<div class="climate-target-group">' +


                    '<button ' +

                        'type="button" ' +

                        'class="dashboard-control dashboard-control-step climate-control" ' +

                        'data-entity="' +

                            Legacy.html.escape(
                                this.entity
                            ) +

                        '" ' +

                        'data-direction="-1" ' +

                        'data-target="' +

                            Legacy.html.escape(
                                targetTemperature
                            ) +

                        '" ' +

                        'data-step="' +

                            Legacy.html.escape(
                                step
                            ) +

                        '" ' +

                        'data-min="' +

                            Legacy.html.escape(
                                minimum
                            ) +

                        '" ' +

                        'data-max="' +

                            Legacy.html.escape(
                                maximum
                            ) +

                        '" ' +

                        'data-available="' +

                            availableValue +

                        '" ' +

                        'aria-label="' +
                            'Zieltemperatur senken' +
                        '"' +

                        buttonDisabled +

                    '>' +

                        LegacyControls.controlContent(
                            '<svg ' +
                                'class="climate-control-icon" ' +
                                'viewBox="0 0 24 24" ' +
                                'aria-hidden="true"' +
                            '>' +
                                '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                            '</svg>',
                            "dashboard-control-step-content"
                        ) +

                    '</button>' +


                    '<div class="climate-target">' +


                        '<span class="climate-target-label">' +

                            "Ziel" +

                        '</span>' +


                        '<span class="climate-target-value">' +

                            Legacy.html.escape(
                                targetText
                            ) +

                            '<small>' +

                                Legacy.html.escape(
                                    this.unit
                                ) +

                            '</small>' +

                        '</span>' +


                    '</div>' +


                    '<button ' +

                        'type="button" ' +

                        'class="dashboard-control dashboard-control-step climate-control" ' +

                        'data-entity="' +

                            Legacy.html.escape(
                                this.entity
                            ) +

                        '" ' +

                        'data-direction="1" ' +

                        'data-target="' +

                            Legacy.html.escape(
                                targetTemperature
                            ) +

                        '" ' +

                        'data-step="' +

                            Legacy.html.escape(
                                step
                            ) +

                        '" ' +

                        'data-min="' +

                            Legacy.html.escape(
                                minimum
                            ) +

                        '" ' +

                        'data-max="' +

                            Legacy.html.escape(
                                maximum
                            ) +

                        '" ' +

                        'data-available="' +

                            availableValue +

                        '" ' +

                        'aria-label="' +
                            'Zieltemperatur erhöhen' +
                        '"' +

                        buttonDisabled +

                    '>' +

                        LegacyControls.controlContent(
                            '<svg ' +
                                'class="climate-control-icon" ' +
                                'viewBox="0 0 24 24" ' +
                                'aria-hidden="true"' +
                            '>' +
                                '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                                '<line x1="12" y1="5" x2="12" y2="19"></line>' +
                            '</svg>',
                            "dashboard-control-step-content"
                        ) +

                    '</button>' +


                    LegacyControls.powerButton({
                        className: "climate-power-control",
                        entity: this.entity,
                        state: state === "off" ? "off" : "on",
                        available: canPower,
                        disabled: !canPower,
                        label: state === "off"
                            ? "Thermostat einschalten"
                            : "Thermostat ausschalten"
                    }) +


                    '</div>' +


                    '</div>' +


                '</div>' +


            '</section>';

    };
