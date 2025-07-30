import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
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
    <nav className="navbar navbar-dark bg-secondary px-3">
      <Link className="navbar-brand" to="/">Auma</Link>
      <div className="dropdown">
        <button
          className="btn btn-light rounded-circle fw-bold text-uppercase "
          type="button"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          {user && user.name.charAt(0)}
        </button>

        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li>
            <Link className="dropdown-item" to="/account">Account</Link>
          </li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
