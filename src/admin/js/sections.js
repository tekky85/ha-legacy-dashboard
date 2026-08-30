(function (admin) {
    "use strict";

    function findDashboard(dashboardId) {
        const draft = admin.State.getDraft();
        const dashboard = draft && draft.dashboards.find(function (item) {
            return item.id === dashboardId;
        });

        if (!dashboard) {
            throw new Error("Dashboard wurde nicht gefunden.");
        }

        if (!Array.isArray(dashboard.sections)) {
            dashboard.sections = [];
        }

        return dashboard;
    }

    function findSection(dashboard, sectionId) {
        const section = dashboard.sections.find(function (item) {
            return item.id === sectionId;
        });

        if (!section) {
            throw new Error("Abschnitt wurde nicht gefunden.");
        }

        return section;
    }

    function normalizedBase(value) {
        return String(value || "abschnitt")
            .toLocaleLowerCase("de")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 54) || "abschnitt";
    }

    function uniqueId(dashboard, title) {
        const base = "section-" + normalizedBase(title);
        const existing = dashboard.sections.map(function (section) {
            return section.id;
        });
        let candidate = base.slice(0, 63);
        let suffix = 2;

        while (existing.indexOf(candidate) !== -1) {
            candidate = (
                base.slice(0, 62 - String(suffix).length) +
                "-" + suffix
            );
            suffix += 1;
        }

        return candidate;
    }

    function normalizeOrders(dashboard) {
        dashboard.sections.sort(function (first, second) {
            if (first.order !== second.order) {
                return first.order - second.order;
            }
            return first.id.localeCompare(second.id);
        });

        dashboard.sections.forEach(function (section, index) {
            section.order = (index + 1) * 10;
        });
    }

    function create(dashboardId, fields) {
        const dashboard = findDashboard(dashboardId);
        const values = fields || {};
        const title = String(values.title || "Neuer Abschnitt").trim();

        if (!title) {
            throw new Error("Bitte einen Abschnittstitel eingeben.");
        }

        const section = {
            id: uniqueId(dashboard, title),
            title: title,
            order: (dashboard.sections.length + 1) * 10,
            showTitle: values.showTitle !== false,
            areaId:
                typeof values.areaId === "string" && values.areaId
                    ? values.areaId
                    : null
        };

        dashboard.sections.push(section);
        normalizeOrders(dashboard);
        admin.State.markDirty();
        return section;
    }

    function update(dashboardId, sectionId, fields) {
        const dashboard = findDashboard(dashboardId);
        const section = findSection(dashboard, sectionId);
        const values = fields || {};

        if (typeof values.title !== "undefined") {
            const title = String(values.title || "").trim();

            if (!title) {
                throw new Error("Bitte einen Abschnittstitel eingeben.");
            }
            section.title = title;
        }

        if (typeof values.showTitle !== "undefined") {
            section.showTitle = Boolean(values.showTitle);
        }

        if (typeof values.areaId !== "undefined") {
            section.areaId = values.areaId
                ? String(values.areaId)
                : null;
        }

        admin.State.markDirty();
        return section;
    }

    function move(dashboardId, sectionId, direction) {
        const dashboard = findDashboard(dashboardId);
        normalizeOrders(dashboard);

        const index = dashboard.sections.findIndex(function (section) {
            return section.id === sectionId;
        });
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (
            index === -1 ||
            targetIndex < 0 ||
            targetIndex >= dashboard.sections.length
        ) {
            return false;
        }

        const temporary = dashboard.sections[index];
        dashboard.sections[index] = dashboard.sections[targetIndex];
        dashboard.sections[targetIndex] = temporary;
        dashboard.sections.forEach(function (section, sectionIndex) {
            section.order = (sectionIndex + 1) * 10;
        });
        admin.State.markDirty();
        return true;
    }

    function assignWidget(dashboardId, widgetId, sectionId) {
        const dashboard = findDashboard(dashboardId);
        const widget = dashboard.widgets.find(function (item) {
            return item.id === widgetId;
        });

        if (!widget) {
            throw new Error("Widget wurde nicht gefunden.");
        }

        const previousSectionId = widget.sectionId || null;

        if (sectionId) {
            findSection(dashboard, sectionId);
            widget.sectionId = sectionId;
        } else {
            widget.sectionId = null;
        }

        if (previousSectionId !== widget.sectionId) {
            admin.Layout.relocateWidget(dashboardId, widgetId);
        }
        admin.State.markDirty();
        return widget;
    }

    function remove(dashboardId, sectionId) {
        const dashboard = findDashboard(dashboardId);
        const sectionIndex = dashboard.sections.findIndex(function (section) {
            return section.id === sectionId;
        });

        if (sectionIndex === -1) {
            throw new Error("Abschnitt wurde nicht gefunden.");
        }

        dashboard.sections.splice(sectionIndex, 1);

        dashboard.widgets
            .filter(function (widget) {
                return widget.sectionId === sectionId;
            })
            .sort(function (first, second) {
                return first.order - second.order;
            })
            .forEach(function (widget) {
                widget.sectionId = null;
                admin.Layout.relocateWidget(
                    dashboardId,
                    widget.id
                );
            });

        normalizeOrders(dashboard);
        admin.State.markDirty();
    }

    admin.Sections = {
        create: create,
        update: update,
        move: move,
        remove: remove,
        assignWidget: assignWidget,
        normalizeOrders: normalizeOrders
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
