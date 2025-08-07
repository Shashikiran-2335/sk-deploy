import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Layout from '../components/Layout';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      

      <div className="homepage-container">
        <div className="homepage-card">
          <h1>Welcome to Kirana Borrow Manager</h1>
          <p className="tagline">
            Simplify your kirana shop’s credit tracking with ease.
          </p>
          <div className="button-group">
            <button onClick={() => navigate('/borrow')}>➕ Add Borrow</button>
            <button onClick={() => navigate('/log')}>📜 View Borrow Log</button>
            <button onClick={() => navigate('/dashboard')}>📊 Go to Dashboard</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
