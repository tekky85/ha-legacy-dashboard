(function (admin) {
    "use strict";

    function summarySettings() {
        const draft = admin.State.getDraft();

        if (!draft.systemDashboards) {
            draft.systemDashboards = {};
        }

        if (!draft.systemDashboards.summary) {
            draft.systemDashboards.summary = {
                ignoredEntities: [],
                showMediaTitles: false
            };
        }

        return draft.systemDashboards.summary;
    }

    function setShowMediaTitles(visible) {
        summarySettings().showMediaTitles = Boolean(visible);
        admin.State.markDirty();
    }

    function addIgnoredEntity(entityId) {
        const settings = summarySettings();

        if (!entityId || settings.ignoredEntities.includes(entityId)) {
            return false;
        }

        settings.ignoredEntities.push(entityId);
        settings.ignoredEntities.sort();
        admin.State.markDirty();
        return true;
    }

    function removeIgnoredEntity(entityId) {
        const settings = summarySettings();
        const index = settings.ignoredEntities.indexOf(entityId);

        if (index === -1) {
            return false;
        }

        settings.ignoredEntities.splice(index, 1);
        admin.State.markDirty();
        return true;
    }

    admin.SystemDashboards = {
        getSummarySettings: summarySettings,
        setShowMediaTitles: setShowMediaTitles,
        addIgnoredEntity: addIgnoredEntity,
        removeIgnoredEntity: removeIgnoredEntity
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
