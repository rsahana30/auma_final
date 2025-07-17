// RFQ.js
import React, { useState } from "react";
import ExcelUpload from "../components/ExcelUpload";
import PartTurn from "../Forms/PartTurn";
import MultiTurn from "../Forms/MultiTurn";
import Linear from "../Forms/Linear";
import Lever from "../Forms/Lever";

const RFQ = () => {
  const [mode, setMode] = useState("manual");
  const [valveType, setValveType] = useState("type1");

  const renderForm = () => {
    switch (valveType) {
      case "type1": return <PartTurn />;
      case "type2": return <MultiTurn />;
      case "type3": return <Linear />;
      case "type4": return <Lever />;
      default: return null;
    }
  };

  return (
    <div className="container">
      <h4 className="mb-3">Request for Quotation (RFQ)</h4>

      <div className="btn-group mb-4" role="group">
        <button
          className={`btn btn-${mode === "manual" ? "primary" : "outline-primary"}`}
          onClick={() => setMode("manual")}
        >
          Manual Entry
        </button>
        <button
          className={`btn btn-${mode === "excel" ? "primary" : "outline-primary"}`}
          onClick={() => setMode("excel")}
        >
          Upload Excel
        </button>
      </div>

      {mode === "manual" && (
        <>
          <div className="mb-3">
            <label className="form-label">Select Valve Type</label>
            <select
              className="form-select"
              value={valveType}
              onChange={(e) => setValveType(e.target.value)}
            >
              <option value="type1">Part Turn</option>
              <option value="type2">Multi Turn</option>
              <option value="type3">Linear</option>
              <option value="type4">Lever</option>
            </select>
          </div>
          {renderForm()}
        </>
      )}

      {mode === "excel" && <ExcelUpload/>}
    </div>
  );
};

export default RFQ;
