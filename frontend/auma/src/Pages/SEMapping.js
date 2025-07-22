import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";

const SEMapping = () => {
  const [rfqs, setRfqs] = useState([]);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [valveRows, setValveRows] = useState([]);
  const [aumaModels, setAumaModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/se-mapping").then((res) => {
      setRfqs(res.data);
    });
  }, []);

  const handleRFQClick = async (rfq) => {
    try {
      setSelectedRFQ(rfq);
      const res = await axios.get(`http://localhost:5000/api/se-details/${rfq.rfq_no}`);
      const keys = Object.keys(res.data);
      const rows = res.data[keys[0]] || [];
      setValveRows(rows);

      if (!rows.length) {
        alert(`⚠️ No valve rows found for RFQ ${rfq.rfq_no}`);
        return;
      }

      const torque = rows[0]?.valveTorque || rows[0]?.calculatedTorque || 0;

      const modelRes = await axios.get("http://localhost:5000/api/getAumaModels", {
        params: { valveType: keys[0], torque, rfqNo: rfq.rfq_no },
      });

      setAumaModels(modelRes.data);
      setSelectedModels({});
    } catch (err) {
      console.error("❌ Error loading valve rows or AUMA models:", err);
      alert("Failed to load valve rows or AUMA models.");
    }
  };

  const handleModelChange = (rowId, model) => {
    setSelectedModels((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], model },
    }));
  };

  const handleQuantityChange = (rowId, quantity) => {
    setSelectedModels((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], quantity: parseInt(quantity) },
    }));
  };

  const handleSubmit = async () => {
    const payload = valveRows
      .map((row) => ({
        rfqNumber: selectedRFQ.rfq_no,
        valveType: selectedRFQ.type,
        valveId: row.id,
        selectedModel: selectedModels[row.id]?.model,
        quantity: selectedModels[row.id]?.quantity,
      }))
      .filter((row) => row.selectedModel && row.quantity > 0);

    try {
      await axios.post("http://localhost:5000/api/se-mapping/submit", payload);
      alert("✅ Submission successful");
      setSelectedRFQ(null);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("❌ Error saving selection.");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">
        <i className="bi bi-diagram-3-fill me-2"></i> SE Mapping Dashboard
      </h2>

      <div className="row g-3">
        {rfqs.map((rfq) => (
          <div className="col-md-4" key={rfq.rfq_no}>
            <div
              className="card shadow-sm border-0 h-100 cursor-pointer"
              onClick={() => handleRFQClick(rfq)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <h5 className="card-title text-primary">{rfq.rfq_no}</h5>
                <p className="card-text mb-1">
                  <strong>Product Group:</strong> {rfq.product_group_name}
                </p>
                <p className="card-text">
                  <strong>Customer:</strong> {rfq.customer_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRFQ && (
        <div className="modal d-block fade show" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  RFQ: {selectedRFQ.rfq_no} | Type: 
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRFQ(null)}></button>
              </div>

              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-bordered align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Item No</th>
                        <th>Valve Type</th>
                        <th>Size</th>
                        <th>AUMA Model</th>
                        <th>Unit Price</th>
                        <th>Net Weight</th>
                        <th>Description</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valveRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.itemNo}</td>
                          <td>{row.valveType}</td>
                          <td>{row.valveSize}</td>
                          <td>
                            <select
                              className="form-select"
                              value={selectedModels[row.id]?.model || ""}
                              onChange={(e) => handleModelChange(row.id, e.target.value)}
                            >
                              <option value="">-- Select Model --</option>
                              {aumaModels.map((m) => (
                                <option key={m.id || m.modelName} value={m.modelName}>
                                  {m.modelName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {
                              aumaModels.find((m) => m.modelName === selectedModels[row.id]?.model)
                                ?.unitPrice || "-"
                            }
                          </td>
                          <td>
                            {
                              aumaModels.find((m) => m.modelName === selectedModels[row.id]?.model)
                                ?.netWeight || "-"
                            }
                          </td>
                          <td>
                            {
                              aumaModels.find((m) => m.modelName === selectedModels[row.id]?.model)
                                ?.description || "-"
                            }
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control text-center"
                              min={0}
                              value={selectedModels[row.id]?.quantity || ""}
                              onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleSubmit}>
                  <FaCheck className="me-1" /> Submit
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedRFQ(null)}>
                  <FaTimes className="me-1" /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEMapping;
