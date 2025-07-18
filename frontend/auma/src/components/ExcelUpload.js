import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import SETable from "../components/SETable";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [results, setResults] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProductGroup, setSelectedProductGroup] = useState("");
  const [rfqNo, setRfqNo] = useState("");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dropdown-data");
        setCustomers(res.data.customers);
        setProductGroups(res.data.productGroups);
      } catch (err) {
        console.error("Dropdown fetch error:", err.message);
      }
    };
    fetchDropdowns();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const normalizeRow = (row) => ({
    itemNo: row["Item No"] || row["itemNo"],
    valveType: row["Valve Type"]?.toLowerCase() || row["valveType"]?.toLowerCase(),
    valveSize: row["Valve Size"] || row["valveSize"],
    valveTorque: row["Valve Torque"] || row["valveTorque"],
    valveThrust: row["Valve Thrust"] || row["valveThrust"],
    stroke: row["Stroke"] || row["stroke"],
    appliedForce: row["Applied Force"] || row["appliedForce"],
    leverArmLength: row["Lever Arm Length"] || row["leverArmLength"],
    mast: row["Mast"] || row["mast"],
    safetyFactor: row["Safety Factor"] || row["safetyFactor"]
  });

  const handleUpload = async () => {
    if (!file) return alert("Please select an Excel file");
    if (!selectedCustomer || !selectedProductGroup) return alert("Please select Customer and Product Group");

    try {
      // Step 1: Generate RFQ Number and store in backend
      const { data } = await axios.post("http://localhost:5000/api/generate-rfq", {
        customerId: selectedCustomer,
        productGroupId: selectedProductGroup
      });
      const generatedRfqNo = data.rfqNo;
      setRfqNo(generatedRfqNo);

      // Step 2: Parse and process Excel
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        const allResults = [];

        for (const rawRow of rows) {
          const row = normalizeRow(rawRow);
          const rowWithMeta = {
            ...row,
            rfqNo: generatedRfqNo,
            customerId: selectedCustomer,
            productGroupId: selectedProductGroup
          };

          try {
            let type = row.valveType;
            if (!type || !["type1", "type2", "type3", "type4"].includes(type)) {
              console.warn("Invalid or missing valveType in row", row);
              continue;
            }

            const response = await axios.post(`http://localhost:5000/api/${type}`, rowWithMeta);
            successCount++;
            allResults.push(response.data);
          } catch (err) {
            console.error("❌ Upload failed for row:", row, err.message);
          }
        }

        setUploadStatus(`${successCount} rows successfully processed.`);
        setResults(allResults);
        alert(`Submitted successfully. Your RFQ Number is ${generatedRfqNo}`);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("RFQ Generation or Upload failed:", err.message);
      alert("Something went wrong during submission.");
    }
  };

  const downloadSample = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        itemNo: "101",
        valveType: "type1",
        valveSize: "80mm",
        valveTorque: 120,
        mast: "M1",
        safetyFactor: 1.3
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "sample_valve_input.xlsx");
  };

  return (
    <div className="border p-4 rounded bg-light">
      <h5>Upload Excel File</h5>

      <div className="mb-3">
        <label className="form-label">Customer</label>
        <select
          className="form-select"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
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
        <label className="form-label">Product Group</label>
        <select
          className="form-select"
          value={selectedProductGroup}
          onChange={(e) => setSelectedProductGroup(e.target.value)}
        >
          <option value="">-- Select Product Group --</option>
          {productGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.group_name}
            </option>
          ))}
        </select>
      </div>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <div className="mt-2">
        <button className="btn btn-primary me-2" onClick={handleUpload}>
          Upload & Process
        </button>
        <button className="btn btn-outline-secondary" onClick={downloadSample}>
          Download Sample Template
        </button>
      </div>

      {uploadStatus && <p className="mt-3 text-success">{uploadStatus}</p>}

      {rfqNo && (
        <div className="alert alert-info mt-4">
          <strong>Generated RFQ No:</strong> {rfqNo}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <h6>Processed Results</h6>
          <SETable result={results} />
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
