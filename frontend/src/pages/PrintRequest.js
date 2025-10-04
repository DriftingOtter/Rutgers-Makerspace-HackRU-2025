import React from 'react';
import { Link } from 'react-router-dom';
import './PrintRequest.css';

const PrintRequest = () => {
  return (
    <div className="print-request-page">
      <main className="main-content">
        <div className="container">
          <section className="print-section">
            <div className="print-container">
              <h1>Print Request</h1>
              <p className="print-description">Welcome to the print request system. This page is currently under development.</p>
              
              <div className="print-placeholder">
                <div className="placeholder-content">
                  <h2>Coming Soon</h2>
                  <p>Print request functionality will be implemented here.</p>
                  <p>Features will include:</p>
                  <ul>
                    <li>File upload for 3D models</li>
                    <li>Print settings configuration</li>
                    <li>Request status tracking</li>
                    <li>Print queue management</li>
                  </ul>
                </div>
              </div>
              
              <div className="print-actions">
                <Link to="/" className="btn btn-primary">Return to Home</Link>
                <Link to="/about" className="btn btn-secondary">View Gallery</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrintRequest;
