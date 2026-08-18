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
                ignoredEntities: [],
                criticalDetectionMode: "device_class",
                criticalLabelId: null
            };
        }

        if (!draft.systemDashboards.errors.criticalDetectionMode) {
            draft.systemDashboards.errors.criticalDetectionMode = "device_class";
            draft.systemDashboards.errors.criticalLabelId = null;
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

    function entityRuleList(ruleName) {
        if (ruleName === "summaryIgnore") {
            return summarySettings().ignoredEntities;
        }
        if (ruleName === "securityRelevant") {
            return errorSettings().securityEntities;
        }
        if (ruleName === "errorIgnore") {
            return errorSettings().ignoredEntities;
        }
        throw new Error("Unbekannte Entity-Regel.");
    }

    function setEntityRule(entityId, ruleName, enabled) {
        const list = entityRuleList(ruleName);
        const index = list.indexOf(entityId);
        const shouldEnable = Boolean(enabled);

        if (!entityId || (shouldEnable && index !== -1) || (!shouldEnable && index === -1)) {
            return false;
        }

        if (shouldEnable) {
            list.push(entityId);
            list.sort();
        } else {
            list.splice(index, 1);
        }

        admin.State.markDirty();
        return true;
    }

    function getEntityRules(entityId) {
        return {
            summaryIgnore:
                summarySettings().ignoredEntities.indexOf(entityId) !== -1,
            securityRelevant:
                errorSettings().securityEntities.indexOf(entityId) !== -1,
            errorIgnore:
                errorSettings().ignoredEntities.indexOf(entityId) !== -1
        };
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
        },
        getEntityRules: getEntityRules,
        setEntityRule: setEntityRule,
        setCriticalDetectionMode: function (mode) {
            errorSettings().criticalDetectionMode = mode === "ha_label"
                ? "ha_label"
                : "device_class";
            admin.State.markDirty();
        },
        setCriticalLabelId: function (labelId) {
            errorSettings().criticalLabelId = labelId || null;
            admin.State.markDirty();
        }
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
