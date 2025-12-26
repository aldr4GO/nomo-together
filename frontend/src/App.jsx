import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import CustomerPortal from './components/CustomerPortal';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CustomerPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

