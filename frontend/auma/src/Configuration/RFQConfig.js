import { useState, useEffect } from 'react';
import axios from 'axios';

function RFQConfig() {
  const [fieldName, setFieldName] = useState('');
  const [valueInputs, setValueInputs] = useState(['']);
  const [savedData, setSavedData] = useState([]);
  const [groupedData, setGroupedData] = useState({});

  const [editingField, setEditingField] = useState(null);
  const [editingValues, setEditingValues] = useState(['']);

  // Type Configuration states
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState(['']);
  const [message, setMessage] = useState('');

  // Extra Fields Addition states
  const [existingTableName, setExistingTableName] = useState('');
  const [existingFields, setExistingFields] = useState([]);
  const [extraFields, setExtraFields] = useState(['']);
  const [extraFieldsMessage, setExtraFieldsMessage] = useState('');
  const [loadingFields, setLoadingFields] = useState(false);

  // Handlers for new fields (Type Configuration)
  const handleFieldChange = (idx, val) => {
    const newFields = [...fields];
    newFields[idx] = val;
    setFields(newFields);
  };
  const addField = () => setFields([...fields, '']);
  const removeField = (idx) => {
    if (fields.length > 1) {
      const newFields = [...fields];
      newFields.splice(idx, 1);
      setFields(newFields);
    }
  };

  // Submit handler for type config (create table)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validFields = fields.filter(f => f.trim() !== '');
    if (!tableName.trim() || validFields.length === 0) {
      setMessage('Please enter a table name and at least one valid field.');
      return;
    }
    try {
      const res1 = await fetch('http://localhost:5000/api/typesave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, fields: validFields }),
      });
      const data1 = await res1.json();
      if (!data1.type_number) throw new Error(data1.error || 'Failed to generate type number');

      alert(`Type saved successfully with type number: ${data1.type_number}`);

      const res2 = await fetch('http://localhost:5000/api/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, fields: validFields, type_number: data1.type_number }),
      });
      const data2 = await res2.json();
      setMessage(data2.message || data2.error || 'Operation completed.');
    } catch (err) {
      setMessage(err.message || 'Server error.');
    }
  };

  // Group data helper
  const groupDataByField = (data) => {
    const grouped = {};
    data.forEach(item => {
      const [field, value] = Object.entries(item)[0];
      if (!grouped[field]) grouped[field] = [];
      grouped[field].push(value);
    });
    return grouped;
  };

  // Fetch saved data
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/level1/data');
      setSavedData(res.data);
      setGroupedData(groupDataByField(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // New field value handlers (Create New Field - RFQ)
  const addInputRow = () => setValueInputs([...valueInputs, '']);
  const removeInputRow = idx => valueInputs.length > 1 && setValueInputs(valueInputs.filter((_, i) => i !== idx));
  const handleValueChange = (idx, val) => {
    let copy = [...valueInputs];
    copy[idx] = val;
    setValueInputs(copy);
  };

  // Save new field values (Create New Field - RFQ)
  const saveAll = async () => {
    const field = fieldName.trim();
    if (!field) return alert('Please enter a field name.');
    const nonEmptyValues = valueInputs.map(v => v.trim()).filter(v => v);
    if (nonEmptyValues.length === 0) return alert('Please enter at least one value.');

    try {
      await axios.post('http://localhost:5000/api/fields', { fieldName: field }).catch(err => {
        if (!(err.response && err.response.status === 409)) throw err;
      });
      for (const val of nonEmptyValues) {
        await axios.post('http://localhost:5000/api/level1', { [field]: val });
      }
      alert(`Saved ${nonEmptyValues.length} values for "${field}"`);
      setFieldName('');
      setValueInputs(['']);
      fetchData();
    } catch (err) {
      alert('Error while saving values!');
      console.error(err);
    }
  };

  // Editing handlers
  const handleEditField = (field, values) => {
    setEditingField(field);
    setEditingValues([...values, '']);
  };
  const handleEditValueChange = (idx, val) => {
    let copy = [...editingValues];
    copy[idx] = val;
    setEditingValues(copy);
  };
  const addEditInputRow = () => setEditingValues([...editingValues, '']);
  const removeEditInputRow = idx => editingValues.length > 1 && setEditingValues(editingValues.filter((_, i) => i !== idx));
  const saveEditedValues = async () => {
    const trimmedValues = editingValues.map(v => v.trim()).filter(v => v);
    const existingValues = groupedData[editingField] || [];
    const newValues = trimmedValues.filter(v => !existingValues.includes(v));
    if (newValues.length === 0) return alert('No new values to save.');

    try {
      for (const val of newValues) {
        await axios.post('http://localhost:5000/api/level1', { [editingField]: val });
      }
      alert(`Saved ${newValues.length} new values for "${editingField}"`);
      setEditingField(null);
      setEditingValues(['']);
      fetchData();
    } catch (err) {
      alert('Error while saving values!');
      console.error(err);
    }
  };

  // -- Extra Fields Addition Handlers --

  // Load existing fields of a table from backend
  const loadExistingFields = async () => {
    if (!existingTableName.trim()) {
      setExtraFieldsMessage('Please enter a table name.');
      setExistingFields([]);
      setExtraFields(['']);
      return;
    }
    setLoadingFields(true);
    setExtraFieldsMessage('');
    setExistingFields([]);
    setExtraFields(['']);
    try {
      const res = await fetch(`http://localhost:5000/api/table-fields?tableName=${encodeURIComponent(existingTableName.trim())}`);
      if (!res.ok) {
        throw new Error('Table not found or error fetching fields.');
      }
      const data = await res.json();
      if (!Array.isArray(data.fields)) {
        throw new Error('Invalid response format.');
      }
      setExistingFields(data.fields);
      setExtraFields(['']);
      setExtraFieldsMessage('Fields loaded. You can add extra fields now.');
    } catch (err) {
      setExtraFieldsMessage(err.message || 'Error fetching fields.');
    } finally {
      setLoadingFields(false);
    }
  };

  // Handlers for extra fields dynamic input
  const handleExtraFieldChange = (idx, val) => {
    const newExtraFields = [...extraFields];
    newExtraFields[idx] = val;
    setExtraFields(newExtraFields);
  };
  const addExtraFieldInput = () => setExtraFields([...extraFields, '']);
  const removeExtraFieldInput = (idx) => {
    if (extraFields.length > 1) {
      const newExtraFields = [...extraFields];
      newExtraFields.splice(idx, 1);
      setExtraFields(newExtraFields);
    }
  };

  // Submit new extra fields to backend
  const addExtraFields = async () => {
    const trimmedTable = existingTableName.trim();
    const trimmedFields = extraFields.map(f => f.trim()).filter(f => f);
    // Validate non-empty fields and that they don't already exist
    const filteredNewFields = trimmedFields.filter(f => !existingFields.includes(f));
    if (!trimmedTable) {
      alert('Please enter the existing table name.');
      return;
    }
    if (filteredNewFields.length === 0) {
      alert('No new fields to add or all fields already exist.');
      return;
    }

    // Prepare field objects with default type (you can extend UI later to choose type)
    const newFieldsPayload = filteredNewFields.map(f => ({ name: f, type: 'VARCHAR(255)' }));

    try {
      const res = await fetch('http://localhost:5000/api/add-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: trimmedTable, newFields: newFieldsPayload }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add fields');
      }
      alert(data.message || 'Fields added successfully');
      // Refresh existing fields in UI
      loadExistingFields();
      setExtraFields(['']);
    } catch (err) {
      alert(err.message || 'Error adding new fields');
    }
  };


  return (
    <div className="container my-5">
      <h1 className="mb-5 text-center text-primary fw-bold">RFQ Configuration</h1>

      {/* Create New Field Section */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h4 className="card-title text-secondary mb-4">Create New Field</h4>

          <label htmlFor="fieldName" className="form-label fw-semibold">
            Field Name
          </label>
          <input
            id="fieldName"
            type="text"
            className="form-control mb-3"
            placeholder="e.g., ValveType"
            value={fieldName}
            onChange={e => setFieldName(e.target.value)}
            disabled={editingField !== null}
          />

          <label className="form-label fw-semibold">Values</label>
          {valueInputs.map((val, idx) => (
            <div className="input-group mb-2" key={idx}>
              <input
                type="text"
                className="form-control"
                placeholder={`Enter value #${idx + 1}`}
                value={val}
                onChange={e => handleValueChange(idx, e.target.value)}
                disabled={editingField !== null}
              />
              {valueInputs.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeInputRow(idx)}
                  disabled={editingField !== null}
                  title="Remove this value"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <div className="d-flex mb-3">
            <button
              type="button"
              className="btn btn-outline-primary me-3"
              onClick={addInputRow}
              disabled={editingField !== null}
            >
              + Add Value
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={saveAll}
              disabled={editingField !== null || !fieldName.trim() || valueInputs.every(v => !v.trim())}
            >
              Save All
            </button>
          </div>
        </div>
      </div>

      {/* Display Grouped Saved Data */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h4 className="card-title text-secondary mb-4">Saved Fields & Values</h4>
          {Object.keys(groupedData).length === 0 ? (
            <p className="text-muted fst-italic">No saved data yet.</p>
          ) : (
            Object.entries(groupedData).map(([field, values]) => (
              <div key={field} className="d-flex align-items-center mb-3">
                <strong className="me-3">{field}:</strong>
                <div className="flex-grow-1 text-truncate" style={{ maxWidth: '60%' }}>
                  [{values.join(', ')}]
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary ms-3"
                  onClick={() => handleEditField(field, values)}
                  disabled={editingField !== null}
                >
                  Add More Values
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Existing Field Values */}
      {editingField && (
        <div className="card shadow-sm mb-5 p-4">
          <h4 className="text-secondary mb-3">Adding Values for: <span className="text-primary">{editingField}</span></h4>
          {editingValues.map((val, idx) => (
            <div className="input-group mb-2" key={idx}>
              <input
                type="text"
                className="form-control"
                placeholder={`Enter value #${idx + 1}`}
                value={val}
                onChange={e => handleEditValueChange(idx, e.target.value)}
              />
              {editingValues.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  title="Remove this value"
                  onClick={() => removeEditInputRow(idx)}
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <div>
            <button type="button" className="btn btn-outline-primary me-3" onClick={addEditInputRow}>
              + Add Value
            </button>
            <button
              type="button"
              className="btn btn-success me-3"
              onClick={saveEditedValues}
              disabled={editingValues.every(v => !v.trim())}
            >
              Save Values
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingField(null);
                setEditingValues(['']);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Type Configuration Section */}
      <div className="card shadow-sm p-4 mb-5">
        <h2 className="text-center mb-4 text-primary fw-bold">Type Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tableName" className="form-label fw-semibold">
              Type
            </label>
            <input
              type="text"
              id="tableName"
              className="form-control"
              placeholder="Enter table name"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Fields</label>
            {fields.map((field, idx) => (
              <div className="input-group mb-2" key={idx}>
                <input
                  type="text"
                  className="form-control"
                  value={field}
                  onChange={e => handleFieldChange(idx, e.target.value)}
                  placeholder={`Field #${idx + 1}`}
                  required
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeField(idx)}
                    title="Remove this field"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-primary mt-2"
              onClick={addField}
            >
              + Add More Field
            </button>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-success btn-lg">
              Create Table
            </button>
          </div>
        </form>
        {message && (
          <div className="alert alert-info mt-4 text-center" role="alert">
            {message}
          </div>
        )}
      </div>

      {/* Add Extra Fields to Existing Table Section */}
      <div className="card shadow-sm p-4 mb-5">
        <h2 className="text-center mb-4 text-primary fw-bold">Add Extra Fields to Existing Table</h2>

        <div className="mb-3">
          <label htmlFor="existingTableName" className="form-label fw-semibold">
            Existing Table Name
          </label>
          <div className="input-group">
            <input
              type="text"
              id="existingTableName"
              className="form-control"
              placeholder="Enter existing table name"
              value={existingTableName}
              onChange={e => setExistingTableName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={loadExistingFields}
              disabled={loadingFields || !existingTableName.trim()}
            >
              {loadingFields ? 'Loading...' : 'Load Fields'}
            </button>
          </div>
          {extraFieldsMessage && <div className="text-info mt-2">{extraFieldsMessage}</div>}
        </div>

        {existingFields.length > 0 && (
          <>
            <div className="mb-3">
              <label className="form-label fw-semibold">Current Fields in &quot;{existingTableName}&quot;</label>
              <ul>
                {existingFields.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Add New Fields</label>
              {extraFields.map((field, idx) => (
                <div className="input-group mb-2" key={idx}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`New field #${idx + 1}`}
                    value={field}
                    onChange={e => handleExtraFieldChange(idx, e.target.value)}
                  />
                  {extraFields.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeExtraFieldInput(idx)}
                      title="Remove this field"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary mt-2"
                onClick={addExtraFieldInput}
              >
                + Add More Field
              </button>
            </div>

            <div className="d-grid">
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={addExtraFields}
                disabled={extraFields.every(f => !f.trim())}
              >
                Add Fields to Table
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RFQConfig;
