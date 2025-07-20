import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const MultiTurn = ({ rfqNo, customerId, productGroupId }) => {
  const [forms, setForms] = useState([
    {
      itemNo: "",
      valveType: "Gate Valve",
      valveSize: "",
      valveThrust: "",
      mast: "",
      safetyFactor: 1.2,
    },
  ]);
  const [results, setResults] = useState([]);

  const handleChange = (i, e) => {
    const copy = [...forms];
    copy[i][e.target.name] = e.target.value;
    setForms(copy);
  };

  const addRow = () => {
    setForms([
      ...forms,
      {
        itemNo: "",
        valveType: "Gate Valve",
        valveSize: "",
        valveThrust: "",
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
          axios.post("http://localhost:5000/api/type2", {
            ...form,
            rfqNo,
            customerId,
            productGroupId,
          })
        )
      );
      setResults(res.map((r) => r.data));
    } catch (err) {
      console.error("Submit failed", err);
      alert("Submit failed.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Item No</th>
              <th>Valve Type</th>
              <th>Valve Size</th>
              <th>Valve Thrust (N)</th>
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
                    <option>Gate Valve</option>
                    <option>Globe Valve</option>
                  </select>
                </td>
                <td><input className="form-control" name="valveSize" value={form.valveSize} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" name="valveThrust" value={form.valveThrust} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" name="mast" value={form.mast} onChange={(e) => handleChange(i, e)} /></td>
                <td><input className="form-control" readOnly value={form.safetyFactor} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn btn-outline-primary" onClick={addRow}>+ Add Row</button>
        <button className="btn btn-success ms-2" type="submit">Submit All</button>
      </form>

      {results.map((res, i) => (
        <SETable key={i} result={res} />
      ))}
    </div>
  );
};

export default MultiTurn;
