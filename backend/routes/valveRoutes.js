const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const axios = require("axios");
const valveController = require("../controllers/valveController");

const upload = multer({ dest: "uploads/" });

// Dummy response wrapper
const dummyRes = {
  json: (data) => console.log("✔ Inserted:", data),
  status: () => ({
    json: (err) => console.error("❌ Controller error:", err)
  })
};

router.post("/upload-excel", upload.single("file"), async (req, res) => {
  const { customer } = req.body;
  const filePath = req.file?.path;

  if (!filePath || !customer) {
    return res.status(400).json({ error: "Missing customer or file." });
  }

  try {
    // Step 1: Generate RFQ
    const { data } = await axios.post("http://localhost:5000/api/generate-rfq", {
      customerId: customer
    });
    const rfqNo = data.rfqNo;
    console.log("✅ Generated RFQ:", rfqNo);

    // Step 2: Read Excel
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Step 3: Process rows
    for (const row of rows) {
      const type = row.type?.toLowerCase();
      const basePayload = {
        itemNo: row["Item No"],
        valveType: row["Valve Type"],
        valveSize: row["Valve Size"],
        valveTorque: row["Valve Torque"],
        valveThrust: row["Valve Torque"],
        mast: row["Mast"],
        stroke: row["Stroke"] || null,
        appliedForce: row["Valve Torque"],
        leverArmLength: row["Lever Arm Length"] || 1,
        safetyFactor: row["Safety Factor"] || 1.2,
        rfqNo,
        customerId: customer
      };

      try {
        if (type === "partturn") {
          await valveController.type1({ body: { ...basePayload, type: "PartTurn" } }, dummyRes);
        } else if (type === "multiturn") {
          await valveController.type2({ body: basePayload }, dummyRes);
        } else if (type === "linear") {
          await valveController.type3({ body: basePayload }, dummyRes);
        } else if (type === "lever") {
          await valveController.type4({ body: basePayload }, dummyRes);
        } else {
          console.warn("❌ Unknown type in row:", type);
        }
      } catch (err) {
        console.error("❌ Failed to insert row:", row, err);
      }
    }

    fs.unlinkSync(filePath);
    res.json({ message: "✅ Excel data uploaded successfully", rfqNo });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
