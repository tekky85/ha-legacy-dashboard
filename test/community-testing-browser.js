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
const guides = require("../testing/data/test-guides.de.json");
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
        assert.equal(await page.locator("#test-list li").count(), 12);
        for (const guide of guides.guides) {
            await page.locator('[data-test-id="' + guide.testId + '"]').click();
            assert.equal(await page.locator("#test-content ol li").count(), guide.steps.length);
            assert.match(await page.locator("#test-content").textContent(), /Das brauchst du – und wer hilft/);
            assert.ok((await page.locator("#test-content pre").textContent()).includes(catalog.tests.find(test => test.id === guide.testId).failureCriteria));
        }
        await page.locator("#filter-extra").evaluate(node => { node.open = true; });
        await page.locator("#deployment").selectOption(""); await page.locator("#help-scope").selectOption("all");
        assert.equal(await page.locator("#test-list li").count(), 72);
        await page.locator("#help-scope").selectOption("prepared"); assert.equal(await page.locator("#test-list li").count(), 60);
        await page.locator("#help-scope").selectOption("community"); await page.locator("#deployment").selectOption("ha-app");
        checks.push("Twelve fully explained checks, all 72 originals retained, sixty technical checks explicitly assisted");
        const helpPage = await context.newPage(); await helpPage.goto(base + "/ha-legacy-dashboard/testing/help.html");
        assert.match(await helpPage.locator("main").textContent(), /Die Plus-Taste ist grau/);
        for (const width of [390, 768, 1280]) {
            await helpPage.setViewportSize({width, height: 900});
            assert.equal(await helpPage.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        }
        await helpPage.close(); checks.push("German worked example loads at project subpath and fits phone/tablet/desktop");
        const create = async alias => {
            for (const [key, value] of Object.entries({testerId: alias, dashboardVersion: "1.0.0-rc.7", device: "Demo Tablet", os: "Demo OS", browser: "Demo Browser"})) await page.locator('#run-form [name="' + key + '"]').fill(value);
            await page.locator("#run-extra").evaluate(node => { node.open = true; });
            await page.locator('#run-form [name="dataKind"]').selectOption("synthetic");
            await page.locator("#save-run").click(); await page.locator("#active-run").filter({hasText: "RUN-"}).waitFor();
        };
        await create("Demo-A");
        await page.locator("#pilot-only").check(); assert.equal(await page.locator("#test-list li").count(), 11);
        await page.locator("#search").fill("MT-50"); assert.equal(await page.locator("#test-list li").count(), 1);
        await page.locator("#pilot-only").uncheck(); checks.push("Pilot selection uses eleven canonical tests and composes with search");
        await page.locator("#search").fill("MT-50"); assert.equal(await page.locator("#test-list li").count(), 1);
        await page.locator('[data-test-id="MT-50"]').click();
        assert.equal(await page.locator("#test-content ol li").count(), 8); checks.push("Search, HA-App filter, complete numbered detail");
        const resultField = key => page.locator('#result-form [name="' + key + '"]');
        await resultField("status").selectOption("FAIL"); await page.locator("#save-result").click();
        assert.match(await page.locator("#message").textContent(), /alle drei Punkte/);
        assert.equal(await resultField("actual").isVisible(), true); assert.equal(await page.locator("#complete-confirm").isVisible(), false);
        await resultField("expected").fill("Expected start"); await resultField("actual").fill('<img src=x onerror="window.injected=true"> ÄÖÜ äöü °C'); await resultField("reproductionSteps").fill("Open demo"); await page.locator("#save-result").click();
        await page.locator("#filter-status").selectOption("FAIL"); assert.equal(await page.locator("#test-list li").count(), 1);
        assert.match(await page.locator("#counts").textContent(), /Etwas stimmt nicht: 1/); checks.push("FAIL requirements, status filter/counts, untrusted text");
        const firstId = await page.evaluate(key => JSON.parse(localStorage.getItem(key))[0].testRunId, KEY);
        await page.reload(); await page.locator("#message").filter({hasText: /^Bereit/}).waitFor();
        await page.locator("#resume-tools").evaluate(node => { node.open = true; });
        await page.locator("#runs").selectOption(firstId); await page.locator("#resume").click();
        await page.locator("#search").fill("MT-50"); await page.locator('[data-test-id="MT-50"]').click();
        assert.match(await resultField("actual").inputValue(), /<img/); assert.equal(await page.evaluate(() => Boolean(window.injected)), false);
        assert.match(await resultField("actual").inputValue(), /ÄÖÜ äöü °C/);
        await page.locator("#run-extra").evaluate(node => { node.open = true; });
        await page.locator('#run-form [name="dataKind"]').selectOption("manual"); await page.locator("#save-run").click();
        assert.match(await page.locator("#message").textContent(), /Berichtsart benötigt einen neuen Lauf/);
        await page.locator('#run-form [name="dataKind"]').selectOption("synthetic");
        checks.push("Unicode survives reload; observed synthetic run cannot become manual");
        await resultField("status").selectOption("BLOCKED"); await resultField("notes").fill(""); await page.locator("#save-result").click(); assert.match(await page.locator("#message").textContent(), /was fehlt/);
        assert.equal(await resultField("actual").isVisible(), false); assert.match(await page.locator("#notes-label").textContent(), /Warum/);
        await resultField("notes").fill("Missing device"); await page.locator("#save-result").click();
        await resultField("status").selectOption("N/A"); await page.locator("#save-result").click(); assert.match(await page.locator("#counts").textContent(), /Passt nicht zu meinem System: 1/);
        await resultField("status").selectOption("PASS"); await page.locator("#save-result").click();
        assert.match(await page.locator("#message").textContent(), /Teilerfolg/);
        await page.locator("#complete-check").check(); await page.locator("#save-result").click();
        await resultField("status").selectOption("NOT_TESTED"); await page.locator("#save-result").click();
        checks.push("Reload/resume and all five result transitions");
        page.once("dialog", dialog => dialog.accept()); await page.locator("#new-run").click(); await create("Demo-B");
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, KEY), 2); checks.push("Independent new run preserves previous run");
        const downloadPromise = page.waitForEvent("download"); await page.locator("#export").click();
        const download = await downloadPromise, downloadPath = await download.path();
        const downloaded = Model.parse(fs.readFileSync(downloadPath, "utf8"), catalog).report;
        assert.ok(downloaded.exportedAt); assert.equal(downloaded.testCenterVersion, Model.TEST_CENTER_VERSION); assert.equal(downloaded.dataKind, "synthetic");
        await page.locator("#import-file").setInputFiles({name: "report.json", mimeType: "application/json", buffer: fs.readFileSync(downloadPath)});
        await page.locator("#import-preview").waitFor({state: "visible"}); await page.locator("#confirm-import").click();
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, KEY), 2); checks.push("JSON download/import round trip without run mixing");
        const independent = await browser.newContext();
        await independent.route("**/*", route => { if (!route.request().url().startsWith(base + "/")) { outside.push(route.request().url()); return route.abort(); } return route.continue(); });
        const independentPage = await independent.newPage(); independentPage.on("pageerror", error => errors.push(error.message));
        await independentPage.goto(base + "/testing/"); await independentPage.locator("#message").filter({hasText: /^Bereit/}).waitFor();
        assert.equal(await independentPage.evaluate(key => localStorage.getItem(key), KEY), null);
        await independentPage.locator("#import-file").setInputFiles({name: "report.json", mimeType: "application/json", buffer: fs.readFileSync(downloadPath)});
        await independentPage.locator("#import-preview").waitFor({state: "visible"}); await independentPage.locator("#confirm-import").click();
        await independentPage.locator("#search").fill("MT-50"); await independentPage.locator('[data-test-id="MT-50"]').click();
        await independentPage.locator('#result-form [name="status"]').selectOption("PASS"); await independentPage.locator("#save-result").click();
        await independentPage.locator("#complete-check").check(); await independentPage.locator("#save-result").click();
        assert.equal(await independentPage.evaluate(key => JSON.parse(localStorage.getItem(key))[0].results.find(item => item.testId === "MT-50").status, KEY), "PASS");
        assert.equal(await independentPage.evaluate(key => Object.hasOwn(JSON.parse(localStorage.getItem(key))[0], "exportedAt"), KEY), false);
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key))[1].results.find(item => item.testId === "MT-50").status, KEY), "NOT_TESTED");
        await independent.close(); checks.push("Separate browser stores; imported exported report can be edited without stale timestamp");
        const altered = JSON.parse(JSON.stringify(downloaded)); altered.notes = "Conflicting observation";
        await page.locator("#import-file").setInputFiles({name: "conflict.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(altered))});
        await page.locator("#import-summary").filter({hasText: "KONFLIKT"}).waitFor();
        assert.equal(await page.locator("#confirm-import").isDisabled(), true); await page.locator("#cancel-import").click(); checks.push("Same-ID conflict cannot overwrite");
        altered.testRunId = "RUN-synthetic-mismatch"; altered.catalogHash = "0".repeat(64);
        await page.locator("#import-file").setInputFiles({name: "mismatch.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(altered))});
        await page.locator("#import-summary").filter({hasText: "anderen Fassung"}).waitFor();
        await page.locator("#confirm-import").click(); assert.match(await page.locator("#message").textContent(), /ausdrücklich bestätigen/);
        await page.locator("#accept-mismatch").check(); await page.locator("#confirm-import").click();
        assert.equal(await page.locator("#save-run").isDisabled(), true); checks.push("Catalog mismatch preview/acknowledgement/read-only import");
        await page.locator("#import-file").setInputFiles({name: "bad.json", mimeType: "application/json", buffer: Buffer.from('{"__proto__":{"x":1}}')});
        await page.locator("#message").filter({hasText: "nicht erlaubte Angaben"}).waitFor();
        checks.push("Malicious import rejected");
        await page.locator("#make-summary").click(); assert.match(await page.locator("#message").textContent(), /Datenschutz/);
        await page.locator("#redaction").check(); await page.locator("#make-summary").click(); assert.match(await page.locator("#issue-summary").inputValue(), /Testbericht/);
        const issue = await page.locator("#issue-link").getAttribute("href"); assert.match(issue, /template=manual_test_run.yml$/); checks.push("Privacy guard and normal Issue-form link, no report in URL");
        await page.locator("#clear-tools").evaluate(node => { node.open = true; });
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
        const missingContext = await browser.newContext();
        const saved = Model.create(catalog, "Demo-existing", {deployment: "ha-app", dashboardVersion: "1.0.0-rc.8", device: "Demo", os: "Demo", browser: "Demo"}, "RUN-existing-preserved", "2026-10-26T10:00:00.000Z");
        await missingContext.addInitScript(({key, raw}) => localStorage.setItem(key, raw), {key: KEY, raw: JSON.stringify([saved])});
        await missingContext.route("**/data/test-guides.de.json*", route => route.fulfill({status: 503, body: "Unavailable"}));
        const missingPage = await missingContext.newPage(); await missingPage.goto(base + "/testing/");
        await missingPage.locator("#message").filter({hasText: "Erklärungen konnten nicht geladen"}).waitFor();
        assert.deepEqual(await missingPage.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY), [saved]);
        await missingContext.close(); checks.push("Unavailable explanation file gives German error and never overwrites existing reports");
        if (process.env.PORTAL_SCREENSHOT_DIR) {
            const screenDir = path.resolve(process.env.PORTAL_SCREENSHOT_DIR); fs.mkdirSync(screenDir, {recursive: true});
            await page.setViewportSize({width: 1280, height: 900}); await page.locator("#search").fill("MT-01"); await page.locator('[data-test-id="MT-01"]').click();
            await page.locator("#run-extra").evaluate(node => { node.open = false; }); await page.locator("#resume-tools").evaluate(node => { node.open = false; });
            await page.screenshot({path: path.join(screenDir, "community-testing.png"), fullPage: true});
            await page.setViewportSize({width: 390, height: 844}); await page.locator("#detail").screenshot({path: path.join(screenDir, "community-test-phone.png")});
        }
        assert.deepEqual(errors, []); assert.deepEqual(outside, []); checks.push("No page exceptions or external requests");
        console.log(JSON.stringify({status: "PASS", browser: await browser.version(), checks: checks.length, evidence: checks}, null, 2));
    } finally {
        if (browser) await browser.close(); await new Promise(resolve => server.close(resolve));
        fs.rmSync(output, {recursive: true, force: true});
    }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
