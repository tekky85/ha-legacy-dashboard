(function (admin) {
    "use strict";

    const DEFAULT_RULES = {
        defaults: {
            unknownGraceMs: 15000,
            unavailableGraceMs: 30000,
            recoveryGraceMs: 10000,
            flapThreshold: 4,
            flapWindowMs: 600000,
            expectedOffline: false
        },
        riskClasses: {
            safety: {unknownGraceMs: 0, unavailableGraceMs: 0, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000},
            security: {unknownGraceMs: 0, unavailableGraceMs: 5000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000},
            normal: {unknownGraceMs: 15000, unavailableGraceMs: 30000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000},
            diagnostic: {unknownGraceMs: 30000, unavailableGraceMs: 60000, recoveryGraceMs: 10000, flapThreshold: 4, flapWindowMs: 600000}
        },
        domains: {},
        devices: {},
        entities: {}
    };

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
                criticalLabelId: null,
                rules: admin.State.clone(DEFAULT_RULES)
            };
        }

        if (!draft.systemDashboards.errors.criticalDetectionMode) {
            draft.systemDashboards.errors.criticalDetectionMode = "device_class";
            draft.systemDashboards.errors.criticalLabelId = null;
        }

        if (!draft.systemDashboards.errors.rules) {
            draft.systemDashboards.errors.rules = admin.State.clone(DEFAULT_RULES);
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
        const override = errorSettings().rules.entities[entityId] || {};

        return {
            summaryIgnore:
                summarySettings().ignoredEntities.indexOf(entityId) !== -1,
            securityRelevant:
                errorSettings().securityEntities.indexOf(entityId) !== -1,
            errorIgnore:
                errorSettings().ignoredEntities.indexOf(entityId) !== -1,
            expectedOffline: override.expectedOffline === true,
            allowCriticalExpectedOffline:
                override.allowCriticalExpectedOffline === true,
            override: admin.State.clone(override)
        };
    }

    function scopedRules(scope) {
        const rules = errorSettings().rules;

        if (scope !== "entities" && scope !== "devices") {
            throw new Error("Unbekannter Regelbereich.");
        }

        return rules[scope];
    }

    function getScopedRule(scope, identifier) {
        const rule = scopedRules(scope)[identifier];

        return rule ? admin.State.clone(rule) : {};
    }

    function isEmptyRule(rule) {
        return Object.keys(rule).length === 0;
    }

    function setScopedRule(scope, identifier, fieldName, value) {
        const rules = scopedRules(scope);
        const rule = rules[identifier] || {};
        const remove = value === null || typeof value === "undefined" || value === "";

        if (!identifier) {
            return false;
        }

        if (remove) {
            delete rule[fieldName];
        } else {
            rule[fieldName] = value;
        }

        if (fieldName === "expectedOffline" && value !== true) {
            delete rule.allowCriticalExpectedOffline;
        }

        if (isEmptyRule(rule)) {
            delete rules[identifier];
        } else {
            rules[identifier] = rule;
        }

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
        },
        getEntityRules: getEntityRules,
        getScopedRule: getScopedRule,
        setScopedRule: setScopedRule,
        getRuleConfiguration: function () {
            return errorSettings().rules;
        },
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
