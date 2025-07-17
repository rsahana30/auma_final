// routes/index.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/valveController");

router.post("/type1", controller.type1);
router.post("/type2", controller.type2);
router.post("/type3", controller.type3);
router.post("/type4", controller.type4);

module.exports = router;
