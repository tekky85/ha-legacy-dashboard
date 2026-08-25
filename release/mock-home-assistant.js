"use strict";

const http = require("node:http");

const port = Number(process.argv[2] || 80);
const expectedAuthorization = "Bearer ci-supervisor-token";

const server = http.createServer(function (request, response) {
    if (request.headers.authorization !== expectedAuthorization) {
        response.writeHead(401, {"Content-Type": "application/json"});
        response.end(JSON.stringify({message: "unauthorized"}));
        return;
    }

    response.setHeader("Content-Type", "application/json");
    if (request.url === "/core/api/states") {
        response.end("[]");
        return;
    }
    if (request.url.indexOf("/core/api/states/") === 0) {
        response.writeHead(404);
        response.end(JSON.stringify({message: "not found"}));
        return;
    }
    response.end(JSON.stringify({message: "API running"}));
});

server.listen(port, "0.0.0.0", function () {
    process.stdout.write("Mock Home Assistant ready\n");
});

function stop() {
    server.close(function () {
        process.exit(0);
    });
}

process.on("SIGTERM", stop);
process.on("SIGINT", stop);
