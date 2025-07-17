// ExcelUpload.js
import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import SETable from "../components/SETable";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [results, setResults] = useState([]);

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

        try {
          let type = row.valveType;
          if (!type || !["type1", "type2", "type3", "type4"].includes(type)) {
            console.warn("Invalid or missing valveType in row", row);
            continue;
          }
          console.log("Sending row:", row);
          const response = await axios.post(`http://localhost:5000/api/${type}`, row);
          console.log("✅ Uploaded:", response.data);
          successCount++;
          allResults.push(response.data);
        } catch (err) {
          console.error("❌ Upload failed for row:", row, err.message);
        }
      }

      setUploadStatus(`${successCount} rows successfully processed.`);
      setResults(allResults);
    };
    reader.readAsArrayBuffer(file);
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
