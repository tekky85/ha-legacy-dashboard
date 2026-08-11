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

    function errorSettings() {
        const draft = admin.State.getDraft();

        if (!draft.systemDashboards) {
            draft.systemDashboards = {};
        }

        if (!draft.systemDashboards.errors) {
            draft.systemDashboards.errors = {
                securityEntities: [],
                ignoredEntities: []
            };
        }

        return draft.systemDashboards.errors;
    }

    function addEntity(listName, entityId) {
        const settings = errorSettings();
        const list = settings[listName];

        if (!entityId || list.includes(entityId)) {
            return false;
        }

        list.push(entityId);
        list.sort();
        admin.State.markDirty();
        return true;
    }

    function removeEntity(listName, entityId) {
        const list = errorSettings()[listName];
        const index = list.indexOf(entityId);

        if (index === -1) {
            return false;
        }

        list.splice(index, 1);
        admin.State.markDirty();
        return true;
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
        getErrorSettings: errorSettings,
        setShowMediaTitles: setShowMediaTitles,
        addIgnoredEntity: addIgnoredEntity,
        removeIgnoredEntity: removeIgnoredEntity,
        addSecurityEntity: function (entityId) {
            return addEntity("securityEntities", entityId);
        },
        removeSecurityEntity: function (entityId) {
            return removeEntity("securityEntities", entityId);
        },
        addErrorIgnoredEntity: function (entityId) {
            return addEntity("ignoredEntities", entityId);
        },
        removeErrorIgnoredEntity: function (entityId) {
            return removeEntity("ignoredEntities", entityId);
        }
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
