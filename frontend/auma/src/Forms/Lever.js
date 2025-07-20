import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const Lever = ({ rfqNo, customerId, productGroupId }) => {
  const [forms, setForms] = useState([
    {
      itemNo: "",
      valveType: "Plug Valve",
      appliedForce: "",
      leverArmLength: "",
      mast: "",
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
        valveType: "Plug Valve",
        appliedForce: "",
        leverArmLength: "",
        mast: "",
        safetyFactor: 1.2,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Promise.all(
        forms.map((form) =>
          axios.post("http://localhost:5000/api/type4", {
            ...form,
            rfqNo,
            customerId,
            productGroupId,
          })
        )
      );
      setResults(res.map((r) => r.data));
    } catch (err) {
      console.error("Error saving Lever Valve:", err);
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
              <th>Applied Force (N)</th>
              <th>Lever Arm Length (mm)</th>
              <th>MAST</th>
              <th>Safety Factor</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form, i) => (
              <tr key={i}>
                <td><input className="form-control" name="itemNo" value={form.itemNo} onChange={(e) => handleChange(i, e)} /></td>
                <td>
                  <select className="form-control" name="valveType" value={form.valveType} onChange={(e) => handleChange(i, e)}>
                    <option>Plug Valve</option>
                    <option>Quarter Turn Valve</option>
                  </select>
                </td>
                <td><input className="form-control" name="appliedForce" value={form.appliedForce} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" name="leverArmLength" value={form.leverArmLength} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" name="mast" value={form.mast} onChange={(e) => handleChange(i, e)} /></td>
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

export default Lever;
