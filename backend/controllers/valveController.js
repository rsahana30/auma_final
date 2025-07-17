// controllers/valveController.js
const db = require("../db");

// Type 1 - PartTurn
exports.type1 = (req, res) => {
  const {
    itemNo, valveType, valveSize, valveTorque, mast, safetyFactor
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
    INSERT INTO PartTurn (itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
      calculatedTorque, actuator, rpm, opTime, price, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
    calculatedTorque, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      itemNo, valveType, valveSize, valveTorque, mast, safetyFactor,
      calculatedTorque, actuator: actuator.name, rpm: actuator.rpm,
      opTime, price: actuator.price, weight: actuator.weight
    });
  });
};

// Repeat similarly for type2, type3, type4
exports.type2 = (req, res) => {
  const { itemNo, valveType, valveSize, valveThrust, mast, safetyFactor } = req.body;
  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = {
    name: "AUMA MT1",
    rpm: 20,
    price: 12000,
    weight: 10
  };
  const opTime = (80 / (4 * actuator.rpm)).toFixed(2);

  const sql = `
    INSERT INTO MultiTurn (itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
      calculatedThrust, actuator, rpm, opTime, price, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    itemNo, valveType, valveSize, valveThrust, mast, safetyFactor,
    calculatedThrust, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ itemNo, valveType, valveSize, valveThrust, mast, safetyFactor, calculatedThrust, actuator: actuator.name, rpm: actuator.rpm, opTime, price: actuator.price, weight: actuator.weight });
  });
};

exports.type3 = (req, res) => {
  const { itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor } = req.body;
  const calculatedThrust = valveThrust * safetyFactor;
  const actuator = {
    name: "AUMA L1",
    rpm: 15,
    price: 11000,
    weight: 9
  };
  const opTime = (stroke / (4 * actuator.rpm)).toFixed(2);

  const sql = `
    INSERT INTO Linear_valve (itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
      calculatedThrust, actuator, rpm, opTime, price, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor,
    calculatedThrust, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ itemNo, valveType, valveSize, valveThrust, stroke, safetyFactor, calculatedThrust, actuator: actuator.name, rpm: actuator.rpm, opTime, price: actuator.price, weight: actuator.weight });
  });
};

exports.type4 = (req, res) => {
  const { itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor } = req.body;
  const calculatedTorque = appliedForce * leverArmLength * safetyFactor;
  const actuator = {
    name: "AUMA L2",
    rpm: 18,
    price: 9600,
    weight: 8.5
  };
  const opTime = (15 / actuator.rpm).toFixed(2);

  const sql = `
    INSERT INTO Lever (itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
      calculatedTorque, actuator, rpm, opTime, price, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor,
    calculatedTorque, actuator.name, actuator.rpm, opTime, actuator.price, actuator.weight
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ itemNo, valveType, appliedForce, leverArmLength, mast, safetyFactor, calculatedTorque, actuator: actuator.name, rpm: actuator.rpm, opTime, price: actuator.price, weight: actuator.weight });
  });
};
