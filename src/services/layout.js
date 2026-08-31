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
    portrait: 6,
    landscape: 12
};

const LEGACY_PROFILE_COLUMNS = {
    portrait: 3,
    landscape: 6
};

const MAX_LAYOUT_ROWS = 100;
const MAX_ITEM_HEIGHT = 4;

const SIZE_DIMENSIONS = {
    compact: {w: 2, h: 1},
    normal: {w: 3, h: 1},
    wide: {w: 6, h: 1},
    tall: {w: 3, h: 2},
    large: {w: 6, h: 2}
};

const WIDGET_MINIMUM_SIZES = {
    sensor: {
        portrait: {w: 2, h: 1},
        landscape: {w: 2, h: 1}
    },
    binary: {
        portrait: {w: 2, h: 1},
        landscape: {w: 2, h: 1}
    },
    light: {
        portrait: {w: 2, h: 1},
        landscape: {w: 2, h: 1}
    },
    climate: {
        portrait: {w: 2, h: 1},
        landscape: {w: 3, h: 1}
    },
    room: {
        portrait: {w: 2, h: 1},
        landscape: {w: 2, h: 1}
    }
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

    const typeRules =
        WIDGET_MINIMUM_SIZES[widget.type] ||
        WIDGET_MINIMUM_SIZES.sensor;

    const minimum =
        typeRules[profileName] ||
        typeRules.portrait;


    return {
        w: minimum.w,
        h: minimum.h
    };

}


function getLegacyMinimumSize(widget, profileName) {

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


function sectionKey(widget) {

    return widget && typeof widget.sectionId === "string"
        ? widget.sectionId
        : "";

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
    const blockingWidgetIdsBySection = Object.create(null);

    const orderedWidgets =
        widgets.slice(0).sort(function (first, second) {
            return first.order - second.order;
        });


    orderedWidgets.forEach(function (widget) {

        const preferred =
            getPreferredSize(widget, profileName);

        const widgetSectionKey =
            sectionKey(widget);

        const blockingWidgetIds =
            blockingWidgetIdsBySection[widgetSectionKey] ||
            Object.create(null);


        blockingWidgetIdsBySection[widgetSectionKey] =
            blockingWidgetIds;

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
    columns,
    minimum
) {


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


function validateLayoutsWithRules(
    dashboard,
    profileColumns,
    minimumSize
) {

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
            profileColumns[profileName];


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
                expectedColumns,
                minimumSize(
                    widgetById[widgetId],
                    profileName
                )
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
                    sectionKey(widgetById[visibleIds[firstIndex]]) ===
                        sectionKey(widgetById[visibleIds[secondIndex]]) &&
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


function validateLayouts(dashboard) {

    return validateLayoutsWithRules(
        dashboard,
        PROFILE_COLUMNS,
        getMinimumSize
    );

}


function validateLegacyLayouts(dashboard) {

    return validateLayoutsWithRules(
        dashboard,
        LEGACY_PROFILE_COLUMNS,
        getLegacyMinimumSize
    );

}


function migrateLegacyLayouts(layouts) {

    const migrated = {};


    PROFILES.forEach(function (profileName) {

        const source = layouts[profileName];
        const items = {};


        Object.keys(source.items).forEach(function (widgetId) {

            const item = source.items[widgetId];

            items[widgetId] = {
                x: item.x * 2,
                y: item.y,
                w: item.w * 2,
                h: item.h
            };

        });


        migrated[profileName] = {
            columns: PROFILE_COLUMNS[profileName],
            items: items
        };

    });


    return migrated;

}


function visibleWidgetMap(dashboard, ignoredWidgetId, targetSectionId) {

    const visible = Object.create(null);


    dashboard.widgets.forEach(function (widget) {
        if (
            widget.visible &&
            widget.id !== ignoredWidgetId &&
            sectionKey(widget) === targetSectionId
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
                visibleWidgetMap(
                    dashboard,
                    widget.id,
                    sectionKey(widget)
                )
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
            visibleWidgetMap(
                dashboard,
                widget.id,
                sectionKey(widget)
            );


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


function relocateWidget(dashboard, widget) {
    PROFILES.forEach(function (profileName) {

        const profile = dashboard.layouts[profileName];
        const current = profile.items[widget.id];
        const preferred =
            current || getPreferredSize(widget, profileName);
        const minimum = getMinimumSize(widget, profileName);


        profile.items[widget.id] =
            findFirstPosition(
                Math.max(minimum.w, preferred.w),
                Math.max(minimum.h, preferred.h),
                profile.columns,
                profile.items,
                visibleWidgetMap(
                    dashboard,
                    widget.id,
                    sectionKey(widget)
                )
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
    LEGACY_PROFILE_COLUMNS:
        Object.assign({}, LEGACY_PROFILE_COLUMNS),
    WIDGET_MINIMUM_SIZES:
        JSON.parse(JSON.stringify(WIDGET_MINIMUM_SIZES)),
    MAX_LAYOUT_ROWS: MAX_LAYOUT_ROWS,
    MAX_ITEM_HEIGHT: MAX_ITEM_HEIGHT,
    createLayouts: createLayouts,
    cloneLayouts: cloneLayouts,
    validateLayouts: validateLayouts,
    validateLegacyLayouts: validateLegacyLayouts,
    migrateLegacyLayouts: migrateLegacyLayouts,
    getMinimumSize: getMinimumSize,
    getPreferredSize: getPreferredSize,
    positionIsFree: positionIsFree,
    findFirstPosition: findFirstPosition,
    addWidget: addWidget,
    removeWidget: removeWidget,
    ensureVisibleWidgetPlacement: ensureVisibleWidgetPlacement,
    relocateWidget: relocateWidget,
    publicLayouts: publicLayouts,
    overlaps: overlaps,
    sectionKey: sectionKey
};
