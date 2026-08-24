const HomeAssistantWebSocket = require("../homeassistant-websocket");
const logger = require("../logger");
const Normalizers = require("./normalizers");
const SourceCache = require("./source-cache");
const AutomationService = require("../automations/service");

const REGISTRY_TTL_MS = 60000;
const CONFIG_ENTRY_TTL_MS = 30000;
const REPAIRS_TTL_MS = 30000;
const MATTER_TTL_MS = 60000;

const COMMANDS = Object.freeze({
    entityRegistry: "config/entity_registry/list",
    deviceRegistry: "config/device_registry/list",
    areaRegistry: "config/area_registry/list",
    labelRegistry: "config/label_registry/list",
    configEntries: "config_entries/get",
    repairs: "repairs/list_issues"
});


function fixedFetch(client, command) {
    return function () {
        return client.request({type: command});
    };
}


function statusName(source) {
    if (source.supported === false) {
        return "unsupported";
    }
    if (source.stale) {
        return "stale";
    }
    if (source.ok) {
        return "available";
    }
    if (source.supported === null) {
        return "unknown";
    }
    return "error";
}


function publicSource(source) {
    return {
        status: statusName(source),
        supported: source.supported,
        ok: source.ok,
        stale: source.stale,
        last_successful_at: source.lastSuccessfulAt,
        error_code: source.errorCode
    };
}


function createService(options) {

    const settings = options || {};
    const log = settings.logger || logger;
    const clock = settings.clock || Date.now;
    const client = settings.client || HomeAssistantWebSocket.createClient({
        logger: log,
        homeAssistantUrl: settings.homeAssistantUrl,
        token: settings.token,
        WebSocketImplementation: settings.WebSocketImplementation
    });
    const automations = AutomationService.createService({
        client: client,
        logger: log,
        clock: clock,
        configTtlMs: settings.automationConfigTtlMs,
        traceTtlMs: settings.automationTraceTtlMs
    });

    function source(name, command, normalize, ttlMs) {
        return SourceCache.createSourceCache({
            name: name,
            fetch: fixedFetch(client, command),
            normalize: normalize,
            ttlMs: ttlMs,
            logger: log,
            clock: clock
        });
    }

    const sources = {
        entityRegistry: source(
            "registry_entity",
            COMMANDS.entityRegistry,
            Normalizers.entityRegistry,
            REGISTRY_TTL_MS
        ),
        deviceRegistry: source(
            "registry_device",
            COMMANDS.deviceRegistry,
            Normalizers.deviceRegistry,
            REGISTRY_TTL_MS
        ),
        areaRegistry: source(
            "registry_area",
            COMMANDS.areaRegistry,
            Normalizers.areaRegistry,
            REGISTRY_TTL_MS
        ),
        labelRegistry: source(
            "registry_label",
            COMMANDS.labelRegistry,
            Normalizers.labelRegistry,
            REGISTRY_TTL_MS
        ),
        configEntries: source(
            "config_entries",
            COMMANDS.configEntries,
            Normalizers.configEntries,
            CONFIG_ENTRY_TTL_MS
        ),
        repairs: source(
            "repairs",
            COMMANDS.repairs,
            Normalizers.repairs,
            REPAIRS_TTL_MS
        )
    };

    const matter = SourceCache.unsupportedResult();


    async function getSnapshot(entities, includeAutomationConfiguration) {

        const values = await Promise.all([
            sources.entityRegistry.get(),
            sources.deviceRegistry.get(),
            sources.areaRegistry.get(),
            sources.labelRegistry.get(),
            sources.configEntries.get(),
            sources.repairs.get()
        ]);

        const sourceValues = {
            entityRegistry: values[0],
            deviceRegistry: values[1],
            areaRegistry: values[2],
            labelRegistry: values[3],
            configEntries: values[4],
            repairs: values[5],
            matter: matter
        };

        const automationMetadata = await automations.getMetadata(
            entities || [],
            includeAutomationConfiguration === true
        );
        const automationTrace = automations.getTraceSource();

        sourceValues.automationInventory =
            automationMetadata.inventorySource;
        sourceValues.automationConfig =
            automationMetadata.configSource;
        sourceValues.automationTrace = automationTrace;

        return {
            metadata: {
                entities: Normalizers.indexBy(
                    values[0].data,
                    "entityId"
                ),
                devices: Normalizers.indexBy(
                    values[1].data,
                    "deviceId"
                ),
                areas: Normalizers.indexBy(
                    values[2].data,
                    "areaId"
                ),
                labels: Normalizers.indexBy(
                    values[3].data,
                    "labelId"
                ),
                configEntries: Normalizers.indexBy(
                    values[4].data,
                    "entryId"
                )
            },
            diagnostics: {
                repairs: values[5].data,
                matter: []
            },
            automations: {
                inventory: automationMetadata.inventory,
                indexes: automationMetadata.indexes
            },
            capabilities: {
                entityRegistry: values[0].supported === true,
                deviceRegistry: values[1].supported === true,
                areaRegistry: values[2].supported === true,
                labelRegistry: values[3].supported === true,
                configEntries: values[4].supported === true,
                repairs: values[5].supported === true,
                matterDiagnostics: false,
                automationInventory: true,
                automationConfigRead:
                    automationMetadata.configSource.supported === true,
                automationTraceRead:
                    automationTrace.supported === true
            },
            sources: sourceValues
        };

    }


    async function getPublicStatus(entities) {
        const snapshot = await getSnapshot(entities || [], true);
        const traceStatus = await automations.probeTrace(
            snapshot.automations.inventory
        );
        const result = {};

        Object.keys(snapshot.sources).forEach(function (name) {
            result[name] = publicSource(snapshot.sources[name]);
        });
        result.automationTrace = traceStatus;
        snapshot.capabilities.automationTraceRead =
            traceStatus.supported === true;

        return {
            capabilities: snapshot.capabilities,
            sources: result,
            cache_ttls_ms: {
                registries: REGISTRY_TTL_MS,
                config_entries: CONFIG_ENTRY_TTL_MS,
                repairs: REPAIRS_TTL_MS,
                matter: MATTER_TTL_MS,
                automation_config:
                    AutomationService.CONFIG_TTL_MS,
                automation_trace:
                    AutomationService.TRACE_TTL_MS
            }
        };
    }


    return {
        getPublicStatus: getPublicStatus,
        getSnapshot: getSnapshot,
        getTraceSummaries: function (inventory, entityIds) {
            return automations.getTraceSummaries(inventory, entityIds);
        },
        close: function () {
            client.close();
        },
        sources: sources
    };

}


let singleton = null;


function getSingleton() {
    if (!singleton) {
        singleton = createService();
    }
    return singleton;
}


module.exports = {
    COMMANDS: COMMANDS,
    CONFIG_ENTRY_TTL_MS: CONFIG_ENTRY_TTL_MS,
    MATTER_TTL_MS: MATTER_TTL_MS,
    REGISTRY_TTL_MS: REGISTRY_TTL_MS,
    REPAIRS_TTL_MS: REPAIRS_TTL_MS,
    createService: createService,
    getPublicStatus: function (entities) {
        return getSingleton().getPublicStatus(entities);
    },
    getSnapshot: function (entities, includeAutomationConfiguration) {
        return getSingleton().getSnapshot(
            entities,
            includeAutomationConfiguration
        );
    },
    getTraceSummaries: function (inventory, entityIds) {
        return getSingleton().getTraceSummaries(inventory, entityIds);
    }
};
