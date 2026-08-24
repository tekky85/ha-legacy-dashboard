const Indexes = require("./indexes");
const Normalizers = require("./normalizers");

const CONFIG_TTL_MS = 60000;
const TRACE_TTL_MS = 30000;
const CONFIG_CONCURRENCY = 8;
const TRACE_CONCURRENCY = 6;
const TRACE_LIMIT = 3;


function sourceResult(options) {
    const value = options || {};

    return {
        supported:
            typeof value.supported === "boolean"
                ? value.supported
                : null,
        ok: value.ok === true,
        stale: value.stale === true,
        lastSuccessfulAt: value.lastSuccessfulAt || null,
        errorCode: value.errorCode || null,
        data: value.data || null
    };
}


function inventorySource(inventory, collectedAt) {
    return sourceResult({
        supported: true,
        ok: true,
        lastSuccessfulAt: collectedAt,
        data: inventory
    });
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


function runBounded(items, concurrency, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    function runner() {
        function next() {
            const index = nextIndex;

            nextIndex += 1;
            if (index >= items.length) {
                return Promise.resolve();
            }

            return Promise.resolve(worker(items[index], index))
                .then(function (result) {
                    results[index] = result;
                })
                .then(next);
        }

        return next();
    }

    const runners = [];
    let index;

    for (index = 0; index < Math.min(concurrency, items.length); index++) {
        runners.push(runner());
    }

    return Promise.all(runners).then(function () {
        return results;
    });
}


function signature(inventory) {
    return inventory.map(function (automation) {
        return automation.entityId;
    }).join("|");
}


function copyReferences(references) {
    return references || Normalizers.emptyReferences();
}


function mergeInventory(inventory, referencesByEntityId) {
    return inventory.map(function (automation) {
        return Object.assign({}, automation, {
            references: copyReferences(
                referencesByEntityId[automation.entityId]
            )
        });
    });
}


function createService(options) {
    const settings = options || {};
    const client = settings.client;
    const log = settings.logger || require("../logger");
    const clock = settings.clock || Date.now;
    const configTtlMs = settings.configTtlMs || CONFIG_TTL_MS;
    const traceTtlMs = settings.traceTtlMs || TRACE_TTL_MS;
    let configCache = null;
    let configExpiresAt = 0;
    let configInFlight = null;
    let lastSuccessfulConfig = null;
    let traceCapability = sourceResult({});
    const traceCache = Object.create(null);
    const traceInFlight = Object.create(null);


    if (!client || typeof client.request !== "function") {
        throw new Error("Automation-WebSocket-Client fehlt");
    }


    function fetchConfig(automation) {
        return client.request({
            type: "automation/config",
            entity_id: automation.entityId
        }).then(function (raw) {
            return {
                entityId: automation.entityId,
                ok: true,
                references: Normalizers.references(raw),
                mode: raw && raw.config && raw.config.mode || null,
                maxRuns: raw && raw.config && raw.config.max
            };
        }).catch(function (error) {
            return {
                entityId: automation.entityId,
                ok: false,
                errorCode: error && error.code
                    ? error.code
                    : "automation_config_failed"
            };
        });
    }


    function configFailure(errorCode, currentInventory, currentSignature) {
        if (lastSuccessfulConfig) {
            const merged = mergeInventory(
                currentInventory,
                lastSuccessfulConfig.referencesByEntityId
            );

            return {
                signature: currentSignature,
                inventory: merged,
                indexes: Indexes.create(merged),
                source: sourceResult({
                    supported: true,
                    ok: false,
                    stale: true,
                    lastSuccessfulAt: lastSuccessfulConfig.collectedAt,
                    errorCode: errorCode
                })
            };
        }

        return {
            signature: currentSignature,
            inventory: currentInventory,
            indexes: Indexes.create(currentInventory),
            source: sourceResult({
                supported:
                    errorCode === "ha_command_unsupported"
                        ? false
                        : null,
                ok: false,
                stale: false,
                lastSuccessfulAt: null,
                errorCode:
                    errorCode === "ha_command_unsupported"
                        ? "unsupported"
                        : errorCode
            })
        };
    }


    function refreshConfig(currentInventory, currentSignature) {
        const first = currentInventory[0];

        log.info("automation_config_refresh_started", {
            automation_count: currentInventory.length
        });

        return fetchConfig(first).then(function (probe) {
            if (!probe.ok && probe.errorCode === "ha_command_unsupported") {
                return configFailure(
                    "ha_command_unsupported",
                    currentInventory,
                    currentSignature
                );
            }

            return runBounded(
                currentInventory.slice(1),
                CONFIG_CONCURRENCY,
                fetchConfig
            ).then(function (rest) {
                const results = [probe].concat(rest);
                const previous = lastSuccessfulConfig
                    ? lastSuccessfulConfig.referencesByEntityId
                    : Object.create(null);
                const referencesByEntityId = Object.create(null);
                let failures = 0;

                results.forEach(function (result) {
                    if (result.ok) {
                        referencesByEntityId[result.entityId] =
                            result.references;
                    } else {
                        failures += 1;
                        if (previous[result.entityId]) {
                            referencesByEntityId[result.entityId] =
                                previous[result.entityId];
                        }
                    }
                });

                if (failures === results.length) {
                    return configFailure(
                        probe.errorCode || "automation_config_failed",
                        currentInventory,
                        currentSignature
                    );
                }

                const merged = mergeInventory(
                    currentInventory,
                    referencesByEntityId
                );
                const collectedAt = new Date(clock()).toISOString();
                const result = {
                    signature: currentSignature,
                    inventory: merged,
                    indexes: Indexes.create(merged),
                    source: sourceResult({
                        supported: true,
                        ok: failures === 0,
                        stale: false,
                        lastSuccessfulAt: collectedAt,
                        errorCode: failures > 0
                            ? "automation_config_partial"
                            : null
                    })
                };

                if (failures < results.length) {
                    lastSuccessfulConfig = {
                        collectedAt: collectedAt,
                        referencesByEntityId: referencesByEntityId
                    };
                }

                log.info("automation_config_refresh_succeeded", {
                    automation_count: merged.length,
                    failed_count: failures,
                    reference_count: merged.reduce(function (total, item) {
                        const refs = item.references;
                        return total + refs.entityIds.length +
                            refs.deviceIds.length + refs.areaIds.length +
                            refs.labelIds.length;
                    }, 0)
                });

                return result;
            });
        }).catch(function (error) {
            const errorCode = error && error.code
                ? error.code
                : "automation_config_failed";

            log.warn("automation_config_refresh_failed", {
                error_code: errorCode
            });

            return configFailure(
                errorCode,
                currentInventory,
                currentSignature
            );
        });
    }


    function getMetadata(entities, includeConfiguration) {
        const currentInventory = Normalizers.inventory(entities);
        const collectedAt = new Date(clock()).toISOString();
        const currentSignature = signature(currentInventory);

        if (!includeConfiguration || currentInventory.length === 0) {
            const cachedReferences = configCache &&
                configCache.signature === currentSignature
                ? configCache.inventory.reduce(function (map, automation) {
                    map[automation.entityId] = automation.references;
                    return map;
                }, Object.create(null))
                : Object.create(null);
            const merged = mergeInventory(currentInventory, cachedReferences);

            return Promise.resolve({
                inventory: merged,
                indexes: Indexes.create(merged),
                inventorySource: inventorySource(merged, collectedAt),
                configSource: configCache
                    ? configCache.source
                    : sourceResult({})
            });
        }

        if (
            configCache &&
            configCache.signature === currentSignature &&
            clock() < configExpiresAt
        ) {
            return Promise.resolve({
                inventory: mergeInventory(
                    currentInventory,
                    configCache.inventory.reduce(function (map, automation) {
                        map[automation.entityId] = automation.references;
                        return map;
                    }, Object.create(null))
                ),
                indexes: configCache.indexes,
                inventorySource: inventorySource(currentInventory, collectedAt),
                configSource: configCache.source
            });
        }

        if (!configInFlight) {
            configInFlight = refreshConfig(
                currentInventory,
                currentSignature
            ).then(function (result) {
                configCache = result;
                configExpiresAt = clock() + configTtlMs;
                return result;
            }).finally(function () {
                configInFlight = null;
            });
        }

        return configInFlight.then(function (result) {
            return {
                inventory: result.inventory,
                indexes: result.indexes,
                inventorySource: inventorySource(
                    currentInventory,
                    collectedAt
                ),
                configSource: result.source
            };
        });
    }


    function fetchTrace(automation) {
        return client.request({
            type: "trace/list",
            domain: "automation",
            item_id: automation.itemId
        }).then(function (raw) {
            const collectedAt = new Date(clock()).toISOString();
            const summaries = Normalizers.traces(raw, TRACE_LIMIT);
            const value = {
                entityId: automation.entityId,
                summaries: summaries,
                errorCount: summaries.filter(function (summary) {
                    return summary.hasError;
                }).length,
                collectedAt: collectedAt
            };

            traceCache[automation.entityId] = {
                value: value,
                expiresAt: clock() + traceTtlMs
            };
            traceCapability = sourceResult({
                supported: true,
                ok: true,
                lastSuccessfulAt: collectedAt
            });
            return value;
        }).catch(function (error) {
            const errorCode = error && error.code
                ? error.code
                : "automation_trace_failed";

            if (errorCode === "ha_command_unsupported") {
                traceCapability = sourceResult({
                    supported: false,
                    ok: false,
                    errorCode: "unsupported"
                });
            } else {
                traceCapability = sourceResult({
                    supported: true,
                    ok: false,
                    errorCode: errorCode
                });
            }

            const cached = traceCache[automation.entityId];
            if (cached) {
                return Object.assign({}, cached.value, {stale: true});
            }

            return null;
        }).finally(function () {
            delete traceInFlight[automation.entityId];
        });
    }


    function getOneTrace(automation) {
        const cached = traceCache[automation.entityId];

        if (cached && clock() < cached.expiresAt) {
            return Promise.resolve(cached.value);
        }

        if (traceInFlight[automation.entityId]) {
            return traceInFlight[automation.entityId];
        }

        traceInFlight[automation.entityId] = fetchTrace(automation);
        return traceInFlight[automation.entityId];
    }


    function getTraceSummaries(inventory, entityIds) {
        const wanted = Object.create(null);
        const eligible = [];

        (entityIds || []).slice(0, 50).forEach(function (entityId) {
            wanted[entityId] = true;
        });

        (inventory || []).forEach(function (automation) {
            if (wanted[automation.entityId] && automation.itemId) {
                eligible.push(automation);
            }
        });

        if (traceCapability.supported === false || eligible.length === 0) {
            return Promise.resolve({
                source: publicSource(traceCapability),
                automations: []
            });
        }

        return runBounded(
            eligible,
            TRACE_CONCURRENCY,
            getOneTrace
        ).then(function (results) {
            return {
                source: publicSource(traceCapability),
                automations: results.filter(Boolean)
            };
        });
    }


    function probeTrace(inventory) {
        const eligible = (inventory || []).filter(function (automation) {
            return Boolean(automation.itemId);
        });

        if (traceCapability.supported !== null || eligible.length === 0) {
            return Promise.resolve(publicSource(traceCapability));
        }

        return getOneTrace(eligible[0]).then(function () {
            return publicSource(traceCapability);
        });
    }


    return {
        getMetadata: getMetadata,
        getTraceSummaries: getTraceSummaries,
        getTraceSource: function () {
            return traceCapability;
        },
        probeTrace: probeTrace,
        publicSource: publicSource,
        getState: function () {
            return {
                configCache: configCache,
                configExpiresAt: configExpiresAt,
                configInFlight: Boolean(configInFlight),
                traceCapability: traceCapability,
                configTtlMs: configTtlMs,
                traceTtlMs: traceTtlMs
            };
        }
    };
}


module.exports = {
    CONFIG_CONCURRENCY: CONFIG_CONCURRENCY,
    CONFIG_TTL_MS: CONFIG_TTL_MS,
    TRACE_CONCURRENCY: TRACE_CONCURRENCY,
    TRACE_LIMIT: TRACE_LIMIT,
    TRACE_TTL_MS: TRACE_TTL_MS,
    createService: createService,
    publicSource: publicSource,
    runBounded: runBounded,
    sourceResult: sourceResult,
    statusName: statusName
};
