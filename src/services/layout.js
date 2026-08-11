/*
 * Deterministic dashboard grid layout.
 *
 * Only validated integer coordinates are accepted. Layout configuration
 * controls presentation only and never grants Home Assistant write access.
 */

const PROFILES = [
    "portrait",
    "landscape"
];

const PROFILE_COLUMNS = {
    portrait: 3,
    landscape: 6
};

const MAX_LAYOUT_ROWS = 100;
const MAX_ITEM_HEIGHT = 4;

const SIZE_DIMENSIONS = {
    compact: {w: 1, h: 1},
    normal: {w: 1, h: 1},
    wide: {w: 2, h: 1},
    tall: {w: 1, h: 2},
    large: {w: 2, h: 2}
};


function cloneItem(item) {

    return {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
    };

}


function cloneLayouts(layouts) {

    const cloned = {};


    PROFILES.forEach(function (profileName) {

        const source = layouts[profileName];
        const items = {};


        Object.keys(source.items).forEach(function (widgetId) {
            items[widgetId] = cloneItem(source.items[widgetId]);
        });

        cloned[profileName] = {
            columns: source.columns,
            items: items
        };

    });


    return cloned;

}


function getMinimumSize(widget, profileName) {

    return {
        w:
            widget.type === "climate" &&
            profileName === "landscape"
                ? 2
                : 1,
        h: 1
    };

}


function getPreferredSize(widget, profileName) {

    const columns =
        PROFILE_COLUMNS[profileName];

    const preset =
        SIZE_DIMENSIONS[widget.size] ||
        SIZE_DIMENSIONS.normal;

    const minimum =
        getMinimumSize(widget, profileName);


    return {
        w: Math.min(
            columns,
            Math.max(minimum.w, preset.w)
        ),
        h: Math.min(
            MAX_ITEM_HEIGHT,
            Math.max(minimum.h, preset.h)
        )
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


function positionIsFree(
    candidate,
    items,
    blockingWidgetIds,
    ignoredWidgetId
) {

    const widgetIds =
        Object.keys(items);

    let index;
    let widgetId;


    for (index = 0; index < widgetIds.length; index++) {

        widgetId = widgetIds[index];

        if (
            widgetId === ignoredWidgetId ||
            !blockingWidgetIds[widgetId]
        ) {
            continue;
        }

        if (overlaps(candidate, items[widgetId])) {
            return false;
        }

    }


    return true;

}


function findFirstPosition(
    width,
    height,
    columns,
    items,
    blockingWidgetIds
) {

    let y;
    let x;
    let candidate;


    for (y = 0; y <= MAX_LAYOUT_ROWS - height; y++) {

        for (x = 0; x <= columns - width; x++) {

            candidate = {
                x: x,
                y: y,
                w: width,
                h: height
            };

            if (
                positionIsFree(
                    candidate,
                    items,
                    blockingWidgetIds,
                    null
                )
            ) {
                return candidate;
            }

        }

    }


    throw new Error("Kein freier Rasterplatz verfügbar");

}


function createProfile(widgets, profileName) {

    const columns =
        PROFILE_COLUMNS[profileName];

    const items = {};
    const blockingWidgetIds = Object.create(null);

    const orderedWidgets =
        widgets.slice(0).sort(function (first, second) {
            return first.order - second.order;
        });


    orderedWidgets.forEach(function (widget) {

        const preferred =
            getPreferredSize(widget, profileName);

        const position =
            findFirstPosition(
                preferred.w,
                preferred.h,
                columns,
                items,
                blockingWidgetIds
            );


        items[widget.id] = position;

        if (widget.visible) {
            blockingWidgetIds[widget.id] = true;
        }

    });


    return {
        columns: columns,
        items: items
    };

}


function createLayouts(widgets) {

    const layouts = {};


    PROFILES.forEach(function (profileName) {
        layouts[profileName] =
            createProfile(widgets, profileName);
    });


    return layouts;

}


function layoutError(message) {

    const error = new Error(message);
    error.code = "invalid_layout";
    return error;

}


function isInteger(value) {

    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        Math.floor(value) === value
    );

}


function validateItem(
    item,
    widget,
    profileName,
    columns
) {

    const minimum =
        getMinimumSize(widget, profileName);


    if (
        !item ||
        !isInteger(item.x) ||
        !isInteger(item.y) ||
        !isInteger(item.w) ||
        !isInteger(item.h)
    ) {
        throw layoutError(
            "Rasterwerte müssen ganze Zahlen sein: " +
            widget.id
        );
    }

    if (
        item.x < 0 ||
        item.y < 0 ||
        item.w < minimum.w ||
        item.h < minimum.h ||
        item.w > columns ||
        item.h > MAX_ITEM_HEIGHT ||
        item.x + item.w > columns ||
        item.y + item.h > MAX_LAYOUT_ROWS
    ) {
        throw layoutError(
            "Rasterwerte liegen außerhalb der Grenzen: " +
            widget.id
        );
    }

}


function validateLayouts(dashboard) {

    const layouts = dashboard.layouts;
    const widgetById = Object.create(null);
    const visibleWidgetIds = Object.create(null);


    if (
        !layouts ||
        typeof layouts !== "object" ||
        Array.isArray(layouts)
    ) {
        throw layoutError("Dashboard-Layouts fehlen");
    }

    if (
        Object.keys(layouts).some(function (profileName) {
            return PROFILES.indexOf(profileName) === -1;
        })
    ) {
        throw layoutError("Unbekanntes Layoutprofil");
    }

    dashboard.widgets.forEach(function (widget) {
        widgetById[widget.id] = widget;
        if (widget.visible) {
            visibleWidgetIds[widget.id] = true;
        }
    });


    PROFILES.forEach(function (profileName) {

        const profile = layouts[profileName];
        const expectedColumns =
            PROFILE_COLUMNS[profileName];


        if (
            !profile ||
            profile.columns !== expectedColumns ||
            !profile.items ||
            typeof profile.items !== "object" ||
            Array.isArray(profile.items)
        ) {
            throw layoutError(
                "Layoutprofil ist ungültig: " +
                profileName
            );
        }


        Object.keys(profile.items).forEach(function (widgetId) {

            if (!widgetById[widgetId]) {
                throw layoutError(
                    "Layout verweist auf unbekanntes Widget: " +
                    widgetId
                );
            }

            validateItem(
                profile.items[widgetId],
                widgetById[widgetId],
                profileName,
                expectedColumns
            );

        });


        dashboard.widgets.forEach(function (widget) {
            if (!profile.items[widget.id]) {
                throw layoutError(
                    "Layoutposition fehlt: " +
                    widget.id
                );
            }
        });


        const visibleIds =
            Object.keys(visibleWidgetIds);

        let firstIndex;
        let secondIndex;


        for (
            firstIndex = 0;
            firstIndex < visibleIds.length;
            firstIndex++
        ) {

            for (
                secondIndex = firstIndex + 1;
                secondIndex < visibleIds.length;
                secondIndex++
            ) {

                if (
                    overlaps(
                        profile.items[visibleIds[firstIndex]],
                        profile.items[visibleIds[secondIndex]]
                    )
                ) {
                    throw layoutError(
                        "Layout enthält überlappende Widgets"
                    );
                }

            }

        }

    });


    return true;

}


function visibleWidgetMap(dashboard, ignoredWidgetId) {

    const visible = Object.create(null);


    dashboard.widgets.forEach(function (widget) {
        if (
            widget.visible &&
            widget.id !== ignoredWidgetId
        ) {
            visible[widget.id] = true;
        }
    });


    return visible;

}


function addWidget(dashboard, widget) {

    PROFILES.forEach(function (profileName) {

        const profile = dashboard.layouts[profileName];
        const preferred =
            getPreferredSize(widget, profileName);


        profile.items[widget.id] =
            findFirstPosition(
                preferred.w,
                preferred.h,
                profile.columns,
                profile.items,
                visibleWidgetMap(dashboard, widget.id)
            );

    });

}


function removeWidget(dashboard, widgetId) {

    PROFILES.forEach(function (profileName) {
        delete dashboard.layouts[profileName].items[widgetId];
    });

}


function ensureVisibleWidgetPlacement(dashboard, widget) {

    if (!widget.visible) {
        return;
    }


    PROFILES.forEach(function (profileName) {

        const profile = dashboard.layouts[profileName];
        const current = profile.items[widget.id];
        const blocking =
            visibleWidgetMap(dashboard, widget.id);


        if (
            current &&
            positionIsFree(
                current,
                profile.items,
                blocking,
                widget.id
            )
        ) {
            return;
        }

        const preferred =
            current ||
            getPreferredSize(widget, profileName);


        profile.items[widget.id] =
            findFirstPosition(
                Math.max(
                    getMinimumSize(widget, profileName).w,
                    preferred.w
                ),
                Math.max(1, preferred.h),
                profile.columns,
                profile.items,
                blocking
            );

    });

}


function publicLayouts(dashboard, visibleWidgets) {

    const visibleIds = Object.create(null);
    const layouts = {};


    visibleWidgets.forEach(function (widget) {
        visibleIds[widget.id] = true;
    });


    PROFILES.forEach(function (profileName) {

        const source = dashboard.layouts[profileName];
        const items = {};


        Object.keys(source.items).forEach(function (widgetId) {
            if (visibleIds[widgetId]) {
                items[widgetId] = cloneItem(source.items[widgetId]);
            }
        });

        layouts[profileName] = {
            columns: source.columns,
            items: items
        };

    });


    return layouts;

}


module.exports = {
    PROFILES: PROFILES.slice(0),
    PROFILE_COLUMNS: Object.assign({}, PROFILE_COLUMNS),
    MAX_LAYOUT_ROWS: MAX_LAYOUT_ROWS,
    MAX_ITEM_HEIGHT: MAX_ITEM_HEIGHT,
    createLayouts: createLayouts,
    cloneLayouts: cloneLayouts,
    validateLayouts: validateLayouts,
    getMinimumSize: getMinimumSize,
    getPreferredSize: getPreferredSize,
    positionIsFree: positionIsFree,
    findFirstPosition: findFirstPosition,
    addWidget: addWidget,
    removeWidget: removeWidget,
    ensureVisibleWidgetPlacement: ensureVisibleWidgetPlacement,
    publicLayouts: publicLayouts,
    overlaps: overlaps
};
