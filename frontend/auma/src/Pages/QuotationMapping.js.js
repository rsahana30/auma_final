// src/QuotationMapping.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/log3.png'
const QuotationMapping = () => {
  const { rfqNo } = useParams();
  const navigate = useNavigate();
  const [rfqInfo, setRfqInfo] = useState(null);
  const [items, setItems] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    // Fetch RFQ header
    axios.get(`http://localhost:5000/api/rfq/${rfqNo}`)
      .then(res => setRfqInfo(res.data))
      .catch(err => console.error('Error fetching RFQ info:', err));

    // Fetch mapped items
    axios.get(`http://localhost:5000/api/se-quotation/${rfqNo}`)
      .then(res => setItems(res.data))
      .catch(err => console.error('Error fetching items:', err));
  }, [rfqNo]);

  if (!rfqInfo) {
    return <div className="container mt-5">Loading...</div>;
  }

  // Parse strings to numbers
  const parsedItems = items.map(item => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const quantity  = parseFloat(item.quantity)  || 0;
    return { ...item, unitPrice, quantity, total: unitPrice * quantity };
  });
  const subtotal = parsedItems.reduce((sum, i) => sum + i.total, 0);
  const taxRate = 0.18;
  const tax     = subtotal * taxRate;
  const total   = subtotal + tax;

  // Download PDF in one click
  const handleDownloadPdf = () => {
    const element = printRef.current;
    html2canvas(element, { scale: 2 })
      .then(canvas => {
        const imgData = canvas.toDataURL();
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4',
        });
        const pageWidth  = pdf.internal.pageSize.getWidth();
        const pageHeight = (canvas.height * pageWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
        pdf.save(`Quotation_${rfqNo}.pdf`);
      })
      .catch(err => console.error('Error generating PDF:', err));
  };

  return (
    <div className="container mt-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        Back
      </button>

      <div ref={printRef} className="p-4 border rounded bg-white">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Company Logo" style={{ height: 60, marginRight: 15 }} />
            <div>
              <h3>Company Name</h3>
              <p>
                123 Main St, City, State<br/>
                Phone: +1-234-567-890
              </p>
            </div>
          </div>
          <h4>Quotation</h4>
        </div>

        {/* RFQ Info */}
        <div className="mb-4">
          <p><strong>RFQ Number:</strong> {rfqInfo.rfqNo}</p>
          <p><strong>Customer:</strong> {rfqInfo.customerName}</p>
          <p><strong>Date:</strong> {new Date(rfqInfo.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Items */}
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Valve Type</th>
              <th>Model</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.valveType}</td>
                <td>{item.aumaModel}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice.toFixed(2)}</td>
                <td>{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="d-flex justify-content-end mt-3">
          <table>
            <tbody>
              <tr>
                <td className="pe-3"><strong>Subtotal:</strong></td>
                <td>{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="pe-3"><strong>GST (18%):</strong></td>
                <td>{tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="pe-3"><strong>Total:</strong></td>
                <td><strong>{total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Download PDF */}
      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={handleDownloadPdf}>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default QuotationMapping;
