const Snapshot = require("../system/snapshot");
const Rules = require("./rules");


function buildSummary(snapshot, configuration) {

    const settings = configuration || {
        ignoredEntities: [],
        showMediaTitles: false
    };

    const nowMilliseconds =
        Date.parse(snapshot.collectedAt || "") || Date.now();

    const items = Rules.collectActivities(
        snapshot.entities || [],
        settings,
        nowMilliseconds
    );

    return {
        dashboard: "summary",
        title: "Summary",
        message:
            items.length === 0
                ? "Keine aktiven Zustände."
                : items.length === 1
                    ? "1 aktiver Zustand."
                    : items.length + " aktive Zustände.",
        activeCount: items.length,
        groups: Rules.groupActivities(items),
        items: items,
        meta: Snapshot.toPublicMeta(snapshot)
    };

}


module.exports = {
    buildSummary: buildSummary
};
