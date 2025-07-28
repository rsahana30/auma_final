import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function CreateTable() {
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState(['']);
  const [message, setMessage] = useState('');

  const handleFieldChange = (index, value) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, '']);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const validFields = fields.filter(f => f.trim() !== '');

  if (!tableName.trim() || validFields.length === 0) {
    setMessage('Please enter a table name and at least one valid field.');
    return;
  }

  // Step 1: Call /typesave to get type_number
  fetch('http://localhost:5000/api/typesave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, fields: validFields }),
  })
    .then(res => res.json())
    .then(data => {
      if (!data.type_number) {
        throw new Error(data.error || 'Failed to generate type number');
      }

      const { type_number } = data;

      alert(`Type saved successfully with type number: ${type_number}`);

      // Step 2: Call /api/create-table with type_number included
      return fetch('http://localhost:5000/api/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, fields: validFields, type_number }),
      });
    })
    .then(res => res.json())
    .then(data => {
      setMessage(data.message || data.error || 'Operation completed.');
    })
    .catch(err => setMessage(err.message || 'Server error.'));
};


  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 p-4">
        <h2 className="text-center mb-4">Type Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Type</label>
            <input
              type="text"
              className="form-control"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Fields</label>
            {fields.map((field, index) => (
              <input
                key={index}
                type="text"
                className="form-control mb-2"
                value={field}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                placeholder={`Field #${index + 1}`}
                required
              />
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
            <button type="submit" className="btn btn-success">
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
    </div>
  );
}

export default CreateTable;
