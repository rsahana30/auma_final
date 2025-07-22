import React, { useState } from "react";
import axios from "axios";
import SETable from "../components/SETable";

const PartTurn = ({ rfqNo, customerId }) => {
  const [forms, setForms] = useState([
    {
      itemNo: "",
      valveType: "Ball Valve",
      valveSize: "",
      valveTorque: "",
      mast: "",
      safetyFactor: 1.2,
    },
  ]);

  const [results, setResults] = useState([]);

  const handleChange = (index, e) => {
    const newForms = [...forms];
    newForms[index][e.target.name] = e.target.value;
    setForms(newForms);
  };

  const handleAddRow = () => {
    setForms([
      ...forms,
      {
        itemNo: "",
        valveType: "Ball Valve",
        valveSize: "",
        valveTorque: "",
        mast: "",
        safetyFactor: 1.2,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rfqNo || !customerId) {
      alert("Missing RFQ info. Please regenerate RFQ.");
      return;
    }

    try {
      const responses = await Promise.all(
        forms.map((form) =>
          axios.post("http://localhost:5000/api/type1", {
            ...form,
            rfqNo,
            customerId,
            type: "PartTurn",
          })
        )
      );
      setResults(responses.map((r) => r.data));
      alert("All products saved successfully!");
    } catch (error) {
      console.error("Error saving RFQ forms:", error);
      alert("Failed to save one or more products.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead>
              <tr>
                <th>Item No</th>
                <th>Valve Type</th>
                <th>Valve Size (mm)</th>
                <th>Valve Torque (Nm)</th>
                <th>MAST</th>
                <th>Safety Factor</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form, index) => (
                <tr key={index}>
                  <td><input type="text" name="itemNo" className="form-control" value={form.itemNo} onChange={(e) => handleChange(index, e)} /></td>
                  <td>
                    <select name="valveType" className="form-control" value={form.valveType} onChange={(e) => handleChange(index, e)}>
                      <option value="Ball Valve">Ball Valve</option>
                      <option value="Butterfly Valve">Butterfly Valve</option>
                    </select>
                  </td>
                  <td><input type="text" name="valveSize" className="form-control" value={form.valveSize} onChange={(e) => handleChange(index, e)} /></td>
                  <td><input type="text" name="valveTorque" className="form-control" value={form.valveTorque} onChange={(e) => handleChange(index, e)} /></td>
                  <td><input type="text" name="mast" className="form-control" value={form.mast} onChange={(e) => handleChange(index, e)} /></td>
                  <td><input type="number" name="safetyFactor" className="form-control" value={form.safetyFactor} readOnly /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={handleAddRow}>+ Add Row</button>
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

export default PartTurn;
