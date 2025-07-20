import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Quotation = () => {
  const [rfqList, setRfqList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/se-mapping/rfqs");
        setRfqList(res.data);
      } catch (err) {
        console.error("Error fetching RFQs:", err);
        alert("Failed to load RFQ list.");
      } finally {
        setLoading(false);
      }
    };

    fetchRFQs();
  }, []);

  if (loading) return <p className="p-4">Loading RFQ list...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">SE Mapped RFQs</h2>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#</th>
            <th className="border p-2">RFQ Number</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rfqList.map((row, index) => (
            <tr key={row.rfq_no}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2 text-center">{row.rfq_no}</td>
              <td className="border p-2 text-center">
                <Link to={`/se-mapping/view/${row.rfq_no}`}>View Full Details</Link>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Quotation;
