// components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => (
  <>
    <Navbar />
    <div className="d-flex">
      <Sidebar />
      <div className="p-4 flex-grow-1" style={{ minHeight: '90vh' }}>
        <Outlet />
      </div>
    </div>
  </>
);

export default Layout;
