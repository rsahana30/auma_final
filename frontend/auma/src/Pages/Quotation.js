import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import logo from "../assets/log3.png";

const Quotation = () => {
  const [rfqList, setRfqList] = useState([]);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const componentRef = useRef();

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

  const handleViewDetails = async (rfq) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/se-quotation/${rfq.rfq_no}`);
      setQuotationDetails(res.data);
      setSelectedRFQ(rfq);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading RFQ details:", err);
      alert("Could not fetch quotation details.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Quotation_${selectedRFQ?.rfq_no}`,
  });

  // Manual Subtotal based on totalPrice
  const subtotal = quotationDetails.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0);
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  if (loading) return <div className="p-4"><Spinner animation="border" /> Loading RFQ list...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">SE Mapped RFQs</h2>
      <Table striped bordered hover responsive>
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>RFQ Number</th>
            <th>Customer Name</th>
            <th>Product Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rfqList.map((rfq, index) => (
            <tr key={rfq.rfq_no}>
              <td>{index + 1}</td>
              <td>
                <button className="btn btn-link p-0" onClick={() => handleViewDetails(rfq)}>
                  {rfq.rfq_no}
                </button>
              </td>
              <td>{rfq.name}</td>
              <td>{rfq.group_name}</td>
              <td>
                <Button variant="outline-primary" onClick={() => handleViewDetails(rfq)}>
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Quotation Modal */}
      <Modal size="xl" show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Quotation for {selectedRFQ?.rfq_no}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div ref={componentRef} className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <img src={logo} alt="Company Logo" style={{ height: 60 }} />
              <div className="text-end">
                <h5>XYZ Automation Pvt. Ltd.</h5>
                <p>Email: contact@xyzauto.com<br />Phone: +91-9876543210</p>
              </div>
            </div>

            <div className="mb-4">
              <strong>RFQ No:</strong> {selectedRFQ?.rfq_no}<br />
              <strong>Customer:</strong> {selectedRFQ?.name}<br />
              <strong>Product Group:</strong> {selectedRFQ?.group_name}
            </div>

            <Table bordered>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Item No</th>
                  <th>Valve Type</th>
                  <th>Valve Size</th>
                  <th>Model</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {quotationDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.itemNo ?? "—"}</td>
                    <td>{item.valve_type ?? "—"}</td>
                    <td>{item.netWeight ?? "—"}</td>
                    <td>{item.auma_model ?? "—"}</td>
                    <td>{item.description ?? "—"}</td>
                    <td>{item.quantity ?? 0}</td>
                    <td>₹{(item.unitPrice ?? 0).toLocaleString()}</td>
                    <td>₹{(item.totalPrice ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="text-end mt-3">
              <strong>Subtotal:</strong> ₹{subtotal.toLocaleString()}<br />
              <strong>GST (18%):</strong> ₹{gst.toLocaleString()}<br />
              <strong>Grand Total:</strong> ₹{grandTotal.toLocaleString()}
            </div>

            <div className="mt-4 text-muted small">
              <p><strong>Terms:</strong> Delivery within 4-6 weeks. Prices valid for 30 days. Payment 50% advance, 50% before dispatch.</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handlePrint}>Download as PDF</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Quotation;
