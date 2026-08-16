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


    function powerIcon() {

        return "" +
            '<span class="focus-power-icon" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" focusable="false">' +
                    '<path d="M12 2v10"></path>' +
                    '<path d="M6.3 5.7a8 8 0 1 0 11.4 0"></path>' +
                '</svg>' +
            '</span>';

    }


    function powerButton(model, hookClass) {

        var enabled = model.powerAvailable === true;


        return "" +
            '<button type="button" class="focus-action focus-power-action ' +
                hookClass +
                (model.isOn ? " is-on" : " is-off") +
                '" data-entity="' + escape(model.entity) +
                '" data-state="' + (model.isOn ? "on" : "off") +
                '" data-available="' + (enabled ? "true" : "false") +
                '" aria-pressed="' + (model.isOn ? "true" : "false") +
                '" aria-label="' + escape(model.powerLabel) + '"' +
                (enabled ? "" : ' disabled="disabled"') +
            '>' +
                powerIcon() +
                '<span class="focus-action-label">' +
                    escape(model.powerLabel) +
                '</span>' +
            '</button>';

    }


    function stepButton(model, direction, enabled, label) {

        var plus = direction > 0;


        return "" +
            '<button type="button" ' +
                'class="focus-action focus-step-action focus-climate-control" ' +
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
                '<svg class="focus-step-icon" viewBox="0 0 24 24" aria-hidden="true">' +
                    '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                    (
                        plus
                            ? '<line x1="12" y1="5" x2="12" y2="19"></line>'
                            : ""
                    ) +
                '</svg>' +
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
            '<div class="focus-controls focus-light-controls">' +
                powerButton(model, "focus-light-control") +
            '</div>' +
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
                '<div class="focus-step-controls">' +
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
                    ) +
                '</div>' +
                power +
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
