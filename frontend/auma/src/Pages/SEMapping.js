import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const SEMapping = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/se-mapping/rfqs");
        setRfqs(res.data);
      } catch (err) {
        console.error("Failed to fetch RFQs", err);
      }
    };
    fetchRFQs();
  }, []);


  const handleViewDetails = (rfqNo) => {
    navigate(`/mappings/${rfqNo}`);
  }; 
  return (
    <div className="container mt-4">
      <h2 className="mb-4">SE Mapping RFQs</h2>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>RFQ Number</th>
            <th>Customer Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map((rfq, index) => (
            <tr key={index}>
              <td>{rfq.rfq_no}</td>
              <td>{rfq.customer_name}</td>
              <td>
                 <button
                className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                onClick={() => handleViewDetails(rfq.rfq_no)}
              >
                <i className="fas fa-eye"></i>
                View Details
              </button>
              </td>
            </tr>
          ))}
          {rfqs.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted">No RFQs available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SEMapping;
