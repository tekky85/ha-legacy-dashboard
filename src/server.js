require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRoutes = require("./routes/api");
const app = express();

const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = path.join(__dirname, "public");


function setStaticHeaders(res, filePath) {

    if (
        /index\.html$/.test(filePath) ||
        /manifest\.json$/.test(filePath)
    ) {

        res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
        );

        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        return;

    }


    res.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable"
    );

}


app.use(express.json());
app.use("/api", apiRoutes);
app.use(express.static(
    PUBLIC_PATH,
    {
        setHeaders: setStaticHeaders
    }
));

app.get('/api/status', (req, res) => {

    res.json({
        status: "online",
        service: "ha-dashboard-gateway",
        version: "0.1.0",
        timestamp: new Date()
    });

});


app.listen(PORT, () => {

    console.log(
        `HA Dashboard Gateway läuft auf Port ${PORT}`
    );

});
