(function (admin) {
    "use strict";

    const DASHBOARD_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

    function requireDraft() {
        const draft = admin.State.getDraft();

        if (!draft) {
            throw new Error("Die Dashboard-Konfiguration wurde nicht geladen.");
        }

        return draft;
    }

    function validateIdentity(draft, id, title) {
        if (!DASHBOARD_ID_PATTERN.test(id || "")) {
            throw new Error(
                "Die technische ID darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten."
            );
        }

        if (!title || !title.trim()) {
            throw new Error("Bitte einen Dashboard-Titel eingeben.");
        }

        if (draft.dashboards.some(function (dashboard) {
            return dashboard.id === id;
        })) {
            throw new Error("Diese Dashboard-ID existiert bereits.");
        }
    }

    function findDashboard(draft, dashboardId) {
        const dashboard = draft.dashboards.find(function (item) {
            return item.id === dashboardId;
        });

        if (!dashboard) {
            throw new Error("Dashboard wurde nicht gefunden.");
        }

        return dashboard;
    }

    function collectWidgetIds(draft) {
        const ids = [];

        draft.dashboards.forEach(function (dashboard) {
            dashboard.widgets.forEach(function (widget) {
                ids.push(widget.id);
            });
        });

        return ids;
    }

    function uniqueDuplicateWidgetId(baseId, usedIds) {
        const normalized = String(baseId)
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 55) || "widget";

        let candidate = normalized;
        let suffix = 2;

        while (usedIds.indexOf(candidate) !== -1) {
            candidate = (
                normalized.slice(0, 58 - String(suffix).length) +
                "-" + suffix
            );
            suffix += 1;
        }

        usedIds.push(candidate);
        return candidate;
    }

    function create(id, title) {
        const draft = requireDraft();
        const cleanTitle = String(title || "").trim();

        validateIdentity(draft, id, cleanTitle);

        draft.dashboards.push({
            id: id,
            title: cleanTitle,
            refreshIntervalMs: 5000,
            widgets: []
        });

        admin.State.selectDashboard(id);
        admin.State.markDirty();
        return findDashboard(draft, id);
    }

    function update(dashboardId, changes) {
        const draft = requireDraft();
        const dashboard = findDashboard(draft, dashboardId);

        if (typeof changes.title !== "undefined") {
            const title = String(changes.title).trim();

            if (!title) {
                throw new Error("Bitte einen Dashboard-Titel eingeben.");
            }
            dashboard.title = title;
        }

        if (typeof changes.refreshIntervalMs !== "undefined") {
            const interval = Number(changes.refreshIntervalMs);

            if (
                !Number.isFinite(interval) ||
                interval < 3000 ||
                interval > 300000
            ) {
                throw new Error(
                    "Das Refresh-Intervall muss zwischen 3000 und 300000 ms liegen."
                );
            }
            dashboard.refreshIntervalMs = interval;
        }

        admin.State.markDirty();
        return dashboard;
    }

    function duplicate(sourceId, newId, newTitle) {
        const draft = requireDraft();
        const source = findDashboard(draft, sourceId);
        const cleanTitle = String(newTitle || "").trim();
        const usedWidgetIds = collectWidgetIds(draft);

        validateIdentity(draft, newId, cleanTitle);

        const duplicateDashboard = {
            id: newId,
            title: cleanTitle,
            refreshIntervalMs: source.refreshIntervalMs,
            widgets: source.widgets.map(function (widget) {
                const duplicateWidget = admin.State.clone(widget);
                duplicateWidget.id = uniqueDuplicateWidgetId(
                    newId + "-" + widget.id,
                    usedWidgetIds
                );
                return duplicateWidget;
            })
        };

        draft.dashboards.push(duplicateDashboard);
        admin.State.selectDashboard(newId);
        admin.State.markDirty();
        return duplicateDashboard;
    }

    function remove(dashboardId) {
        const draft = requireDraft();
        const index = draft.dashboards.findIndex(function (dashboard) {
            return dashboard.id === dashboardId;
        });

        if (index === -1) {
            throw new Error("Dashboard wurde nicht gefunden.");
        }
        if (draft.defaultDashboardId === dashboardId) {
            throw new Error(
                "Wählen Sie zuerst ein anderes Standard-Dashboard."
            );
        }
        if (draft.dashboards.length <= 1) {
            throw new Error("Mindestens ein Dashboard muss bestehen bleiben.");
        }

        draft.dashboards.splice(index, 1);
        admin.State.selectDashboard(draft.defaultDashboardId);
        admin.State.markDirty();
    }

    function setDefault(dashboardId) {
        const draft = requireDraft();
        findDashboard(draft, dashboardId);
        draft.defaultDashboardId = dashboardId;
        admin.State.markDirty();
    }

    admin.Dashboards = {
        DASHBOARD_ID_PATTERN: DASHBOARD_ID_PATTERN,
        create: create,
        update: update,
        duplicate: duplicate,
        remove: remove,
        setDefault: setDefault
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
