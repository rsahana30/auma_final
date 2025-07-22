import React, { useEffect, useState } from "react";
import axios from "axios";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/dropdown-data").then((res) => {
      setCustomers(res.data.customers);
    });
  }, []);

  const handleUpload = async () => {
    if (!file || !customer) {
      setUploadStatus("❗ Please select customer and file.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("customer", customer);

    try {
      const res = await axios.post("http://localhost:5000/api/upload-excel", data);
      setUploadStatus(`✅ Uploaded successfully. RFQ No: ${res.data.rfqNo}`);
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload failed. Check console for details.");
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h5 className="card-title mb-4 text-primary">
        📊 Upload Excel for Valve Selection
      </h5>

      <div className="mb-3">
        <label className="form-label">Customer</label>
        <select
          className="form-select"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        >
          <option value="">-- Select Customer --</option>
          {customers.map((cust) => (
            <option key={cust.id} value={cust.id}>
              {cust.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Excel File</label>
        <input
          type="file"
          className="form-control"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <button className="btn btn-success" onClick={handleUpload}>
        ⬆️ Upload File
      </button>

      {uploadStatus && (
        <div
          className={`alert mt-4 ${uploadStatus.includes("✅") ? "alert-success" : "alert-danger"}`}
          style={{ whiteSpace: "pre-line" }}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
