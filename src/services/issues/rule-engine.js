/*
 * Central, read-only Sprint-22 rule engine.
 *
 * The engine observes only normalized snapshots already collected by the
 * gateway. It never queries Home Assistant history and keeps a bounded,
 * process-local transition history for flapping detection.
 */

const Risk = require("./risk");
const Severity = require("./severity");


const MAX_TRANSITIONS = 16;
const MAX_TRACKED_ENTITIES = 10000;
const TRACKING_TTL_MS = 86400000;

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
        safety: {
            unknownGraceMs: 0,
            unavailableGraceMs: 0,
            recoveryGraceMs: 10000,
            flapThreshold: 4,
            flapWindowMs: 600000
        },
        security: {
            unknownGraceMs: 0,
            unavailableGraceMs: 5000,
            recoveryGraceMs: 10000,
            flapThreshold: 4,
            flapWindowMs: 600000
        },
        normal: {
            unknownGraceMs: 15000,
            unavailableGraceMs: 30000,
            recoveryGraceMs: 10000,
            flapThreshold: 4,
            flapWindowMs: 600000
        },
        diagnostic: {
            unknownGraceMs: 30000,
            unavailableGraceMs: 60000,
            recoveryGraceMs: 10000,
            flapThreshold: 4,
            flapWindowMs: 600000
        }
    },
    domains: {},
    devices: {},
    entities: {}
};

const RULE_FIELDS = [
    "unknownGraceMs",
    "unavailableGraceMs",
    "recoveryGraceMs",
    "flapThreshold",
    "flapWindowMs",
    "expectedOffline",
    "allowCriticalExpectedOffline",
    "riskClass"
];


function cloneRule(rule) {
    const result = {};

    RULE_FIELDS.forEach(function (fieldName) {
        if (
            rule &&
            Object.prototype.hasOwnProperty.call(rule, fieldName)
        ) {
            result[fieldName] = rule[fieldName];
        }
    });

    return result;
}


function cloneRules(rules) {
    const source = rules || DEFAULT_RULES;
    const result = {
        defaults: cloneRule(source.defaults || DEFAULT_RULES.defaults),
        riskClasses: {},
        domains: {},
        devices: {},
        entities: {}
    };

    ["safety", "security", "normal", "diagnostic"].forEach(function (riskClass) {
        result.riskClasses[riskClass] = cloneRule(
            source.riskClasses && source.riskClasses[riskClass] ||
            DEFAULT_RULES.riskClasses[riskClass]
        );
    });

    ["domains", "devices", "entities"].forEach(function (collectionName) {
        const collection = source[collectionName] || {};

        Object.keys(collection).forEach(function (identifier) {
            result[collectionName][identifier] = cloneRule(collection[identifier]);
        });
    });

    return result;
}


function applyRule(target, source) {
    RULE_FIELDS.forEach(function (fieldName) {
        if (
            source &&
            Object.prototype.hasOwnProperty.call(source, fieldName)
        ) {
            target[fieldName] = source[fieldName];
        }
    });
}


function validRiskClass(value) {
    return value === "safety" ||
        value === "security" ||
        value === "normal" ||
        value === "diagnostic";
}


function classifyRisk(entity, settings, securityRelevant, modeCriticalEligible) {
    const rules = settings.rules || DEFAULT_RULES;
    const context = entity.context || {};
    const attributes = entity.attributes || {};
    const entityRule = rules.entities && rules.entities[entity.entityId];
    const deviceRule = context.deviceId && rules.devices
        ? rules.devices[context.deviceId]
        : null;
    const criticalMode = settings.criticalDetectionMode || "device_class";
    let riskClass;
    let source;

    if (entityRule && validRiskClass(entityRule.riskClass)) {
        riskClass = entityRule.riskClass;
        source = "entity";
    } else if (deviceRule && validRiskClass(deviceRule.riskClass)) {
        riskClass = deviceRule.riskClass;
        source = "device";
    } else if (securityRelevant) {
        riskClass = "security";
        source = "security_entity";
    } else if (modeCriticalEligible) {
        riskClass = "security";
        source = "critical_detection";
    } else {
        riskClass = criticalMode === "ha_label"
            ? Risk.classifyWithoutAutomaticCritical(context.entityCategory)
            : Risk.classify(
                attributes.deviceClass,
                context.entityCategory,
                entity.domain
            );
        source = Risk.isCritical(riskClass)
            ? "critical_detection"
            : "risk_class";
    }

    return {
        riskClass: riskClass,
        source: source,
        entityRule: entityRule || null,
        deviceRule: deviceRule || null
    };
}


function resolveRule(entity, settings, securityRelevant, modeCriticalEligible) {
    const configured = settings.rules || DEFAULT_RULES;
    const rules = cloneRules(configured);
    const classification = classifyRisk(
        entity,
        settings,
        securityRelevant,
        modeCriticalEligible
    );
    const domainRule = rules.domains[entity.domain] || null;
    const riskRule = rules.riskClasses[classification.riskClass] || null;
    const effective = {};
    let source = "default";

    applyRule(effective, rules.defaults);

    if (domainRule) {
        applyRule(effective, domainRule);
        source = "domain";
    }

    if (riskRule) {
        applyRule(effective, riskRule);
        source = classification.source === "risk_class"
            ? "risk_class"
            : classification.source;
    }

    if (classification.deviceRule) {
        applyRule(effective, classification.deviceRule);
        source = "device";
    }

    if (classification.entityRule) {
        applyRule(effective, classification.entityRule);
        source = "entity";
    }

    effective.riskClass = classification.riskClass;

    return {
        effective: effective,
        entityRule: classification.entityRule,
        deviceRule: classification.deviceRule,
        ruleSource: source,
        riskClass: classification.riskClass
    };
}


function stateKind(value) {
    const state = String(value || "").toLowerCase();

    if (state === "unknown" || state === "unavailable") {
        return state;
    }

    return "healthy";
}


function timestampMilliseconds(value, fallback) {
    const parsed = Date.parse(value || "");

    if (
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed <= fallback
    ) {
        return parsed;
    }

    return fallback;
}


function copyEvaluation(evaluation) {
    return Object.assign({}, evaluation);
}


function RuleEngine(options) {
    const settings = options || {};

    this.maxTransitions = Number.isInteger(settings.maxTransitions)
        ? Math.max(2, Math.min(MAX_TRANSITIONS, settings.maxTransitions))
        : MAX_TRANSITIONS;
    this.maxTrackedEntities = Number.isInteger(settings.maxTrackedEntities)
        ? Math.max(
            100,
            Math.min(MAX_TRACKED_ENTITIES, settings.maxTrackedEntities)
        )
        : MAX_TRACKED_ENTITIES;
    this.trackingTtlMs = Number.isFinite(settings.trackingTtlMs)
        ? Math.max(60000, settings.trackingTtlMs)
        : TRACKING_TTL_MS;
    this.entities = Object.create(null);
    this.observations = 0;
}


RuleEngine.prototype.reset = function () {
    this.entities = Object.create(null);
    this.observations = 0;
};


RuleEngine.prototype.entityState = function (entityId) {
    if (!this.entities[entityId]) {
        this.entities[entityId] = {
            lastObservedAt: null,
            lastObservedState: null,
            lastChangedAt: null,
            transitions: [],
            healthySince: null,
            visible: null
        };
    }

    return this.entities[entityId];
};


RuleEngine.prototype.pruneTransitions = function (runtime, now, windowMs) {
    const oldest = now - windowMs;

    runtime.transitions = runtime.transitions.filter(function (transition) {
        return transition.at >= oldest;
    }).slice(-this.maxTransitions);
};


RuleEngine.prototype.recordTransition = function (runtime, from, to, now) {
    runtime.transitions.push({
        at: now,
        from: from,
        to: to
    });

    if (runtime.transitions.length > this.maxTransitions) {
        runtime.transitions = runtime.transitions.slice(-this.maxTransitions);
    }
};


RuleEngine.prototype.sweep = function (now) {
    const entityIds = Object.keys(this.entities);

    if (
        entityIds.length <= this.maxTrackedEntities &&
        this.observations % 1000 !== 0
    ) {
        return;
    }

    entityIds.forEach(function (entityId) {
        const runtime = this.entities[entityId];

        if (
            runtime.lastObservedAt !== null &&
            now - runtime.lastObservedAt > this.trackingTtlMs
        ) {
            delete this.entities[entityId];
        }
    }, this);

    Object.keys(this.entities)
        .sort(function (first, second) {
            return this.entities[first].lastObservedAt -
                this.entities[second].lastObservedAt;
        }.bind(this))
        .slice(0, Math.max(0, Object.keys(this.entities).length - this.maxTrackedEntities))
        .forEach(function (entityId) {
            delete this.entities[entityId];
        }, this);
};


RuleEngine.prototype.expectedOfflineAllowed = function (resolved) {
    const rule = resolved.effective;

    if (rule.expectedOffline !== true) {
        return false;
    }

    if (!Risk.isCritical(resolved.riskClass)) {
        return true;
    }

    if (
        resolved.entityRule &&
        resolved.entityRule.expectedOffline === true &&
        resolved.entityRule.allowCriticalExpectedOffline === true
    ) {
        return true;
    }

    return Boolean(
        resolved.deviceRule &&
        resolved.deviceRule.expectedOffline === true &&
        resolved.deviceRule.allowCriticalExpectedOffline === true
    );
};


RuleEngine.prototype.evaluate = function (entity, settings, observation) {
    const options = observation || {};
    const now = Number.isFinite(options.nowMilliseconds)
        ? options.nowMilliseconds
        : Date.now();
    const resolved = resolveRule(
        entity,
        settings || {},
        options.securityRelevant === true,
        options.modeCriticalEligible === true
    );
    const rule = resolved.effective;
    const currentState = stateKind(entity.state);
    let runtime = this.entityState(entity.entityId);
    let newTransition = false;

    this.observations += 1;

    if (
        runtime.lastObservedAt !== null &&
        now <= runtime.lastObservedAt &&
        currentState !== runtime.lastObservedState
    ) {
        delete this.entities[entity.entityId];
        runtime = this.entityState(entity.entityId);
    }

    if (
        runtime.lastObservedState !== null &&
        runtime.lastObservedState !== currentState &&
        now > runtime.lastObservedAt
    ) {
        this.recordTransition(
            runtime,
            runtime.lastObservedState,
            currentState,
            now
        );
        newTransition = true;
    }

    runtime.lastObservedAt = now;
    runtime.lastObservedState = currentState;
    runtime.lastChangedAt = timestampMilliseconds(entity.lastChanged, now);

    this.pruneTransitions(runtime, now, rule.flapWindowMs);
    this.sweep(now);

    const expectedOffline = currentState === "unavailable" &&
        this.expectedOfflineAllowed(resolved);
    const flappingDetected = runtime.transitions.length >= rule.flapThreshold;
    const criticalRisk = Risk.isCritical(resolved.riskClass);
    let evaluation = null;

    if (expectedOffline) {
        runtime.visible = null;
        runtime.healthySince = null;
        runtime.transitions = [];

        return {
            eligible: false,
            currentState: currentState,
            displayState: currentState,
            severity: null,
            riskClass: resolved.riskClass,
            gracePeriodMs: rule.unavailableGraceMs,
            graceActive: false,
            expectedOffline: true,
            flapping: false,
            recoveryPending: false,
            ruleSource: resolved.ruleSource,
            transitionCount: 0
        };
    }

    if (currentState !== "healthy") {
        const gracePeriodMs = currentState === "unknown"
            ? rule.unknownGraceMs
            : rule.unavailableGraceMs;
        const problemStartedAt = timestampMilliseconds(entity.lastChanged, now);
        const graceActive = now - problemStartedAt < gracePeriodMs;
        const flapping = flappingDetected && (newTransition || runtime.visible !== null);

        if (graceActive && !runtime.visible && !flapping) {
            runtime.healthySince = null;

            return {
                eligible: false,
                currentState: currentState,
                displayState: currentState,
                severity: null,
                riskClass: resolved.riskClass,
                gracePeriodMs: gracePeriodMs,
                graceActive: true,
                expectedOffline: false,
                flapping: false,
                recoveryPending: false,
                ruleSource: resolved.ruleSource,
                transitionCount: runtime.transitions.length
            };
        }

        evaluation = {
            eligible: true,
            currentState: currentState,
            displayState: currentState,
            severity: flapping
                ? criticalRisk ? "critical" : "warning"
                : Severity.issueSeverity(
                    currentState,
                    criticalRisk,
                    resolved.riskClass
                ),
            riskClass: resolved.riskClass,
            gracePeriodMs: gracePeriodMs,
            graceActive: false,
            expectedOffline: false,
            flapping: flapping,
            recoveryPending: false,
            ruleSource: resolved.ruleSource,
            transitionCount: runtime.transitions.length,
            problemStartedAt: new Date(problemStartedAt).toISOString()
        };

        runtime.visible = copyEvaluation(evaluation);
        runtime.healthySince = null;
        return evaluation;
    }

    if (
        flappingDetected &&
        newTransition &&
        !runtime.visible
    ) {
        runtime.visible = {
            eligible: true,
            currentState: "healthy",
            displayState: "flapping",
            severity: criticalRisk ? "critical" : "warning",
            riskClass: resolved.riskClass,
            gracePeriodMs: 0,
            graceActive: false,
            expectedOffline: false,
            flapping: true,
            recoveryPending: false,
            ruleSource: resolved.ruleSource,
            transitionCount: runtime.transitions.length,
            problemStartedAt: new Date(now).toISOString()
        };
    }

    if (runtime.visible) {
        if (runtime.healthySince === null) {
            runtime.healthySince = now;
        }

        if (now - runtime.healthySince < rule.recoveryGraceMs) {
            evaluation = copyEvaluation(runtime.visible);
            evaluation.currentState = "healthy";
            evaluation.recoveryPending = true;
            evaluation.flapping = runtime.visible.flapping === true || flappingDetected;
            evaluation.transitionCount = runtime.transitions.length;
            return evaluation;
        }

        runtime.visible = null;
        runtime.healthySince = null;
        runtime.transitions = [];
    }

    return {
        eligible: false,
        currentState: "healthy",
        displayState: "healthy",
        severity: null,
        riskClass: resolved.riskClass,
        gracePeriodMs: 0,
        graceActive: false,
        expectedOffline: false,
        flapping: false,
        recoveryPending: false,
        ruleSource: resolved.ruleSource,
        transitionCount: runtime.transitions.length
    };
};


RuleEngine.prototype.history = function (entityId) {
    const runtime = this.entities[entityId];

    return runtime
        ? runtime.transitions.map(function (transition) {
            return Object.assign({}, transition);
        })
        : [];
};


module.exports = {
    DEFAULT_RULES: cloneRules(DEFAULT_RULES),
    MAX_TRANSITIONS: MAX_TRANSITIONS,
    RuleEngine: RuleEngine,
    cloneRule: cloneRule,
    cloneRules: cloneRules,
    resolveRule: resolveRule,
    stateKind: stateKind
};
