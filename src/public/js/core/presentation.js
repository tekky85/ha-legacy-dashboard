/*
 * Shared, side-effect-free card presentation rules.
 *
 * This file is intentionally ES5-compatible so the same decisions can be
 * used by the legacy wall display and by the modern Admin preview.
 */

var LegacyPresentation = (function () {

    var CARD_GUTTER = 20;
    var ROW_ASPECT_FACTOR = 0.9;
    var MINIMUM_USABLE_ROW_HEIGHT = 128;
    var TIERS = [
        "compact",
        "standard",
        "wide",
        "tall",
        "large"
    ];


    function numericValue(value) {

        var number = parseFloat(value);


        return isNaN(number)
            ? null
            : number;

    }


    function dataValue(data, attributeName, directName) {

        var attributes =
            data && data.attributes
                ? data.attributes
                : {};


        if (
            typeof attributes[attributeName] !== "undefined" &&
            attributes[attributeName] !== null
        ) {
            return attributes[attributeName];
        }


        if (
            data &&
            typeof data[directName || attributeName] !== "undefined" &&
            data[directName || attributeName] !== null
        ) {
            return data[directName || attributeName];
        }


        return null;

    }


    function contentDensity(widget, data, values) {

        var identity = getIdentity(widget, data);
        var subtitle = widget && widget.subtitle
            ? String(widget.subtitle)
            : "";
        var score = 0;
        var index;
        var text;


        if (identity.length > 24) {
            score += 2;
        } else if (identity.length > 16) {
            score += 1;
        }


        if (subtitle.length > 20) {
            score += 1;
        }


        for (index = 0; index < values.length; index++) {
            text = String(values[index] || "");

            if (text.length > 10) {
                score += 1;
            }
        }


        return score >= 2
            ? "dense"
            : "normal";

    }


    function getHints(widget, data) {

        var type = widget && widget.type
            ? widget.type
            : "";
        var state = data && data.state
            ? String(data.state)
            : "unavailable";
        var capabilities =
            data && data.gateway_capabilities
                ? data.gateway_capabilities
                : {};
        var available =
            state !== "unknown" &&
            state !== "unavailable";
        var controlCount = 0;
        var values = [state];
        var target;


        if (type === "sensor") {
            values.push(
                dataValue(
                    data,
                    "unit_of_measurement"
                )
            );
        } else if (type === "light") {
            if (
                state === "on" &&
                capabilities.can_light_power_off === true
            ) {
                controlCount = 1;
            } else if (
                state === "off" &&
                capabilities.can_light_power_on === true
            ) {
                controlCount = 1;
            }
        } else if (type === "climate") {
            target = numericValue(
                dataValue(
                    data,
                    "temperature",
                    "target_temperature"
                )
            );

            values.push(
                dataValue(
                    data,
                    "current_temperature"
                )
            );
            values.push(target);
            values.push(
                dataValue(
                    data,
                    "hvac_action"
                )
            );
            values.push(widget && widget.unit);

            if (
                available &&
                target !== null &&
                capabilities.can_set_temperature === true
            ) {
                controlCount += 2;
            }

            if (capabilities.supports_power === true) {
                controlCount += 1;
            }
        }


        return {
            available: available,
            contentDensity:
                contentDensity(widget, data, values),
            controlCount: controlCount,
            hasSecondary: Boolean(
                widget && widget.subtitle
            )
        };

    }


    function normalizeHints(hints) {

        var source = hints || {};
        var count = parseInt(
            source.controlCount,
            10
        );


        if (!isFinite(count) || count < 0) {
            count = 0;
        }


        return {
            contentDensity:
                source.contentDensity === "dense"
                    ? "dense"
                    : "normal",
            controlCount: Math.min(3, count),
            hasSecondary:
                source.hasSecondary === true ||
                source.hasSecondary === "true"
        };

    }


    function getMode(
        widget,
        width,
        height,
        effectiveWidth,
        effectiveHeight,
        hints
    ) {

        var type = widget && widget.type
            ? widget.type
            : "sensor";
        var details = normalizeHints(hints);
        var dense =
            details.contentDensity === "dense";
        var minimumWidth =
            type === "climate" || type === "room"
                ? 250
                : details.controlCount > 0
                    ? 180
                    : 160;
        var wideWidth =
            type === "climate" || type === "room"
                ? 400
                : details.controlCount > 0
                    ? 380
                    : 360;
        var largeWidth =
            type === "climate" || type === "room"
                ? 440
                : details.controlCount > 0
                    ? 420
                    : 400;


        if (dense) {
            wideWidth += 20;
            largeWidth += 20;
        }

        if (
            typeof effectiveWidth === "number" &&
            typeof effectiveHeight === "number"
        ) {

            if (
                effectiveWidth < minimumWidth
            ) {
                return "compact";
            }


            if (
                effectiveHeight < 150
            ) {
                return effectiveWidth >= wideWidth
                    ? "wide"
                    : "compact";
            }


            if (
                effectiveWidth >= largeWidth &&
                effectiveHeight >= 210
            ) {
                return "large";
            }


            if (effectiveHeight >= 300) {
                return "tall";
            }


            if (effectiveWidth >= wideWidth) {
                return "wide";
            }


            return "standard";

        }


        if (height >= 2 && width >= 6) {
            return "large";
        }


        if (height >= 3) {
            return "tall";
        }


        if (width >= 5) {
            return "wide";
        }


        if (
            height === 1 &&
            width <= (
                type === "climate"
                    ? 4
                    : 3
            )
        ) {
            return "compact";
        }


        return "standard";

    }


    function calculateGridGeometry(containerWidth, columns) {

        var safeWidth = parseFloat(containerWidth);
        var columnWidth;
        var rowHeight;


        if (!isFinite(safeWidth) || safeWidth <= 0) {
            safeWidth = 1;
        }


        columnWidth = safeWidth / columns;
        rowHeight = Math.max(
            MINIMUM_USABLE_ROW_HEIGHT,
            Math.round(
                columnWidth * ROW_ASPECT_FACTOR
            )
        );


        return {
            containerWidth: safeWidth,
            columnWidth: columnWidth,
            rowHeight: rowHeight,
            gutter: CARD_GUTTER
        };

    }


    function getIdentity(widget, data) {

        var attributes =
            data && data.attributes
                ? data.attributes
                : {};

        var candidates = [
            widget && widget.title,
            widget && widget.subtitle,
            attributes.friendly_name,
            data && data.friendly_name,
            widget && widget.entity,
            data && data.entity_id
        ];

        var index;
        var value;


        for (index = 0; index < candidates.length; index++) {

            if (typeof candidates[index] !== "string") {
                continue;
            }

            value = candidates[index].replace(
                /^\s+|\s+$/g,
                ""
            );

            if (value) {
                return value;
            }

        }


        return "Widget";

    }


    return {
        CARD_GUTTER: CARD_GUTTER,
        TIERS: TIERS.slice(0),
        getMode: getMode,
        getHints: getHints,
        calculateGridGeometry: calculateGridGeometry,
        getIdentity: getIdentity
    };

}());
