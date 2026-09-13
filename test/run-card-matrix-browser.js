"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const EXPECTED_CASES = 1576;
const BROWSER_CANDIDATES = [
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_SHIM,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
].filter(Boolean);


function browserPath() {
    let index;

    for (index = 0; index < BROWSER_CANDIDATES.length; index += 1) {
        if (fs.existsSync(BROWSER_CANDIDATES[index])) {
            return BROWSER_CANDIDATES[index];
        }
    }
    return "";
}


function contentType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const types = {
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg"
    };

    return types[extension] || "application/octet-stream";
}


function staticServer() {
    return http.createServer(function (request, response) {
        let pathname;
        let fileName;

        try {
            pathname = decodeURIComponent(
                String(request.url || "/").split("?")[0]
            );
        } catch (error) {
            response.writeHead(400);
            response.end("Bad request");
            return;
        }

        fileName = path.resolve(ROOT, "." + pathname);
        if (
            request.method !== "GET" ||
            (fileName !== ROOT && fileName.indexOf(ROOT + path.sep) !== 0)
        ) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }

        fs.readFile(fileName, function (error, data) {
            if (error) {
                response.writeHead(404);
                response.end("Not found");
                return;
            }
            response.writeHead(200, {
                "Cache-Control": "no-store",
                "Content-Type": contentType(fileName),
                "X-Content-Type-Options": "nosniff"
            });
            response.end(data);
        });
    });
}


function runBrowser(executable, url, profileDirectory) {
    return new Promise(function (resolve, reject) {
        const argumentsList = [
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-background-networking",
            "--disable-component-update",
            "--disable-default-apps",
            "--disable-extensions",
            "--no-first-run",
            "--user-data-dir=" + profileDirectory,
            "--virtual-time-budget=30000",
            "--dump-dom",
            url
        ];
        const browser = childProcess.spawn(executable, argumentsList, {
            stdio: ["ignore", "pipe", "pipe"]
        });
        let output = "";
        let errors = "";
        let settled = false;
        const timeout = setTimeout(function () {
            if (!settled) {
                settled = true;
                browser.kill("SIGKILL");
                reject(new Error("Browser-Matrix nach 120 Sekunden abgebrochen"));
            }
        }, 120000);

        browser.stdout.on("data", function (chunk) {
            output += chunk.toString("utf8");
        });
        browser.stderr.on("data", function (chunk) {
            errors += chunk.toString("utf8");
        });
        browser.on("error", function (error) {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                reject(error);
            }
        });
        browser.on("close", function (code) {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            if (code !== 0) {
                reject(new Error(
                    "Headless-Browser endete mit " + code + ": " +
                    errors.slice(-2000)
                ));
                return;
            }
            resolve(output);
        });
    });
}


function attribute(documentText, name) {
    const match = new RegExp(name + '="([^"]*)"').exec(documentText);
    return match ? match[1] : "";
}


async function main() {
    const executable = browserPath();
    let server;
    let profileDirectory;
    let address;
    let documentText;
    let status;
    let cases;
    let failures;
    let diagnostics;
    let failureSummary;

    if (!executable) {
        throw new Error(
            "Kein Chromium-basierter Browser gefunden; CHROME_BIN setzen"
        );
    }

    server = staticServer();
    profileDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "ha-legacy-card-matrix-")
    );

    try {
        await new Promise(function (resolve, reject) {
            server.once("error", reject);
            server.listen(0, "127.0.0.1", resolve);
        });
        address = server.address();
        documentText = await runBrowser(
            executable,
            "http://127.0.0.1:" + address.port +
                "/test/card-matrix-harness.html",
            profileDirectory
        );
        status = attribute(documentText, "data-matrix-status");
        cases = Number(attribute(documentText, "data-matrix-cases"));
        failures = Number(attribute(documentText, "data-matrix-failures"));
        diagnostics = decodeURIComponent(
            attribute(documentText, "data-matrix-diagnostics") || "%5B%5D"
        );
        failureSummary = decodeURIComponent(
            attribute(documentText, "data-matrix-failure-summary") || "%7B%7D"
        );

        if (
            status !== "passed" ||
            cases !== EXPECTED_CASES ||
            failures !== 0
        ) {
            throw new Error(
                "Browser-Matrix fehlgeschlagen: status=" + status +
                ", cases=" + cases + ", failures=" + failures +
                ", summary=" + failureSummary +
                ", examples=" + diagnostics
            );
        }
        process.stdout.write(
            "Card matrix browser gate passed: " + cases +
            " cases, 0 failures.\n"
        );
    } finally {
        await new Promise(function (resolve) {
            server.close(resolve);
        });
        fs.rmSync(profileDirectory, {recursive: true, force: true});
    }
}


main().catch(function (error) {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
});
