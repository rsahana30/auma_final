// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Layout from "./components/Layout";
import RFQ from "./Pages/RFQ";

// import Quotation from "./pages/Quotation";
import PartTurn from "./Forms/PartTurn";
import MultiTurn from "./Forms/MultiTurn";
import Linear from "./Forms/Linear";
import Lever from "./Forms/Lever";
import SEMapping from "./Pages/SEMapping";
import Quotation from "./Pages/Quotation";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RFQ />} />
          <Route path="/rfq" element={<RFQ/>} />
          <Route path="/semapping" element={<SEMapping/>} />
           <Route path="/quotation" element={<Quotation/>} />  
          <Route path="/type1" element={<PartTurn />} />
          <Route path="/type2" element={<MultiTurn />} />
          <Route path="/type3" element={<Linear />} />
          {/* <Route path="/se-mapping/view/:rfqNo" element={<QuotationDetails/>} /> */}

          <Route path="/type4" element={<Lever />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
