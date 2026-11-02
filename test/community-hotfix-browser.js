"use strict";
// Controlled real frontend only, fake local API fixtures; no production HA.
const assert = require("node:assert/strict");
const {chromium} = require("playwright");
const fixture = require("./capture-doc-screenshots");
const cp = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
async function main() {
    const server = fixture.server();
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_BIN || undefined});
    const baseline = process.argv.includes("--baseline");
    const evidence = {};
    try {
        if (process.argv.includes("--matrix")) {
            const matrixServer = require("./run-card-matrix-browser").staticServer();
            await new Promise(resolve => matrixServer.listen(0, "127.0.0.1", resolve));
            const matrixBase = "http://127.0.0.1:" + matrixServer.address().port;
            const matrixContext = await browser.newContext();
            try {
                await matrixContext.route("**/*", route => route.request().url().startsWith(matrixBase + "/") ? route.continue() : route.abort());
                const matrix = await matrixContext.newPage();
                await matrix.goto(matrixBase + "/test/card-matrix-harness.html");
                await matrix.locator("body[data-matrix-status]").waitFor({timeout: 120000});
                evidence.matrix = await matrix.locator("body").evaluate(body => ({status: body.getAttribute("data-matrix-status"),
                    cases: Number(body.getAttribute("data-matrix-cases")), failures: Number(body.getAttribute("data-matrix-failures")),
                    diagnostics: decodeURIComponent(body.getAttribute("data-matrix-diagnostics") || "[]")}));
                assert.equal(evidence.matrix.status, "passed", JSON.stringify(evidence.matrix));
                assert.equal(evidence.matrix.cases, 1576); assert.equal(evidence.matrix.failures, 0);
            } finally { await matrixContext.close(); await new Promise(resolve => matrixServer.close(resolve)); }
        }
        const context = await browser.newContext({viewport: {width: 768, height: 1024}});
        await context.route("**/*", route => {
            const url = new URL(route.request().url());
            if (!url.href.startsWith(base + "/")) { return route.abort(); }
            if (baseline && ["/js/core/dashboard.js", "/admin/js/app.js", "/css/style.css"].includes(url.pathname)) {
                const file = url.pathname.startsWith("/admin/") ? "src" + url.pathname : "src/public" + url.pathname;
                return route.fulfill({body: cp.execFileSync("git", ["show", "v1.0.0-rc.8:" + file]), contentType: file.endsWith(".css") ? "text/css" : "application/javascript"});
            }
            return route.continue();
        });
        let savedConfiguration = null, rejectSave = false;
        await context.route("**/api/admin/config", route => {
            if (route.request().method() === "PUT") {
                if (rejectSave) { return route.fulfill({status: 500, json: {message: "Controlled local save failure"}}); }
                savedConfiguration = route.request().postDataJSON();
                return route.fulfill({json: savedConfiguration});
            }
            return savedConfiguration ? route.fulfill({json: savedConfiguration}) : route.continue();
        });
        const page = await context.newPage();
        await page.goto(base + "/"); await page.locator(".card-room").waitFor();
        // Legacy Safari allows flex rows to shrink below their text's minimum
        // size. Model that sizing behavior explicitly, not physical iOS proof.
        await page.addStyleTag({content: ".room-content > div { min-height: 0; }"});
        evidence.layout = await page.evaluate(() => {
            const card = document.querySelector(".card-room");
            const labels = [...card.querySelectorAll(".room-primary span")].map(e => e.getBoundingClientRect().bottom);
            const status = card.querySelector(".room-status-line .room-status").getBoundingClientRect();
            const icon = card.querySelector(".room-icon").getBoundingClientRect();
            const primary = card.querySelector(".room-primary strong").getBoundingClientRect();
            return {rowsOverlap: Math.max(...labels) > status.top + 1 || icon.bottom > primary.top + 1};
        });
        if (!baseline) assert.equal(evidence.layout.rowsOverlap, false, "Room rows overlap under legacy flex sizing");
        evidence.room = await page.evaluate(() => {
            const card = document.querySelector(".card-room"), content = card.querySelector(".room-content");
            content.scrollTop = 40;
            Dashboard.render(JSON.parse(JSON.stringify(Dashboard.states)));
            return {sameCard: card === document.querySelector(".card-room"), sameContent: content === document.querySelector(".room-content")};
        });
        if (!baseline) assert.deepEqual(evidence.room, {sameCard: true, sameContent: true});
        if (!baseline) {
            evidence.controlRecovery = await page.evaluate(() => {
                const button = document.querySelector(".room-light-control");
                button.disabled = true; button.className += " is-busy";
                Dashboard.render(JSON.parse(JSON.stringify(Dashboard.states)));
                return {sameButton: button === document.querySelector(".room-light-control"),
                    enabled: !button.disabled, busyCleared: !button.classList.contains("is-busy")};
            });
            assert.deepEqual(evidence.controlRecovery, {sameButton: true, enabled: true, busyCleared: true});
            const roomRefresh = await page.evaluate(() => {
                const card = document.querySelector(".card-room"), content = card.querySelector(".room-content");
                const background = card.querySelector(".room-background-image");
                const temperature = Dashboard.widgets.find(w => w.type === "room").room.entities.temperature;
                content.scrollTop = 40;
                const scroll = content.scrollTop;
                const data = JSON.parse(JSON.stringify(Dashboard.states)); data[temperature].state = "23.4";
                Dashboard.render(data);
                return {sameCard: card === document.querySelector(".card-room"), sameBackground: background === card.querySelector(".room-background-image"),
                    sameContent: content === card.querySelector(".room-content"), scrollRetained: content.scrollTop === scroll,
                    valueUpdated: card.querySelector(".room-temperature strong").textContent.includes("23.4")};
            });
            assert.deepEqual(roomRefresh, {sameCard: true, sameBackground: true, sameContent: true, scrollRetained: true, valueUpdated: true});
            evidence.changedRoom = roomRefresh;
            let powerCalls = 0;
            await context.route("**/api/climate/power", route => {
                powerCalls++;
                assert.deepEqual(Object.keys(route.request().postDataJSON()).sort(), ["entity", "state"]);
                return route.fulfill({status: 500, json: {error: "Controlled local service failure"}});
            });
            await page.locator(".room-climate-power-control").click();
            await page.waitForFunction(() => {
                const b = document.querySelector(".room-climate-power-control");
                return b && !b.disabled && !b.classList.contains("is-busy");
            }, null, {timeout: 10000});
            assert.equal(powerCalls, 1); evidence.powerFailureRecovery = true;
            assert.equal(await page.locator(".card-room").evaluate(card => card.classList.contains("is-expanded")), true);
            await page.locator(".room-expand-control").click();
            await page.evaluate(() => Dashboard.render(JSON.parse(JSON.stringify(Dashboard.states))));
            assert.equal(await page.locator(".room-expand-control").getAttribute("aria-expanded"), "false");
            await page.locator(".room-expand-control").click();
            await page.evaluate(() => Dashboard.render(JSON.parse(JSON.stringify(Dashboard.states))));
            assert.equal(await page.locator(".room-expand-control").getAttribute("aria-expanded"), "true");
            evidence.expansionRetained = true;
            evidence.deniedControl = await page.evaluate(() => {
                const room = Dashboard.widgets.find(w => w.type === "room"), id = room.room.entities.lights[0];
                const data = JSON.parse(JSON.stringify(Dashboard.states));
                data[id].gateway_capabilities = {can_light_power_on: false, can_light_power_off: false};
                Dashboard.render(data);
                return document.querySelector(".room-light-control").disabled;
            });
            assert.equal(evidence.deniedControl, true);
            if (process.env.HOTFIX_SCREENSHOT_DIR) {
                fs.mkdirSync(process.env.HOTFIX_SCREENSHOT_DIR, {recursive: true});
                await page.locator(".room-content").evaluate(e => { e.scrollTop = 0; });
                await page.screenshot({path: path.join(process.env.HOTFIX_SCREENSHOT_DIR, "room-card-rc9.png")});
            }
        }
        // Cross-origin embedding can suppress native confirm without showing a dialog.
        const embed = await context.newPage();
        await embed.setViewportSize({width: 1440, height: 1100});
        await embed.goto(base + "/admin/");
        await embed.setContent('<iframe width="1400" height="1000" sandbox="allow-scripts allow-same-origin allow-forms" src="' + base + '/admin/"></iframe>');
        const frame = embed.frames().find(frame => frame.parentFrame());
        await frame.waitForSelector("[data-action=dashboard-delete]");
        await frame.locator('[data-action="dashboard-duplicate"]').click();
        await frame.locator("#dashboardTitleInput").fill("Löschtest");
        await frame.locator("#dashboardIdInput").fill("delete-test");
        await frame.locator('#dashboardForm button[type="submit"]').click();
        await frame.locator("#saveButton").click();
        await frame.waitForFunction(() => !HALegacyAdmin.State.isDirty());
        const ids = await frame.evaluate(() => HALegacyAdmin.State.getDraft().dashboards.map(d => d.id));
        const removable = await frame.evaluate(() => { const c = HALegacyAdmin.State.getDraft(); return c.dashboards.find(d => d.id !== c.defaultDashboardId).id; });
        // Duplicate is already selected by the real editor.
        await frame.locator("#dashboardEditorTitle").fill("Löschtest");
        await frame.locator('[data-action="dashboard-delete"]').click();
        if (!baseline) {
            await frame.locator("#dashboardDeleteDialog").waitFor({state: "visible"});
            if (process.env.HOTFIX_SCREENSHOT_DIR) {
                await frame.locator("#dashboardDeleteDialog").screenshot({path: path.join(process.env.HOTFIX_SCREENSHOT_DIR, "dashboard-delete-rc9.png")});
            }
            // Opening/cancelling never removes data.
            assert.deepEqual(await frame.evaluate(() => HALegacyAdmin.State.getDraft().dashboards.map(d => d.id)), ids);
            await frame.locator('[data-close-dialog="dashboardDeleteDialog"]').first().click();
            assert.deepEqual(await frame.evaluate(() => HALegacyAdmin.State.getDraft().dashboards.map(d => d.id)), ids);
            await frame.locator('[data-action="dashboard-delete"]').click();
            await frame.locator("#dashboardDeleteConfirm").click();
        }
        evidence.delete = await frame.evaluate(id => ({removed: !HALegacyAdmin.State.getDraft().dashboards.some(d => d.id === id), dirty: HALegacyAdmin.State.isDirty()}), removable);
        if (!baseline) assert.deepEqual(evidence.delete, {removed: true, dirty: true});
        if (!baseline) {
            // Discard restores the saved copy; deleting is never a hidden HA write.
            await frame.locator("#discardButton").click();
            assert.deepEqual(await frame.evaluate(() => HALegacyAdmin.State.getDraft().dashboards.map(d => d.id)), ids);
            await frame.locator('[data-dashboard-id="' + removable + '"]').click();
            await frame.locator('[data-action="dashboard-delete"]').click(); await frame.locator("#dashboardDeleteConfirm").click();
            rejectSave = true; await frame.locator("#saveButton").click();
            await frame.locator("#globalNotice").filter({hasText: /Fehler|Speichern|speichern/i}).waitFor();
            assert.equal(await frame.evaluate(() => HALegacyAdmin.State.isDirty()), true);
            assert.equal(savedConfiguration.dashboards.some(d => d.id === removable), true);
            rejectSave = false; await frame.locator("#saveButton").click(); await frame.waitForFunction(() => !HALegacyAdmin.State.isDirty());
            await frame.goto(base + "/admin/"); await frame.waitForSelector("[data-action=dashboard-delete]");
            assert.equal(await frame.evaluate(id => HALegacyAdmin.State.getDraft().dashboards.some(d => d.id === id), removable), false);
            await frame.locator('[data-action="dashboard-delete"]').click();
            await frame.locator("#globalNotice").filter({hasText: "anderes Standard-Dashboard"}).waitFor();
            assert.equal(await frame.locator("#dashboardDeleteDialog").isVisible(), false);
            evidence.saveDiscardReloadAndDefaultProtection = true;
        }
        if (baseline) {
            assert.equal(evidence.layout.rowsOverlap, true);
            assert.equal(evidence.room.sameCard, false);
            assert.equal(evidence.delete.removed, false);
        }
        console.log(JSON.stringify({baseline, evidence}, null, 2));
    } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
