(function (admin) {
    "use strict";

    const SUPPORTED_DOMAINS = [
        "sensor",
        "binary_sensor",
        "light",
        "climate"
    ];

    function normalize(value) {
        return String(value || "").toLocaleLowerCase("de");
    }

    function filter(entities, query, domain) {
        const search = normalize(query).trim();

        return (entities || []).filter(function (entity) {
            if (SUPPORTED_DOMAINS.indexOf(entity.domain) === -1) {
                return false;
            }
            if (domain && entity.domain !== domain) {
                return false;
            }
            if (!search) {
                return true;
            }

            return [
                entity.friendly_name,
                entity.entity_id,
                entity.domain,
                entity.device_class
            ].some(function (value) {
                return normalize(value).indexOf(search) !== -1;
            });
        });
    }

    admin.Entities = {
        SUPPORTED_DOMAINS: SUPPORTED_DOMAINS.slice(),
        filter: filter,
        isSupported: function (entity) {
            return Boolean(
                entity &&
                SUPPORTED_DOMAINS.indexOf(entity.domain) !== -1
            );
        }
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
