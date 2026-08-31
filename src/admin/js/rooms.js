(function (admin) {
    "use strict";

    const SINGLE_FIELDS = [
        "temperature", "humidity", "climate", "presence"
    ];
    const LIST_FIELDS = [
        "windows", "lights", "switches", "covers", "fans",
        "mediaPlayers", "locks", "batteries", "alerts", "secondary"
    ];
    const SIZES = ["compact", "normal", "wide", "tall", "large"];

    function validateSize(size) {
        if (SIZES.indexOf(size) === -1) {
            throw new Error("Bitte eine gültige Kartengröße auswählen.");
        }
        return size;
    }

    function emptyEntities() {
        return {
            temperature: null,
            humidity: null,
            climate: null,
            presence: null,
            windows: [],
            lights: [],
            switches: [],
            covers: [],
            fans: [],
            mediaPlayers: [],
            locks: [],
            batteries: [],
            alerts: [],
            secondary: []
        };
    }

    function emptyRoom() {
        return {
            areaId: null,
            collapsible: true,
            defaultExpanded: false,
            background: null,
            entities: emptyEntities()
        };
    }

    function domain(entity) {
        return entity ? entity.domain : "";
    }

    function deviceClass(entity) {
        return String(entity && entity.device_class || "").toLowerCase();
    }

    function isTemperature(entity) {
        const unit = String(entity && entity.unit_of_measurement || "");
        return domain(entity) === "sensor" && (
            deviceClass(entity) === "temperature" ||
            unit === "°C" || unit === "°F"
        );
    }

    function isHumidity(entity) {
        return domain(entity) === "sensor" &&
            deviceClass(entity) === "humidity";
    }

    function isPresence(entity) {
        return domain(entity) === "binary_sensor" &&
            ["presence", "occupancy", "motion"].indexOf(
                deviceClass(entity)
            ) !== -1;
    }

    function isOpening(entity) {
        return domain(entity) === "binary_sensor" &&
            ["window", "door", "opening", "garage_door"].indexOf(
                deviceClass(entity)
            ) !== -1;
    }

    function isBattery(entity) {
        return deviceClass(entity) === "battery" ||
            (
                entity && entity.entity_category === "diagnostic" &&
                String(entity.unit_of_measurement || "") === "%"
            );
    }

    function isSafety(entity) {
        return domain(entity) === "binary_sensor" &&
            [
                "smoke", "co", "carbon_monoxide", "gas",
                "moisture", "safety", "water"
            ].indexOf(deviceClass(entity)) !== -1;
    }

    function unique(values) {
        return values.filter(function (value, index) {
            return values.indexOf(value) === index;
        });
    }

    function suggest(areaId, inventory) {
        const result = emptyEntities();
        const used = Object.create(null);
        const entities = (inventory || []).filter(function (entity) {
            return Boolean(areaId && entity.area_id === areaId);
        });

        function first(fieldName, predicate) {
            const entity = entities.find(function (candidate) {
                return !used[candidate.entity_id] && predicate(candidate);
            });
            if (entity) {
                result[fieldName] = entity.entity_id;
                used[entity.entity_id] = true;
            }
        }

        function list(fieldName, predicate) {
            result[fieldName] = unique(entities.filter(predicate).map(function (entity) {
                used[entity.entity_id] = true;
                return entity.entity_id;
            }));
        }

        first("temperature", isTemperature);
        first("humidity", isHumidity);
        first("climate", function (entity) { return domain(entity) === "climate"; });
        first("presence", isPresence);
        list("windows", isOpening);
        list("lights", function (entity) { return domain(entity) === "light"; });
        list("switches", function (entity) { return domain(entity) === "switch"; });
        list("covers", function (entity) { return domain(entity) === "cover"; });
        list("fans", function (entity) { return domain(entity) === "fan"; });
        list("mediaPlayers", function (entity) { return domain(entity) === "media_player"; });
        list("locks", function (entity) { return domain(entity) === "lock"; });
        list("batteries", isBattery);
        list("alerts", isSafety);
        list("secondary", function (entity) {
            return !used[entity.entity_id] &&
                (domain(entity) === "sensor" || domain(entity) === "binary_sensor");
        });

        return result;
    }

    function normalizeEntities(source) {
        const input = source || {};
        const result = emptyEntities();

        SINGLE_FIELDS.forEach(function (fieldName) {
            result[fieldName] = input[fieldName] || null;
        });
        LIST_FIELDS.forEach(function (fieldName) {
            result[fieldName] = unique((input[fieldName] || []).slice());
        });
        return result;
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

    function validateSection(dashboard, sectionId) {
        if (!sectionId) {
            return null;
        }
        if (!(dashboard.sections || []).some(function (section) {
            return section.id === sectionId;
        })) {
            throw new Error("Bitte einen gültigen Abschnitt auswählen.");
        }
        return sectionId;
    }

    function create(dashboardId, fields) {
        const dashboard = findDashboard(dashboardId);
        const title = String(fields.title || "").trim();
        const maxOrder = dashboard.widgets.reduce(function (maximum, widget) {
            return Math.max(maximum, widget.order);
        }, 0);

        if (!title) {
            throw new Error("Bitte einen Raumnamen eingeben.");
        }

        const widget = {
            id: admin.State.uniqueWidgetId(dashboardId + "-room-" + title),
            entity: "",
            type: "room",
            title: title,
            subtitle: "",
            icon: "room",
            iconClass: "room",
            unit: "",
            order: maxOrder + 10,
            visible: fields.visible !== false,
            control: {
                enabled: fields.controlEnabled === true,
                preferredOnMode:
                    typeof fields.preferredOnMode === "string" &&
                    fields.preferredOnMode
                        ? fields.preferredOnMode
                        : null
            },
            sectionId: validateSection(dashboard, fields.sectionId),
            size: validateSize(fields.size || "large"),
            room: {
                areaId: fields.areaId || null,
                collapsible: fields.collapsible !== false,
                defaultExpanded: fields.defaultExpanded === true,
                background: null,
                entities: normalizeEntities(fields.entities)
            }
        };

        dashboard.widgets.push(widget);
        admin.Layout.addWidget(dashboard, widget);
        admin.State.markDirty();
        return widget;
    }

    function update(dashboardId, widgetId, fields) {
        const dashboard = findDashboard(dashboardId);
        const widget = dashboard.widgets.find(function (item) {
            return item.id === widgetId;
        });
        const title = String(fields.title || "").trim();
        const sectionId = validateSection(dashboard, fields.sectionId);

        if (!widget || widget.type !== "room") {
            throw new Error("Room Card wurde nicht gefunden.");
        }
        if (!title) {
            throw new Error("Bitte einen Raumnamen eingeben.");
        }

        widget.title = title;
        widget.visible = fields.visible !== false;
        widget.control = {
            enabled: fields.controlEnabled === true,
            preferredOnMode:
                typeof fields.preferredOnMode === "string" &&
                fields.preferredOnMode
                    ? fields.preferredOnMode
                    : null
        };
        widget.size = validateSize(fields.size);
        widget.room.areaId = fields.areaId || null;
        widget.room.collapsible = fields.collapsible !== false;
        widget.room.defaultExpanded = fields.defaultExpanded === true;
        widget.room.entities = normalizeEntities(fields.entities);
        if (typeof fields.background !== "undefined") {
            widget.room.background = fields.background;
        }

        if ((widget.sectionId || null) !== sectionId) {
            widget.sectionId = sectionId;
            admin.Layout.relocateWidget(dashboardId, widgetId);
        } else {
            admin.Layout.ensureVisiblePlacement(dashboardId, widgetId);
        }

        admin.State.markDirty();
        return widget;
    }

    admin.Rooms = {
        SINGLE_FIELDS: SINGLE_FIELDS.slice(),
        LIST_FIELDS: LIST_FIELDS.slice(),
        emptyRoom: emptyRoom,
        normalizeEntities: normalizeEntities,
        suggest: suggest,
        create: create,
        update: update
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
