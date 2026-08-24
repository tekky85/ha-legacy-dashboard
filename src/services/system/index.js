const Cache = require("./cache");
const Collector = require("./collector");
const Diagnostics = require("../diagnostics");

const cache = Cache.createSnapshotCache({
    collector: Collector.createCollector({
        diagnostics: Diagnostics
    }),
    ttlMs: Cache.DEFAULT_TTL_MS
});


module.exports = {
    CACHE_TTL_MS: Cache.DEFAULT_TTL_MS,
    getDiagnosticsStatus: async function () {
        const snapshot = await cache.getSnapshot();
        return Diagnostics.getPublicStatus(snapshot.entities);
    },
    getCriticalLabels: async function () {
        const snapshot = await Diagnostics.getSnapshot();
        const source = snapshot.sources.labelRegistry;
        const labels = Object.keys(snapshot.metadata.labels || {})
            .map(function (labelId) {
                return snapshot.metadata.labels[labelId];
            })
            .sort(function (first, second) {
                return first.name.localeCompare(second.name);
            });

        return {
            labels: labels.map(function (label) {
                return {id: label.labelId, name: label.name};
            }),
            source: {
                status: source && source.stale
                    ? "stale"
                    : source && source.ok
                        ? "available"
                        : source && source.supported === false
                            ? "unsupported"
                            : "error",
                stale: Boolean(source && source.stale)
            }
        };
    },
    getSnapshot: function () {
        return cache.getSnapshot();
    },
    getErrorSnapshot: async function () {
        const snapshot = await cache.getSnapshot();
        const diagnostic = await Diagnostics.getSnapshot(
            snapshot.entities,
            true
        );

        return require("./enrichment").attach(
            snapshot,
            diagnostic
        );
    },
    getAutomationTraceSummaries: function (snapshot, entityIds) {
        const automation = snapshot && snapshot.automations
            ? snapshot.automations
            : {inventory: []};

        return Diagnostics.getTraceSummaries(
            automation.inventory,
            entityIds
        );
    }
};
