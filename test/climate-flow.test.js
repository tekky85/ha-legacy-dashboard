const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");


function createHarness() {

    let now = 1000;
    let timerId = 0;

    const gets = [];
    const posts = [];
    const timers = [];
    const intervals = [];

    const status = {
        innerHTML: ""
    };

    const display = {
        innerHTML: ""
    };

    const body = {};

    const lightBadge = {
        className: "light-state light-state-off",
        innerHTML: "Aus"
    };

    const lightIcon = {
        className: "icon light off"
    };

    const lightLabel = {
        innerHTML: "Einschalten"
    };

    const lightCard = {
        className: "card card-light",
        parentNode: body,
        getElementsByClassName: function (name) {
            if (name === "icon") {
                return [lightIcon];
            }
            if (name === "light-state") {
                return [lightBadge];
            }
            if (name === "light-control-label") {
                return [lightLabel];
            }
            return [];
        }
    };

    const lightAttributes = {
        "data-entity": "light.esszimmer_lampen",
        "data-state": "off",
        "data-available": "true",
        "aria-pressed": "false",
        "aria-label": "Einschalten"
    };

    const lightButton = {
        className: "light-control is-off",
        disabled: false,
        tagName: "BUTTON",
        parentNode: lightCard,
        getAttribute: function (name) {
            return lightAttributes[name];
        },
        setAttribute: function (name, value) {
            lightAttributes[name] = value;
        }
    };

    const card = {
        className: "card card-climate",
        parentNode: body,
        getElementsByClassName: function (name) {
            return name === "climate-target-value"
                ? [display]
                : [];
        }
    };

    function makeButton(direction) {

        const attributes = {
            "data-entity": "climate.esszimmer_thermostate",
            "data-direction": String(direction),
            "data-target": "22",
            "data-step": "0.5",
            "data-min": "10",
            "data-max": "30",
            "data-available": "true"
        };

        return {
            className: "climate-control",
            disabled: false,
            tagName: "BUTTON",
            parentNode: card,
            getAttribute: function (name) {
                return attributes[name];
            },
            setAttribute: function (name, value) {
                attributes[name] = value;
            }
        };

    }

    const minus = makeButton(-1);
    const plus = makeButton(1);

    const dashboard = {
        onclick: null
    };

    const document = {
        body: body,
        getElementById: function (id) {
            if (id === "updated") {
                return status;
            }
            if (id === "dashboard") {
                return dashboard;
            }
            return null;
        },
        getElementsByClassName: function (name) {
            if (name === "climate-control") {
                return [minus, plus];
            }
            if (name === "light-control") {
                return [lightButton];
            }
            return [];
        }
    };

    function FakeDate() {}

    FakeDate.prototype.getTime = function () {
        return now;
    };

    FakeDate.prototype.toLocaleTimeString = function () {
        return "test-time";
    };

    function setTimer(callback, delay) {
        timerId += 1;
        timers.push({
            id: timerId,
            callback: callback,
            delay: delay,
            cleared: false
        });
        return timerId;
    }

    function clearTimer(id) {
        let index;
        for (index = 0; index < timers.length; index += 1) {
            if (timers[index].id === id) {
                timers[index].cleared = true;
            }
        }
    }

    const context = {
        Theme: {
            load: function () {},
            toggle: function () {}
        },
        Legacy: {
            dom: {
                byId: document.getElementById
            },
            html: {
                escape: function (value) {
                    return String(value);
                }
            },
            http: {
                get: function (url, success, error) {
                    gets.push({
                        url: url,
                        success: success,
                        error: error
                    });
                },
                post: function (url, payload, success, error) {
                    posts.push({
                        url: url,
                        payload: payload,
                        success: success,
                        error: error
                    });
                }
            }
        },
        Dashboard: {
            addWidget: function () {},
            render: function () {}
        },
        SensorWidget: function () {},
        BinaryWidget: function () {},
        ClimateWidget: function () {},
        LightWidget: function () {},
        document: document,
        Date: FakeDate,
        isFinite: isFinite,
        isNaN: isNaN,
        parseFloat: parseFloat,
        Number: Number,
        String: String,
        Math: Math,
        window: {
            event: null,
            setInterval: function (callback) {
                intervals.push(callback);
            },
            setTimeout: setTimer,
            clearTimeout: clearTimer
        }
    };

    const appPath = path.join(
        __dirname,
        "..",
        "src",
        "public",
        "js",
        "app.js"
    );

    vm.runInNewContext(
        fs.readFileSync(appPath, "utf8"),
        context
    );

    return {
        dashboard: dashboard,
        display: display,
        gets: gets,
        intervals: intervals,
        lightBadge: lightBadge,
        lightButton: lightButton,
        lightIcon: lightIcon,
        lightLabel: lightLabel,
        minus: minus,
        plus: plus,
        posts: posts,
        status: status,
        advanceTo: function (milliseconds) {
            now = milliseconds;
        },
        click: function (button) {
            dashboard.onclick({
                target: button,
                preventDefault: function () {}
            });
        },
        runLatestTimer: function (delay) {
            let index;
            for (index = timers.length - 1; index >= 0; index -= 1) {
                if (
                    !timers[index].cleared &&
                    timers[index].delay === delay
                ) {
                    timers[index].cleared = true;
                    timers[index].callback();
                    return;
                }
            }
            throw new Error("Timer nicht gefunden: " + delay);
        }
    };

}


test("schnelle Climate-Klicks werden zusammengefasst", function () {

    const harness = createHarness();

    harness.gets[0].success({});

    harness.intervals[0]();
    assert.equal(harness.gets.length, 2);

    harness.click(harness.plus);
    assert.equal(
        harness.display.innerHTML,
        "22.5<small>°C</small>"
    );
    assert.equal(harness.posts.length, 0);
    assert.equal(harness.plus.disabled, false);

    harness.click(harness.plus);
    assert.equal(
        harness.display.innerHTML,
        "23.0<small>°C</small>"
    );
    assert.equal(harness.posts.length, 0);
    assert.equal(
        harness.status.innerHTML,
        "Zieltemperatur 23.0 °C wird gespeichert …"
    );

    harness.runLatestTimer(500);
    assert.equal(harness.posts.length, 1);
    assert.equal(harness.posts[0].payload.temperature, 23);

    harness.click(harness.plus);
    assert.equal(
        harness.display.innerHTML,
        "23.5<small>°C</small>"
    );
    assert.equal(harness.posts.length, 1);
    assert.equal(harness.plus.disabled, false);

    harness.posts[0].success({
        temperature: 23,
        confirmed: true
    });

    assert.equal(
        harness.display.innerHTML,
        "23.5<small>°C</small>"
    );

    harness.runLatestTimer(500);
    assert.equal(harness.posts.length, 2);
    assert.equal(harness.posts[1].payload.temperature, 23.5);

    harness.posts[1].success({
        temperature: 23.5,
        confirmed: true
    });

    assert.equal(
        harness.status.innerHTML,
        "Zieltemperatur wurde gesetzt"
    );
    assert.equal(harness.plus.disabled, false);
    assert.equal(harness.minus.disabled, false);

    harness.advanceTo(6000);
    harness.gets[1].success({});

    assert.equal(
        harness.display.innerHTML,
        "23.5<small>°C</small>"
    );

    harness.runLatestTimer(5000);
    assert.equal(harness.gets.length, 3);

});


test("Climate-Fehler bleibt sichtbar und löst Refresh aus", function () {

    const harness = createHarness();

    harness.gets[0].success({});
    harness.click(harness.plus);
    harness.runLatestTimer(500);

    harness.posts[0].error({
        message: "Netzwerkfehler"
    });

    assert.equal(
        harness.status.innerHTML,
        "Fehler: Netzwerkfehler"
    );
    assert.equal(harness.plus.disabled, false);

    harness.intervals[0]();
    assert.equal(harness.gets.length, 1);

    harness.advanceTo(4000);
    harness.runLatestTimer(3000);
    assert.equal(harness.gets.length, 2);

});


test("schnelle Licht-Taps bleiben reaktionsfähig", function () {

    const harness = createHarness();

    harness.gets[0].success({});

    harness.click(harness.lightButton);

    assert.equal(harness.posts.length, 1);
    assert.equal(harness.posts[0].url, "/api/light/state");
    assert.equal(harness.posts[0].payload.state, "on");
    assert.equal(
        harness.lightButton.getAttribute("data-state"),
        "on"
    );
    assert.equal(harness.lightButton.disabled, false);
    assert.equal(harness.lightBadge.innerHTML, "An");
    assert.equal(harness.lightLabel.innerHTML, "Ausschalten");

    harness.click(harness.lightButton);

    assert.equal(harness.posts.length, 1);
    assert.equal(
        harness.lightButton.getAttribute("data-state"),
        "off"
    );
    assert.equal(harness.lightButton.disabled, false);

    harness.posts[0].success({
        state: "on"
    });

    assert.equal(harness.posts.length, 2);
    assert.equal(harness.posts[1].payload.state, "off");

    harness.posts[1].success({
        state: "off"
    });

    assert.equal(
        harness.status.innerHTML,
        "Licht wurde ausgeschaltet"
    );
    assert.equal(harness.lightBadge.innerHTML, "Aus");
    assert.equal(harness.lightLabel.innerHTML, "Einschalten");

});


test("Lichtfehler bleibt sichtbar und löst Refresh aus", function () {

    const harness = createHarness();

    harness.gets[0].success({});
    harness.click(harness.lightButton);

    harness.posts[0].error({
        message: "Netzwerkfehler"
    });

    assert.equal(
        harness.status.innerHTML,
        "Fehler: Netzwerkfehler"
    );
    assert.equal(harness.lightButton.disabled, false);

    harness.intervals[0]();
    assert.equal(harness.gets.length, 1);

    harness.advanceTo(2000);
    harness.runLatestTimer(1000);
    assert.equal(harness.gets.length, 2);

});
