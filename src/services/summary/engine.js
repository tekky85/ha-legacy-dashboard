const Snapshot = require("../system/snapshot");


function buildSummary(snapshot) {

    return {
        dashboard: "summary",
        title: "Summary",
        message: "Noch keine Summary-Regeln aktiviert.",
        items: [],
        meta: Snapshot.toPublicMeta(snapshot)
    };

}


module.exports = {
    buildSummary: buildSummary
};
