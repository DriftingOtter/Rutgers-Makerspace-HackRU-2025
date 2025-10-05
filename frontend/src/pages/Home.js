import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Import the video file
import makerspaceVideo from '../Images/Makerspace Tour at Rutgers University\'s Livingston Campus - Makerspaces (1080p, h264, youtube).mp4';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <video 
          className="hero-video" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={makerspaceVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <h1 className="hero-title">RUmakerspace</h1>
          <p className="hero-subtitle">Innovation • Creation • Collaboration</p>
          <div className="hero-buttons">
            <Link to="/about" className="btn btn-primary">Learn More</Link>
            <Link to="/login" className="btn btn-primary">Print Request</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="features-title">Welcome to RUmakerspace</h2>
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
        </div>
      </section>
    </div>
  );
};

export default Home;
