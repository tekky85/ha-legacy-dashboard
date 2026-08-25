"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PRIVATE_FILE_PATTERN =
    /(^|\/)(\.env|id_rsa|id_ed25519|[^/]+\.(?:pem|key|p12|pfx))$/i;
const SECRET_PATTERNS = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bghp_[A-Za-z0-9]{20,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /Authorization:\s*Bearer\s+eyJ[A-Za-z0-9._-]+/i
];


function trackedFiles(root) {
    return childProcess.execFileSync(
        "git",
        [
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard",
            "-z"
        ],
        {cwd: root}
    ).toString("utf8").split("\0").filter(Boolean);
}


function scan(root) {
    const findings = [];
    trackedFiles(root).forEach(function (fileName) {
        if (PRIVATE_FILE_PATTERN.test(fileName)) {
            findings.push("private file tracked: " + fileName);
            return;
        }

        const absolutePath = path.join(root, fileName);
        if (!fs.existsSync(absolutePath)) {
            return;
        }
        const content = fs.readFileSync(absolutePath);
        if (content.indexOf(0) !== -1) {
            return;
        }
        const text = content.toString("utf8");
        SECRET_PATTERNS.forEach(function (pattern) {
            if (pattern.test(text)) {
                findings.push(
                    "secret-like content in tracked file: " + fileName
                );
            }
        });
    });
    return findings;
}


if (require.main === module) {
    try {
        const findings = scan(ROOT);
        if (findings.length > 0) {
            findings.forEach(function (finding) {
                process.stderr.write(finding + "\n");
            });
            process.exitCode = 1;
        } else {
            process.stdout.write(
                "Secret scan passed for tracked release sources.\n"
            );
        }
    } catch (error) {
        process.stderr.write(error.message + "\n");
        process.exitCode = 1;
    }
}


module.exports = {
    scan: scan
};
