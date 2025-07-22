import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AumaModelSelector = ({ valveType, onSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const [aumaModels, setAumaModels] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedController, setSelectedController] = useState("");
  const [selectedProtection, setSelectedProtection] = useState("");

  const openModal = () => {
    setShowModal(true);
    setAumaModels([]);
    setSelectedCountry("");
    setSelectedController("");
    setSelectedProtection("");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const fetchAumaModels = () => {
    const params = { type: valveType };
    if (selectedCountry) params.country = selectedCountry;
    if (selectedController) params.controller = selectedController;
    if (selectedProtection) params.protectionType = selectedProtection;

    axios
      .get("http://localhost:5000/api/auma-models", { params })
      .then((res) => setAumaModels(res.data))
      .catch((err) => console.error("Error fetching models", err));
  };

  const handleSelect = (model) => {
    onSelect(model);
    closeModal();
  };

  return (
    <div>
      <button className="btn btn-outline-primary btn-sm" onClick={openModal}>
        Select AUMA Model
      </button>

      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select AUMA Model ({valveType})</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col">
                    <label>Country</label>
                    <select
                      className="form-select"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <option value="">-- All --</option>
                      <option value="India">India</option>
                      <option value="Africa">Africa</option>
                      <option value="Dubai">Dubai</option>
                    </select>
                  </div>
                  <div className="col">
                    <label>Controller</label>
                    <select
                      className="form-select"
                      value={selectedController}
                      onChange={(e) => setSelectedController(e.target.value)}
                    >
                      <option value="">-- All --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="col">
                    <label>Protection Type</label>
                    <select
                      className="form-select"
                      value={selectedProtection}
                      onChange={(e) => setSelectedProtection(e.target.value)}
                    >
                      <option value="">-- All --</option>
                      <option value="Weather Proof">Weather Proof</option>
                      <option value="Explosion Proof">Explosion Proof</option>
                    </select>
                  </div>
                  <div className="col d-flex align-items-end">
                    <button className="btn btn-info w-100" onClick={fetchAumaModels}>
                      Filter
                    </button>
                  </div>
                </div>

                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Model Name</th>
                      <th>Torque Range</th>
                      <th>Net Weight</th>
                      <th>Unit Price</th>
                      <th>Country</th>
                      <th>Controller</th>
                      <th>Protection</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aumaModels.map((model, idx) => (
                      <tr key={idx}>
                        <td>{model.modelName}</td>
                        <td>{model.torqueRange}</td>
                        <td>{model.netWeight}</td>
                        <td>{model.unitPrice}</td>
                        <td>{model.country}</td>
                        <td>{model.controller}</td>
                        <td>{model.protectionType}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSelect(model)}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AumaModelSelector;
