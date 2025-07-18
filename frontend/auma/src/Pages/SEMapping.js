import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const SEMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState("");

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/se-mapping");
        setMappings(res.data);
      } catch (err) {
        console.error("Failed to fetch SE Mapping:", err.message);
      }
    };
    fetchMappings();
  }, []);

  const handleRFQClick = async (rfqNo) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/se-details/${rfqNo}`);
      setModalData(res.data);
      setSelectedRFQ(rfqNo);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch RFQ details:", err.message);
    }
  };

  const renderTableSection = (label, data) => {
    if (!data || data.length === 0) return null;

    const excludedKeys = ['rfqNo', 'customerId', 'productGroupId'];
    const filteredKeys = Object.keys(data[0]).filter(key => !excludedKeys.includes(key));

    return (
      <>
        <h6 className="mt-3">{label}</h6>
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              {filteredKeys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {filteredKeys.map((key, colIdx) => (
                  <td key={colIdx}>{String(row[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div className="container mt-4">
      <h4>SE Mapping</h4>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>RFQ No</th>
            <th>Customer</th>
            <th>Product Group</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((m) => (
            <tr key={m.rfq_no}>
              <td>
                <button className="btn btn-link p-0" onClick={() => handleRFQClick(m.rfq_no)}>
                  {m.rfq_no}
                </button>
              </td>
              <td>{m.customer_name}</td>
              <td>{m.product_group_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Details for {selectedRFQ}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData ? (
            <>
              {renderTableSection("Part Turn", modalData.partTurn)}
              {renderTableSection("Multi Turn", modalData.multiTurn)}
              {renderTableSection("Linear Valve", modalData.linear)}
              {renderTableSection("Lever", modalData.lever)}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SEMapping;
