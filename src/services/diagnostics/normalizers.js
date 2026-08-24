const ENTITY_ID_PATTERN = /^[a-z0-9_]+\.[a-z0-9_]+$/;


function text(value, maximumLength) {
    return typeof value === "string" && value !== ""
        ? value.slice(0, maximumLength)
        : null;
}


function identifier(value) {
    return text(value, 128);
}


function identifiers(values) {
    const seen = Object.create(null);

    if (!Array.isArray(values)) {
        return [];
    }

    return values.map(identifier).filter(function (value) {
        if (!value || seen[value]) {
            return false;
        }
        seen[value] = true;
        return true;
    });
}


function timestamp(value) {

    if (typeof value === "number" && Number.isFinite(value)) {
        return new Date(value * 1000).toISOString();
    }

    if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
        return null;
    }

    return new Date(Date.parse(value)).toISOString();

}


function configEntryFromDevice(raw) {

    if (identifier(raw.config_entry_id)) {
        return identifier(raw.config_entry_id);
    }

    const legacy = Array.isArray(raw.config_entries)
        ? raw.config_entries.filter(function (entryId) {
            return Boolean(identifier(entryId));
        })
        : [];

    if (legacy.length === 1) {
        return legacy[0];
    }

    const primary = identifier(raw.primary_config_entry);

    return primary && legacy.indexOf(primary) !== -1
        ? primary
        : null;

}


function configSubentryFromDevice(raw, configEntryId) {

    if (identifier(raw.config_subentry_id)) {
        return identifier(raw.config_subentry_id);
    }

    const legacy = raw.config_entries_subentries;

    if (
        configEntryId &&
        legacy &&
        typeof legacy === "object" &&
        Array.isArray(legacy[configEntryId]) &&
        legacy[configEntryId].length === 1
    ) {
        return identifier(legacy[configEntryId][0]);
    }

    return null;

}


function entityRegistry(entries) {

    if (!Array.isArray(entries)) {
        return [];
    }

    return entries.map(function (raw) {
        const entityId = raw && raw.entity_id;

        if (
            typeof entityId !== "string" ||
            !ENTITY_ID_PATTERN.test(entityId)
        ) {
            return null;
        }

        return {
            entityId: entityId,
            deviceId: identifier(raw.device_id),
            areaId: identifier(raw.area_id),
            configEntryId: identifier(raw.config_entry_id),
            configSubentryId: identifier(raw.config_subentry_id),
            platform: text(raw.platform, 80),
            disabledBy: text(raw.disabled_by, 80),
            hiddenBy: text(raw.hidden_by, 80),
            entityCategory: text(raw.entity_category, 40),
            labelIds: identifiers(raw.labels),
            name: text(raw.name, 160),
            originalName: text(raw.original_name, 160),
            icon: text(raw.icon, 120)
        };
    }).filter(Boolean);

}


function deviceRegistry(entries) {

    if (!Array.isArray(entries)) {
        return [];
    }

    return entries.map(function (raw) {

        if (!raw || !identifier(raw.id)) {
            return null;
        }

        const configEntryId = configEntryFromDevice(raw);

        return {
            deviceId: identifier(raw.id),
            name: text(raw.name, 160),
            nameByUser: text(raw.name_by_user, 160),
            areaId: identifier(raw.area_id),
            manufacturer: text(raw.manufacturer, 120),
            model: text(raw.model, 120),
            modelId: text(raw.model_id, 120),
            softwareVersion: text(raw.sw_version, 80),
            hardwareVersion: text(raw.hw_version, 80),
            labelIds: identifiers(raw.labels),
            configEntryId: configEntryId,
            configSubentryId:
                configSubentryFromDevice(raw, configEntryId),
            viaDeviceId: identifier(raw.via_device_id)
        };
    }).filter(Boolean);

}


function labelRegistry(entries) {

    if (!Array.isArray(entries)) {
        return [];
    }

    return entries.map(function (raw) {
        const labelId = raw && identifier(raw.label_id || raw.id);

        return labelId
            ? {
                labelId: labelId,
                name: text(raw.name, 160) || labelId
            }
            : null;
    }).filter(Boolean);

}


function areaRegistry(entries) {

    if (!Array.isArray(entries)) {
        return [];
    }

    return entries.map(function (raw) {
        const areaId = raw && identifier(raw.area_id || raw.id);

        return areaId
            ? {
                areaId: areaId,
                name: text(raw.name, 160),
                labelIds: identifiers(raw.labels)
            }
            : null;
    }).filter(Boolean);

}


function configEntries(entries) {

    if (!Array.isArray(entries)) {
        return [];
    }

    return entries.map(function (raw) {
        const entryId = raw && identifier(raw.entry_id || raw.id);

        return entryId
            ? {
                entryId: entryId,
                domain: text(raw.domain, 80),
                title: text(raw.title, 160),
                state: text(raw.state, 80),
                source: text(raw.source, 80),
                disabledBy: text(raw.disabled_by, 80)
            }
            : null;
    }).filter(Boolean);

}


function repairSeverity(value) {

    const normalized = String(value || "").toLowerCase();

    if (
        normalized === "critical" ||
        normalized === "error" ||
        normalized === "warning"
    ) {
        return normalized;
    }

    return "info";

}


function repairs(result) {

    const entries = result && Array.isArray(result.issues)
        ? result.issues
        : Array.isArray(result)
            ? result
            : [];

    return entries.map(function (raw) {
        const domain = raw && text(raw.domain || raw.issue_domain, 80);
        const issueId = raw && identifier(raw.issue_id || raw.id);

        if (!domain || !issueId || raw.ignored === true) {
            return null;
        }

        const translationKey = text(raw.translation_key, 160);

        return {
            id: "ha-repair-" + domain + "-" + issueId,
            source: "home_assistant_repair",
            severity: repairSeverity(raw.severity),
            status: "active",
            title: "Home Assistant Repair: " + domain,
            description: translationKey
                ? "Hinweis: " + translationKey
                : "Home Assistant meldet Reparaturbedarf.",
            domain: domain,
            fixable: raw.is_fixable === true,
            createdAt: timestamp(raw.created)
        };
    }).filter(Boolean);

}


function indexBy(items, key) {
    const result = Object.create(null);

    (items || []).forEach(function (item) {
        if (item && item[key]) {
            result[item[key]] = item;
        }
    });

    return result;
}


module.exports = {
    areaRegistry: areaRegistry,
    configEntries: configEntries,
    deviceRegistry: deviceRegistry,
    entityRegistry: entityRegistry,
    indexBy: indexBy,
    labelRegistry: labelRegistry,
    repairs: repairs
};
