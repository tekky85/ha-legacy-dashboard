const express = require("express");
const router = express.Router();

const ha = require("../services/homeassistant");

router.get("/dashboard", async (req, res) => {

    const entities = await ha.getEntities([
        "sensor.badezimmer_smart_indoor_module_temperatur",
        "sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit",
        "binary_sensor.kuche_fenster_rechts"
    ]);

    res.json(entities);

});

module.exports = router;
