// Type3.js
import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const Linear = () => {
  const [form, setForm] = useState({
    itemNo: "",
    valveType: "Diaphragm Valve",
    valveSize: "",
    valveThrust: "",
    stroke: "",
    safetyFactor: 1.1
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/type3", form);
      setResult(res.data);
    } catch (error) {
      console.error("Error saving Type 3 RFQ:", error);
      alert("Failed to save RFQ.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card p-4">
        <h5 className="mb-3">Type 3: Linear Valve (Diaphragm)</h5>
        <input className="form-control mb-2" name="itemNo" placeholder="Item No" onChange={handleChange} />
        <input className="form-control mb-2" name="valveType" value="Diaphragm Valve" readOnly />
        <input className="form-control mb-2" name="valveSize" placeholder="Valve Size (mm)" onChange={handleChange} />
        <input className="form-control mb-2" name="valveThrust" placeholder="Valve Thrust (N)" onChange={handleChange} />
        <input className="form-control mb-2" name="stroke" placeholder="Stroke (mm)" onChange={handleChange} />
        <input className="form-control mb-2" name="safetyFactor" value={form.safetyFactor} readOnly />
        <button className="btn btn-success mt-2">Submit</button>
      </form>

      {result && <SETable result={result} />}
    </div>
  );
};

export default Linear;