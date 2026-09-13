(function (root, factory) {
    "use strict";

    var fixtures = factory();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = fixtures;
    }

    root.CardMatrixFixtures = fixtures;
}(this, function () {
    "use strict";

    var TYPES = [
        "sensor",
        "binary",
        "light",
        "climate",
        "room"
    ];

    var PROFILES = {
        portrait: {
            columns: 6,
            canvasWidth: 768
        },
        landscape: {
            columns: 12,
            canvasWidth: 1024
        }
    };

    var MINIMUM_WIDTHS = {
        sensor: {portrait: 2, landscape: 2},
        binary: {portrait: 2, landscape: 2},
        light: {portrait: 2, landscape: 2},
        climate: {portrait: 2, landscape: 3},
        room: {portrait: 2, landscape: 2}
    };


    function entityState(entityId, state, attributes, capabilities) {
        return {
            entity_id: entityId,
            state: state,
            attributes: attributes || {},
            gateway_capabilities: capabilities || {}
        };
    }


    function roomScenario(options) {
        var entities = {
            temperature: "sensor.room_temperature",
            humidity: "sensor.room_humidity",
            climate: options.withClimate === false
                ? ""
                : "climate.room",
            presence: options.minimal
                ? ""
                : "binary_sensor.room_presence",
            windows: options.minimal
                ? []
                : ["binary_sensor.room_window"],
            lights: options.withLight === false
                ? []
                : ["light.room"],
            switches: options.minimal ? [] : ["switch.room"],
            covers: options.minimal ? [] : ["cover.room"],
            fans: options.minimal ? [] : ["fan.room"],
            mediaPlayers: options.minimal ? [] : ["media_player.room"],
            locks: options.minimal ? [] : ["lock.room"],
            batteries: options.minimal ? [] : ["sensor.room_battery"],
            alerts: options.minimal ? [] : ["binary_sensor.room_smoke"],
            secondary: options.minimal ? [] : ["sensor.room_secondary"]
        };
        var data = {};
        var climateCapabilities = options.climateCapabilities || {};
        var lightCapabilities = options.lightCapabilities || {};
        var background = options.background
            ? {
                image_url: "/assets/backgrounds/bg-0123456789abcdef0123456789abcdef.jpg",
                position: "center center",
                size: "cover",
                overlay: 20
            }
            : null;

        data[entities.temperature] = entityState(
            entities.temperature,
            options.temperatureState || "21.5",
            {unit_of_measurement: options.longValues ? "Grad Celsius" : "°C"}
        );
        data[entities.humidity] = entityState(
            entities.humidity,
            options.humidityState || "48",
            {unit_of_measurement: "%"}
        );

        if (entities.climate) {
            data[entities.climate] = entityState(
                entities.climate,
                options.climateState || "heat",
                options.climateAttributes || {
                    current_temperature: 21.5,
                    temperature: 22.5,
                    min_temp: 5,
                    max_temp: 35,
                    target_temp_step: 0.5,
                    hvac_action: "heating"
                },
                climateCapabilities
            );
        }

        if (entities.presence) {
            data[entities.presence] = entityState(
                entities.presence,
                options.presenceState || "on"
            );
        }
        if (entities.windows.length) {
            data[entities.windows[0]] = entityState(
                entities.windows[0],
                options.windowState || "on",
                {friendly_name: "Terrassenfenster mit langem Namen"}
            );
        }
        if (entities.lights.length) {
            data[entities.lights[0]] = entityState(
                entities.lights[0],
                options.lightState || "on",
                {friendly_name: "Deckenlicht"},
                lightCapabilities
            );
        }

        if (!options.minimal) {
            data[entities.switches[0]] = entityState(
                entities.switches[0], "on", {friendly_name: "Leselampe Schalter"}
            );
            data[entities.covers[0]] = entityState(entities.covers[0], "open");
            data[entities.fans[0]] = entityState(entities.fans[0], "on");
            data[entities.mediaPlayers[0]] = entityState(
                entities.mediaPlayers[0], "playing"
            );
            data[entities.locks[0]] = entityState(entities.locks[0], "unlocked");
            data[entities.batteries[0]] = entityState(
                entities.batteries[0], "12", {unit_of_measurement: "%"}
            );
            data[entities.alerts[0]] = entityState(entities.alerts[0], "off");
            data[entities.secondary[0]] = entityState(
                entities.secondary[0],
                options.longValues ? "-1234.567" : "ok",
                {
                    friendly_name: options.longValues
                        ? "Sekundärer Sensor mit besonders langem Namen"
                        : "Sekundärer Sensor",
                    unit_of_measurement: options.longValues
                        ? "Kilowattstunden"
                        : ""
                }
            );
        }

        return {
            id: options.id,
            title: options.title || "Wohnzimmer",
            subtitle: "",
            data: data,
            alerts: options.alerts || [],
            room: {
                areaId: options.areaId === false ? null : "living",
                collapsible: true,
                defaultExpanded: options.expanded === true,
                background: background,
                entities: entities
            }
        };
    }

    var STATES = {
        sensor: [
            {
                id: "short",
                title: "Bad",
                subtitle: "Temperatur",
                unit: "°C",
                data: {
                    state: "21.8",
                    attributes: {unit_of_measurement: "°C"}
                }
            },
            {
                id: "long-negative",
                title: "Außentemperatur Nordseite mit sehr langem Namen",
                subtitle: "Kalibrierter Messwert",
                unit: "Kilowattstunden",
                data: {
                    state: "-1234.567",
                    attributes: {
                        unit_of_measurement: "Kilowattstunden"
                    }
                }
            },
            {
                id: "unknown",
                title: "Unbekannter Sensor",
                subtitle: "Diagnose",
                unit: "°C",
                data: {state: "unknown", attributes: {}}
            },
            {
                id: "unavailable",
                title: "Nicht verfügbarer Sensor",
                subtitle: "Diagnose",
                unit: "°C",
                data: {state: "unavailable", attributes: {}}
            }
        ],
        binary: [
            {
                id: "on",
                title: "Fenster Küche",
                subtitle: "Kontakt",
                data: {state: "on", attributes: {}}
            },
            {
                id: "off-long",
                title: "Terrassentür im hinteren Wohnbereich",
                subtitle: "Sehr langer sekundärer Hinweis",
                data: {state: "off", attributes: {}}
            },
            {
                id: "unknown",
                title: "Unbekannter Kontakt",
                subtitle: "Diagnose",
                data: {state: "unknown", attributes: {}}
            },
            {
                id: "unavailable",
                title: "Nicht verfügbarer Kontakt",
                subtitle: "Diagnose",
                data: {state: "unavailable", attributes: {}}
            }
        ],
        light: [
            {
                id: "on",
                title: "Esszimmer",
                subtitle: "Deckenlicht",
                data: {
                    state: "on",
                    attributes: {brightness: 192},
                    gateway_capabilities: {
                        can_light_power_off: true
                    }
                }
            },
            {
                id: "off-long",
                title: "Indirekte Beleuchtung im langen Wohnbereich",
                subtitle: "Helligkeit und Farbtemperatur verfügbar",
                data: {
                    state: "off",
                    attributes: {brightness: 0},
                    gateway_capabilities: {
                        can_light_power_on: true
                    }
                }
            },
            {
                id: "on-read-only",
                title: "Licht ohne Schreibfreigabe",
                subtitle: "Nur Anzeige",
                data: {
                    state: "on",
                    attributes: {brightness: 255},
                    gateway_capabilities: {}
                }
            },
            {
                id: "unavailable",
                title: "Nicht verfügbares Licht",
                subtitle: "Diagnose",
                data: {
                    state: "unavailable",
                    attributes: {},
                    gateway_capabilities: {}
                }
            }
        ],
        climate: [
            {
                id: "heating",
                title: "Esszimmer",
                subtitle: "Thermostat",
                unit: "°C",
                data: {
                    state: "heat",
                    attributes: {
                        current_temperature: 21.8,
                        temperature: 22.5,
                        min_temp: 5,
                        max_temp: 35,
                        target_temp_step: 0.5,
                        hvac_action: "heating"
                    },
                    gateway_capabilities: {
                        can_set_temperature: true,
                        supports_power: true,
                        can_power_off: true
                    }
                }
            },
            {
                id: "cooling-long",
                title: "Thermostat im sehr langen Namen des Wohnbereichs",
                subtitle: "Kühlbetrieb mit sekundärer Information",
                unit: "°C",
                data: {
                    state: "cool",
                    attributes: {
                        current_temperature: 29.75,
                        temperature: 18.25,
                        min_temp: 5,
                        max_temp: 35,
                        target_temp_step: 0.25,
                        hvac_action: "cooling"
                    },
                    gateway_capabilities: {
                        can_set_temperature: true,
                        supports_power: true,
                        can_power_off: true
                    }
                }
            },
            {
                id: "negative-decimal",
                title: "Frostschutz",
                subtitle: "Außenbereich",
                unit: "°C",
                data: {
                    state: "heat",
                    attributes: {
                        current_temperature: -12.5,
                        temperature: 5.0,
                        min_temp: 5,
                        max_temp: 35,
                        target_temp_step: 0.5,
                        hvac_action: "idle"
                    },
                    gateway_capabilities: {
                        can_set_temperature: true,
                        supports_power: true,
                        can_power_off: true
                    }
                }
            },
            {
                id: "off",
                title: "Schlafzimmer",
                subtitle: "Thermostat ausgeschaltet",
                unit: "°F",
                data: {
                    state: "off",
                    attributes: {
                        current_temperature: 68.0,
                        temperature: 69.5,
                        min_temp: 41,
                        max_temp: 95,
                        target_temp_step: 0.5,
                        hvac_action: "off"
                    },
                    gateway_capabilities: {
                        supports_power: true,
                        can_power_on: true
                    }
                }
            },
            {
                id: "unknown",
                title: "Thermostat mit unbekanntem Zustand",
                subtitle: "Diagnose",
                unit: "°C",
                data: {
                    state: "unknown",
                    attributes: {},
                    gateway_capabilities: {}
                }
            },
            {
                id: "unavailable",
                title: "Nicht verfügbarer Thermostat",
                subtitle: "Diagnose",
                unit: "°C",
                data: {
                    state: "unavailable",
                    attributes: {},
                    gateway_capabilities: {}
                }
            }
        ],
        room: [
            roomScenario({
                id: "collapsed-controlled-background",
                background: true,
                climateCapabilities: {
                    can_set_temperature: true,
                    supports_power: true,
                    can_power_off: true
                },
                lightCapabilities: {can_light_power_off: true},
                alerts: [{title: "Fenster offen", severity: "warning"}]
            }),
            roomScenario({
                id: "expanded-controlled-background",
                expanded: true,
                background: true,
                climateState: "off",
                climateCapabilities: {
                    can_set_temperature: true,
                    supports_power: true,
                    can_power_on: true
                },
                lightState: "off",
                lightCapabilities: {can_light_power_on: true},
                alerts: [{title: "Rauchwarnung", severity: "critical"}]
            }),
            roomScenario({
                id: "expanded-read-only",
                expanded: true,
                climateCapabilities: {},
                lightCapabilities: {}
            }),
            roomScenario({
                id: "target-without-power",
                expanded: true,
                withLight: false,
                climateCapabilities: {can_set_temperature: true}
            }),
            roomScenario({
                id: "unavailable",
                expanded: true,
                temperatureState: "unavailable",
                humidityState: "unknown",
                climateState: "unavailable",
                climateAttributes: {},
                climateCapabilities: {},
                lightState: "unavailable",
                lightCapabilities: {}
            }),
            roomScenario({
                id: "minimal-missing-optional",
                title: "Abstellraum",
                minimal: true,
                withClimate: false,
                withLight: false,
                areaId: false
            }),
            roomScenario({
                id: "expanded-long-dense",
                title: "Wohn- und Esszimmer mit besonders langem Raumnamen",
                expanded: true,
                background: true,
                longValues: true,
                climateCapabilities: {
                    can_set_temperature: true,
                    supports_power: true,
                    can_power_off: true
                },
                lightCapabilities: {can_light_power_off: true},
                alerts: [
                    {title: "Sehr langer Sicherheitshinweis", severity: "critical"},
                    {title: "Batterie niedrig", severity: "warning"}
                ]
            })
        ]
    };


    function expectedControlCount(entry) {
        var state = entry.state;
        var capabilities;
        var entities;
        var count;

        if (entry.type === "light") {
            return 1;
        }
        if (entry.type === "climate") {
            capabilities = state.data.gateway_capabilities || {};
            return 2 + (capabilities.supports_power === true ? 1 : 0);
        }
        if (entry.type !== "room") {
            return 0;
        }

        entities = state.room.entities || {};
        count = (entities.lights || []).length;
        if (entities.climate) {
            capabilities = state.data[entities.climate] &&
                state.data[entities.climate].gateway_capabilities || {};
            count += 2;
            if (capabilities.supports_power === true) {
                count += 1;
            }
        }
        return count;
    }


    function sizes(type, profileName) {
        var profile = PROFILES[profileName];
        var minimum = MINIMUM_WIDTHS[type][profileName];
        var result = [];
        var width;
        var height;

        for (height = 1; height <= 4; height += 1) {
            for (
                width = minimum;
                width <= profile.columns;
                width += 1
            ) {
                result.push({w: width, h: height});
            }
        }

        return result;
    }


    function cases() {
        var result = [];

        TYPES.forEach(function (type) {
            Object.keys(PROFILES).forEach(function (profileName) {
                sizes(type, profileName).forEach(function (size) {
                    STATES[type].forEach(function (state) {
                        result.push({
                            id:
                                type + "-" + profileName + "-" +
                                size.w + "x" + size.h + "-" + state.id,
                            type: type,
                            profile: profileName,
                            size: {w: size.w, h: size.h},
                            state: state
                        });
                    });
                });
            });
        });

        return result;
    }


    return {
        TYPES: TYPES.slice(0),
        PROFILES: PROFILES,
        MINIMUM_WIDTHS: MINIMUM_WIDTHS,
        STATES: STATES,
        sizes: sizes,
        cases: cases,
        expectedControlCount: expectedControlCount
    };
}));
