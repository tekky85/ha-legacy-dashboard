"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const Climate = require("../src/services/climate-power");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function state(extra, mode) {
    return {state: mode || "heat", attributes: Object.assign({temperature: 20, min_temp: 5,
        max_temp: 30, supported_features: 1, hvac_modes: ["off", "heat"]}, extra)};
}
test("Optional Climate step no longer disables authorized thermostats, active or off", () => {
    for (const id of ["climate.radiator_one", "climate.radiator_two", "climate.air_conditioner"]) {
        for (const mode of ["heat", "off"]) {
            for (const step of [undefined, null, 0.1, 0.5, 1]) {
                const result = Climate.capabilities(id, state({target_temp_step: step}, mode), {domain: "climate", entityId: id});
                assert.equal(result.canSetTemperature, true, id + mode + step);
                assert.equal(result.temperature.step, step == null ? 0.5 : step);
            }
        }
    }
});
test("Fallback never masks explicit invalid constraints, absent setpoint or missing authorization", () => {
    for (const attributes of [{target_temp_step: 0}, {target_temp_step: -1}, {target_temp_step: "bad"},
        {target_temp_step: ""}, {target_temp_step: Infinity}, {temperature: null}, {min_temp: null},
        {max_temp: null}, {min_temp: 31}, {supported_features: 0}, {supported_features: 2}]) {
        assert.equal(Climate.capabilities("climate.demo", state(attributes), {domain: "climate", entityId: "climate.demo"}).canSetTemperature, false);
    }
    for (const authorization of [null, {domain: "light", entityId: "climate.demo"}, {domain: "climate", entityId: "climate.other"}]) {
        assert.equal(Climate.capabilities("climate.demo", state({}), authorization).canSetTemperature, false);
    }
    for (const mode of ["unavailable", "unknown"]) {
        assert.equal(Climate.capabilities("climate.demo", state({}, mode), {domain: "climate", entityId: "climate.demo"}).canSetTemperature, false);
    }
});
test("Grid, Focus and Room retain one central temperature grant and 0.5 fallback", () => {
    const context = vm.createContext({Legacy: {html: {escape: value => String(value)}}});
    for (const file of ["core/widget", "controls/power", "widgets/climate", "widgets/room"]) {
        vm.runInContext(read("src/public/js/" + file + ".js"), context);
    }
    const entity = state({});
    entity.gateway_capabilities = {can_set_temperature: true};
    const grid = new context.ClimateWidget({id: "heating", type: "climate", entity: "climate.demo", title: "Heating"});
    assert.match(grid.render(entity), /data-step="0.5"/);
    const room = new context.RoomWidget({id: "room", type: "room", title: "Room", room: {entities: {climate: "climate.demo"}}});
    assert.match(room.climateControls(entity, "climate.demo"), /data-step="0.5"/);
    entity.gateway_capabilities.can_set_temperature = false;
    assert.match(grid.render(entity), /disabled="disabled"/);
    assert.match(room.climateControls(entity, "climate.demo"), /disabled="disabled"/);
});
test("Room presentation explicitly prevents legacy flex compression; Admin keeps confirmation and draft semantics", () => {
    const css = read("src/public/css/style.css");
    assert.match(css, /\.room-content > div\s*\{[^}]*-webkit-flex-shrink:\s*0;[^}]*flex-shrink:\s*0;/);
    const app = read("src/admin/js/app.js");
    assert.match(app, /pendingDashboardDeleteId/);
    assert.match(app, /openDialog\(elements.dashboardDeleteDialog\)/);
    assert.match(app, /admin\.Dashboards\.remove\(pendingDashboardDeleteId\)/);
    const branch = app.split('button.dataset.action === "dashboard-delete"')[1].split('button.dataset.action === "room-add"')[0];
    assert.doesNotMatch(branch, /window.confirm/);
    assert.match(read("src/admin/index.html"), /erst mit „Änderungen speichern“/);
});
