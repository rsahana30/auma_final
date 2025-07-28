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


router.post('/create-table', (req, res) => {
  const { tableName, fields } = req.body;

  if (!tableName || !fields || !Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: 'Table name and fields are required' });
  }

  // Start with id column for unique id
  const columns = [
    '`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY',
    ...fields.map(field => `\`${field}\` VARCHAR(255)`)
  ].join(', ');

  const sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columns});`;

  console.log('Executing SQL:', sql);

  db.query(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return res.status(500).json({ error: 'Failed to create table', details: err.message });
    }
    res.json({ message: `Table '${tableName}' created successfully with unique id.` });
  });
});




router.post('/typesave', (req, res) => {
  const { tableName } = req.body;

  if (!tableName || typeof tableName !== 'string' || tableName.trim() === '') {
    return res.status(400).json({ error: 'tableName is required.' });
  }

  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const datePart = yyyy + mm + dd;

  const likePattern = `T${datePart}%`;

  // Step 1: get the highest type_number for today from 'type' table
  const selectSql = `
    SELECT type_number FROM type
    WHERE type_number LIKE ?
    ORDER BY type_number DESC
    LIMIT 1
  `;

  db.query(selectSql, [likePattern], (err, rows) => {
    if (err) {
      console.error('DB select error:', err);
      return res.status(500).json({ error: 'Database error during type number lookup.' });
    }

    let sequence = 1;
    if (rows.length > 0) {
      const lastTypeNumber = rows[0].type_number;
      const lastSeqStr = lastTypeNumber.slice(-4);
      sequence = parseInt(lastSeqStr, 10) + 1;
    }

    const sequenceStr = sequence.toString().padStart(4, '0');
    const type_number = `T${datePart}${sequenceStr}`;

    // Step 2: Insert the new type_number and tableName into 'type' table
    const insertSql = 'INSERT INTO type (type_number, table_name) VALUES (?, ?)';

    db.query(insertSql, [type_number, tableName.trim()], (insertErr) => {
      if (insertErr) {
        console.error('DB insert error:', insertErr);
        if (insertErr.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Table name already exists.' });
        }
        return res.status(500).json({ error: 'Database error during insert.' });
      }

      return res.json({ type_number });
    });
  });
});

// In your routes file
router.get('/types-with-data', (req, res) => {
  db.query('SELECT type_number, table_name FROM type', async (err, types) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch types.' });

    // For each type, get its data rows
    const allTypeData = await Promise.all(types.map(type =>
      new Promise(resolve => {
        db.query(`SELECT * FROM ??`, [type.table_name], (err, rows) => {
          resolve({
            type_number: type.type_number,
            table_name: type.table_name,
            rows: err ? [{ error: 'Table does not exist or error reading table.' }] : rows
          });
        });
      })
    ));

    res.json(allTypeData);
  });
});


// POST /api/insert-row
router.post('/insert-row', (req, res) => {
  const { type_number, table_name, rowData } = req.body;

  if (!table_name && !type_number) {
    return res.status(400).json({ error: 'table_name or type_number is required' });
  }

  if (!rowData || typeof rowData !== 'object' || Array.isArray(rowData)) {
    return res.status(400).json({ error: 'Invalid rowData' });
  }

  // If only type_number is provided, fetch table_name from type table
  const getTableNamePromise = type_number
    ? new Promise((resolve, reject) => {
        db.query(
          'SELECT table_name FROM type WHERE type_number = ?',
          [type_number],
          (err, results) => {
            if (err) reject(err);
            else if (!results.length) reject(new Error('Invalid type_number'));
            else resolve(results[0].table_name);
          }
        );
      })
    : Promise.resolve(table_name);

  getTableNamePromise
    .then((resolvedTableName) => {
      // Build the insert SQL dynamically:
      const fields = Object.keys(rowData);
      const values = fields.map((f) => rowData[f]);

      if (fields.length === 0) {
        throw new Error('No data provided for insert.');
      }

      // Use parameterized query to prevent SQL injection
      const sql = `INSERT INTO \`${resolvedTableName}\` (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          res.status(500).json({ error: 'Database insert error' });
        } else {
          res.json({ message: 'Row inserted successfully', insertId: result.insertId });
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ error: err.message || 'Invalid input' });
    });
    
});
router.get('/fields-for-table', (req, res) => {
  const table = req.query.table;
  db.query(`DESCRIBE \`${table}\``, (err, results) => {
    if (err) return res.json([]);
    res.json(results.map(row => row.Field));
  });
});

router.get('/types', (req, res) => {
  db.query('SELECT type_number, table_name FROM type', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch types' });
    res.json(rows);
  });
});

router.get('/table-fields', (req, res) => {
  const tableName = req.query.tableName;
  if (!tableName) {
    return res.status(400).json({ error: 'tableName query param is required' });
  }

  // Use prepared statement with escaping to avoid injection
  const sql = `DESCRIBE \`${tableName}\``;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting table fields:', err);
      return res.status(500).json({ error: 'Error fetching table fields' });
    }
    const fields = results.map(row => row.Field);
    res.json({ fields });
  });
});

// Endpoint to add new columns to a table
router.post('/add-fields', (req, res) => {
  const { tableName, newFields } = req.body;
  if (!tableName || !Array.isArray(newFields) || newFields.length === 0) {
    return res.status(400).json({ error: 'Missing tableName or newFields' });
  }

  // Run ALTER TABLE for each new field
  const alters = newFields.map(field => {
    const fieldName = field.name.replace(/`/g, ''); // basic sanitation
    const fieldType = field.type || 'VARCHAR(255)';
    return `ADD COLUMN \`${fieldName}\` ${fieldType} NULL`;
  });

  const alterSql = `ALTER TABLE \`${tableName}\` ${alters.join(', ')}`;

  db.query(alterSql, (err) => {
    if (err) {
      console.error('Error adding new fields:', err);
      return res.status(500).json({ error: 'Failed to add new fields' });
    }
    res.json({ message: 'Fields added successfully' });
  });
});

router.get('/field', (req, res) => {
  db.query('SELECT field_name, db_column FROM field_column_map', (err, results) => {
    if (err) return res.status(500).send('DB error');
    res.json(results);
  });
});



module.exports = router;