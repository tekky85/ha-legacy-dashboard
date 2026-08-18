function emptyMap() {
    return Object.create(null);
}


function sourceStatus(source) {

    const value = source || {};

    return {
        supported:
            typeof value.supported === "boolean"
                ? value.supported
                : null,
        ok: value.ok === true,
        stale: value.stale === true,
        lastSuccessfulAt: value.lastSuccessfulAt || null,
        errorCode: value.errorCode || null
    };

}


function deviceConfigEntry(device) {
    return device && device.configEntryId
        ? device.configEntryId
        : null;
}


function createContext(entity, metadata) {

    const entities = metadata.entities || emptyMap();
    const devices = metadata.devices || emptyMap();
    const areas = metadata.areas || emptyMap();
    const configEntries = metadata.configEntries || emptyMap();
    const registry = entities[entity.entityId] || null;
    const device = registry && registry.deviceId
        ? devices[registry.deviceId] || null
        : null;
    const areaId = registry && registry.areaId
        ? registry.areaId
        : device && device.areaId
            ? device.areaId
            : null;
    const area = areaId ? areas[areaId] || null : null;
    const configEntryId = registry && registry.configEntryId
        ? registry.configEntryId
        : deviceConfigEntry(device);
    const configEntry = configEntryId
        ? configEntries[configEntryId] || null
        : null;
    const friendlyName = entity.attributes &&
        entity.attributes.friendlyName;
    const deviceName = device
        ? device.nameByUser || device.name || friendlyName || entity.entityId
        : friendlyName || entity.entityId;

    return {
        registryOnly: false,
        deviceId: registry ? registry.deviceId : null,
        areaId: areaId,
        configEntryId: configEntryId,
        configSubentryId:
            registry && registry.configSubentryId
                ? registry.configSubentryId
                : device && device.configSubentryId
                    ? device.configSubentryId
                    : null,
        platform: registry ? registry.platform : null,
        entityCategory:
            registry ? registry.entityCategory : null,
        disabledBy: registry ? registry.disabledBy : null,
        hiddenBy: registry ? registry.hiddenBy : null,
        deviceName: deviceName,
        areaName: area ? area.name : null,
        integration:
            configEntry
                ? configEntry.title || configEntry.domain
                : registry
                    ? registry.platform
                    : null,
        integrationDomain:
            configEntry ? configEntry.domain : null
    };

}


function attach(snapshot, diagnosticsSnapshot) {

    const diagnostic = diagnosticsSnapshot || {};
    const metadata = diagnostic.metadata || {
        entities: emptyMap(),
        devices: emptyMap(),
        areas: emptyMap(),
        labels: emptyMap(),
        configEntries: emptyMap()
    };
    const sources = diagnostic.sources || {};

    snapshot.version = 2;
    snapshot.metadata = metadata;
    snapshot.diagnostics = diagnostic.diagnostics || {
        repairs: [],
        matter: []
    };
    snapshot.capabilities = diagnostic.capabilities || {
        entityRegistry: false,
        deviceRegistry: false,
        areaRegistry: false,
        labelRegistry: false,
        configEntries: false,
        repairs: false,
        matterDiagnostics: false
    };

    Object.keys(sources).forEach(function (name) {
        snapshot.sources[name] = sourceStatus(sources[name]);
    });

    snapshot.entities.forEach(function (entity) {
        entity.context = createContext(entity, metadata);
    });

    return snapshot;

}


function unavailable(errorCode) {

    const names = [
        "entityRegistry",
        "deviceRegistry",
        "areaRegistry",
        "labelRegistry",
        "configEntries",
        "repairs"
    ];
    const sources = {};

    names.forEach(function (name) {
        sources[name] = {
            supported: null,
            ok: false,
            stale: false,
            lastSuccessfulAt: null,
            errorCode: errorCode || "metadata_unavailable"
        };
    });

    sources.matter = {
        supported: false,
        ok: false,
        stale: false,
        lastSuccessfulAt: null,
        errorCode: "unsupported"
    };

    return {
        metadata: {
            entities: emptyMap(),
            devices: emptyMap(),
            areas: emptyMap(),
            labels: emptyMap(),
            configEntries: emptyMap()
        },
        diagnostics: {
            repairs: [],
            matter: []
        },
        capabilities: {
            entityRegistry: false,
            deviceRegistry: false,
            areaRegistry: false,
            labelRegistry: false,
            configEntries: false,
            repairs: false,
            matterDiagnostics: false
        },
        sources: sources
    };

}


module.exports = {
    attach: attach,
    createContext: createContext,
    sourceStatus: sourceStatus,
    unavailable: unavailable
};
