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
        "climate"
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
        climate: {portrait: 2, landscape: 3}
    };

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
        ]
    };


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
        cases: cases
    };
}));
