const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/se-mapping/rfqs", (req, res) => {
  db.query(
    `SELECT r.rfq_no, c.name AS customer_name
     FROM rfqs r
     JOIN customers c ON r.customer_id = c.id
     ORDER BY r.created_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Error fetching SEMapping RFQs:", err);
        return res.status(500).json({ error: "Failed to fetch RFQs" });
      }
      res.json(results);
    }
  );
});


router.get("/se-mapping/details/:rfq_no", (req, res) => {
  const { rfq_no } = req.params;

  db.query(
    `
    SELECT valveType, valveSize, type, total AS total FROM partturn WHERE rfqNo = ?
    UNION ALL
    SELECT valveType, valveSize, type, total AS total FROM multiturn WHERE rfqNo = ?
    UNION ALL
    SELECT valveType, valveSize, type, total AS total FROM linear_valve WHERE rfqNo = ?
    UNION ALL
    SELECT valveType, NULL AS valveSize, type, total AS total FROM lever WHERE rfqNo = ?
    `,
    [rfq_no, rfq_no, rfq_no, rfq_no],
    (err, results) => {
      if (err) {
        console.error("Error fetching mapping data:", err); // ⛔ Will show exact error here
        return res.status(500).json({ error: "Failed to fetch valve details" });
      }
      res.json(results);
    }
  );
});

router.get("/auma-models", (req, res) => {
  const { type, country, controller, protectionType } = req.query;

  if (!type) {
    return res.status(400).json({ error: "Valve type is required" });
  }

  let query = "SELECT * FROM auma_models WHERE type = ?";
  const values = [type];

  if (country && country.trim() !== "") {
    query += " AND country = ?";
    values.push(country.trim());
  }

  if (controller && controller.trim() !== "") {
    query += " AND controller = ?";
    values.push(controller.trim());
  }

  if (protectionType && protectionType.trim() !== "") {
    query += " AND protectionType = ?";
    values.push(protectionType.trim());
  }

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error fetching AUMA models:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});




router.post("/se-mapping/save", (req, res) => {
  const { rfqNo, mappings } = req.body;

  const insertValues = mappings.map((row) => [
    rfqNo,
    row.valveType,
    row.valveSize,
    row.type,
    row.total,
    row.quantity,
    row.auma_model,
    row.netWeight,
    row.unitPrice,
    row.country,
  ]);

  const sql = `
    INSERT INTO save_semappings
    (rfqNo, valveType, valveSize, type, totalTorque, quantity, aumaModel, netWeight, unitPrice, country) 
    VALUES ?
  `;

  db.query(sql, [insertValues], (err, result) => {
    if (err) {
      console.error("Error saving mappings:", err);
      return res.status(500).json({ error: "Failed to save mappings" });
    }
    res.json({ message: "Mappings saved successfully" });
  });
});
module.exports = router;
