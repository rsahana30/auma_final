import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const Linear = ({ rfqNo, customerId, productGroupId }) => {
  const [form, setForm] = useState({
    itemNo: "",
    valveType: "Globe Valve",
    valveSize: "",
    valveThrust: "",
    stroke: "",
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

    const payload = {
      ...form,
      rfqNo,
      customerId,
      productGroupId
    };

    try {
      const res = await axios.post("http://localhost:5000/api/type3", payload);
      setResult(res.data);
    } catch (err) {
      console.error("Error saving Linear Valve:", err);
      alert("Failed to save RFQ.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card p-4">
        <h5 className="mb-3">Type 3: Linear Valve (Globe/Control)</h5>
        <input className="form-control mb-2" name="itemNo" placeholder="Item No" onChange={handleChange} />
        <select className="form-control mb-2" name="valveType" value={form.valveType} onChange={handleChange}>
          <option value="Globe Valve">Globe Valve</option>
          <option value="Control Valve">Control Valve</option>
        </select>
        <input className="form-control mb-2" name="valveSize" placeholder="Valve Size" onChange={handleChange} />
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
