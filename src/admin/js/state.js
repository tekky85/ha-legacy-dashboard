(function (admin) {
    "use strict";

    let savedConfiguration = null;
    let draftConfiguration = null;
    let selectedDashboardId = null;
    let entities = [];
    let previewEntities = [];
    let dirty = false;

    function clone(value) {
        return value === null
            ? null
            : JSON.parse(JSON.stringify(value));
    }

    function findDashboard(configuration, dashboardId) {
        if (!configuration) {
            return null;
        }

        return configuration.dashboards.find(function (dashboard) {
            return dashboard.id === dashboardId;
        }) || null;
    }

    function setConfiguration(configuration) {
        savedConfiguration = clone(configuration);
        draftConfiguration = clone(configuration);
        dirty = false;

        if (!findDashboard(draftConfiguration, selectedDashboardId)) {
            selectedDashboardId = configuration.defaultDashboardId;
        }
    }

    function clear() {
        savedConfiguration = null;
        draftConfiguration = null;
        selectedDashboardId = null;
        entities = [];
        previewEntities = [];
        dirty = false;
    }

    function discard() {
        draftConfiguration = clone(savedConfiguration);
        dirty = false;

        if (!findDashboard(draftConfiguration, selectedDashboardId)) {
            selectedDashboardId = draftConfiguration.defaultDashboardId;
        }
    }

    function markDirty() {
        dirty = true;
    }

    function allWidgetIds() {
        const ids = [];

        if (!draftConfiguration) {
            return ids;
        }

        draftConfiguration.dashboards.forEach(function (dashboard) {
            dashboard.widgets.forEach(function (widget) {
                ids.push(widget.id);
            });
        });

        return ids;
    }

    function uniqueWidgetId(baseId) {
        const normalizedBase = String(baseId || "widget")
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 55) || "widget";

        const existing = allWidgetIds();
        let candidate = normalizedBase;
        let suffix = 2;

        while (existing.indexOf(candidate) !== -1) {
            candidate = (
                normalizedBase.slice(0, 58 - String(suffix).length) +
                "-" + suffix
            );
            suffix += 1;
        }

        return candidate;
    }

    admin.State = {
        clone: clone,
        setConfiguration: setConfiguration,
        clear: clear,
        discard: discard,
        markDirty: markDirty,
        isDirty: function () {
            return dirty;
        },
        getDraft: function () {
            return draftConfiguration;
        },
        getSaved: function () {
            return savedConfiguration;
        },
        getSelectedDashboard: function () {
            return findDashboard(
                draftConfiguration,
                selectedDashboardId
            );
        },
        getSelectedDashboardId: function () {
            return selectedDashboardId;
        },
        selectDashboard: function (dashboardId) {
            if (!findDashboard(draftConfiguration, dashboardId)) {
                throw new Error("Dashboard wurde nicht gefunden.");
            }
            selectedDashboardId = dashboardId;
        },
        setEntities: function (nextEntities) {
            entities = clone(nextEntities || []);
        },
        getEntities: function () {
            return clone(entities);
        },
        setPreviewEntities: function (nextEntities) {
            previewEntities = clone(nextEntities || []);
        },
        getPreviewEntity: function (entityId) {
            return clone(
                previewEntities.find(function (entity) {
                    return entity.entity_id === entityId;
                }) || null
            );
        },
        uniqueWidgetId: uniqueWidgetId
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
