import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import CreateRFP from './pages/CreateRFP';
import Vendors from './pages/Vendors';
import RFPList from './pages/RFPList';
import RFPDetail from './pages/RFPDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
        <h1>AI RFP Starter</h1>

        <Routes>
          <Route
            path="/"
            element={
              <>
              <Vendors />
                <hr />
                <CreateRFP />
                <hr />
                <RFPList />
              </>
            }
          />

          <Route path="/rfp/:id" element={<RFPDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
