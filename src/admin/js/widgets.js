(function (admin) {
    "use strict";

    const ICONS = [
        "sensor",
        "temperature",
        "humidity",
        "window",
        "light",
        "heating"
    ];

    const SIZES = [
        "compact",
        "normal",
        "wide",
        "tall",
        "large"
    ];

    const SIZE_LABELS = {
        compact: "Kompakt",
        normal: "Normal",
        wide: "Breit",
        tall: "Hoch",
        large: "Groß"
    };

    function validateSize(size) {
        if (SIZES.indexOf(size) === -1) {
            throw new Error("Bitte eine gültige Kachelgröße auswählen.");
        }

        return size;
    }

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

    function assignOrders(dashboard) {
        dashboard.widgets.forEach(function (widget, index) {
            widget.order = (index + 1) * 10;
        });
    }

    function normalizeOrders(dashboard) {
        dashboard.widgets.sort(function (first, second) {
            return first.order - second.order;
        });
        assignOrders(dashboard);
    }

    function suggestionForEntity(entity) {
        const domain = entity && entity.domain;
        const deviceClass = entity && entity.device_class;
        let type;
        let icon;

        if (domain === "sensor") {
            type = "sensor";
            icon = deviceClass === "temperature"
                ? "temperature"
                : deviceClass === "humidity"
                    ? "humidity"
                    : "sensor";
        } else if (domain === "binary_sensor") {
            type = "binary";
            icon = ["window", "door", "opening"]
                .indexOf(deviceClass) !== -1
                ? "window"
                : "sensor";
        } else if (domain === "light") {
            type = "light";
            icon = "light";
        } else if (domain === "climate") {
            type = "climate";
            icon = "heating";
        } else {
            return null;
        }

        return {
            type: type,
            icon: icon,
            title:
                entity.friendly_name ||
                entity.entity_id,
            subtitle:
                entity.device_class ||
                domain,
            unit:
                entity.unit_of_measurement || ""
        };
    }

    function create(dashboardId, entity, fields) {
        const dashboard = findDashboard(dashboardId);
        const suggestion = suggestionForEntity(entity);

        if (!suggestion) {
            throw new Error(
                "Diese Entity-Domain wird nicht als Widget unterstützt."
            );
        }

        const title = String(fields.title || "").trim();
        const icon = fields.icon;

        if (!title) {
            throw new Error("Bitte einen Widget-Titel eingeben.");
        }
        if (ICONS.indexOf(icon) === -1) {
            throw new Error("Bitte ein bekanntes Icon auswählen.");
        }

        const maxOrder = dashboard.widgets.reduce(function (maximum, widget) {
            return Math.max(maximum, widget.order);
        }, 0);

        const widget = {
            id: admin.State.uniqueWidgetId(
                dashboardId + "-" +
                entity.entity_id.replace(".", "-")
            ),
            entity: entity.entity_id,
            type: suggestion.type,
            title: title,
            subtitle: String(fields.subtitle || ""),
            icon: icon,
            iconClass: icon,
            unit: String(fields.unit || ""),
            order:
                Number.isFinite(Number(fields.order))
                    ? Number(fields.order)
                    : maxOrder + 10,
            visible: Boolean(fields.visible),
            size: validateSize(fields.size || "normal")
        };

        dashboard.widgets.push(widget);
        normalizeOrders(dashboard);
        admin.State.markDirty();
        return widget;
    }

    function update(dashboardId, widgetId, fields) {
        const dashboard = findDashboard(dashboardId);
        const widget = findWidget(dashboard, widgetId);
        const title = String(fields.title || "").trim();
        const order = Number(fields.order);
        const size = validateSize(fields.size);

        if (!title) {
            throw new Error("Bitte einen Widget-Titel eingeben.");
        }
        if (ICONS.indexOf(fields.icon) === -1) {
            throw new Error("Bitte ein bekanntes Icon auswählen.");
        }
        if (!Number.isFinite(order)) {
            throw new Error("Die Widget-Reihenfolge ist ungültig.");
        }

        widget.title = title;
        widget.subtitle = String(fields.subtitle || "");
        widget.icon = fields.icon;
        widget.iconClass = fields.icon;
        widget.unit = String(fields.unit || "");
        widget.order = order;
        widget.visible = Boolean(fields.visible);
        widget.size = size;

        normalizeOrders(dashboard);
        admin.State.markDirty();
        return widget;
    }

    function setVisibility(dashboardId, widgetId, visible) {
        const dashboard = findDashboard(dashboardId);
        const widget = findWidget(dashboard, widgetId);
        widget.visible = Boolean(visible);
        admin.State.markDirty();
    }

    function move(dashboardId, widgetId, direction) {
        const dashboard = findDashboard(dashboardId);
        normalizeOrders(dashboard);

        const index = dashboard.widgets.findIndex(function (widget) {
            return widget.id === widgetId;
        });
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (
            index === -1 ||
            targetIndex < 0 ||
            targetIndex >= dashboard.widgets.length
        ) {
            return false;
        }

        const temporary = dashboard.widgets[index];
        dashboard.widgets[index] = dashboard.widgets[targetIndex];
        dashboard.widgets[targetIndex] = temporary;
        assignOrders(dashboard);
        admin.State.markDirty();
        return true;
    }

    function remove(dashboardId, widgetId) {
        const dashboard = findDashboard(dashboardId);
        const index = dashboard.widgets.findIndex(function (widget) {
            return widget.id === widgetId;
        });

        if (index === -1) {
            throw new Error("Widget wurde nicht gefunden.");
        }

        dashboard.widgets.splice(index, 1);
        normalizeOrders(dashboard);
        admin.State.markDirty();
    }

    admin.Widgets = {
        ICONS: ICONS.slice(),
        SIZES: SIZES.slice(),
        sizeLabel: function (size) {
            return SIZE_LABELS[size] || SIZE_LABELS.normal;
        },
        suggestionForEntity: suggestionForEntity,
        normalizeOrders: normalizeOrders,
        create: create,
        update: update,
        setVisibility: setVisibility,
        move: move,
        remove: remove
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
