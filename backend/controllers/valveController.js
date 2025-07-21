const db = require("../db");

// Generate RFQ Number
exports.generateRFQNumber = async (req, res) => {
  try {
    const { customerId, productGroupId } = req.body;
    if (!customerId || !productGroupId) {
      return res.status(400).json({ error: "Customer ID and Product Group ID are required" });
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}${mm}${dd}`;

    await db.promise().query(`
      INSERT INTO rfq_counter (date_key, counter)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE counter = counter + 1
    `, [dateKey]);

    const [[{ counter }]] = await db.promise().query(
      `SELECT counter FROM rfq_counter WHERE date_key = ?`,
      [dateKey]
    );

    const rfqNo = `RFQ${dateKey}${String(counter).padStart(4, '0')}`;

    await db.promise().query(
      `INSERT INTO rfqs (rfq_no, customer_id, product_group_id) VALUES (?, ?, ?)`,
      [rfqNo, customerId, productGroupId]
    );

    res.json({ rfqNo });
  } catch (err) {
    console.error("Error generating RFQ number:", err);
    res.status(500).json({ error: "Failed to generate and store RFQ number" });
  }
};

// Insert PartTurn
exports.type1 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
    rfqNo, customerId, productGroupId, type
  } = req.body;

  const calculatedTorque = valveTorque * safetyFactor;
  const actuator = { name: "AUMA A1", rpm: 30, price: 8000, weight: 6 };
  const opTime = (15 / actuator.rpm).toFixed(2);

  const sql = `
    INSERT INTO PartTurn (
      itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
      calculatedTorque, actuator, rpm, opTime, price, weight,
      rfqNo, customerId, productGroupId, type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
    calculatedTorque, actuator.name, actuator.rpm, opTime,
    actuator.price, actuator.weight, rfqNo, customerId, productGroupId, type
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Inserted to PartTurn", ...req.body });
  });
};

// MultiTurn
exports.type2 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = { name: "AUMA MT1", rpm: 20, price: 12000, weight: 10 };
  const opTime = (80 / (4 * actuator.rpm)).toFixed(2);

  const sql = `
    INSERT INTO MultiTurn (
      itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
      calculatedThrust, actuator, rpm, opTime, price, weight,
      rfqNo, customerId, productGroupId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
    calculatedThrust, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight,
    rfqNo, customerId, productGroupId
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Inserted to MultiTurn", ...req.body });
  });
};

// Linear
exports.type3 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = { name: "AUMA L1", rpm: 15, price: 11000, weight: 9 };
  const opTime = (stroke / (4 * actuator.rpm)).toFixed(2);

  const sql = `
    INSERT INTO Linear_valve (
      itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
      calculatedThrust, actuator, rpm, opTime, price, weight,
      rfqNo, customerId, productGroupId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
    calculatedThrust, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight,
    rfqNo, customerId, productGroupId
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Inserted to Linear", ...req.body });
  });
};

// Lever
exports.type4 = (req, res) => {
  const {
    itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedTorque = appliedForce * leverArmLength * safetyFactor;
  const actuator = { name: "AUMA L2", rpm: 18, price: 9600, weight: 8.5 };
  const opTime = (15 / actuator.rpm).toFixed(2);

  const sql = `
    INSERT INTO Lever (
      itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
      calculatedTorque, actuator, rpm, opTime, price, weight,
      rfqNo, customerId, productGroupId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
    calculatedTorque, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight,
    rfqNo, customerId, productGroupId
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Inserted to Lever", ...req.body });
  });
};

// Dropdown Data
exports.getDropdownData = async (req, res) => {
  try {
    const [customers] = await db.promise().query(`SELECT id, name FROM customers`);
    const [productGroups] = await db.promise().query(`SELECT id, group_name FROM product_groups`);
    res.json({ customers, productGroups });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dropdown options" });
  }
};

// RFQ List
exports.getSEMappingData = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        rfqs.rfq_no,
        rfqs.type,
        customers.name AS customer_name,
        product_groups.group_name AS product_group_name,
        rfqs.created_at
      FROM rfqs
      JOIN customers ON rfqs.customer_id = customers.id
      JOIN product_groups ON rfqs.product_group_id = product_groups.id
      ORDER BY rfqs.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch RFQ list" });
  }
};

// Valve Details by RFQ
exports.getSEDetailsByRFQ = async (req, res) => {
  const rfqNo = req.params.rfqNo;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT v.type, v.id, v.itemNo, v.valveType, v.valveSize, v.torque, v.thrust, v.stroke, v.rfqNo,
             r.customer_id, r.product_group_id
      FROM (
        SELECT 'partturn' AS type, id, itemNo, valveType, valveSize, valveTorque AS torque, NULL AS thrust, NULL AS stroke, rfqNo
        FROM PartTurn WHERE rfqNo = ?

        UNION ALL

        SELECT 'multiturn' AS type, id, itemNo, valveType, valveSize, NULL AS torque, valveThrust AS thrust, NULL AS stroke, rfqNo
        FROM MultiTurn WHERE rfqNo = ?

        UNION ALL

        SELECT 'linear' AS type, id, itemNo, valveType, valveSize, NULL AS torque, valveThrust AS thrust, stroke, rfqNo
        FROM Linear_valve WHERE rfqNo = ?

        UNION ALL

        SELECT 'lever' AS type, id, itemNo, valveType, NULL AS valveSize, calculatedTorque AS torque, NULL AS thrust, NULL AS stroke, rfqNo
        FROM Lever WHERE rfqNo = ?
      ) v
      JOIN rfqs r ON v.rfqNo = r.rfq_no
      `,
      [rfqNo, rfqNo, rfqNo, rfqNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No valve data found for this RFQ" });
    }

    res.json({ valveRows: rows });
  } catch (err) {
    console.error("❌ Error fetching SE details by RFQ:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get AUMA Models
exports.getAumaModels = async (req, res) => {
  const { rfqNo } = req.query;

  if (!rfqNo) {
    return res.status(400).json({ error: "rfqNo is required" });
  }

  try {
    const [rows] = await db.promise().query(
      `
      SELECT 
        v.type, 
        v.id AS valveId, 
        v.itemNo, 
        v.valveType, 
        v.valveSize, 
        v.torque, 
        v.thrust, 
        v.stroke,
        a.id AS modelId,
        a.modelName,
        a.torque AS modelTorque,
        a.thrust AS modelThrust,
        a.stroke AS modelStroke,
        a.unitPrice,
        a.netWeight,
        a.description
      FROM (
        SELECT 'PartTurn' AS type, id, itemNo, valveType, valveSize, valveTorque AS torque, NULL AS thrust, NULL AS stroke
        FROM PartTurn
        WHERE rfqNo = ?

        UNION ALL

        SELECT 'MultiTurn' AS type, id, itemNo, valveType, valveSize, NULL AS torque, valveThrust AS thrust, NULL AS stroke
        FROM MultiTurn
        WHERE rfqNo = ?

        UNION ALL

        SELECT 'Linear' AS type, id, itemNo, valveType, valveSize, NULL AS torque, valveThrust AS thrust, stroke
        FROM Linear_valve
        WHERE rfqNo = ?

        UNION ALL

        SELECT 'Lever' AS type, id, itemNo, valveType, NULL AS valveSize, calculatedTorque AS torque, NULL AS thrust, NULL AS stroke
        FROM Lever
        WHERE rfqNo = ?
      ) v
      JOIN auma_model a ON LOWER(v.type) = LOWER(a.type)
      ORDER BY v.type, v.itemNo, a.modelName
      `,
      [rfqNo, rfqNo, rfqNo, rfqNo]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getAumaModels:", err);
    res.status(500).json({ error: "Failed to fetch AUMA models" });
  }
};



// Submit SE Mapping
// POST /api/se-mapping/submit
exports.submitSEMapping = async (req, res) => {
  const data = req.body;

  if (!Array.isArray(data) || !data.length) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const insertQueries = data.map((entry) => {
    const { rfqNumber, valveType, valveId, selectedModel, quantity } = entry;
    return db.promise().query(
      `INSERT INTO se_mappings (rfq_no, valve_type, valve_row_id, auma_model, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [rfqNumber, valveType, valveId, selectedModel, quantity]
    );
  });

  try {
    await Promise.all(insertQueries);
    res.json({ message: "SE Mapping submitted successfully" });
  }catch (err) {
  console.error("❌ Failed to insert SE Mapping:", err); // already exists?
  res.status(500).json({ error: err.message }); // <-- this reveals the root cause
}

};



exports.getRFQInfo = async (req, res) => {
  const { rfqNo } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
  r.rfq_no, 
  c.name AS customer_name, 
  p.group_name AS product_group_name
FROM se_mapping s
JOIN rfqs r ON s.rfq_no = r.rfq_no
JOIN customers c ON r.customer_id = c.id
JOIN product_groups p ON r.product_group_id = p.id
WHERE s.rfq_no = ?
LIMIT 1;
`,
      [rfqNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "RFQ not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching RFQ info:", err);
    res.status(500).json({ error: "Failed to fetch RFQ info" });
  }
};
exports.getSEQuotation = async (req, res) => {
  const { rfqNo } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        v.itemNo,
        v.valveType,
        v.valveSize,
        a.modelName,
        a.unitPrice,
        m.quantity,
        a.description
      FROM se_mappings m
      JOIN (
        SELECT id, itemNo, valveType, valveSize, 'PartTurn' AS type FROM PartTurn
        UNION ALL
        SELECT id, itemNo, valveType, valveSize, 'MultiTurn' AS type FROM MultiTurn
        UNION ALL
        SELECT id, itemNo, valveType, valveSize, 'Linear' AS type FROM Linear_valve
        UNION ALL
        SELECT id, itemNo, valveType, valveSize, 'Lever' AS type FROM Lever
      ) v ON v.id = m.valve_row_id AND v.type = m.valve_type
      JOIN auma_model a ON a.modelName = m.auma_model AND LOWER(a.type) = LOWER(m.valve_type)
      WHERE m.rfq_no = ?
      ORDER BY v.itemNo, a.modelName`,
      [rfqNo]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching SE Quotation:", err);
    res.status(500).json({ error: "Failed to fetch SE Quotation" });
  }
};

// Get all unique RFQ numbers from SE Mappings
exports.getSEMappingRFQs = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT DISTINCT r.rfq_no, c.name, pg.group_name
      FROM se_mappings sm
      JOIN rfqs r ON sm.rfq_no = r.rfq_no
      JOIN customers c ON r.customer_id = c.id
      JOIN product_groups pg ON r.product_group_id = pg.id
      ORDER BY r.rfq_no DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching SE mapping RFQs:", err);
    res.status(500).json({ error: "Failed to fetch RFQ list" });
  }
};


exports.getSEQuotation = async (req, res) => {
  const { rfqNo } = req.params;

  try {
    const [rows] = await db.promise().query(`
     SELECT 
        sm.id,
        sm.rfq_no,
        sm.valve_type,
       
        sm.auma_model,
        sm.quantity,
        am.description,
        am.netWeight,
        am.torque,
        am.thrust,
        am.stroke,
        am.unitPrice,
        (sm.quantity * am.unitPrice) AS totalPrice
      FROM se_mappings sm
      JOIN auma_model am ON sm.auma_model = am.modelName
      WHERE sm.rfq_no = ?
    `, [rfqNo]);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching SE Quotation:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch SE Quotation" });
  }
};




