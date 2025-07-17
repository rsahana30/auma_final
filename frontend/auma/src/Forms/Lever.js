// Type4.js
import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const Lever = () => {
  const [form, setForm] = useState({
    itemNo: "",
    valveType: "Damper Valve",
    appliedForce: "",
    leverArmLength: "",
    mast: "",
    safetyFactor: 1.3
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/type4", form);
      setResult(res.data);
    } catch (error) {
      console.error("Error saving Type 4 RFQ:", error);
      alert("Failed to save RFQ.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card p-4">
        <h5 className="mb-3">Type 4: Lever Operated Valve (Damper)</h5>
        <input className="form-control mb-2" name="itemNo" placeholder="Item No" onChange={handleChange} />
        <input className="form-control mb-2" name="valveType" value="Damper Valve" readOnly />
        <input className="form-control mb-2" name="appliedForce" placeholder="Applied Force (N)" onChange={handleChange} />
        <input className="form-control mb-2" name="leverArmLength" placeholder="Lever Arm Length (m)" onChange={handleChange} />
        <input className="form-control mb-2" name="mast" placeholder="MAST (optional)" onChange={handleChange} />
        <input className="form-control mb-2" name="safetyFactor" value={form.safetyFactor} readOnly />
        <button className="btn btn-success mt-2">Submit</button>
      </form>

      {result && <SETable result={result} />}
    </div>
  );
};

export default Lever;
