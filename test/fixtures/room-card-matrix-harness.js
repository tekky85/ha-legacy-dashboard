(function () {
    "use strict";

    var CASES = [
        {id: "compact", width: 220, height: 145, gridWidth: 2, gridHeight: 1},
        {id: "standard", width: 330, height: 245, gridWidth: 3, gridHeight: 2},
        {id: "wide", width: 470, height: 145, gridWidth: 6, gridHeight: 1},
        {id: "large", width: 560, height: 330, gridWidth: 6, gridHeight: 2}
    ];

    function config() {
        return {
            id: "living-room",
            entity: "",
            type: "room",
            title: "Wohnzimmer mit langem Namen",
            subtitle: "",
            icon: "room",
            iconClass: "room",
            unit: "",
            size: "large",
            room: {
                areaId: "living",
                collapsible: true,
                defaultExpanded: true,
                background: null,
                entities: {
                    temperature: "sensor.temperature",
                    humidity: "sensor.humidity",
                    climate: "climate.main",
                    presence: "binary_sensor.presence",
                    windows: ["binary_sensor.window_one", "binary_sensor.window_two"],
                    lights: ["light.main"],
                    switches: ["switch.read_only"],
                    covers: ["cover.read_only"],
                    fans: ["fan.read_only"],
                    mediaPlayers: ["media_player.read_only"],
                    locks: ["lock.read_only"],
                    batteries: ["sensor.battery"],
                    alerts: ["binary_sensor.smoke"],
                    secondary: ["sensor.long_value"]
                }
            }
        };
    }

    function state(entityId, value, attributes, capabilities) {
        return {
            entity_id: entityId,
            state: value,
            attributes: attributes || {},
            gateway_capabilities: capabilities || {}
        };
    }

    function states() {
        return {
            "sensor.temperature": state("sensor.temperature", "21.5", {unit_of_measurement: "°C"}),
            "sensor.humidity": state("sensor.humidity", "48", {unit_of_measurement: "%"}),
            "climate.main": state("climate.main", "heat", {temperature: 22.5, min_temp: 5, max_temp: 35, target_temp_step: 0.5}, {can_set_temperature: true, supports_power: true, can_power_off: true}),
            "binary_sensor.presence": state("binary_sensor.presence", "on"),
            "binary_sensor.window_one": state("binary_sensor.window_one", "on"),
            "binary_sensor.window_two": state("binary_sensor.window_two", "off"),
            "light.main": state("light.main", "on", {friendly_name: "Deckenlicht"}, {can_light_power_off: true}),
            "switch.read_only": state("switch.read_only", "on", {friendly_name: "Langer read-only Schaltername"}),
            "cover.read_only": state("cover.read_only", "open"),
            "fan.read_only": state("fan.read_only", "on"),
            "media_player.read_only": state("media_player.read_only", "playing"),
            "lock.read_only": state("lock.read_only", "unlocked"),
            "sensor.battery": state("sensor.battery", "12", {unit_of_measurement: "%"}),
            "binary_sensor.smoke": state("binary_sensor.smoke", "off"),
            "sensor.long_value": state("sensor.long_value", "-1234.567", {unit_of_measurement: "Kilowattstunden"})
        };
    }

    function renderCase(definition) {
        var widget = new RoomWidget(config());
        var wrapper = document.createElement("article");
        var label = document.createElement("span");

        wrapper.className = "room-matrix-case";
        wrapper.setAttribute("data-room-case", definition.id);
        wrapper.style.width = definition.width + "px";
        wrapper.innerHTML = widget.render(states(), [{title: "Batterie niedrig", severity: "warning"}]);
        wrapper.firstChild.className += " card-presentation-" + definition.id;
        wrapper.firstChild.style.width = definition.width + "px";
        wrapper.firstChild.style.height = definition.height + "px";
        label.className = "room-matrix-label";
        label.appendChild(document.createTextNode(definition.id));
        wrapper.appendChild(label);
        return wrapper;
    }

    function run() {
        var board = document.getElementById("room-matrix-board");
        var failures = [];

        CASES.forEach(function (definition) {
            board.appendChild(renderCase(definition));
        });

        window.setTimeout(function () {
            var fixtures = board.getElementsByClassName("room-matrix-case");
            var index;
            var card;
            var controls;
            var controlIndex;
            var bounds;

            for (index = 0; index < fixtures.length; index += 1) {
                card = fixtures[index].getElementsByClassName("card-room")[0];
                controls = card.querySelectorAll("button");
                if (card.scrollWidth > card.clientWidth + 1) {
                    failures.push({caseId: fixtures[index].getAttribute("data-room-case"), code: "horizontal-overflow"});
                }
                if (card.className.indexOf("card-presentation-" + fixtures[index].getAttribute("data-room-case")) === -1) {
                    failures.push({caseId: fixtures[index].getAttribute("data-room-case"), code: "invalid-tier"});
                }
                for (controlIndex = 0; controlIndex < controls.length; controlIndex += 1) {
                    if (window.getComputedStyle(controls[controlIndex]).display === "none") {
                        continue;
                    }
                    bounds = controls[controlIndex].getBoundingClientRect();
                    if (bounds.width === 0 || bounds.height === 0) {
                        continue;
                    }
                    if (bounds.width < 43.5 || bounds.height < 43.5) {
                        failures.push({caseId: fixtures[index].getAttribute("data-room-case"), code: "touch-target"});
                    }
                }
            }

            window.RoomMatrixResult = {cases: fixtures.length, failures: failures};
            document.body.setAttribute("data-room-matrix-status", failures.length ? "failed" : "passed");
            document.getElementById("room-matrix-result").textContent = JSON.stringify(window.RoomMatrixResult, null, 2);
        }, 80);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run, false);
    } else {
        run();
    }
}());
