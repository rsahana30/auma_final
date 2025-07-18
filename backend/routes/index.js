const express = require("express");
const router = express.Router();
const controller = require("../controllers/valveController");

// Valve type-specific insert routes
router.post("/type1", controller.type1);
router.post("/type2", controller.type2);
router.post("/type3", controller.type3);
router.post("/type4", controller.type4);

// Dropdown data for customers and product groups
router.get("/dropdown-data", controller.getDropdownData);

// ✅ POST route for generating RFQ number (corrected)
router.post("/generate-rfq", controller.generateRFQNumber);


router.get("/se-mapping", controller.getSEMappingData);
router.get("/se-details/:rfqNo", controller.getSEDetailsByRFQ);

module.exports = router;
