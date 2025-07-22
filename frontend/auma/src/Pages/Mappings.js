import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AumaModelSelector from "./AumaModelSelector"; // Adjust path as needed

const Mappings = () => {
  const { rfqNo } = useParams();
  const [valveData, setValveData] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/se-mapping/details/${rfqNo}`)
      .then((res) => setValveData(res.data))
      .catch((err) => console.error("Error fetching mapping data", err));
  }, [rfqNo]);

  const handleInputChange = (index, field, value) => {
    const updated = [...valveData];
    updated[index][field] = value;
    setValveData(updated);
  };

  const handleAumaModelSelect = (index, selectedModel) => {
    const updated = [...valveData];
    updated[index].auma_model = selectedModel.modelName;
    updated[index].netWeight = selectedModel.netWeight;
    updated[index].unitPrice = selectedModel.unitPrice;
    updated[index].country = selectedModel.country;
    setValveData(updated);
  };

  return (
    <div className="container mt-4">
      <h2>RFQ Mappings for {rfqNo}</h2>
      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>Valve Type</th>
            <th>Valve Size (mm)</th>
            <th>Type</th>
            <th>Torque (Nm)</th>
            <th>Quantity</th>
            <th>AUMA Model</th>
            <th>Net Weight</th>
            <th>Unit Price</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {valveData.map((row, index) => (
            <tr key={index}>
              <td>{row.valveType}</td>
              <td>{row.valveSize}</td>
              <td>{row.type}</td>
              <td>{row.total}</td>
              <td>
                <input
                  type="number"
                  value={row.quantity || ""}
                  onChange={(e) =>
                    handleInputChange(index, "quantity", e.target.value)
                  }
                  className="form-control"
                />
              </td>
              <td>
                <AumaModelSelector
                  valveType={row.type}
                  total={parseFloat(row.total)}
                  onSelect={(model) => handleAumaModelSelect(index, model)}
                />
                <div className="small text-muted mt-1">
                  {row.auma_model ? row.auma_model : "No model selected"}
                </div>
              </td>
              <td>
                <input
                  type="text"
                  value={row.netWeight || ""}
                  readOnly
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.unitPrice || ""}
                  readOnly
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.country || ""}
                  readOnly
                  className="form-control"
                />
              </td>
              <td><button
  className="btn btn-success mt-3"
  onClick={() => {
    axios
      .post("http://localhost:5000/api/se-mapping/save", {
        rfqNo,
        mappings: valveData,
      })
      .then(() => alert("Mappings saved successfully!"))
      .catch((err) => {
        console.error("Error saving mappings", err);
        alert("Failed to save mappings");
      });
  }}
>
  Save Mappings
</button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Mappings;
