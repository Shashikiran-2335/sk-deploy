// src/App.jsx or wherever your routes are
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BorrowPage from './pages/Borrowform';
import BorrowLog from './pages/BorrowLogList';
import Dashboard from './pages/Dashboard';

function KiranaApp() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="borrow" element={<BorrowPage />} />
        <Route path="log" element={<BorrowLog />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  </Router>
  );
}

export default KiranaApp;
