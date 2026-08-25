"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const VersionCheck = require("./check-version");

const ROOT = path.join(__dirname, "..");
const INCLUDED_PATHS = [
    ".env.example",
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "README.de.md",
    "README.en.md",
    "deploy/systemd/ha-legacy-dashboard.service",
    "docs/DEPLOYMENT.md",
    "package-lock.json",
    "package.json",
    "src"
];


function writeString(buffer, offset, length, value) {
    const content = Buffer.from(String(value), "utf8");
    content.copy(buffer, offset, 0, Math.min(content.length, length));
}


function writeOctal(buffer, offset, length, value) {
    const content = Math.floor(value).toString(8)
        .padStart(length - 1, "0") + "\0";
    writeString(buffer, offset, length, content);
}


function splitTarPath(fileName) {
    if (Buffer.byteLength(fileName) <= 100) {
        return {name: fileName, prefix: ""};
    }

    const slash = fileName.lastIndexOf("/");
    const prefix = fileName.slice(0, slash);
    const name = fileName.slice(slash + 1);

    if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155) {
        throw new Error("Archive path is too long: " + fileName);
    }
    return {name: name, prefix: prefix};
}


function createHeader(fileName, size, mode, type, mtime) {
    const header = Buffer.alloc(512, 0);
    const tarPath = splitTarPath(fileName);

    writeString(header, 0, 100, tarPath.name);
    writeOctal(header, 100, 8, mode);
    writeOctal(header, 108, 8, 0);
    writeOctal(header, 116, 8, 0);
    writeOctal(header, 124, 12, size);
    writeOctal(header, 136, 12, mtime);
    header.fill(32, 148, 156);
    writeString(header, 156, 1, type);
    writeString(header, 257, 6, "ustar\0");
    writeString(header, 263, 2, "00");
    writeString(header, 265, 32, "root");
    writeString(header, 297, 32, "root");
    writeString(header, 345, 155, tarPath.prefix);

    let checksum = 0;
    for (let index = 0; index < header.length; index += 1) {
        checksum += header[index];
    }
    writeString(
        header,
        148,
        8,
        checksum.toString(8).padStart(6, "0") + "\0 "
    );
    return header;
}


function collectPath(relativePath, entries) {
    const absolutePath = path.join(ROOT, relativePath);
    const status = fs.statSync(absolutePath);

    if (status.isDirectory()) {
        entries.push({
            path: relativePath.replace(/\/$/, "") + "/",
            directory: true,
            content: Buffer.alloc(0)
        });
        fs.readdirSync(absolutePath).sort().forEach(function (name) {
            collectPath(path.join(relativePath, name), entries);
        });
        return;
    }

    if (!status.isFile()) {
        throw new Error("Unsupported bundle entry: " + relativePath);
    }
    entries.push({
        path: relativePath,
        directory: false,
        content: fs.readFileSync(absolutePath)
    });
}


function buildTar(version) {
    const prefix = "ha-legacy-dashboard-" + version;
    const sourceDateEpoch = Number(process.env.SOURCE_DATE_EPOCH || 0);
    const mtime = Number.isFinite(sourceDateEpoch) && sourceDateEpoch >= 0
        ? Math.floor(sourceDateEpoch)
        : 0;
    const entries = [];

    INCLUDED_PATHS.forEach(function (relativePath) {
        collectPath(relativePath, entries);
    });
    entries.push({
        path: "VERSION",
        directory: false,
        content: Buffer.from(version + "\n", "utf8")
    });
    entries.sort(function (left, right) {
        if (left.path < right.path) {
            return -1;
        }
        if (left.path > right.path) {
            return 1;
        }
        return 0;
    });

    const blocks = [];
    entries.forEach(function (entry) {
        const archivePath = prefix + "/" +
            entry.path.split(path.sep).join("/");
        const mode = entry.directory ? 0o755 : 0o644;
        blocks.push(createHeader(
            archivePath,
            entry.content.length,
            mode,
            entry.directory ? "5" : "0",
            mtime
        ));
        if (!entry.directory) {
            blocks.push(entry.content);
            const remainder = entry.content.length % 512;
            if (remainder !== 0) {
                blocks.push(Buffer.alloc(512 - remainder, 0));
            }
        }
    });
    blocks.push(Buffer.alloc(1024, 0));
    return Buffer.concat(blocks);
}


function createBundle(outputDirectory) {
    const release = VersionCheck.validate(ROOT, null);
    const targetDirectory = path.resolve(outputDirectory || "dist");
    const archivePath = path.join(
        targetDirectory,
        release.standaloneArtifact
    );
    const checksumPath = path.join(targetDirectory, "SHA256SUMS");
    const tar = buildTar(release.version);
    const archive = zlib.gzipSync(tar, {
        level: 9,
        mtime: 0
    });
    const digest = crypto.createHash("sha256")
        .update(archive)
        .digest("hex");

    fs.mkdirSync(targetDirectory, {recursive: true});
    fs.writeFileSync(archivePath, archive, {mode: 0o644});
    fs.writeFileSync(
        checksumPath,
        digest + "  " + release.standaloneArtifact + "\n",
        {mode: 0o644}
    );

    return {
        archivePath: archivePath,
        checksumPath: checksumPath,
        digest: digest
    };
}


if (require.main === module) {
    try {
        const result = createBundle(process.argv[2]);
        process.stdout.write(result.archivePath + "\n");
        process.stdout.write(result.checksumPath + "\n");
    } catch (error) {
        process.stderr.write(error.message + "\n");
        process.exitCode = 1;
    }
}


module.exports = {
    INCLUDED_PATHS: INCLUDED_PATHS.slice(0),
    createBundle: createBundle
};
