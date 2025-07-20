import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const QuotationDetails = () => {
  const { rfqNo } = useParams();
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/se-mapping/details/${rfqNo}`);
        setDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch details:", err);
        alert("Failed to load quotation details.");
      }
    };

    fetchDetails();
  }, [rfqNo]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">SE Mapping Quotation - {rfqNo}</h2>
      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Item No</th>
            <th className="border p-2">Valve Type</th>
            <th className="border p-2">Valve Size</th>
            <th className="border p-2">Model</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {details.map((row, index) => (
            <tr key={index}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2 text-center">{row.itemNo}</td>
              <td className="border p-2 text-center">{row.valveType}</td>
              <td className="border p-2 text-center">{row.valveSize}</td>
              <td className="border p-2 text-center">{row.auma_model}</td>
              <td className="border p-2">{row.description}</td>
              <td className="border p-2 text-center">{row.quantity}</td>
              <td className="border p-2 text-right">₹{row.unitPrice.toLocaleString()}</td>
              <td className="border p-2 text-right">₹{row.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationDetails;
