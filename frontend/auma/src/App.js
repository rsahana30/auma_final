// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Layout from "./components/Layout";
import RFQ from "./Pages/RFQ";

// import Quotation from "./pages/Quotation";
import PartTurn from "./Forms/PartTurn";
import MultiTurn from "./Forms/MultiTurn";
import Linear from "./Forms/Linear";
import Lever from "./Forms/Lever";
import SEMapping from "./Pages/SEMapping";
import Quotation from "./Pages/Quotation";
import Mappings from "./Pages/Mappings";
import QuotationMapping from "./Pages/QuotationMapping.js";
import RFQConfig from "./Configuration/RFQConfig.js";
import DeleteFields from "./Configuration/DeleteFields.js";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Account from "./Pages/Account";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<RFQ />} />
            <Route path="/rfq" element={<RFQ />} />
            <Route path="/semapping" element={<SEMapping />} />
            <Route path="/quotation" element={<Quotation />} />
            <Route path="/type1" element={<PartTurn />} />
            <Route path="/type2" element={<MultiTurn />} />
            <Route path="/type3" element={<Linear />} />
            <Route path="/mappings/:rfqNo" element={<Mappings />} />
            <Route path="/quotation/:rfqNo" element={<QuotationMapping />} />
            <Route path="/type4" element={<Lever />} />
            <Route path="//manage-fields" element={<DeleteFields />} />
            <Route path="/rfq_config" element={<RFQConfig />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
