const express = require("express");
const router = express.Router();
const db = require("../db");


router.post('/fields', async (req, res) => {
  const { fieldName } = req.body;
  const allColumns = 'abcdefghijklmnopqrstuvwxyz'.split('');

  db.query('SELECT db_column FROM field_column_map', (err, results) => {
    if (err) return res.status(500).send('DB error');
    const used = results.map(r => r.db_column);
    const available = allColumns.find(c => !used.includes(c));
    if (!available) return res.status(400).send('No columns left');
    // Insert mapping, handle duplicate error
    db.query('INSERT INTO field_column_map (field_name, db_column) VALUES (?, ?)',
      [fieldName, available], (err2) => {
        if (err2) {
          // MySQL duplicate error code is ER_DUP_ENTRY (1062)
          if (err2.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Field name already exists');
          }
          return res.status(500).send('DB error');
        }
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


// DELETE /api/fields/:fieldName
router.delete('/fields/:fieldName', (req, res) => {
  const { fieldName } = req.params;
  
  // Find the mapped column
  db.query('SELECT db_column FROM field_column_map WHERE field_name = ?', [fieldName], (err, result) => {
    if (err) return res.status(500).send('DB error');
    if (result.length === 0) return res.status(404).send('Field mapping not found');
    
    const col = result[0].db_column;

    // Delete mapping entry
    db.query('DELETE FROM field_column_map WHERE field_name = ?', [fieldName], (err2) => {
      if (err2) return res.status(500).send('DB error');

      // Clear data from the associated column
      const sql = `UPDATE level1 SET \`${col}\` = NULL`;
      db.query(sql, (err3) => {
        if (err3) return res.status(500).send('DB error clearing column data');
        res.send('Field mapping and associated data deleted');
      });
    });
  });
});


router.get('/field', (req, res) => {
  db.query('SELECT field_name, db_column FROM field_column_map', (err, results) => {
    if (err) return res.status(500).send('DB error');
    res.json(results);
  });
});

module.exports = router;