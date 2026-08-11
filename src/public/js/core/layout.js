/*
 * ES5-compatible absolute-positioned grid renderer.
 *
 * The legacy wall display intentionally does not use CSS Grid. Only known
 * profiles and validated integer values are converted to inline geometry.
 */

var LegacyLayout = (function () {

    var PROFILE_COLUMNS = {
        portrait: 3,
        landscape: 6
    };

    var MAX_ROWS = 100;
    var MAX_HEIGHT = 4;

    var configuredLayouts = null;
    var configuredWidgets = [];


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

        return (
            widget &&
            widget.type === "climate" &&
            name === "landscape"
        )
            ? 2
            : 1;

    }


    function preferredSize(widget, name) {

        var width = 1;
        var height = 1;


        if (widget.size === "wide") {
            width = 2;
        } else if (widget.size === "tall") {
            height = 2;
        } else if (widget.size === "large") {
            width = 2;
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

        configuredLayouts = layouts || null;
        configuredWidgets = widgets || [];

    }


    function apply(container) {

        var name;
        var profile;
        var cards;
        var rowHeight;
        var maximumRow = 0;
        var index;
        var card;
        var widgetId;
        var item;
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


        rowHeight =
            name === "landscape"
                ? 240
                : 260;

        container.className =
            "grid grid-layout-active layout-" +
            name;

        cards =
            container.getElementsByClassName("card");


        for (index = 0; index < cards.length; index++) {

            card = cards[index];
            widgetId = card.getAttribute("data-widget-id");
            item = profile.items[widgetId];

            if (!item) {
                continue;
            }

            widthPercent =
                item.w / profile.columns * 100;

            card.style.left =
                item.x / profile.columns * 100 + "%";
            card.style.top =
                item.y * rowHeight + "px";
            card.style.width =
                "calc(" + widthPercent + "% - 20px)";
            card.style.height =
                item.h * rowHeight - 20 + "px";
            card.style.minHeight = "0";

            maximumRow = Math.max(
                maximumRow,
                item.y + item.h
            );

        }


        container.style.height =
            maximumRow * rowHeight + "px";

    }


    return {
        configure: configure,
        apply: apply,
        getProfileName: profileName
    };

}());
