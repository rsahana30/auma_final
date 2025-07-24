const express = require("express");
const router = express.Router();
const db = require("../db");


router.post('/fields', async (req, res) => {
  const { fieldName } = req.body;
  const allColumns = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // Find used columns
  db.query('SELECT db_column FROM field_column_map', (err, results) => {
    if (err) return res.status(500).send('DB error');
    const used = results.map(r => r.db_column);
    const available = allColumns.find(c => !used.includes(c));
    if (!available) return res.status(400).send('No columns left');
    // Insert mapping
    db.query('INSERT INTO field_column_map (field_name, db_column) VALUES (?, ?)',
      [fieldName, available], (err2) => {
        if (err2) return res.status(500).send('DB error');
        res.send({ fieldName, db_column: available });
      });
  });
});
router.post('/level1', async (req, res) => {
  const data = req.body; // e.g., { valveType: 'ball valve', pressure: '50psi' }
  const fieldNames = Object.keys(data);

  // Get mapping for fields
  db.query(
    'SELECT field_name, db_column FROM field_column_map WHERE field_name IN (?)',
    [fieldNames], (err, results) => {
      if (err) return res.status(500).send('DB error');
      const mapping = {};
      results.forEach(r => { mapping[r.field_name] = r.db_column; });

      // Build insert query
      const dbCols = [];
      const values = [];
      fieldNames.forEach(fn => {
        const col = mapping[fn];
        if (col) {
          dbCols.push(col);
          values.push(data[fn]);
        }
      });
      if (dbCols.length === 0) return res.status(400).send('No valid fields');
      const sql = `INSERT INTO level1 (${dbCols.join(',')}) VALUES (${dbCols.map(()=>'?').join(',')})`;
      db.query(sql, values, (err2) => {
        if (err2) return res.status(500).send('DB error');
        res.send('Data saved');
      });
    });
});


router.get('/level1/data', (req, res) => {
  db.query('SELECT * FROM level1', (err, results) => {
    if (err) return res.status(500).send(err);

    db.query('SELECT field_name, db_column FROM field_column_map', (err2, mappings) => {
      if (err2) return res.status(500).send(err2);

      const colToField = {};
      mappings.forEach(m => {
        colToField[m.db_column] = m.field_name;
      });

      // Transform result rows to object with field names as keys
      const data = results.map(row => {
        const item = { id: row.id };
        Object.entries(row).forEach(([col, val]) => {
          if (col !== 'id' && val !== null) {
            const field = colToField[col];
            if (field) item[field] = val;
          }
        });
        return item;
      });

      res.json(data);
    });
  });
});

module.exports = router;