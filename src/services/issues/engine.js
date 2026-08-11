const Snapshot = require("../system/snapshot");


function buildIssues(snapshot) {

    return {
        dashboard: "errors",
        title: "Systemstatus",
        message: "Noch keine Fehlerauswertung aktiviert.",
        issues: [],
        meta: Snapshot.toPublicMeta(snapshot)
    };

}


module.exports = {
    buildIssues: buildIssues
};
