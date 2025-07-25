import { useState, useEffect } from 'react';
import axios from 'axios';

function DeleteFields() {
  const [fieldMappings, setFieldMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all field mappings
  const fetchFieldMappings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/field'); // Make sure backend GET /api/fields exists
      setFieldMappings(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load field mappings');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFieldMappings();
  }, []);

  // Delete field mapping and clear associated column data
  const deleteFieldMapping = async (fieldName) => {
    if (!window.confirm(`Are you sure you want to delete the field "${fieldName}" and all its associated data? This cannot be undone.`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/fields/${encodeURIComponent(fieldName)}`);
      alert(`Field "${fieldName}" deleted successfully!`);
      fetchFieldMappings(); // Refresh to show latest mappings
    } catch (err) {
      alert('Failed to delete field mapping.');
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
      <h2>Manage Field Mappings</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && fieldMappings.length === 0 && <p>No field mappings found.</p>}

      <div className="list-group">
        {fieldMappings.map(({ field_name, db_column }) => (
          <div key={field_name} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{field_name}</strong> <small className="text-muted">(Column: {db_column})</small>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteFieldMapping(field_name)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeleteFields;
