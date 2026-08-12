/*
 * Shared dashboard-native power button renderer.
 */

var LegacyControls = (function () {

    function powerButton(options) {

        var settings = options || {};
        var state = settings.state;
        var isOn = state === "on";
        var available = settings.available === true;
        var stateClass = available
            ? isOn
                ? "on"
                : "off"
            : "neutral";
        var label = settings.label || (
            available
                ? isOn
                    ? "Ausschalten"
                    : "Einschalten"
                : "Nicht verfügbar"
        );
        var disabled =
            settings.disabled === true ||
            !available;


        return "" +
            '<button type="button" class="dashboard-power-control ' +
                Legacy.html.escape(settings.className || "") +
                ' is-' +
                Legacy.html.escape(stateClass) +
                '" data-entity="' +
                Legacy.html.escape(settings.entity || "") +
                '" data-state="' +
                Legacy.html.escape(state || "unavailable") +
                '" data-available="' +
                (available ? "true" : "false") +
                '" aria-pressed="' +
                (isOn ? "true" : "false") +
                '" aria-label="' +
                Legacy.html.escape(label) +
                '"' +
                (disabled ? ' disabled="disabled"' : "") +
            '>' +
                '<span class="dashboard-power-icon" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24" focusable="false">' +
                        '<path d="M12 2v10"></path>' +
                        '<path d="M6.3 5.7a8 8 0 1 0 11.4 0"></path>' +
                    '</svg>' +
                '</span>' +
                '<span class="dashboard-power-label">' +
                    Legacy.html.escape(label) +
                '</span>' +
            '</button>';

    }


    return {
        powerButton: powerButton
    };

}());
