/*
 * Side-effect-free Focus View Model builder.
 *
 * Focus consumes widget definitions and the latest sanitized dashboard state.
 * It never reads layout geometry or rendered Grid DOM.
 */

var LegacyFocusViewModel = (function () {

    function toNumber(value) {

        var number = parseFloat(value);


        return isNaN(number)
            ? null
            : number;

    }


    function decimalPlaces(value) {

        var text = String(value);
        var position = text.indexOf(".");


        return position === -1
            ? 0
            : text.length - position - 1;

    }


    function formatNumber(value, minimumDecimals) {

        var number = toNumber(value);
        var decimals = minimumDecimals || 0;


        if (number === null) {
            return "–";
        }

        if (Math.round(number) !== number) {
            decimals = Math.max(decimals, 1);
        }

        return number.toFixed(decimals);

    }


    function climateState(state, action) {

        if (state === "unavailable" || state === "unknown") {
            return {text: "Nicht verfügbar", tone: "neutral"};
        }

        if (state === "off") {
            return {text: "Aus", tone: "off"};
        }

        if (action === "heating") {
            return {text: "Heizt", tone: "heating"};
        }

        if (action === "cooling") {
            return {text: "Kühlt", tone: "cooling"};
        }

        if (action === "idle") {
            return {text: "Bereit", tone: "idle"};
        }

        if (state === "auto") {
            return {text: "Automatik", tone: "idle"};
        }

        if (state === "heat") {
            return {text: "Heizen", tone: "idle"};
        }

        return {text: state || "Unbekannt", tone: "neutral"};

    }


    function identityFor(widget, state) {

        if (
            widget &&
            typeof widget.getCardIdentity === "function"
        ) {
            return widget.getCardIdentity(state);
        }

        if (typeof LegacyPresentation !== "undefined") {
            return LegacyPresentation.getIdentity(widget, state);
        }

        return widget && widget.title
            ? widget.title
            : "Widget";

    }


    function commonModel(widget, state, options) {

        var unavailable =
            !state ||
            state.state === "unknown" ||
            state.state === "unavailable" ||
            state.state === null ||
            typeof state.state === "undefined";


        return {
            widgetId: widget.id || "",
            type: widget.type || "",
            entity: widget.entity || "",
            identity: identityFor(widget, state),
            subtitle: widget.subtitle || "",
            icon: widget.icon || "sensor",
            state: state && state.state
                ? state.state
                : "unavailable",
            unavailable: unavailable,
            stale: Boolean(options.stale),
            controlsDisabled:
                Boolean(options.controlsDisabled) ||
                Boolean(options.stale) ||
                unavailable
        };

    }


    function sensorModel(model, widget, state) {

        var attributes = state && state.attributes
            ? state.attributes
            : {};


        model.value = model.unavailable
            ? "–"
            : String(state.state);
        model.unit = model.unavailable
            ? ""
            : attributes.unit_of_measurement || "";
        model.tone = widget.iconClass === "humidity"
            ? "humidity"
            : widget.iconClass === "temperature"
                ? "temperature"
                : "neutral";

        return model;

    }


    function binaryModel(model) {

        if (model.state === "on") {
            model.stateText = "Offen";
            model.tone = "danger";
        } else if (model.state === "off") {
            model.stateText = "Geschlossen";
            model.tone = "success";
        } else {
            model.stateText = "Nicht verfügbar";
            model.tone = "neutral";
        }

        return model;

    }


    function lightModel(model, state) {

        var capabilities = state && state.gateway_capabilities
            ? state.gateway_capabilities
            : {};
        var available = model.state === "on" || model.state === "off";
        var isOn = model.state === "on";
        var capability = isOn
            ? capabilities.can_light_power_off === true
            : capabilities.can_light_power_on === true;


        model.isOn = isOn;
        model.stateText = available
            ? isOn
                ? "An"
                : "Aus"
            : "Nicht verfügbar";
        model.powerLabel = available
            ? isOn
                ? "Ausschalten"
                : "Einschalten"
            : "Nicht verfügbar";
        model.powerAvailable =
            available &&
            capability &&
            !model.controlsDisabled;
        model.tone = available
            ? isOn
                ? "on"
                : "off"
            : "neutral";

        return model;

    }


    function climateModel(model, widget, state) {

        var attributes = state && state.attributes
            ? state.attributes
            : {};
        var capabilities = state && state.gateway_capabilities
            ? state.gateway_capabilities
            : {};
        var current = toNumber(attributes.current_temperature);
        var target = toNumber(attributes.temperature);
        var minimum = toNumber(attributes.min_temp);
        var maximum = toNumber(attributes.max_temp);
        var step = toNumber(attributes.target_temp_step);
        var stateInfo = climateState(
            model.state,
            attributes.hvac_action
        );
        var temperatureAvailable;


        if (minimum === null) {
            minimum = 5;
        }

        if (maximum === null) {
            maximum = 35;
        }

        if (step === null || step <= 0) {
            step = 0.5;
        }

        temperatureAvailable =
            !model.controlsDisabled &&
            target !== null &&
            capabilities.can_set_temperature === true;

        model.unit = widget.unit || "°C";
        model.currentTemperature = current;
        model.currentText = formatNumber(current, 1);
        model.targetTemperature = target;
        model.targetText = formatNumber(
            target,
            Math.max(1, decimalPlaces(step))
        );
        model.minimum = minimum;
        model.maximum = maximum;
        model.step = step;
        model.stateText = stateInfo.text;
        model.tone = stateInfo.tone;
        model.canDecrease =
            temperatureAvailable &&
            target - step >= minimum - 0.000001;
        model.canIncrease =
            temperatureAvailable &&
            target + step <= maximum + 0.000001;
        model.powerVisible =
            capabilities.supports_power === true;
        model.powerAvailable =
            !model.controlsDisabled &&
            (
                model.state === "off"
                    ? capabilities.can_power_on === true
                    : capabilities.can_power_off === true
            );
        model.isOn = model.state !== "off";
        model.powerLabel = model.state === "off"
            ? "Thermostat einschalten"
            : "Thermostat ausschalten";

        return model;

    }


    function create(source) {

        var settings = source || {};
        var widget = settings.widget;
        var state = settings.state || {
            state: "unavailable",
            attributes: {}
        };
        var options = {
            controlsDisabled: settings.controlsDisabled === true,
            stale: settings.stale === true
        };
        var model;


        if (!widget || !widget.id || !widget.type) {
            return null;
        }

        model = commonModel(widget, state, options);

        if (model.type === "sensor") {
            return sensorModel(model, widget, state);
        }

        if (model.type === "binary") {
            return binaryModel(model);
        }

        if (model.type === "light") {
            return lightModel(model, state);
        }

        if (model.type === "climate") {
            return climateModel(model, widget, state);
        }

        return null;

    }


    return {
        create: create
    };

}());
