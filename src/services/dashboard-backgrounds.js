const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const Runtime = require("../config/runtime");


const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const MAX_PIXELS = 16777216;
const IMAGE_ID_PATTERN =
    /^bg-[a-f0-9]{32}\.(?:jpg|png)$/;


function backgroundError(code, message) {

    const error = new Error(message);

    error.code = code;
    return error;

}


function validateDimensions(width, height) {

    if (
        !Number.isInteger(width) ||
        !Number.isInteger(height) ||
        width < 1 ||
        height < 1 ||
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION ||
        width * height > MAX_PIXELS
    ) {
        throw backgroundError(
            "background_dimensions_invalid",
            "Bildabmessungen werden nicht unterstützt"
        );
    }

}


function inspectPng(buffer) {

    const signature = Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a
    ]);

    let offset = 8;
    let sawHeader = false;
    let sawEnd = false;
    let width = 0;
    let height = 0;


    if (
        buffer.length < 33 ||
        !buffer.subarray(0, 8).equals(signature)
    ) {
        throw backgroundError(
            "background_file_invalid",
            "PNG-Datei ist ungültig"
        );
    }


    while (offset + 12 <= buffer.length) {

        const length = buffer.readUInt32BE(offset);
        const type = buffer.toString(
            "ascii",
            offset + 4,
            offset + 8
        );

        const dataStart = offset + 8;
        const nextOffset = dataStart + length + 4;


        if (nextOffset > buffer.length) {
            throw backgroundError(
                "background_file_invalid",
                "PNG-Datei ist unvollständig"
            );
        }

        if (!sawHeader) {
            if (type !== "IHDR" || length !== 13) {
                throw backgroundError(
                    "background_file_invalid",
                    "PNG-Header ist ungültig"
                );
            }

            width = buffer.readUInt32BE(dataStart);
            height = buffer.readUInt32BE(dataStart + 4);
            validateDimensions(width, height);
            sawHeader = true;
        }

        offset = nextOffset;

        if (type === "IEND") {
            if (length !== 0 || offset !== buffer.length) {
                throw backgroundError(
                    "background_file_invalid",
                    "PNG-Ende ist ungültig"
                );
            }

            sawEnd = true;
            break;
        }

    }


    if (!sawHeader || !sawEnd) {
        throw backgroundError(
            "background_file_invalid",
            "PNG-Datei ist unvollständig"
        );
    }


    return {
        extension: "png",
        mimeType: "image/png",
        width: width,
        height: height
    };

}


function isJpegStartOfFrame(marker) {

    return [
        0xc0, 0xc1, 0xc2, 0xc3,
        0xc5, 0xc6, 0xc7,
        0xc9, 0xca, 0xcb,
        0xcd, 0xce, 0xcf
    ].indexOf(marker) !== -1;

}


function inspectJpeg(buffer) {

    let offset = 2;
    let width = 0;
    let height = 0;
    let sawFrame = false;
    let sawScan = false;
    let sawEnd = false;


    if (
        buffer.length < 8 ||
        buffer[0] !== 0xff ||
        buffer[1] !== 0xd8 ||
        buffer[buffer.length - 2] !== 0xff ||
        buffer[buffer.length - 1] !== 0xd9
    ) {
        throw backgroundError(
            "background_file_invalid",
            "JPEG-Datei ist ungültig"
        );
    }


    while (offset < buffer.length) {

        if (buffer[offset] !== 0xff) {
            throw backgroundError(
                "background_file_invalid",
                "JPEG-Marker fehlt"
            );
        }

        while (
            offset < buffer.length &&
            buffer[offset] === 0xff
        ) {
            offset += 1;
        }

        if (offset >= buffer.length) {
            break;
        }

        const marker = buffer[offset];
        offset += 1;


        if (marker === 0xd9) {
            sawEnd = true;

            if (offset !== buffer.length) {
                throw backgroundError(
                    "background_file_invalid",
                    "JPEG-Ende ist ungültig"
                );
            }

            break;
        }

        if (marker === 0x00 || marker === 0xd8) {
            throw backgroundError(
                "background_file_invalid",
                "JPEG-Marker ist ungültig"
            );
        }

        if (
            marker === 0x01 ||
            (marker >= 0xd0 && marker <= 0xd7)
        ) {
            continue;
        }

        if (offset + 2 > buffer.length) {
            throw backgroundError(
                "background_file_invalid",
                "JPEG-Segment ist unvollständig"
            );
        }

        const segmentLength = buffer.readUInt16BE(offset);

        if (
            segmentLength < 2 ||
            offset + segmentLength > buffer.length
        ) {
            throw backgroundError(
                "background_file_invalid",
                "JPEG-Segment ist ungültig"
            );
        }

        if (isJpegStartOfFrame(marker)) {
            if (segmentLength < 11) {
                throw backgroundError(
                    "background_file_invalid",
                    "JPEG-Bildheader ist ungültig"
                );
            }

            const componentCount =
                buffer[offset + 7];


            if (
                componentCount < 1 ||
                componentCount > 4 ||
                segmentLength !==
                    8 + componentCount * 3
            ) {
                throw backgroundError(
                    "background_file_invalid",
                    "JPEG-Bildheader ist ungültig"
                );
            }

            height = buffer.readUInt16BE(offset + 3);
            width = buffer.readUInt16BE(offset + 5);
            validateDimensions(width, height);
            sawFrame = true;
        }

        offset += segmentLength;


        if (marker === 0xda) {
            const componentCount =
                buffer[offset - segmentLength + 2];


            if (
                !sawFrame ||
                componentCount < 1 ||
                componentCount > 4 ||
                segmentLength !==
                    6 + componentCount * 2
            ) {
                throw backgroundError(
                    "background_file_invalid",
                    "JPEG-Scanheader ist ungültig"
                );
            }

            sawScan = true;


            while (offset < buffer.length) {

                if (buffer[offset] !== 0xff) {
                    offset += 1;
                    continue;
                }

                const markerOffset = offset;


                while (
                    offset < buffer.length &&
                    buffer[offset] === 0xff
                ) {
                    offset += 1;
                }

                if (offset >= buffer.length) {
                    throw backgroundError(
                        "background_file_invalid",
                        "JPEG-Scandaten sind unvollständig"
                    );
                }

                const scanMarker = buffer[offset];


                if (
                    scanMarker === 0x00 ||
                    (
                        scanMarker >= 0xd0 &&
                        scanMarker <= 0xd7
                    )
                ) {
                    offset += 1;
                    continue;
                }

                offset = markerOffset;
                break;

            }
        }

    }


    if (!sawFrame || !sawScan || !sawEnd) {
        throw backgroundError(
            "background_file_invalid",
            "JPEG-Datei ist unvollständig"
        );
    }


    return {
        extension: "jpg",
        mimeType: "image/jpeg",
        width: width,
        height: height
    };

}


function inspectImage(buffer, contentType) {

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw backgroundError(
            "background_file_required",
            "Bilddatei fehlt"
        );
    }

    if (buffer.length > MAX_FILE_SIZE) {
        throw backgroundError(
            "background_file_too_large",
            "Bilddatei ist zu groß"
        );
    }

    const mimeType = String(contentType || "")
        .split(";", 1)[0]
        .trim()
        .toLowerCase();

    let metadata;


    if (mimeType === "image/jpeg") {
        metadata = inspectJpeg(buffer);
    } else if (mimeType === "image/png") {
        metadata = inspectPng(buffer);
    } else {
        throw backgroundError(
            "background_content_type_invalid",
            "Nur JPEG- und PNG-Bilder sind erlaubt"
        );
    }


    if (metadata.mimeType !== mimeType) {
        throw backgroundError(
            "background_content_type_mismatch",
            "Dateityp und Bildinhalt stimmen nicht überein"
        );
    }


    metadata.size = buffer.length;
    return metadata;

}


function DashboardBackgroundStore(options) {

    const settings = options || {};

    this.dataDirectory =
        settings.dataDirectory ||
        Runtime.resolveDataDirectory();

    this.backgroundDirectory = path.join(
        this.dataDirectory,
        "backgrounds"
    );

}


DashboardBackgroundStore.prototype.ensureDirectory = function () {

    fs.mkdirSync(
        this.backgroundDirectory,
        {
            recursive: true,
            mode: 0o700
        }
    );

    fs.chmodSync(this.backgroundDirectory, 0o700);

};


DashboardBackgroundStore.prototype.fsyncDirectory = function () {

    let descriptor = null;


    try {
        descriptor = fs.openSync(
            this.backgroundDirectory,
            "r"
        );
        fs.fsyncSync(descriptor);
    } finally {
        if (descriptor !== null) {
            fs.closeSync(descriptor);
        }
    }

};


DashboardBackgroundStore.prototype.store = function (
    buffer,
    contentType
) {

    const metadata = inspectImage(buffer, contentType);
    const imageId =
        "bg-" +
        crypto.randomBytes(16).toString("hex") +
        "." + metadata.extension;

    const finalPath = path.join(
        this.backgroundDirectory,
        imageId
    );

    const temporaryPath = path.join(
        this.backgroundDirectory,
        "." + imageId + "." + process.pid + ".tmp"
    );

    let descriptor = null;
    let renamed = false;


    this.ensureDirectory();


    try {
        descriptor = fs.openSync(
            temporaryPath,
            "wx",
            0o600
        );
        fs.writeFileSync(descriptor, buffer);
        fs.fsyncSync(descriptor);
        fs.closeSync(descriptor);
        descriptor = null;

        fs.renameSync(temporaryPath, finalPath);
        renamed = true;
        fs.chmodSync(finalPath, 0o600);
        this.fsyncDirectory();
    } catch (error) {
        if (descriptor !== null) {
            fs.closeSync(descriptor);
        }

        try {
            fs.unlinkSync(
                renamed ? finalPath : temporaryPath
            );
        } catch (cleanupError) {
            if (cleanupError.code !== "ENOENT") {
                throw cleanupError;
            }
        }

        throw error;
    }


    return {
        imageId: imageId,
        mimeType: metadata.mimeType,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height
    };

};


DashboardBackgroundStore.prototype.resolve = function (imageId) {

    if (
        typeof imageId !== "string" ||
        !IMAGE_ID_PATTERN.test(imageId)
    ) {
        return null;
    }

    const filePath = path.join(
        this.backgroundDirectory,
        imageId
    );


    if (!fs.existsSync(filePath)) {
        return null;
    }


    return {
        filePath: filePath,
        imageId: imageId,
        mimeType:
            imageId.slice(-4) === ".png"
                ? "image/png"
                : "image/jpeg"
    };

};


DashboardBackgroundStore.prototype.remove = function (imageId) {

    const asset = this.resolve(imageId);


    if (!asset) {
        return false;
    }

    fs.unlinkSync(asset.filePath);
    this.fsyncDirectory();
    return true;

};


const defaultStore = new DashboardBackgroundStore();


module.exports = {
    DashboardBackgroundStore: DashboardBackgroundStore,
    IMAGE_ID_PATTERN: IMAGE_ID_PATTERN,
    MAX_DIMENSION: MAX_DIMENSION,
    MAX_FILE_SIZE: MAX_FILE_SIZE,
    MAX_PIXELS: MAX_PIXELS,
    inspectImage: inspectImage,
    remove: function (imageId) {
        return defaultStore.remove(imageId);
    },
    resolve: function (imageId) {
        return defaultStore.resolve(imageId);
    },
    store: function (buffer, contentType) {
        return defaultStore.store(buffer, contentType);
    }
};
