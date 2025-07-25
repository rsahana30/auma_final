import { useState, useEffect } from 'react';
import axios from 'axios';

function RFQConfig() {
  const [fieldName, setFieldName] = useState('');
  const [valueInputs, setValueInputs] = useState(['']); // Starts with one value row
  const [savedData, setSavedData] = useState([]);

  // Fetch all saved data for display
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/level1/data');
      setSavedData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Add an empty value input row
  const addInputRow = () => setValueInputs([...valueInputs, '']);

  // Remove a value input row by index
  const removeInputRow = idx => setValueInputs(valueInputs.length > 1
    ? valueInputs.filter((_, i) => i !== idx)
    : valueInputs // Prevent removing last
  );

  // Handle value change in a specific input
  const handleValueChange = (idx, val) => {
    const newInputs = [...valueInputs];
    newInputs[idx] = val;
    setValueInputs(newInputs);
  };

  // Save all non-empty values for the field
  const saveAll = async () => {
    const field = fieldName.trim();
    if (!field) {
      alert('Please enter a field name.');
      return;
    }
    const nonEmptyValues = valueInputs.map(v => v.trim()).filter(v => v);
    if (nonEmptyValues.length === 0) {
      alert('Please enter at least one value.');
      return;
    }
    try {
      // Create mapping if new field, ignore 409 for existing
      await axios.post('http://localhost:5000/api/fields', { fieldName: field })
        .catch(err => {
          if (!(err.response && err.response.status === 409)) throw err;
        });
      for (const val of nonEmptyValues) {
        await axios.post('http://localhost:5000/api/level1', { [field]: val });
      }
      alert(`Saved ${nonEmptyValues.length} values for "${field}"`);
      setValueInputs(['']);
      setFieldName('');
      fetchData();
    } catch (err) {
      alert('Error while saving values!');
      console.error(err);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-primary text-center">Add Multiple Values for a Field</h2>

      {/* Field Name */}
      <div className="mb-3">
        <label className="form-label">Field Name</label>
        <input
          className="form-control"
          placeholder="e.g. ValveType"
          value={fieldName}
          onChange={e => setFieldName(e.target.value)}
        />
      </div>

      {/* Dynamic Value Inputs */}
      <label className="form-label">Values</label>
      {valueInputs.map((val, idx) => (
        <div className="d-flex mb-2" key={idx}>
          <input
            type="text"
            className="form-control"
            placeholder={`Enter value #${idx + 1}`}
            value={val}
            onChange={e => handleValueChange(idx, e.target.value)}
          />
          {/* Allow remove only if more than one input */}
          {valueInputs.length > 1 && (
            <button
              type="button"
              className="btn btn-outline-danger ms-2"
              title="Remove this value"
              onClick={() => removeInputRow(idx)}
            >
              &times;
            </button>
          )}
        </div>
      ))}

      <button type="button" className="btn btn-outline-primary me-2" onClick={addInputRow}>
        + Add Value
      </button>

      <button
        className="btn btn-success"
        onClick={saveAll}
        disabled={!fieldName.trim() || valueInputs.every(v => !v.trim())}
      >
        Save All
      </button>

      <hr />

      {/* Display Saved Data */}
      <h3 className="mb-4 text-center">Saved Records</h3>
      {savedData.length === 0 ? (
        <p className="text-muted text-center fs-5">No data available.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {savedData.map((record) => (
            <div key={record.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  {Object.entries(record).map(([key, val]) => key !== 'id' &&
                    <p key={`${record.id}-${key}`} className="mb-2">
                      <strong className="text-secondary text-capitalize">{key}:</strong> {val}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RFQConfig;
