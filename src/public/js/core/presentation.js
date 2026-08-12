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


    function getMode(
        widget,
        width,
        height,
        effectiveWidth,
        effectiveHeight
    ) {

        if (
            typeof effectiveWidth === "number" &&
            typeof effectiveHeight === "number"
        ) {

            if (widget && widget.type === "climate") {

                if (
                    effectiveWidth >= 360 &&
                    effectiveHeight >= 210
                ) {
                    return "expanded";
                }

                if (
                    effectiveWidth < 200 ||
                    effectiveHeight < 170
                ) {
                    return "compact";
                }

                return "normal";

            }


            if (
                effectiveWidth >= 220 &&
                effectiveHeight >= 210
            ) {
                return "expanded";
            }

            if (
                effectiveWidth < 180 ||
                effectiveHeight < 150
            ) {
                return "compact";
            }

            return "normal";

        }


        if (height >= 2 || width >= 6) {
            return "expanded";
        }

        if (widget && widget.type === "climate") {
            return width <= 4
                ? "compact"
                : "normal";
        }

        return width <= 2
            ? "compact"
            : "normal";

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
        getMode: getMode,
        calculateGridGeometry: calculateGridGeometry,
        getIdentity: getIdentity
    };

}());
