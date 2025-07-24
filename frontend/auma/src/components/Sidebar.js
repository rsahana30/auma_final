// components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';


  const Sidebar = () => (
  <div className="bg-light border-end vh-100 p-3" style={{ width: '250px' }}>
    <h6 className="text-muted">Quotation Management</h6>
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link to="/rfq" className="nav-link">RFQ</Link>
      </li>
      <li className="nav-item">
        <Link to="/semapping" className="nav-link">SE Mapping</Link>
      </li>
      <li className="nav-item">
        <Link to="/quotation" className="nav-link">Quotation</Link>
      </li>
    </ul>

    <h6 className="text-muted mt-4">Configuration Management</h6>
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link to="/rfq_config" className="nav-link">RFQ</Link>
      </li>
      <li className="nav-item">
        <Link to="/config2" className="nav-link">SE Mapping</Link>
      </li>
      <li className="nav-item">
        <Link to="/config3" className="nav-link">Quotation</Link>
      </li>
    </ul>
  </div>
);


export default Sidebar;
