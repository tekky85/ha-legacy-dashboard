(function (admin) {
    "use strict";

    const PROFILES = ["portrait", "landscape"];
    const COLUMNS = {
        portrait: 6,
        landscape: 12
    };
    const MAX_ROWS = 100;
    const MAX_HEIGHT = 4;
    const SIZE_DIMENSIONS = {
        compact: {w: 2, h: 1},
        normal: {w: 3, h: 1},
        wide: {w: 6, h: 1},
        tall: {w: 3, h: 2},
        large: {w: 6, h: 2}
    };
    const MINIMUM_SIZES = {
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
        }
    };

    function findDashboard(dashboardId) {
        const draft = admin.State.getDraft();
        const dashboard = draft && draft.dashboards.find(function (item) {
            return item.id === dashboardId;
        });

        if (!dashboard) {
            throw new Error("Dashboard wurde nicht gefunden.");
        }

        return dashboard;
    }

    function findWidget(dashboard, widgetId) {
        const widget = dashboard.widgets.find(function (item) {
            return item.id === widgetId;
        });

        if (!widget) {
            throw new Error("Widget wurde nicht gefunden.");
        }

        return widget;
    }

    function minimumSize(widget, profileName) {
        const typeRules = MINIMUM_SIZES[widget.type] || MINIMUM_SIZES.sensor;
        const minimum = typeRules[profileName] || typeRules.portrait;

        return {
            w: minimum.w,
            h: minimum.h
        };
    }

    function preferredSize(widget, profileName) {
        const preset = SIZE_DIMENSIONS[widget.size] || SIZE_DIMENSIONS.normal;
        const minimum = minimumSize(widget, profileName);

        return {
            w: Math.min(COLUMNS[profileName], Math.max(minimum.w, preset.w)),
            h: Math.min(MAX_HEIGHT, Math.max(minimum.h, preset.h))
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

    function visibleWidgetIds(dashboard, ignoredWidgetId, targetSectionId) {
        const ids = Object.create(null);

        dashboard.widgets.forEach(function (widget) {
            if (
                widget.visible &&
                widget.id !== ignoredWidgetId &&
                sectionKey(widget) === targetSectionId
            ) {
                ids[widget.id] = true;
            }
        });

        return ids;
    }

    function isFree(dashboard, widget, profileName, candidate) {
        const items = dashboard.layouts[profileName].items;
        const blockers = visibleWidgetIds(
            dashboard,
            widget.id,
            sectionKey(widget)
        );

        return !Object.keys(items).some(function (widgetId) {
            return blockers[widgetId] && overlaps(candidate, items[widgetId]);
        });
    }

    function isValidCandidate(dashboard, widget, profileName, candidate) {
        const minimum = minimumSize(widget, profileName);
        const columns = COLUMNS[profileName];

        return Boolean(
            candidate &&
            [candidate.x, candidate.y, candidate.w, candidate.h]
                .every(Number.isInteger) &&
            candidate.x >= 0 &&
            candidate.y >= 0 &&
            candidate.w >= minimum.w &&
            candidate.h >= minimum.h &&
            candidate.w <= columns &&
            candidate.h <= MAX_HEIGHT &&
            candidate.x + candidate.w <= columns &&
            candidate.y + candidate.h <= MAX_ROWS &&
            isFree(dashboard, widget, profileName, candidate)
        );
    }

    function firstFreePosition(dashboard, widget, profileName, width, height) {
        const columns = COLUMNS[profileName];
        let y;
        let x;
        let candidate;

        for (y = 0; y <= MAX_ROWS - height; y += 1) {
            for (x = 0; x <= columns - width; x += 1) {
                candidate = {x: x, y: y, w: width, h: height};

                if (isFree(dashboard, widget, profileName, candidate)) {
                    return candidate;
                }
            }
        }

        throw new Error("Für dieses Widget ist kein freier Rasterplatz verfügbar.");
    }

    function emptyLayouts() {
        return {
            portrait: {columns: COLUMNS.portrait, items: {}},
            landscape: {columns: COLUMNS.landscape, items: {}}
        };
    }

    function ensureDashboard(dashboard) {
        if (!dashboard.layouts) {
            dashboard.layouts = emptyLayouts();
        }

        PROFILES.forEach(function (profileName) {
            if (!dashboard.layouts[profileName]) {
                dashboard.layouts[profileName] = {
                    columns: COLUMNS[profileName],
                    items: {}
                };
            }
        });
    }

    function addWidgetToDashboard(dashboard, widget) {
        ensureDashboard(dashboard);

        PROFILES.forEach(function (profileName) {
            const preferred = preferredSize(widget, profileName);
            dashboard.layouts[profileName].items[widget.id] =
                firstFreePosition(
                    dashboard,
                    widget,
                    profileName,
                    preferred.w,
                    preferred.h
                );
        });
    }

    function createLayouts(widgets) {
        const dashboard = {
            widgets: widgets,
            layouts: emptyLayouts()
        };

        widgets.slice().sort(function (first, second) {
            return first.order - second.order;
        }).forEach(function (widget) {
            addWidgetToDashboard(dashboard, widget);
        });

        return dashboard.layouts;
    }

    function place(dashboardId, widgetId, profileName, candidate) {
        if (PROFILES.indexOf(profileName) === -1) {
            return false;
        }

        const dashboard = findDashboard(dashboardId);
        const widget = findWidget(dashboard, widgetId);

        ensureDashboard(dashboard);

        const normalized = {
            x: Number(candidate.x),
            y: Number(candidate.y),
            w: Number(candidate.w),
            h: Number(candidate.h)
        };

        if (!isValidCandidate(dashboard, widget, profileName, normalized)) {
            return false;
        }

        dashboard.layouts[profileName].items[widgetId] = normalized;
        admin.State.markDirty();
        return true;
    }

    function canPlace(dashboardId, widgetId, profileName, candidate) {
        if (PROFILES.indexOf(profileName) === -1) {
            return false;
        }

        const dashboard = findDashboard(dashboardId);
        const widget = findWidget(dashboard, widgetId);
        const normalized = {
            x: Number(candidate.x),
            y: Number(candidate.y),
            w: Number(candidate.w),
            h: Number(candidate.h)
        };

        ensureDashboard(dashboard);
        return isValidCandidate(
            dashboard,
            widget,
            profileName,
            normalized
        );
    }

    function move(dashboardId, widgetId, profileName, deltaX, deltaY) {
        const dashboard = findDashboard(dashboardId);
        ensureDashboard(dashboard);
        const current = dashboard.layouts[profileName].items[widgetId];

        return place(dashboardId, widgetId, profileName, {
            x: current.x + deltaX,
            y: current.y + deltaY,
            w: current.w,
            h: current.h
        });
    }

    function resize(dashboardId, widgetId, profileName, deltaW, deltaH) {
        const dashboard = findDashboard(dashboardId);
        ensureDashboard(dashboard);
        const current = dashboard.layouts[profileName].items[widgetId];

        return place(dashboardId, widgetId, profileName, {
            x: current.x,
            y: current.y,
            w: current.w + deltaW,
            h: current.h + deltaH
        });
    }

    function ensureVisiblePlacement(dashboardId, widgetId) {
        const dashboard = findDashboard(dashboardId);
        const widget = findWidget(dashboard, widgetId);

        if (!widget.visible) {
            return;
        }

        ensureDashboard(dashboard);

        PROFILES.forEach(function (profileName) {
            const current = dashboard.layouts[profileName].items[widgetId];

            if (
                current &&
                isValidCandidate(dashboard, widget, profileName, current)
            ) {
                return;
            }

            const preferred = current || preferredSize(widget, profileName);
            const minimum = minimumSize(widget, profileName);

            dashboard.layouts[profileName].items[widgetId] =
                firstFreePosition(
                    dashboard,
                    widget,
                    profileName,
                    Math.max(minimum.w, preferred.w),
                    Math.max(minimum.h, preferred.h)
                );
        });
    }

    function relocateWidget(dashboardId, widgetId) {
        const dashboard = findDashboard(dashboardId);
        const widget = findWidget(dashboard, widgetId);

        ensureDashboard(dashboard);

        PROFILES.forEach(function (profileName) {
            const current = dashboard.layouts[profileName].items[widgetId];
            const preferred = current || preferredSize(widget, profileName);
            const minimum = minimumSize(widget, profileName);

            dashboard.layouts[profileName].items[widgetId] =
                firstFreePosition(
                    dashboard,
                    widget,
                    profileName,
                    Math.max(minimum.w, preferred.w),
                    Math.max(minimum.h, preferred.h)
                );
        });
    }

    function removeWidget(dashboard, widgetId) {
        ensureDashboard(dashboard);
        PROFILES.forEach(function (profileName) {
            delete dashboard.layouts[profileName].items[widgetId];
        });
    }

    function remapLayouts(sourceDashboard, widgetIdMap) {
        const layouts = emptyLayouts();

        PROFILES.forEach(function (profileName) {
            const sourceProfile = sourceDashboard.layouts[profileName];

            Object.keys(sourceProfile.items).forEach(function (oldWidgetId) {
                const newWidgetId = widgetIdMap[oldWidgetId];
                const item = sourceProfile.items[oldWidgetId];

                if (newWidgetId) {
                    layouts[profileName].items[newWidgetId] = {
                        x: item.x,
                        y: item.y,
                        w: item.w,
                        h: item.h
                    };
                }
            });
        });

        return layouts;
    }

    function rowCount(dashboard, profileName, targetSectionId) {
        const items = dashboard.layouts[profileName].items;
        let maximum = 1;

        const expectedSectionId =
            typeof targetSectionId === "string"
                ? targetSectionId
                : "";

        dashboard.widgets.forEach(function (widget) {
            const item = items[widget.id];
            if (
                widget.visible &&
                item &&
                sectionKey(widget) === expectedSectionId
            ) {
                maximum = Math.max(maximum, item.y + item.h);
            }
        });

        return maximum;
    }

    function cellFromPoint(element, profileName, clientX, clientY) {
        const bounds = element.getBoundingClientRect();
        const columns = COLUMNS[profileName];
        const rowHeight = Number(element.dataset.rowHeight) || 194;

        return {
            x: Math.max(0, Math.min(
                columns - 1,
                Math.floor((clientX - bounds.left) / (bounds.width / columns))
            )),
            y: Math.max(0, Math.floor((clientY - bounds.top) / rowHeight))
        };
    }

    admin.Layout = {
        PROFILES: PROFILES.slice(),
        COLUMNS: Object.assign({}, COLUMNS),
        MAX_ROWS: MAX_ROWS,
        MAX_HEIGHT: MAX_HEIGHT,
        emptyLayouts: emptyLayouts,
        createLayouts: createLayouts,
        ensureDashboard: ensureDashboard,
        addWidget: addWidgetToDashboard,
        removeWidget: removeWidget,
        ensureVisiblePlacement: ensureVisiblePlacement,
        relocateWidget: relocateWidget,
        remapLayouts: remapLayouts,
        minimumSize: minimumSize,
        preferredSize: preferredSize,
        canPlace: canPlace,
        place: place,
        move: move,
        resize: resize,
        rowCount: rowCount,
        sectionKey: sectionKey,
        cellFromPoint: cellFromPoint,
        overlaps: overlaps
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
