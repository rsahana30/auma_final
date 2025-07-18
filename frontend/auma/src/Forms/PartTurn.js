import React, { useState, useEffect } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const PartTurn = ({ rfqNo, customerId, productGroupId }) => {
  const [form, setForm] = useState({
    itemNo: "",
    valveType: "Ball Valve",
    valveSize: "",
    valveTorque: "",
    mast: "",
    safetyFactor: 1.2
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rfqNo || !customerId || !productGroupId) {
      alert("Missing RFQ info. Please regenerate RFQ.");
      return;
    }

    try {
      const payload = {
        ...form,
        rfqNo,
        customerId,
        productGroupId
      };

      const res = await axios.post("http://localhost:5000/api/type1", payload);
      setResult(res.data);
    } catch (error) {
      console.error("Error saving Type 1 RFQ:", error);
      alert("Failed to save RFQ.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card p-4">
        <h5 className="mb-3">Type 1: Part-Turn Valve (Ball/Butterfly)</h5>
        <input className="form-control mb-2" name="itemNo" placeholder="Item No" onChange={handleChange} />
        <select className="form-control mb-2" name="valveType" value={form.valveType} onChange={handleChange}>
          <option value="Ball Valve">Ball Valve</option>
          <option value="Butterfly Valve">Butterfly Valve</option>
        </select>
        <input className="form-control mb-2" name="valveSize" placeholder="Valve Size (mm)" onChange={handleChange} />
        <input className="form-control mb-2" name="valveTorque" placeholder="Valve Torque (Nm)" onChange={handleChange} />
        <input className="form-control mb-2" name="mast" placeholder="MAST (optional)" onChange={handleChange} />
        <input className="form-control mb-2" name="safetyFactor" value={form.safetyFactor} readOnly />
        <button className="btn btn-success mt-2">Submit</button>
      </form>

      {result && <SETable result={result} />}
    </div>
  );
};

export default PartTurn;
