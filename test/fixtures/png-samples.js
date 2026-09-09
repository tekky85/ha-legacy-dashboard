const VALID = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
);


function crc32(buffer) {

    let crc = 0xffffffff;


    for (let index = 0; index < buffer.length; index += 1) {
        crc ^= buffer[index];

        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc & 1)
                ? 0xedb88320 ^ (crc >>> 1)
                : crc >>> 1;
        }
    }


    return (crc ^ 0xffffffff) >>> 0;

}


function chunk(type, data) {

    const payload = data || Buffer.alloc(0);
    const typeBuffer = Buffer.from(type, "ascii");
    const result = Buffer.alloc(payload.length + 12);


    result.writeUInt32BE(payload.length, 0);
    typeBuffer.copy(result, 4);
    payload.copy(result, 8);
    result.writeUInt32BE(
        crc32(Buffer.concat([typeBuffer, payload])),
        payload.length + 8
    );


    return result;

}


function findChunk(buffer, wantedType) {

    let offset = 8;


    while (offset + 12 <= buffer.length) {
        const length = buffer.readUInt32BE(offset);
        const type = buffer.toString("ascii", offset + 4, offset + 8);


        if (type === wantedType) {
            return {
                offset: offset,
                length: length,
                end: offset + 12 + length
            };
        }

        offset += 12 + length;
    }


    throw new Error("PNG test chunk not found: " + wantedType);

}


function withoutIdat() {

    const idat = findChunk(VALID, "IDAT");


    return Buffer.concat([
        VALID.subarray(0, idat.offset),
        VALID.subarray(idat.end)
    ]);

}


function withBadCrc() {

    const result = Buffer.from(VALID);
    const idat = findChunk(result, "IDAT");


    result[idat.end - 1] ^= 0xff;
    return result;

}


function withUnknownCriticalChunk() {

    const idat = findChunk(VALID, "IDAT");


    return Buffer.concat([
        VALID.subarray(0, idat.offset),
        chunk("ABCD"),
        VALID.subarray(idat.offset)
    ]);

}


function withDuplicateHeader() {

    const header = findChunk(VALID, "IHDR");
    const end = findChunk(VALID, "IEND");


    return Buffer.concat([
        VALID.subarray(0, end.offset),
        VALID.subarray(header.offset, header.end),
        VALID.subarray(end.offset)
    ]);

}


module.exports = {
    badCrc: withBadCrc(),
    duplicateHeader: withDuplicateHeader(),
    noIdat: withoutIdat(),
    trailingData: Buffer.concat([VALID, Buffer.from([0x00])]),
    truncated: VALID.subarray(0, VALID.length - 1),
    unknownCritical: withUnknownCriticalChunk(),
    valid: VALID
};
