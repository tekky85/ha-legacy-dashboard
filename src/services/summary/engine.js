const Snapshot = require("../system/snapshot");
const Rules = require("./rules");

const FILTER_DEFINITIONS = [
    {id: "all", label: "Alle", categories: Rules.CATEGORY_ORDER},
    {id: "open", label: "Offen", categories: ["open"]},
    {id: "powered", label: "Licht & Strom", categories: ["powered"]},
    {id: "active", label: "Aktiv", categories: ["running", "cleaning", "movement"]},
    {id: "climate", label: "Klima", categories: ["climate"]},
    {id: "media", label: "Medien", categories: ["media"]},
    {id: "security", label: "Sicherheit", categories: ["security"]}
];


function buildFilters(items) {

    return FILTER_DEFINITIONS.map(function (definition) {

        const categories = definition.categories.slice(0);
        const count = items.filter(function (item) {
            return categories.indexOf(item.category) !== -1;
        }).length;

        return {
            id: definition.id,
            label: definition.label,
            count: count,
            categories: categories
        };

    });

}


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
        filters: buildFilters(items),
        groups: Rules.groupActivities(items),
        items: items,
        meta: Snapshot.toPublicMeta(snapshot)
    };

}


module.exports = {
    FILTER_DEFINITIONS: FILTER_DEFINITIONS.map(function (definition) {
        return {
            id: definition.id,
            label: definition.label,
            categories: definition.categories.slice(0)
        };
    }),
    buildFilters: buildFilters,
    buildSummary: buildSummary
};
