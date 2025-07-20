import React, { useEffect, useState } from "react";
import axios from "axios";

const SEMapping = () => {
  const [rfqs, setRfqs] = useState([]);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [valveRows, setValveRows] = useState([]);
  const [aumaModels, setAumaModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState({});

  // Load RFQ list on mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/se-mapping").then((res) => {
      setRfqs(res.data);
    });
  }, []);

  // Handle RFQ Click → Load valve rows & AUMA models
const handleRFQClick = async (rfq) => {
  try {
    setSelectedRFQ(rfq);  // even if type is not here

    const res = await axios.get(`http://localhost:5000/api/se-details/${rfq.rfq_no}`);
    const keys = Object.keys(res.data);
    const rows = res.data[keys[0]] || [];

    setValveRows(rows);

    if (!rows.length) {
      alert(`⚠️ No valve rows found for RFQ ${rfq.rfq_no}`);
      return;
    }

    const torque = rows[0]?.valveTorque || rows[0]?.calculatedTorque || 0;

    const modelRes = await axios.get("http://localhost:5000/api/getAumaModels", {
  params: { valveType: keys[0], torque, rfqNo: rfq.rfq_no }
});


    setAumaModels(modelRes.data);
    setSelectedModels({});
  } catch (err) {
    console.error("❌ Error loading valve rows or AUMA models:", err);
    alert("Failed to load valve rows or AUMA models.");
  }
};


  const handleModelChange = (rowId, model) => {
    setSelectedModels((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        model
      }
    }));
  };

  const handleQuantityChange = (rowId, quantity) => {
    setSelectedModels((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        quantity: parseInt(quantity)
      }
    }));
  };

  const handleSubmit = async () => {
    const payload = valveRows
  .map((row) => ({
    rfqNumber: selectedRFQ.rfq_no,
    valveType: selectedRFQ.type,
    valveId: row.id,
    selectedModel: selectedModels[row.id]?.model,
    quantity: selectedModels[row.id]?.quantity,
  }))
  .filter((row) => row.selectedModel && row.quantity > 0);


    try {
      await axios.post("http://localhost:5000/api/se-mapping/submit", payload);
      alert("Submission successful");
      setSelectedRFQ(null);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Error saving selection.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">SE Mapping</h2>

      {/* RFQ Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">RFQ Number</th>
            <th className="border p-2">Product Group</th>
            <th className="border p-2">Customer Name</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map((rfq) => (
            <tr
              key={rfq.rfq_no}
              className="hover:bg-blue-100 cursor-pointer"
              onClick={() => handleRFQClick(rfq)}
            >
              <td className="border p-2 text-blue-600 underline">{rfq.rfq_no}</td>
              <td className="border p-2">{rfq.product_group_name}</td>
              <td className="border p-2">{rfq.customer_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-10 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                RFQ: {selectedRFQ.rfq_no} ({selectedRFQ.type})
              </h3>
              <button
                onClick={() => setSelectedRFQ(null)}
                className="text-gray-500 hover:text-black text-xl font-bold"
              >
                ✖
              </button>
            </div>

            <table className="w-full border text-sm mb-4">
  <thead className="bg-gray-100">
    <tr>
      <th className="border p-2">Item No</th>
      <th className="border p-2">Valve Type</th>
      <th className="border p-2">Valve Size</th>
      <th className="border p-2">AUMA Model</th>
      <th className="border p-2">Unit Price</th>
      <th className="border p-2">Net Weight</th>
      <th className="border p-2">Description</th>
      <th className="border p-2">Quantity</th>
    </tr>
  </thead>
  <tbody>
    {valveRows.map((row) => (
      <tr key={row.id}>
        <td className="border p-2">{row.itemNo}</td>
        <td className="border p-2">{row.valveType}</td>
        <td className="border p-2">{row.valveSize}</td>
        <td className="border p-2">
          <select
            className="w-full border px-2 py-1"
            value={selectedModels[row.id]?.model || ""}
            onChange={(e) => handleModelChange(row.id, e.target.value)}
          >
            <option value="">-- Select Model --</option>
            {aumaModels.map((m) => (
              <option key={m.id || m.modelName} value={m.modelName}>
  {m.modelName}
</option>

            ))}
          </select>
        </td>
        <td className="border p-2">
          {
            aumaModels.find(m => m.modelName === selectedModels[row.id]?.model)?.unitPrice || "-"
          }
        </td>
        <td className="border p-2">
          {
            aumaModels.find(m => m.modelName === selectedModels[row.id]?.model)?.netWeight || "-"
          }
        </td>
        <td className="border p-2">
          {
            aumaModels.find(m => m.modelName === selectedModels[row.id]?.model)?.description || "-"
          }
        </td>
        <td className="border p-2">
          <input
            type="number"
            min={0}
            className="border px-2 py-1 w-20"
            value={selectedModels[row.id]?.quantity || ""}
            onChange={(e) => handleQuantityChange(row.id, e.target.value)}
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setSelectedRFQ(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEMapping;
