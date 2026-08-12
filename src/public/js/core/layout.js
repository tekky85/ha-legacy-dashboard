/*
 * ES5-compatible absolute-positioned grid renderer.
 *
 * The legacy wall display intentionally does not use CSS Grid. Only known
 * profiles and validated integer values are converted to inline geometry.
 */

var LegacyLayout = (function () {

    var PROFILE_COLUMNS = {
        portrait: 6,
        landscape: 12
    };

    var MAX_ROWS = 100;
    var MAX_HEIGHT = 4;
    var CARD_GUTTER = 20;
    var ROW_ASPECT_FACTOR = 0.9;
    var MINIMUM_USABLE_ROW_HEIGHT = 128;

    var configuredLayouts = null;
    var configuredWidgets = [];
    var configuredWidgetById = {};
    var presentationCache = {};
    var presentationComputationCount = 0;
    var geometryCache = {};
    var geometryComputationCount = 0;


    function isInteger(value) {

        return (
            typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value
        );

    }


    function profileName() {

        return (
            window.innerWidth > window.innerHeight
        )
            ? "landscape"
            : "portrait";

    }


    function minimumWidth(widget, name) {

        if (widget && widget.type === "climate") {
            return name === "landscape"
                ? 3
                : 2;
        }

        return 2;

    }


    function preferredSize(widget, name) {

        var width = 3;
        var height = 1;


        if (widget.size === "compact") {
            width = 2;
        } else if (widget.size === "wide") {
            width = 6;
        } else if (widget.size === "tall") {
            width = 3;
            height = 2;
        } else if (widget.size === "large") {
            width = 6;
            height = 2;
        }


        return {
            w: Math.min(
                PROFILE_COLUMNS[name],
                Math.max(
                    minimumWidth(widget, name),
                    width
                )
            ),
            h: height
        };

    }


    function overlaps(first, second) {

        return !(
            first.x + first.w <= second.x ||
            second.x + second.w <= first.x ||
            first.y + first.h <= second.y ||
            second.y + second.h <= first.y
        );

    }


    function firstFree(items, width, height, columns) {

        var ids = [];
        var y;
        var x;
        var index;
        var candidate;
        var free;


        for (index = 0; index < items.length; index++) {
            ids.push(index);
        }


        for (y = 0; y <= MAX_ROWS - height; y++) {

            for (x = 0; x <= columns - width; x++) {

                candidate = {
                    x: x,
                    y: y,
                    w: width,
                    h: height
                };

                free = true;

                for (index = 0; index < ids.length; index++) {
                    if (overlaps(candidate, items[ids[index]])) {
                        free = false;
                        break;
                    }
                }

                if (free) {
                    return candidate;
                }

            }

        }


        return null;

    }


    function automaticProfile(widgets, name) {

        var columns = PROFILE_COLUMNS[name];
        var occupied = [];
        var items = {};
        var index;
        var widget;
        var size;
        var position;


        for (index = 0; index < widgets.length; index++) {

            widget = widgets[index];
            size = preferredSize(widget, name);
            position = firstFree(
                occupied,
                size.w,
                size.h,
                columns
            );

            if (!position) {
                return null;
            }

            items[widget.id] = position;
            occupied.push(position);

        }


        return {
            columns: columns,
            items: items
        };

    }


    function safeProfile(layouts, widgets, name) {

        var source =
            layouts && layouts[name];

        var columns =
            PROFILE_COLUMNS[name];

        var items = {};
        var occupied = [];
        var index;
        var widget;
        var item;
        var safe;
        var otherIndex;


        if (
            !source ||
            source.columns !== columns ||
            !source.items ||
            typeof source.items !== "object"
        ) {
            return automaticProfile(widgets, name);
        }


        for (index = 0; index < widgets.length; index++) {

            widget = widgets[index];
            item = source.items[widget.id];

            safe = Boolean(
                item &&
                isInteger(item.x) &&
                isInteger(item.y) &&
                isInteger(item.w) &&
                isInteger(item.h) &&
                item.x >= 0 &&
                item.y >= 0 &&
                item.w >= minimumWidth(widget, name) &&
                item.h >= 1 &&
                item.w <= columns &&
                item.h <= MAX_HEIGHT &&
                item.x + item.w <= columns &&
                item.y + item.h <= MAX_ROWS
            );

            if (!safe) {
                return automaticProfile(widgets, name);
            }

            for (otherIndex = 0; otherIndex < occupied.length; otherIndex++) {
                if (overlaps(item, occupied[otherIndex])) {
                    return automaticProfile(widgets, name);
                }
            }

            items[widget.id] = {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h
            };
            occupied.push(items[widget.id]);

        }


        return {
            columns: columns,
            items: items
        };

    }


    function configure(layouts, widgets) {

        var index;


        configuredLayouts = layouts || null;
        configuredWidgets = widgets || [];
        configuredWidgetById = {};
        presentationCache = {};
        presentationComputationCount = 0;
        geometryCache = {};
        geometryComputationCount = 0;


        for (index = 0; index < configuredWidgets.length; index++) {
            configuredWidgetById[configuredWidgets[index].id] =
                configuredWidgets[index];
        }

    }


    function getPresentationMode(
        widget,
        width,
        height,
        effectiveWidth,
        effectiveHeight
    ) {

        presentationComputationCount++;


        if (typeof LegacyPresentation !== "undefined") {
            return LegacyPresentation.getMode(
                widget,
                width,
                height,
                effectiveWidth,
                effectiveHeight
            );
        }


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


    function resolvePresentationMode(
        name,
        widget,
        item,
        effectiveWidth,
        effectiveHeight
    ) {

        var key = name + ":" + widget.id;
        var signature =
            widget.type + ":" + item.w + ":" + item.h +
            ":" + Math.round(effectiveWidth) +
            ":" + Math.round(effectiveHeight);
        var cached = presentationCache[key];


        if (cached && cached.signature === signature) {
            return cached.mode;
        }


        cached = {
            signature: signature,
            mode: getPresentationMode(
                widget,
                item.w,
                item.h,
                effectiveWidth,
                effectiveHeight
            )
        };

        presentationCache[key] = cached;

        return cached.mode;

    }


    function calculateGridGeometry(containerWidth, columns) {

        var safeWidth = parseFloat(containerWidth);
        var columnWidth;
        var rowHeight;


        geometryComputationCount++;


        if (typeof LegacyPresentation !== "undefined") {
            return LegacyPresentation.calculateGridGeometry(
                containerWidth,
                columns
            );
        }


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


    function resolveGridGeometry(name, container, columns) {

        var containerWidth = parseFloat(container.clientWidth);
        var signature;
        var cached;


        if (!isFinite(containerWidth) || containerWidth <= 0) {
            containerWidth = parseFloat(window.innerWidth);
        }


        signature =
            Math.round(containerWidth) + ":" + columns;

        cached = geometryCache[name];


        if (cached && cached.signature === signature) {
            return cached.geometry;
        }


        cached = {
            signature: signature,
            geometry: calculateGridGeometry(
                containerWidth,
                columns
            )
        };

        geometryCache[name] = cached;

        return cached.geometry;

    }


    function applyPresentationMode(card, mode) {

        var className = card.className || "";


        className = className.replace(
            /\s*card-presentation-(compact|normal|expanded)/g,
            ""
        );

        card.className =
            className + " card-presentation-" + mode;

    }


    function apply(container) {

        var name;
        var profile;
        var cards;
        var geometry;
        var maximumRow = 0;
        var index;
        var card;
        var widgetId;
        var item;
        var widget;
        var presentationMode;
        var effectiveWidth;
        var effectiveHeight;
        var widthPercent;


        if (!container || !configuredWidgets.length) {
            return;
        }


        name = profileName();
        profile = safeProfile(
            configuredLayouts,
            configuredWidgets,
            name
        );


        if (!profile) {
            return;
        }


        geometry = resolveGridGeometry(
            name,
            container,
            profile.columns
        );

        container.className =
            "grid grid-layout-active layout-" +
            name;

        cards =
            container.getElementsByClassName("card");


        for (index = 0; index < cards.length; index++) {

            card = cards[index];
            widgetId = card.getAttribute("data-widget-id");
            item = profile.items[widgetId];
            widget = configuredWidgetById[widgetId];

            if (!item || !widget) {
                continue;
            }

            effectiveWidth = Math.max(
                0,
                item.w * geometry.columnWidth -
                    geometry.gutter
            );

            effectiveHeight = Math.max(
                0,
                item.h * geometry.rowHeight -
                    geometry.gutter
            );

            presentationMode = resolvePresentationMode(
                name,
                widget,
                item,
                effectiveWidth,
                effectiveHeight
            );

            applyPresentationMode(
                card,
                presentationMode
            );

            widthPercent =
                item.w / profile.columns * 100;

            card.style.left =
                item.x / profile.columns * 100 + "%";
            card.style.top =
                item.y * geometry.rowHeight + "px";
            card.style.width =
                "calc(" + widthPercent + "% - " +
                    geometry.gutter + "px)";
            card.style.height =
                effectiveHeight + "px";
            card.style.minHeight = "0";

            maximumRow = Math.max(
                maximumRow,
                item.y + item.h
            );

        }


        container.style.height =
            maximumRow * geometry.rowHeight + "px";

    }


    return {
        configure: configure,
        apply: apply,
        getProfileName: profileName,
        getPresentationMode: getPresentationMode,
        calculateGridGeometry: calculateGridGeometry,
        getPresentationComputationCount: function () {
            return presentationComputationCount;
        },
        getGeometryComputationCount: function () {
            return geometryComputationCount;
        }
    };

}());
