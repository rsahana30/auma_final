const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/fields
router.get('/fields', (req, res) => {
  db.query('SELECT field_name, db_column FROM field_column_map', (err, results) => {
    if (err) return res.status(500).send('DB error');
    res.json(results); // [{field_name: 'ValveType', db_column: 'a'}, ...]
  });
});

// GET /api/fields/:fieldName/values
router.get('/fields/:fieldName/values', (req, res) => {
  const { fieldName } = req.params;

  // Find the column for the given field
  db.query('SELECT db_column FROM field_column_map WHERE field_name = ?', [fieldName], (err, results) => {
    if (err) return res.status(500).send('DB error');
    if (results.length === 0) return res.status(404).send('Field not found');

    const col = results[0].db_column;

    // Select distinct non-null values stored in that column
    const sql = `SELECT DISTINCT \`${col}\` AS value FROM level1 WHERE \`${col}\` IS NOT NULL AND \`${col}\` <> ''`;

    db.query(sql, (err2, values) => {
      if (err2) return res.status(500).send('DB error');
      res.json(values.map(v => v.value)); // Return an array of distinct values
    });
  });
});
module.exports = router;