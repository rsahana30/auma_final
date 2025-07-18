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
  const [productGroups, setProductGroups] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [productGroupId, setProductGroupId] = useState("");
  const [rfqNo, setRfqNo] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dropdown-data");
        setCustomers(res.data.customers);
        setProductGroups(res.data.productGroups);
      } catch (err) {
        console.error("Dropdown fetch error:", err.message);
      }
    };
    fetchData();
  }, []);

  const handleGenerateRFQ = async () => {
    if (!customerId || !productGroupId) {
      alert("Please select Customer and Product Group");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/generate-rfq", {
        customerId,
        productGroupId,
      });
      setRfqNo(res.data.rfqNo);
      setShowForm(true);
    } catch (err) {
      console.error("RFQ generation failed:", err.message);
      alert("Failed to generate RFQ number");
    }
  };

  const renderForm = () => {
    const sharedProps = { rfqNo, customerId, productGroupId };
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
    <div className="container">
      <h4 className="mb-3">Request for Quotation (RFQ)</h4>

      <div className="btn-group mb-4" role="group">
        <button className={`btn btn-${mode === "manual" ? "primary" : "outline-primary"}`} onClick={() => setMode("manual")}>
          Manual Entry
        </button>
        <button className={`btn btn-${mode === "excel" ? "primary" : "outline-primary"}`} onClick={() => setMode("excel")}>
          Upload Excel
        </button>
      </div>

      {mode === "manual" && (
        <>
          <div className="mb-3">
            <label className="form-label">Customer</label>
            <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Product Group</label>
            <select className="form-select" value={productGroupId} onChange={(e) => setProductGroupId(e.target.value)}>
              <option value="">-- Select Product Group --</option>
              {productGroups.map((pg) => (
                <option key={pg.id} value={pg.id}>{pg.group_name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Valve Type</label>
            <select className="form-select" value={valveType} onChange={(e) => setValveType(e.target.value)}>
              <option value="type1">Part Turn</option>
              <option value="type2">Multi Turn</option>
              <option value="type3">Linear</option>
              <option value="type4">Lever</option>
            </select>
          </div>

          <button className="btn btn-success" onClick={handleGenerateRFQ}>
            Generate RFQ & Proceed
          </button>

          {showForm && (
            <div className="mt-3">
              <strong>Generated RFQ No:</strong> {rfqNo}
              {renderForm()}
            </div>
          )}
        </>
      )}

      {mode === "excel" && <ExcelUpload />}
    </div>
  );
};

export default RFQ;
