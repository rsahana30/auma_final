import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const Linear = ({ rfqNo, customerId }) => {
  const [forms, setForms] = useState([
    {
      itemNo: "",
      valveType: "Globe Valve",
      valveSize: "",
      valveThrust: "",
      stroke: "",
      safetyFactor: 1.2,
    },
  ]);
  const [results, setResults] = useState([]);

  const handleChange = (i, e) => {
    const updated = [...forms];
    updated[i][e.target.name] = e.target.value;
    setForms(updated);
  };

  const addRow = () => {
    setForms([
      ...forms,
      {
        itemNo: "",
        valveType: "Globe Valve",
        valveSize: "",
        valveThrust: "",
        stroke: "",
        safetyFactor: 1.2,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Promise.all(
        forms.map((form) =>
          axios.post("http://localhost:5000/api/type3", {
            ...form,
            rfqNo,
            customerId,
          })
        )
      );
      setResults(res.map((r) => r.data));
    } catch (err) {
      console.error("Error saving Linear Valve:", err);
      alert("Failed to save one or more rows.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>Item No</th>
              <th>Valve Type</th>
              <th>Valve Size</th>
              <th>Valve Thrust (N)</th>
              <th>Stroke (mm)</th>
              <th>Safety Factor</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form, i) => (
              <tr key={i}>
                <td><input className="form-control" name="itemNo" value={form.itemNo} onChange={(e) => handleChange(i, e)} /></td>
                <td>
                  <select className="form-control" name="valveType" value={form.valveType} onChange={(e) => handleChange(i, e)}>
                    <option>Globe Valve</option>
                    <option>Control Valve</option>
                  </select>
                </td>
                <td><input className="form-control" name="valveSize" value={form.valveSize} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" name="valveThrust" value={form.valveThrust} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" name="stroke" value={form.stroke} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" readOnly value={form.safetyFactor} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={addRow}>+ Add Row</button>
          <button type="submit" className="btn btn-success">Submit All</button>
        </div>
      </form>

      <div className="mt-4">
        {results.map((res, i) => (
          <SETable key={i} result={res} />
        ))}
      </div>
    </div>
  );
};

export default Linear;
