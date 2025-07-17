// Type2.js
import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const MultiTurn = () => {
  const [form, setForm] = useState({
    itemNo: "",
    valveType: "Gate Valve",
    valveSize: "",
    valveThrust: "",
    mast: "",
    safetyFactor: 1.25
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/type2", form);
      setResult(res.data);
    } catch (error) {
      console.error("Error saving Type 2 RFQ:", error);
      alert("Failed to save RFQ.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card p-4">
        <h5 className="mb-3">Type 2: Multi-Turn Valve (Gate/Globe)</h5>
        <input className="form-control mb-2" name="itemNo" placeholder="Item No" onChange={handleChange} />
        <select className="form-control mb-2" name="valveType" onChange={handleChange}>
          <option>Gate Valve</option>
          <option>Globe Valve</option>
        </select>
        <input className="form-control mb-2" name="valveSize" placeholder="Valve Size (mm)" onChange={handleChange} />
        <input className="form-control mb-2" name="valveThrust" placeholder="Valve Thrust (N)" onChange={handleChange} />
        <input className="form-control mb-2" name="mast" placeholder="MAST (optional)" onChange={handleChange} />
        <input className="form-control mb-2" name="safetyFactor" value={form.safetyFactor} readOnly />
        <button className="btn btn-success mt-2">Submit</button>
      </form>

      {result && <SETable result={result} />}
    </div>
  );
};

export default MultiTurn;
