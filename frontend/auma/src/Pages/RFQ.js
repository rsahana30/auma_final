import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelUpload from "../components/ExcelUpload";
import PartTurn from "../Forms/PartTurn";
import MultiTurn from "../Forms/MultiTurn";
import Linear from "../Forms/Linear";
import Lever from "../Forms/Lever";

const RFQ = () => {
  const [mode, setMode] = useState("manual");
  const [valveType, setValveType] = useState("type1");
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [rfqNo, setRfqNo] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dropdown-data");
        setCustomers(res.data.customers);
      } catch (err) {
        console.error("Dropdown fetch error:", err.message);
      }
    };
    fetchData();
  }, []);

  const handleGenerateRFQ = async () => {
    if (!customerId) {
      alert("Please select a Customer");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/generate-rfq", {
        customerId,
        productGroupId: null, // No product group
      });
      setRfqNo(res.data.rfqNo);
      setShowForm(true);
    } catch (err) {
      console.error("RFQ generation failed:", err.message);
      alert("Failed to generate RFQ number");
    }
  };

  const valveOptions = [
    { label: "Part Turn", value: "type1" },
    { label: "Multi Turn", value: "type2" },
    { label: "Linear", value: "type3" },
    { label: "Lever", value: "type4" },
  ];

  const renderForm = () => {
    const sharedProps = { rfqNo, customerId };
    switch (valveType) {
      case "type1":
        return <PartTurn {...sharedProps} />;
      case "type2":
        return <MultiTurn {...sharedProps} />;
      case "type3":
        return <Linear {...sharedProps} />;
      case "type4":
        return <Lever {...sharedProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-4">📄 Request for Quotation (RFQ)</h4>

          <div className="btn-group mb-4" role="group">
            <button
              className={`btn btn-${mode === "manual" ? "primary" : "outline-primary"}`}
              onClick={() => setMode("manual")}
            >
              📝 Manual Entry
            </button>
            <button
              className={`btn btn-${mode === "excel" ? "primary" : "outline-primary"}`}
              onClick={() => setMode("excel")}
            >
              📊 Upload Excel
            </button>
          </div>

          {mode === "manual" && (
            <>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Customer</label>
                  <select
                    className="form-select"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={valveType}
                    onChange={(e) => setValveType(e.target.value)}
                  >
                    {valveOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button className="btn btn-success" onClick={handleGenerateRFQ}>
                  ➕ Generate RFQ & Proceed
                </button>
              </div>

              {showForm && (
                <div className="mt-4">
                  <div className="alert alert-info">
                    <strong>Generated RFQ No:</strong> {rfqNo}
                  </div>
                  {renderForm()}
                </div>
              )}
            </>
          )}

          {mode === "excel" && (
            <div className="mt-3">
              <ExcelUpload />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQ;
