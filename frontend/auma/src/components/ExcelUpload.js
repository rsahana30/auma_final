// ✅ FRONTEND: ExcelUpload.js

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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Excel for Valve Selection</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block mb-1">Customer</label>
          <select
            name="customer"
            className="border p-2 rounded"
            value={form.customer}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Product Group</label>
          <select
            name="productGroup"
            className="border p-2 rounded"
            value={form.productGroup}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {productGroups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.group_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
        Upload
      </button>

      {uploadStatus && <p className="mt-4 font-semibold">{uploadStatus}</p>}
    </div>
  );
};

export default ExcelUpload;
