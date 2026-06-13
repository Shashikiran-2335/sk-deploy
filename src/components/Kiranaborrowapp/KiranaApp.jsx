// src/App.jsx or wherever your routes are
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BorrowPage from './pages/Borrowform';
import BorrowLog from './pages/BorrowLogList';
import Dashboard from './pages/Dashboard';

import ProductsPage from './pages/ProductsPage';

function KiranaApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="borrow" element={<BorrowPage />} />
          <Route path="log" element={<BorrowLog />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>
      </Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default KiranaApp;
