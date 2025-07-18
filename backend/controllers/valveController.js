// controllers/valveController.js
const db = require("../db");
// In valveController.js
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

    // ✅ THIS IS IMPORTANT
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


// Type 1 - PartTurn
// TYPE 1 - PartTurn
exports.type1 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedTorque = valveTorque * safetyFactor;
  const actuator = {
    name: "AUMA A1",
    rpm: 30,
    price: 8000,
    weight: 6
  };
  const opTime = (15 / actuator.rpm).toFixed(2);

  const sql = `
    INSERT INTO PartTurn (
      itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
      calculatedTorque, actuator, rpm, opTime, price, weight,
      rfqNo, customerId, productGroupId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
    calculatedTorque, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight,
    rfqNo, customerId, productGroupId
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
      calculatedTorque, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};

// TYPE 2 - MultiTurn
exports.type2 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = {
    name: "AUMA MT1",
    rpm: 20,
    price: 12000,
    weight: 10
  };
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
    res.json({ itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
      calculatedThrust, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};

// TYPE 3 - Linear
exports.type3 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = {
    name: "AUMA L1",
    rpm: 15,
    price: 11000,
    weight: 9
  };
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
    res.json({ itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
      calculatedThrust, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};

// TYPE 4 - Lever
exports.type4 = (req, res) => {
  const {
    itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedTorque = appliedForce * leverArmLength * safetyFactor;
  const actuator = {
    name: "AUMA L2",
    rpm: 18,
    price: 9600,
    weight: 8.5
  };
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
    res.json({ itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
      calculatedTorque, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};


// TYPE 2 - MultiTurn
exports.type2 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = {
    name: "AUMA MT1",
    rpm: 20,
    price: 12000,
    weight: 10
  };
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
    res.json({ itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
      calculatedThrust, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};

// TYPE 3 - Linear
exports.type3 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = {
    name: "AUMA L1",
    rpm: 15,
    price: 11000,
    weight: 9
  };
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
    res.json({ itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
      calculatedThrust, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};

// TYPE 4 - Lever
exports.type4 = (req, res) => {
  const {
    itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
    rfqNo, customerId, productGroupId
  } = req.body;

  const calculatedTorque = appliedForce * leverArmLength * safetyFactor;
  const actuator = {
    name: "AUMA L2",
    rpm: 18,
    price: 9600,
    weight: 8.5
  };
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
    res.json({ itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
      calculatedTorque, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight, rfqNo, customerId, productGroupId
    });
  });
};


exports.getDropdownData = async (req, res) => {
  try {
    const [customers] = await db.promise().query(`SELECT id, name FROM customers`);
    const [productGroups] = await db.promise().query(`SELECT id, group_name FROM product_groups`);
    res.json({ customers, productGroups });
  } catch (err) {
    console.error("Error fetching dropdown data:", err);
    res.status(500).json({ error: "Failed to load dropdown options" });
  }
};


exports.getSEMappingData = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        rfqs.rfq_no,
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
    console.error("Error fetching SE mapping data:", err);
    res.status(500).json({ error: "Failed to fetch SE Mapping data" });
  }
};

exports.getSEDetailsByRFQ = async (req, res) => {
  const rfqNo = req.params.rfqNo;

  try {
    const [partTurn] = await db.promise().query("SELECT * FROM PartTurn WHERE rfqNo = ?", [rfqNo]);
    const [multiTurn] = await db.promise().query("SELECT * FROM MultiTurn WHERE rfqNo = ?", [rfqNo]);
    const [linear] = await db.promise().query("SELECT * FROM Linear_valve WHERE rfqNo = ?", [rfqNo]);
    const [lever] = await db.promise().query("SELECT * FROM Lever WHERE rfqNo = ?", [rfqNo]);

    res.json({
      partTurn,
      multiTurn,
      linear,
      lever
    });
  } catch (err) {
    console.error("Error fetching SE details:", err);
    res.status(500).json({ error: "Failed to fetch SE mapping details" });
  }
};
