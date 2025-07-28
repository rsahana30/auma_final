import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelUpload from "../components/ExcelUpload";

function RFQSample() {
  const [mode, setMode] = useState("manual"); // manual or excel
  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // New state for types with mapped data
  const [typesWithData, setTypesWithData] = useState([]);
  const [loadingTypesData, setLoadingTypesData] = useState(false);
  const [typesDataError, setTypesDataError] = useState(null);

  // New states for insert form
  const [types, setTypes] = useState([]); // list of all types (type_number + table_name)
  const [selectedInsertType, setSelectedInsertType] = useState(null); // selected type/table for insertion
  const [insertFields, setInsertFields] = useState([]); // fields (columns) of selected insert table
  const [insertFormData, setInsertFormData] = useState({});
  const [insertMessage, setInsertMessage] = useState("");

  // Fetch all fields on mount for the existing manual mode
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/fields");
        setFields(res.data);
      } catch (err) {
        console.error("Failed to load fields:", err);
      }
    };
    fetchFields();
  }, []);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dropdown-data");
        setCustomers(res.data.customers || []);
      } catch (err) {
        console.error("Failed to load customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch values for each field - only for manual mode and when fields change
  useEffect(() => {
    if (mode !== "manual") return; // skip in excel mode

    fields.forEach(({ field_name }) => {
      if (!fieldValues[field_name]) {
        axios
          .get(
            `http://localhost:5000/api/fields/${encodeURIComponent(
              field_name
            )}/values`
          )
          .then((res) => {
            setFieldValues((prev) => ({ ...prev, [field_name]: res.data }));
          })
          .catch((err) => {
            console.error(`Failed to load values for ${field_name}`, err);
            setFieldValues((prev) => ({ ...prev, [field_name]: [] }));
          });
      }
    });
  }, [fields, fieldValues, mode]);

  // Fetch types with mapped table data on component mount (or you can add a refresh button)
  useEffect(() => {
    const fetchTypesWithData = async () => {
      setLoadingTypesData(true);
      setTypesDataError(null);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/types-with-data" // your backend endpoint
        );
        setTypesWithData(res.data || []);
      } catch (err) {
        console.error("Failed to load types with data:", err);
        setTypesDataError("Failed to load types with data.");
      } finally {
        setLoadingTypesData(false);
      }
    };

    fetchTypesWithData();
  }, []);

  // Fetch all types for insert form on mount
  useEffect(() => {
    const fetchAllTypes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/types");
        setTypes(res.data);
      } catch (err) {
        console.error("Failed to fetch types for insert:", err);
      }
    };
    fetchAllTypes();
  }, []);

  // When selectedInsertType changes, fetch fields (columns) dynamically for that table
  useEffect(() => {
    if (!selectedInsertType) {
      setInsertFields([]);
      setInsertFormData({});
      return;
    }

    const fetchFieldsForTable = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/fields-for-table?table=${encodeURIComponent(selectedInsertType.table_name)}`
        );
        setInsertFields(res.data || []);
        setInsertFormData({}); // Reset form data on changing type
      } catch (err) {
        console.error("Failed to fetch fields for insert form:", err);
        setInsertFields([]);
      }
    };

    fetchFieldsForTable();
  }, [selectedInsertType]);

  // Handlers

  const handleCustomerChange = (e) => {
    setSelectedCustomerId(e.target.value);
  };

  const handleSelectChange = (fieldName, value) => {
    setSelectedValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleInsertTypeChange = (e) => {
    const selected = types.find((t) => t.type_number === e.target.value);
    setSelectedInsertType(selected || null);
    setInsertMessage("");
  };

  const handleInsertInputChange = (field, value) => {
    setInsertFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInsertSubmit = async (e) => {
    e.preventDefault();
    setInsertMessage("");

    if (!selectedInsertType) {
      setInsertMessage("Please select a type/table to insert data.");
      return;
    }

    try {
      const payload = {
        table_name: selectedInsertType.table_name,
        rowData: insertFormData,
      };

      const res = await axios.post("http://localhost:5000/api/insert-row", payload);
      setInsertMessage(res.data.message || "Row inserted successfully.");
      setInsertFormData({});
    } catch (err) {
      setInsertMessage(
        err.response?.data?.error || "Failed to insert row. Try again."
      );
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center text-primary">RFQ - Request For Quotation</h2>

      {/* Mode toggle */}
      <div className="btn-group mb-4" role="group" aria-label="Manual or Excel mode">
        <button
          className={`btn btn-${mode === "manual" ? "primary" : "outline-primary"}`}
          onClick={() => setMode("manual")}
          type="button"
        >
          📝 Manual Entry
        </button>
        <button
          className={`btn btn-${mode === "excel" ? "primary" : "outline-primary"}`}
          onClick={() => setMode("excel")}
          type="button"
        >
          📊 Upload Excel
        </button>
      </div>

      {/* Conditional rendering */}
      {mode === "manual" ? (
        <>
          {/* Customer Dropdown */}
          <div className="mb-4">
            <label htmlFor="customerSelect" className="form-label">
              Select Customer
            </label>
            <select
              id="customerSelect"
              className="form-select"
              value={selectedCustomerId}
              onChange={handleCustomerChange}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields Dropdowns */}
          {fields.length === 0 ? (
            <p></p>
          ) : (
            <form>
              {fields.map(({ field_name }) => (
                <div key={field_name} className="mb-4">
                  <label htmlFor={`select-${field_name}`} className="form-label text-capitalize">
                    {field_name}
                  </label>
                  <select
                    id={`select-${field_name}`}
                    className="form-select"
                    value={selectedValues[field_name] || ""}
                    onChange={(e) => handleSelectChange(field_name, e.target.value)}
                  >
                    <option value="">-- Select {field_name} --</option>
                    {(fieldValues[field_name] || []).map((val, idx) => (
                      <option key={`${field_name}-${val}-${idx}`} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </form>
          )}
        </>
      ) : (
        <div className="mt-3">
          <ExcelUpload />
        </div>
      )}

      {/* ------------------- NEW SECTION: Insert Row Form ------------------- */}

      <hr />

      <div>


        {/* Type selection */}
        <div className="mb-3">
          <label htmlFor="selectTypeInsert" className="form-label">
            Select Type 
          </label>
          <select
            id="selectTypeInsert"
            className="form-select"
            onChange={handleInsertTypeChange}
            value={selectedInsertType?.type_number || ""}
          >
            <option value="">-- Select Type --</option>
            {types.map((t) => (
              <option key={t.type_number} value={t.type_number}>
                 {t.table_name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic input fields for insertion */}
        {insertFields.length > 0 && (
          <form onSubmit={handleInsertSubmit}>
            {insertFields
              .filter(field => field.toLowerCase() !== "id") // exclude id field
              .map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label">{field}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={insertFormData[field] || ""}
                    onChange={(e) => handleInsertInputChange(field, e.target.value)}
                  />
                </div>
              ))
            }

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        )}

        {insertMessage && (
          <div className={`alert mt-3 ${insertMessage.toLowerCase().includes("fail") ? "alert-danger" : "alert-success"}`}>
            {insertMessage}
          </div>
        )}
      </div>

      {/* ------------------- NEW SECTION: Show Saved Types with Data ------------------- */}

      {/* <hr />

      <div>


        {loadingTypesData ? (
          <p>Loading saved types and data...</p>
        ) : typesDataError ? (
          <p className="text-danger">{typesDataError}</p>
        ) : typesWithData.length === 0 ? (
          <p>No saved types found.</p>
        ) : (
          typesWithData.map(({ type_number, table_name, rows }, idx) => (
            <div key={type_number ? type_number : idx} className="mb-5">
              <h3>{table_name}</h3>
              {rows && rows.length > 0 && !rows[0].error ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        {Object.keys(rows[0]).map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {Object.keys(rows[0]).map((col) => (
                            <td key={col}>{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-danger">This table has no data or could not be loaded.</p>
              )}
            </div>
          ))
        )}
      </div> */}
    </div>
  );
}

export default RFQSample;
