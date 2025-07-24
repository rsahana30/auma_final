import { useState, useEffect } from 'react';
import axios from 'axios';

function RFQConfig() {
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [savedData, setSavedData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/level1/data');
      setSavedData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createField = async () => {
    if (!field) {
      alert('Please enter a field name.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/fields', { fieldName: field });
      alert('Field mapped!');
    } catch (error) {
      alert('Error creating field mapping.');
      console.error(error);
    }
  };

  const saveValue = async () => {
    if (!field || !value) {
      alert('Please enter both field name and value.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/level1', { [field]: value });
      alert('Value saved!');
      setField('');
      setValue('');
      fetchData();
    } catch (error) {
      alert('Error saving value.');
      console.error(error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-primary">RFQ Configuration </h2>
      
      <div className="row g-3 align-items-end">
        <div className="col-md-5">
          <label htmlFor="fieldName" className="form-label">Field Name</label>
          <input
            id="fieldName"
            type="text"
            className="form-control"
            value={field}
            onChange={e => setField(e.target.value)}
            placeholder="Enter field name"
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-outline-primary" onClick={createField}>
            Create Field
          </button>
        </div>
      </div>

      <div className="row g-3 align-items-end mt-3">
        <div className="col-md-5">
          <label htmlFor="fieldValue" className="form-label">Value</label>
          <input
            id="fieldValue"
            type="text"
            className="form-control"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter value"
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-success" onClick={saveValue}>
            Save Value
          </button>
        </div>
      </div>

      <hr className="my-4" />

      <h3>Saved Records</h3>
      {savedData.length === 0 ? (
        <p className="text-muted">No data available.</p>
      ) : (
        <div className="row">
          {savedData.map(record => (
            <div key={record.id} className="col-md-6 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  {Object.entries(record).map(([key, val]) => {
                    if (key === 'id') return null;
                    return (
                      <p key={key} className="mb-1">
                        <strong className="text-secondary">{key}</strong>: {val}
                      </p>
                    );
                  })}
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
