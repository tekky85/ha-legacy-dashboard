"use strict";
// Requires test-only Playwright, never a runtime dependency. See coordinator guide.
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const {chromium} = require("playwright");
const Site = require("../scripts/testing/build-site");
const Model = require("../testing/js/report");
const catalog = require("../testing/data/test-catalog.json");
const ROOT = path.resolve(__dirname, "..");
const KEY = "ha-legacy-community-runs-v1";
const types = {".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".md": "text/plain; charset=utf-8"};
async function main() {
    const output = path.join(ROOT, "dist/community-browser-" + process.pid);
    Site.build(output);
    const server = http.createServer((request, response) => {
        let route;
        try { route = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/ha-legacy-dashboard/, ""); } catch (_) { response.writeHead(400).end(); return; }
        if (route.endsWith("/")) route += "index.html";
        const file = path.resolve(output, "." + route);
        if (!file.startsWith(output + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
        response.writeHead(200, {"Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store"}); response.end(fs.readFileSync(file));
    });
    let browser;
    const checks = [], errors = [], outside = [];
    try {
        await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
        const base = "http://127.0.0.1:" + server.address().port;
        browser = await chromium.launch({headless: true});
        const context = await browser.newContext({viewport: {width: 1280, height: 900}, acceptDownloads: true});
        await context.route("**/*", route => { if (!route.request().url().startsWith(base + "/")) { outside.push(route.request().url()); return route.abort(); } return route.continue(); });
        const page = await context.newPage(); page.on("pageerror", error => errors.push(error.message));
        await page.goto(base + "/ha-legacy-dashboard/testing/"); await page.locator("#message").filter({hasText: /^Bereit/}).waitFor();
        assert.match(await page.locator("#catalog-info").textContent(), /72 Tests/); checks.push("Project subpath assets/catalog");
        const create = async alias => {
            for (const [key, value] of Object.entries({testerId: alias, dashboardVersion: "1.0.0-rc.7", device: "Demo Tablet", os: "Demo OS", browser: "Demo Browser"})) await page.locator('#run-form [name="' + key + '"]').fill(value);
            await page.locator("#save-run").click(); await page.locator("#active-run").filter({hasText: "RUN-"}).waitFor();
        };
        await create("Demo-A");
        await page.locator("#search").fill("MT-50"); assert.equal(await page.locator("#test-list li").count(), 1);
        await page.locator('[data-test-id="MT-50"]').click();
        assert.equal(await page.locator("#test-content ol li").count(), 8); checks.push("Search, HA-App filter, complete numbered detail");
        const resultField = key => page.locator('#result-form [name="' + key + '"]');
        await resultField("status").selectOption("FAIL"); await page.locator("#save-result").click();
        assert.match(await page.locator("#message").textContent(), /FAIL requires/);
        await resultField("expected").fill("Expected start"); await resultField("actual").fill('<img src=x onerror="window.injected=true">'); await resultField("reproductionSteps").fill("Open demo"); await page.locator("#save-result").click();
        await page.locator("#filter-status").selectOption("FAIL"); assert.equal(await page.locator("#test-list li").count(), 1);
        assert.match(await page.locator("#counts").textContent(), /FAIL 1/); checks.push("FAIL requirements, status filter/counts, untrusted text");
        const firstId = await page.evaluate(key => JSON.parse(localStorage.getItem(key))[0].testRunId, KEY);
        await page.reload(); await page.locator("#message").filter({hasText: /^Bereit/}).waitFor();
        await page.locator("#runs").selectOption(firstId); await page.locator("#resume").click();
        await page.locator("#search").fill("MT-50"); await page.locator('[data-test-id="MT-50"]').click();
        assert.match(await resultField("actual").inputValue(), /<img/); assert.equal(await page.evaluate(() => Boolean(window.injected)), false);
        await resultField("status").selectOption("BLOCKED"); await resultField("notes").fill(""); await page.locator("#save-result").click(); assert.match(await page.locator("#message").textContent(), /explanation required/);
        await resultField("notes").fill("Missing device"); await page.locator("#save-result").click();
        await resultField("status").selectOption("N/A"); await page.locator("#save-result").click(); assert.match(await page.locator("#counts").textContent(), /N\/A 1/);
        await resultField("status").selectOption("PASS"); await page.locator("#save-result").click();
        await resultField("status").selectOption("NOT_TESTED"); await page.locator("#save-result").click();
        checks.push("Reload/resume and all five result transitions");
        page.once("dialog", dialog => dialog.accept()); await page.locator("#new-run").click(); await create("Demo-B");
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, KEY), 2); checks.push("Independent new run preserves previous run");
        const downloadPromise = page.waitForEvent("download"); await page.locator("#export").click();
        const download = await downloadPromise, downloadPath = await download.path();
        const downloaded = Model.parse(fs.readFileSync(downloadPath, "utf8"), catalog).report;
        await page.locator("#import-file").setInputFiles({name: "report.json", mimeType: "application/json", buffer: fs.readFileSync(downloadPath)});
        await page.locator("#import-preview").waitFor({state: "visible"}); await page.locator("#confirm-import").click();
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, KEY), 2); checks.push("JSON download/import round trip without run mixing");
        const altered = JSON.parse(JSON.stringify(downloaded)); altered.notes = "Conflicting observation";
        await page.locator("#import-file").setInputFiles({name: "conflict.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(altered))});
        await page.locator("#import-summary").filter({hasText: "KONFLIKT"}).waitFor();
        assert.equal(await page.locator("#confirm-import").isDisabled(), true); await page.locator("#cancel-import").click(); checks.push("Same-ID conflict cannot overwrite");
        altered.testRunId = "RUN-synthetic-mismatch"; altered.catalogHash = "0".repeat(64);
        await page.locator("#import-file").setInputFiles({name: "mismatch.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(altered))});
        await page.locator("#import-summary").filter({hasText: "Catalog mismatch"}).waitFor();
        await page.locator("#confirm-import").click(); assert.match(await page.locator("#message").textContent(), /ausdrücklich bestätigen/);
        await page.locator("#accept-mismatch").check(); await page.locator("#confirm-import").click();
        assert.equal(await page.locator("#save-run").isDisabled(), true); checks.push("Catalog mismatch preview/acknowledgement/read-only import");
        await page.locator("#import-file").setInputFiles({name: "bad.json", mimeType: "application/json", buffer: Buffer.from('{"__proto__":{"x":1}}')});
        await page.locator("#message").filter({hasText: "Unsafe"}).waitFor();
        checks.push("Malicious import rejected");
        await page.locator("#make-summary").click(); assert.match(await page.locator("#message").textContent(), /Datenschutz/);
        await page.locator("#redaction").check(); await page.locator("#make-summary").click(); assert.match(await page.locator("#issue-summary").inputValue(), /Manual Test Run/);
        const issue = await page.locator("#issue-link").getAttribute("href"); assert.match(issue, /template=manual_test_run.yml$/); checks.push("Privacy guard and normal Issue-form link, no report in URL");
        page.once("dialog", dialog => dialog.dismiss()); await page.locator("#clear").click();
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, KEY), 3);
        page.once("dialog", dialog => dialog.accept()); await page.locator("#clear").click();
        assert.equal(await page.evaluate(key => localStorage.getItem(key), KEY), null);
        assert.equal(await page.locator("#issue-summary").inputValue(), ""); assert.equal(await page.locator("#redaction").isChecked(), false);
        checks.push("Clear cancel/confirm and removal, including stale sharing text");
        for (const width of [390, 768, 1280]) {
            await page.setViewportSize({width, height: 900});
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, "overflow at " + width);
        }
        await page.keyboard.press("Tab"); assert.ok(await page.evaluate(() => document.activeElement !== document.body)); checks.push("Phone/tablet/desktop overflow and keyboard focus");
        const blockedContext = await browser.newContext();
        await blockedContext.addInitScript(() => { Storage.prototype.setItem = function () { throw new Error("quota"); }; });
        const blockedPage = await blockedContext.newPage(); await blockedPage.goto(base + "/testing/");
        await blockedPage.locator("#message").filter({hasText: /^Bereit/}).waitFor();
        for (const [key, value] of Object.entries({testerId: "Demo-Private", dashboardVersion: "1.0.0-rc.7", device: "Demo", os: "Demo", browser: "Demo"})) await blockedPage.locator('#run-form [name="' + key + '"]').fill(value);
        await blockedPage.locator("#save-run").click(); assert.match(await blockedPage.locator("#storage-message").textContent(), /voll/);
        assert.equal(await blockedPage.locator("#export").isEnabled(), true); checks.push("Storage quota failure keeps export available; root path works");
        if (process.env.PORTAL_SCREENSHOT_DIR) {
            const screenDir = path.resolve(process.env.PORTAL_SCREENSHOT_DIR); fs.mkdirSync(screenDir, {recursive: true});
            await page.setViewportSize({width: 1280, height: 900}); await page.screenshot({path: path.join(screenDir, "community-testing.png"), fullPage: true});
        }
        assert.deepEqual(errors, []); assert.deepEqual(outside, []); checks.push("No page exceptions or external requests");
        console.log(JSON.stringify({status: "PASS", browser: await browser.version(), checks: checks.length, evidence: checks}, null, 2));
    } finally {
        if (browser) await browser.close(); await new Promise(resolve => server.close(resolve));
        fs.rmSync(output, {recursive: true, force: true});
    }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
