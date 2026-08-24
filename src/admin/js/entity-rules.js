(function (admin) {
    "use strict";

    const DEFAULT_LIMIT = 100;

    function normalize(value) {
        return String(value || "").toLocaleLowerCase("de").trim();
    }

    function createIndex(entities) {
        return (entities || []).map(function (entity) {
            const friendlyName = entity.friendly_name || entity.entity_id;
            const areaName = entity.area_name || "";
            const deviceName = entity.device_name || "";

            return {
                entity: entity,
                area: areaName,
                domain: entity.domain || "",
                device: deviceName,
                deviceId: entity.device_id || "",
                search: normalize([
                    friendlyName,
                    entity.entity_id,
                    areaName,
                    deviceName,
                    entity.domain
                ].join(" ")),
                sort: normalize(friendlyName + " " + entity.entity_id)
            };
        }).sort(function (first, second) {
            return first.sort.localeCompare(second.sort, "de");
        });
    }

    function createLookup(settings) {
        const lookup = {
            summaryIgnore: Object.create(null),
            securityRelevant: Object.create(null),
            errorIgnore: Object.create(null),
            entityOverrides: Object.create(null),
            deviceOverrides: Object.create(null)
        };

        function add(values, target) {
            (values || []).forEach(function (entityId) {
                target[entityId] = true;
            });
        }

        add(settings.summaryIgnoredEntities, lookup.summaryIgnore);
        add(settings.securityEntities, lookup.securityRelevant);
        add(settings.errorIgnoredEntities, lookup.errorIgnore);
        Object.keys(settings.entityRuleOverrides || {}).forEach(function (entityId) {
            lookup.entityOverrides[entityId] = true;
        });
        Object.keys(settings.deviceRuleOverrides || {}).forEach(function (deviceId) {
            lookup.deviceOverrides[deviceId] = true;
        });
        return lookup;
    }

    function configured(lookup, entityOrId) {
        const entity = typeof entityOrId === "object" ? entityOrId : null;
        const entityId = entity ? entity.entity_id : entityOrId;

        return Boolean(
            lookup.summaryIgnore[entityId] ||
            lookup.securityRelevant[entityId] ||
            lookup.errorIgnore[entityId] ||
            lookup.entityOverrides[entityId] ||
            entity && entity.device_id && lookup.deviceOverrides[entity.device_id]
        );
    }

    function filter(index, settings, filters, maximumResults) {
        const query = normalize(filters && filters.query);
        const area = filters && filters.area || "";
        const domain = filters && filters.domain || "";
        const device = normalize(filters && filters.device);
        const configuredOnly = Boolean(filters && filters.configuredOnly);
        const limit = Number(maximumResults) > 0
            ? Number(maximumResults)
            : DEFAULT_LIMIT;
        const lookup = createLookup(settings || {});
        const entities = [];
        let total = 0;
        let indexPosition;

        for (indexPosition = 0; indexPosition < index.length; indexPosition++) {
            const entry = index[indexPosition];
            const entityId = entry.entity.entity_id;

            if (area && entry.area !== area) {
                continue;
            }
            if (domain && entry.domain !== domain) {
                continue;
            }
            if (device && normalize(entry.device).indexOf(device) === -1) {
                continue;
            }
            if (query && entry.search.indexOf(query) === -1) {
                continue;
            }
            if (configuredOnly && !configured(lookup, entry.entity)) {
                continue;
            }

            total += 1;
            if (entities.length < limit) {
                entities.push(entry.entity);
            }
        }

        return {
            entities: entities,
            limited: total > entities.length,
            total: total
        };
    }

    function options(index, property) {
        const seen = Object.create(null);
        const values = [];

        index.forEach(function (entry) {
            const value = entry[property];

            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });

        return values.sort(function (first, second) {
            return first.localeCompare(second, "de");
        });
    }

    admin.EntityRules = {
        DEFAULT_LIMIT: DEFAULT_LIMIT,
        configured: configured,
        createIndex: createIndex,
        createLookup: createLookup,
        filter: filter,
        options: options
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
