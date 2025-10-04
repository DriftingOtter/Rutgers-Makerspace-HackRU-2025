import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">RuMakerspace</h1>
          <p className="hero-subtitle">Innovation • Creation • Collaboration</p>
          <div className="hero-buttons">
            <Link to="/about" className="btn btn-primary">Learn More</Link>
            <Link to="/login" className="btn btn-primary">Print Request</Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <section className="features">
            <h2>Welcome to Our Makerspace</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>3D Printing</h3>
                <p>Access to professional 3D printers for your projects and prototypes.</p>
              </div>
              <div className="feature-card">
                <h3>Workshop Tools</h3>
                <p>Complete workshop with tools for woodworking, electronics, and more.</p>
              </div>
              <div className="feature-card">
                <h3>Collaboration</h3>
                <p>Work with fellow makers and bring your ideas to life together.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
