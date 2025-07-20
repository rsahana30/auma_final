const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const axios = require("axios");
const valveController = require("../controllers/valveController");

const upload = multer({ dest: "uploads/" });

router.post("/upload-excel", upload.single("file"), async (req, res) => {
  const { customer, productGroup } = req.body;
  const filePath = req.file?.path;

  if (!customer || !productGroup || !filePath) {
    return res.status(400).json({ error: "Missing customer, product group, or file." });
  }

  try {
    // Step 1: Generate RFQ
    const { data } = await axios.post("http://localhost:5000/api/generate-rfq", {
      customerId: customer,
      productGroupId: productGroup
    });
    const rfqNo = data.rfqNo;
    console.log("✅ RFQ Number generated:", rfqNo);

    // Step 2: Parse Excel
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet);

    // Step 3: Normalize column names
    const normalizeKeys = (row) => {
      const mapKey = (key) =>
        key
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

      const normalized = {};
      for (const key in row) {
        normalized[mapKey(key)] = row[key];
      }
      return normalized;
    };

    const rows = rawRows.map(normalizeKeys);

    // Step 4: Dispatch each row
    for (const row of rows) {
      const type = row.type?.toLowerCase();
      console.log("🔁 Routing type:", type);

      const payload = {
        ...row,
        rfqNo,
        customerId: customer,
        productGroupId: productGroup
      };

      const wrapController = (fn) =>
        new Promise((resolve, reject) =>
          fn(
            { body: payload },
            {
              json: resolve,
              status: () => ({
                json: (err) => {
                  console.error("❌ Controller error:", err);
                  reject(err);
                }
              })
            }
          )
        );

      try {
        if (type === "partturn") {
          await wrapController(valveController.type1);
        } else if (type === "multiturn") {
          await wrapController(valveController.type2);
        } else if (type === "linear") {
          await wrapController(valveController.type3);
        } else if (type === "lever") {
          await wrapController(valveController.type4);
        } else {
          console.warn("❌ Unknown type in row:", type);
        }
      } catch (err) {
        console.error("❌ Error in row processing:", err);
      }
    }

    // Step 5: Clean up file
    fs.unlinkSync(filePath);

    res.json({ message: "✅ Excel data inserted into respective tables", rfqNo });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
