// components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (

    <div className="bg-light border-end vh-100 d-flex flex-column p-3" style={{ width: '250px' }}>
      <div>
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

      {/* <div className="mt-auto w-100">
        {user ? (
          <div className="d-flex flex-column">
            <span className="fw-bold text-muted mb-2">Welcome, {user.name}</span>
            <button className="btn btn-danger w-100" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <Link className="btn btn-outline-secondary w-100" to="/signin">Sign In</Link>
            <Link className="btn btn-secondary w-100" to="/signup">Sign Up</Link>
          </div>
        )}
      </div> */}
    </div>
  )
};


export default Sidebar;
