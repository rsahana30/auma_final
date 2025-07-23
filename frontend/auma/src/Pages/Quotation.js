import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const QuotationList = () => {
  const [rfqs, setRfqs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/se-mapping/rfqs')
      .then(res => setRfqs(res.data))
      .catch(err => console.error('Error fetching RFQs:', err));
  }, []);

  return (
    <div className="container mt-5">
      <h2>RFQ List</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>RFQ Number</th>
            <th>Customer Name</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map(rfq => (
            <tr key={rfq.rfq_no}>
              <td>
                <Link to={`/quotation/${rfq.rfq_no}`}>{rfq.rfq_no}</Link>
              </td>
              <td>{rfq.customer_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationList;