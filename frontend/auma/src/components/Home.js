// Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h4 className="mb-4 text-center">Select Valve Type</h4>
        <div className="d-grid gap-3">
          <button className="btn btn-primary" onClick={() => navigate("/type1")}>
            Type 1: Part-Turn Valve
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/type2")}>
            Type 2: Multi-Turn Valve
          </button>
          <button className="btn btn-success" onClick={() => navigate("/type3")}>
            Type 3: Linear Valve
          </button>
          <button className="btn btn-warning" onClick={() => navigate("/type4")}>
            Type 4: Lever Operated Valve
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
