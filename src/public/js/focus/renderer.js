/*
 * Native Focus renderer. It creates an interaction view with a Focus-only
 * CSS namespace and never renders or clones a Grid card.
 */

var LegacyFocusRenderer = (function () {

    function escape(value) {

        return Legacy.html.escape(
            value === null || typeof value === "undefined"
                ? ""
                : String(value)
        );

    }


    function icon(model) {

        return "" +
            '<div class="focus-icon focus-icon-' +
                escape(model.tone || "neutral") +
            '" aria-hidden="true">' +
                LegacyIcons.get(model.icon) +
            '</div>';

    }


    function header(model, includeState) {

        return "" +
            '<div class="focus-header">' +
                icon(model) +
                '<div class="focus-heading">' +
                    '<div class="focus-identity">' +
                        escape(model.identity) +
                    '</div>' +
                    (
                        model.subtitle
                            ? '<div class="focus-subtitle">' +
                                escape(model.subtitle) +
                              '</div>'
                            : ""
                    ) +
                '</div>' +
                (
                    includeState
                        ? '<div class="focus-state focus-state-' +
                            escape(model.tone || "neutral") +
                          '">' + escape(model.stateText) + '</div>'
                        : ""
                ) +
            '</div>';

    }


    function secondary(model) {

        return model.stale
            ? '<div class="focus-secondary">Veraltete Daten</div>'
            : "";

    }


    function powerButton(model, hookClass) {

        var enabled = model.powerAvailable === true;


        return LegacyControls.powerButton({
            className: "focus-action focus-power-action " + hookClass,
            entity: model.entity,
            state: model.isOn ? "on" : "off",
            available: enabled,
            disabled: !enabled,
            label: model.powerLabel
        });

    }


    function stepButton(model, direction, enabled, label) {

        var plus = direction > 0;


        return "" +
            '<button type="button" ' +
                'class="dashboard-control dashboard-control-step focus-action focus-step-action focus-climate-control" ' +
                'data-entity="' + escape(model.entity) + '" ' +
                'data-direction="' + direction + '" ' +
                'data-target="' + escape(model.targetTemperature) + '" ' +
                'data-step="' + escape(model.step) + '" ' +
                'data-min="' + escape(model.minimum) + '" ' +
                'data-max="' + escape(model.maximum) + '" ' +
                'data-available="' + (enabled ? "true" : "false") + '" ' +
                'aria-label="' + escape(label) + '"' +
                (enabled ? "" : ' disabled="disabled"') +
            '>' +
                LegacyControls.controlContent(
                    '<svg class="focus-step-icon" viewBox="0 0 24 24" aria-hidden="true">' +
                        '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                        (
                            plus
                                ? '<line x1="12" y1="5" x2="12" y2="19"></line>'
                                : ""
                        ) +
                    '</svg>',
                    "dashboard-control-step-content"
                ) +
            '</button>';

    }


    function wrapper(model, content) {

        var stateClass = model.unavailable
            ? " focus-state-unavailable"
            : "";


        if (model.stale) {
            stateClass += " focus-state-stale";
        }

        return "" +
            '<section class="focus-widget focus-widget-' +
                escape(model.type) + stateClass +
                '" data-widget-id="' + escape(model.widgetId) +
                '" role="document">' +
                content +
            '</section>';

    }


    function renderSensorFocus(model) {

        return wrapper(
            model,
            header(model, false) +
            '<div class="focus-primary focus-sensor-primary">' +
                '<span class="focus-value">' + escape(model.value) + '</span>' +
                (
                    model.unit
                        ? '<span class="focus-unit">' + escape(model.unit) + '</span>'
                        : ""
                ) +
            '</div>' +
            secondary(model)
        );

    }


    function renderBinaryFocus(model) {

        return wrapper(
            model,
            header(model, false) +
            '<div class="focus-primary focus-binary-primary">' +
                '<div class="focus-binary-state focus-binary-state-' +
                    escape(model.tone) + '">' +
                    escape(model.stateText) +
                '</div>' +
            '</div>' +
            secondary(model)
        );

    }


    function renderLightFocus(model) {

        return wrapper(
            model,
            header(model, true) +
            LegacyControls.controlRow(
                powerButton(model, "focus-light-control"),
                {
                    className: "focus-controls focus-light-controls",
                    groupClassName: "focus-light-control-group"
                }
            ) +
            secondary(model)
        );

    }


    function renderClimateFocus(model) {

        var power = model.powerVisible
            ? powerButton(model, "focus-climate-power-control")
            : "";


        return wrapper(
            model,
            header(model, true) +
            '<div class="focus-primary focus-climate-primary">' +
                '<span class="focus-current-value">' +
                    escape(model.currentText) +
                '</span>' +
                '<span class="focus-current-unit">' +
                    escape(model.unit) +
                '</span>' +
                '<span class="focus-current-label">Aktuell</span>' +
            '</div>' +
            '<div class="focus-controls focus-climate-controls">' +
                '<div class="focus-target">' +
                    '<span class="focus-target-label">Ziel</span>' +
                    '<span class="focus-target-value">' +
                        escape(model.targetText) +
                        '<small>' + escape(model.unit) + '</small>' +
                    '</span>' +
                '</div>' +
                LegacyControls.controlRow(
                    stepButton(
                        model,
                        -1,
                        model.canDecrease,
                        "Zieltemperatur senken"
                    ) +
                    stepButton(
                        model,
                        1,
                        model.canIncrease,
                        "Zieltemperatur erhöhen"
                    ),
                    {
                        className: "focus-temperature-control-row",
                        groupClassName: "focus-step-controls"
                    }
                ) +
                (
                    power
                        ? LegacyControls.controlRow(
                            power,
                            {
                                className: "focus-power-control-row",
                                groupClassName: "focus-power-control-group"
                            }
                        )
                        : ""
                ) +
            '</div>' +
            secondary(model)
        );

    }


    function render(model) {

        if (!model) {
            return "";
        }

        if (model.type === "sensor") {
            return renderSensorFocus(model);
        }

        if (model.type === "binary") {
            return renderBinaryFocus(model);
        }

        if (model.type === "light") {
            return renderLightFocus(model);
        }

        if (model.type === "climate") {
            return renderClimateFocus(model);
        }

        return "";

    }


    return {
        render: render,
        renderSensorFocus: renderSensorFocus,
        renderBinaryFocus: renderBinaryFocus,
        renderLightFocus: renderLightFocus,
        renderClimateFocus: renderClimateFocus
    };

}());
