const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");


function createHarness(pathname) {

    let now = 1000;
    let timerId = 0;

    const gets = [];
    const posts = [];
    const timers = [];
    const intervals = [];
    const configurations = [];
    const renders = [];

    const status = {
        className: "updated",
        innerHTML: ""
    };

    const clock = {
        innerHTML: ""
    };

    const date = {
        innerHTML: ""
    };

    const connectionBadge = {
        className: "connection-badge is-connecting"
    };

    const connectionLabel = {
        innerHTML: "Verbinde …"
    };

    const networkBanner = {
        className: "network-banner",
        innerHTML: ""
    };

    const dashboardTitle = {
        innerHTML: "HA Dashboard"
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
            if (name === "dashboard-power-label") {
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
        className: "dashboard-power-control light-control is-off",
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
        title: "HA Legacy Dashboard",
        getElementById: function (id) {
            if (id === "updated") {
                return status;
            }
            if (id === "dashboard") {
                return dashboard;
            }
            if (id === "wallClock") {
                return clock;
            }
            if (id === "wallDate") {
                return date;
            }
            if (id === "connectionBadge") {
                return connectionBadge;
            }
            if (id === "connectionLabel") {
                return connectionLabel;
            }
            if (id === "networkBanner") {
                return networkBanner;
            }
            if (id === "dashboardTitle") {
                return dashboardTitle;
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
        },
        getElementsByTagName: function () {
            return [lightButton, minus, plus];
        }
    };

    function FakeDate() {}

    FakeDate.prototype.getTime = function () {
        return now;
    };

    FakeDate.prototype.toLocaleTimeString = function () {
        return "test-time";
    };

    FakeDate.prototype.getHours = function () {
        return 9;
    };

    FakeDate.prototype.getMinutes = function () {
        return 5;
    };

    FakeDate.prototype.getDay = function () {
        return 2;
    };

    FakeDate.prototype.getDate = function () {
        return 4;
    };

    FakeDate.prototype.getMonth = function () {
        return 7;
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
            configure: function (widgets) {
                configurations.push(widgets);
                return widgets.length;
            },
            render: function (data) {
                renders.push(data);
            }
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
            location: {
                pathname: pathname || "/"
            },
            setInterval: function (callback, delay) {
                callback.delay = delay;
                callback.cleared = false;
                intervals.push(callback);
                return intervals.length;
            },
            clearInterval: function (id) {
                if (intervals[id - 1]) {
                    intervals[id - 1].cleared = true;
                }
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
        clock: clock,
        date: date,
        connectionBadge: connectionBadge,
        connectionLabel: connectionLabel,
        networkBanner: networkBanner,
        dashboardTitle: dashboardTitle,
        document: document,
        configurations: configurations,
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
        renders: renders,
        status: status,
        completeConfiguration: function () {
            gets[0].success({
                id: "default",
                title: "Übersicht",
                refresh_interval_ms: 5000,
                widgets: [
                    {
                        entity: "light.esszimmer_lampen",
                        type: "light"
                    }
                ]
            });
        },
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


test("Dashboard-Konfiguration wird vor Zuständen geladen", function () {

    const harness = createHarness();

    assert.equal(harness.gets.length, 1);
    assert.equal(
        harness.gets[0].url,
        "/api/dashboard/config"
    );

    harness.intervals[0]();
    assert.equal(harness.gets.length, 1);

    harness.completeConfiguration();

    assert.equal(harness.configurations.length, 1);
    assert.equal(harness.gets.length, 2);
    assert.equal(harness.gets[1].url, "/api/dashboard");

});


test("Dashboard-ID aus der URL steuert Konfiguration und Zustand", function () {

    const harness = createHarness("/d/esszimmer");

    assert.equal(
        harness.gets[0].url,
        "/api/dashboards/esszimmer/config"
    );

    harness.gets[0].success({
        id: "esszimmer",
        title: "Esszimmer",
        refresh_interval_ms: 5000,
        widgets: [
            {
                entity: "light.esszimmer_lampen",
                type: "light"
            }
        ]
    });

    assert.equal(
        harness.dashboardTitle.innerHTML,
        "Esszimmer"
    );
    assert.equal(
        harness.document.title,
        "Esszimmer – HA Dashboard"
    );
    assert.equal(
        harness.gets[1].url,
        "/api/dashboards/esszimmer/state"
    );

});


test("Wall-Display zeigt Uhr, Status und automatische Wiederverbindung", function () {

    const harness = createHarness();

    assert.equal(harness.clock.innerHTML, "09:05");
    assert.equal(harness.date.innerHTML, "Dienstag, 4. August");
    assert.equal(harness.intervals[0].delay, 5000);
    assert.equal(harness.intervals[1].delay, 30000);

    harness.completeConfiguration();
    harness.gets[1].success({
        _meta: {
            home_assistant: "online"
        }
    });

    assert.equal(harness.connectionLabel.innerHTML, "Online");
    assert.equal(
        harness.connectionBadge.className,
        "connection-badge is-online"
    );
    assert.equal(harness.networkBanner.className, "network-banner");

    harness.intervals[0]();
    harness.gets[2].error({
        message: "Netzwerkfehler"
    });

    assert.equal(harness.connectionLabel.innerHTML, "Gateway offline");
    assert.ok(
        harness.networkBanner.className.indexOf("is-visible") !== -1
    );

    harness.intervals[0]();
    harness.gets[3].success({
        _meta: {
            home_assistant: "online"
        }
    });

    assert.equal(harness.connectionLabel.innerHTML, "Online");
    assert.equal(harness.networkBanner.innerHTML, "");

});


test("fehlerhafte Dashboard-Konfiguration wird erneut geladen", function () {

    const harness = createHarness();

    harness.gets[0].error({
        message: "Konfiguration nicht erreichbar"
    });

    assert.equal(
        harness.status.innerHTML,
        "Fehler: Konfiguration nicht erreichbar"
    );

    harness.intervals[0]();

    assert.equal(harness.gets.length, 2);
    assert.equal(
        harness.gets[1].url,
        "/api/dashboard/config"
    );

});


test("veraltete Daten bleiben mit letztem Erfolg sichtbar", function () {

    const harness = createHarness();

    harness.completeConfiguration();
    harness.gets[1].success({
        _meta: {
            home_assistant: "online"
        }
    });

    assert.equal(harness.renders.length, 1);
    assert.equal(
        harness.status.innerHTML,
        "Aktualisiert: test-time"
    );

    harness.intervals[0]();
    harness.gets[2].success({
        _meta: {
            home_assistant: "offline"
        }
    });

    assert.equal(harness.renders.length, 1);
    assert.equal(
        harness.status.innerHTML,
        "Verbindung unterbrochen – letzter Erfolg: test-time"
    );
    assert.ok(
        harness.status.className.indexOf("is-stale") !== -1
    );

    harness.intervals[0]();
    harness.gets[3].success({
        _meta: {
            home_assistant: "degraded"
        }
    });

    assert.equal(harness.renders.length, 2);
    assert.equal(
        harness.status.innerHTML,
        "Teilweise verfügbar – letzter voller Erfolg: test-time"
    );

    harness.intervals[0]();
    harness.gets[4].success({
        _meta: {
            home_assistant: "online"
        }
    });

    assert.equal(harness.renders.length, 3);
    assert.equal(harness.status.className, "updated");

});


test("schnelle Climate-Klicks werden zusammengefasst", function () {

    const harness = createHarness();

    harness.completeConfiguration();
    harness.gets[1].success({});

    harness.intervals[0]();
    assert.equal(harness.gets.length, 3);

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
    harness.gets[2].success({});

    assert.equal(
        harness.display.innerHTML,
        "23.5<small>°C</small>"
    );

    harness.runLatestTimer(5000);
    assert.equal(harness.gets.length, 4);

});


test("Climate-Fehler bleibt sichtbar und löst Refresh aus", function () {

    const harness = createHarness();

    harness.completeConfiguration();
    harness.gets[1].success({});
    harness.click(harness.plus);
    harness.runLatestTimer(500);

    harness.posts[0].error({
        message: "Netzwerkfehler"
    });

    assert.equal(
        harness.display.innerHTML,
        "22.0<small>°C</small>"
    );
    assert.equal(
        harness.status.innerHTML,
        "Fehler: Netzwerkfehler"
    );
    assert.equal(harness.plus.disabled, false);

    harness.intervals[0]();
    assert.equal(harness.gets.length, 2);

    harness.advanceTo(4000);
    harness.runLatestTimer(3000);
    assert.equal(harness.gets.length, 3);

});


test("Climate-Fehler nach schnellem Folgeclick stellt letzten bestätigten Wert her", function () {

    const harness = createHarness();

    harness.completeConfiguration();
    harness.gets[1].success({});
    harness.click(harness.plus);
    harness.click(harness.plus);
    harness.runLatestTimer(500);

    harness.click(harness.plus);
    harness.posts[0].success({
        temperature: 23,
        confirmed: true
    });
    harness.runLatestTimer(500);
    harness.posts[1].error({
        message: "Off-State-Sollwert abgelehnt"
    });

    assert.equal(
        harness.display.innerHTML,
        "23.0<small>°C</small>"
    );
    assert.equal(
        harness.status.innerHTML,
        "Fehler: Off-State-Sollwert abgelehnt"
    );

});


test("schnelle Licht-Taps bleiben reaktionsfähig", function () {

    const harness = createHarness();

    harness.completeConfiguration();
    harness.gets[1].success({});

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

    harness.completeConfiguration();
    harness.gets[1].success({});
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
    assert.equal(harness.gets.length, 2);

    harness.advanceTo(2000);
    harness.runLatestTimer(1000);
    assert.equal(harness.gets.length, 3);

});
