require('dotenv').config();

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.json());


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
