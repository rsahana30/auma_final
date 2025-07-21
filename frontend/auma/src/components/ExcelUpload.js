import React, { useEffect, useState } from "react";
import axios from "axios";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [form, setForm] = useState({ customer: "", productGroup: "" });
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/dropdown-data").then((res) => {
      setCustomers(res.data.customers);
      setProductGroups(res.data.productGroups);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !form.customer || !form.productGroup) {
      setUploadStatus("❗ Please select customer, product group and file.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("customer", form.customer);
    data.append("productGroup", form.productGroup);

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

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Customer</label>
          <select
            name="customer"
            className="form-select"
            value={form.customer}
            onChange={handleChange}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Product Group</label>
          <select
            name="productGroup"
            className="form-select"
            value={form.productGroup}
            onChange={handleChange}
          >
            <option value="">-- Select Product Group --</option>
            {productGroups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.group_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Excel File</label>
        <input
          type="file"
          className="form-control"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={handleUpload}
        className="btn btn-success"
      >
        ⬆️ Upload File
      </button>

      {uploadStatus && (
        <div
          style={{ whiteSpace: "pre-line" }}
          role="alert"
          className={`alert mt-4 ${uploadStatus.includes("✅") ? "alert-success" : "alert-danger"
            }`}
        >
          {uploadStatus}
        </div>
      )}

    </div>
  );
};

export default ExcelUpload;
