// src/QuotationMapping.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/log3.png';

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

  // Parse strings to numbers and calculate totals
  const parsedItems = items.map(item => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    const total = unitPrice * quantity;
    const gst = total * 0.18; // Gst 18%
    return { ...item, unitPrice, quantity, total, gst };
  });

  const subtotal = parsedItems.reduce((sum, i) => sum + i.total, 0);
  const totalGst = subtotal * 0.18;
  const grandTotal = subtotal + totalGst;

  // Download PDF handler
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
        const pageWidth = pdf.internal.pageSize.getWidth();
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

      <div ref={printRef} className="p-4 border rounded bg-white shadow-sm">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Company Logo" style={{ height: 70, marginRight: 20 }} />
            <div>
              <h2 className="mb-0">Digizura Technologies</h2>
              <small>123 Main St, City, State</small><br />
              <small>Phone: +1-234-567-890</small><br />
              <small>Email: info@digizura.com</small>
            </div>
          </div>
          <h3 className="text-primary">Quotation</h3>
        </div>

        {/* RFQ Info */}
        <div className="mb-4">
          <p><strong>RFQ Number:</strong> {rfqInfo.rfqNo}</p>
          <p><strong>Customer:</strong> {rfqInfo.customerName}</p>
          <p><strong>Date:</strong> {new Date(rfqInfo.createdAt).toLocaleDateString()}</p>
        
        </div>

        {/* Items Table */}
        <table className="table table-bordered table-striped table-hover">

          <thead className="table-secondary">
          
            <tr>
              <th>Valve Type</th>
              <th>Model</th>
              <th>Net Weight (kg)</th>
              
              <th>Torque Range</th>
              <th>Country</th>
              <th>Controller</th>
              <th>Protection Type</th>
              <th>Qty</th>
              <th>Unit Price ($)</th>
              <th>Total ($)</th>
              
            </tr>
          </thead>
          <tbody>
            {parsedItems.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center">No items found.</td>
              </tr>
            ) : (
              parsedItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.valveType}</td>
                  <td>{item.aumaModel}</td>
                  <td>{item.netWeight}</td>
                  
                  <td>{item.torqueRange || '-'}</td>
                  <td>{item.country || '-'}</td>
                  <td>{item.controller || '-'}</td>
                  <td>{item.protectionType || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toFixed(2)}</td>
                  <td>{item.total.toFixed(2)}</td>
                 
                </tr>
              ))
            )}
          </tbody>

        </table>

        {/* Totals Section */}
        <div className="d-flex justify-content-end mt-3">
          <table style={{ width: '300px' }}>
            <tbody>
              <tr>
                <td className="pe-3 text-end"><strong>Subtotal:</strong></td>
                <td className="text-end">${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="pe-3 text-end"><strong>GST (18%):</strong></td>
                <td className="text-end">${totalGst.toFixed(2)}</td>
              </tr>
              <tr className="fw-bold">
                <td className="pe-3 text-end"><strong>Total:</strong></td>
                <td className="text-end">${grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Download PDF Button */}
      <div className="text-center mt-4 mb-5">
        <button className="btn btn-primary" onClick={handleDownloadPdf}>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default QuotationMapping;
