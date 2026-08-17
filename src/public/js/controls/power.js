/*
 * Shared dashboard-native power button renderer.
 */

var LegacyControls = (function () {

    function powerIcon() {

        return "" +
            '<span class="dashboard-control-power-icon dashboard-power-icon" ' +
                'aria-hidden="true">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" ' +
                    'focusable="false" aria-hidden="true">' +
                    '<path d="M12 3v10"></path>' +
                    '<path d="M6.3 6.7a8 8 0 1 0 11.4 0"></path>' +
                '</svg>' +
            '</span>';

    }

    function powerButton(options) {

        var settings = options || {};
        var state = settings.state;
        var isOn = state === "on";
        var available = settings.available === true;
        var isBusy = settings.busy === true;
        var hasError = settings.error === true || state === "error";
        var stateClass = hasError
            ? "error"
            : available
                ? isOn
                    ? "on"
                    : "off"
                : "unavailable";
        var label = settings.label || (
            available
                ? isOn
                    ? "Ausschalten"
                    : "Einschalten"
                : "Nicht verfügbar"
        );
        var disabled =
            settings.disabled === true ||
            isBusy ||
            !available;

        var modifierClasses =
            " is-" + stateClass +
            (isBusy ? " is-busy" : "") +
            (disabled ? " is-disabled" : "");


        return "" +
            '<button type="button" class="dashboard-control ' +
                'dashboard-control-power dashboard-power-control ' +
                Legacy.html.escape(settings.className || "") +
                Legacy.html.escape(modifierClasses) +
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
                powerIcon() +
                '<span class="dashboard-control-power-label dashboard-power-label">' +
                    Legacy.html.escape(label) +
                '</span>' +
            '</button>';

    }


    return {
        powerIcon: powerIcon,
        powerButton: powerButton
    };

}());
