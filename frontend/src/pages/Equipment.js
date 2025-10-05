import React from 'react';
import { Link } from 'react-router-dom';
import './Equipment.css';

const Equipment = () => {
  return (
    <div className="equipment-page">
      <main className="main-content">
        <div className="container">
          {/* Hero Section */}
          <section className="equipment-hero">
            <h1>Equipment & Resources</h1>
            <p>Discover the tools and equipment available at RUmakerspace</p>
          </section>

          {/* Equipment Categories */}
          <section className="equipment-categories">
            <Link to="/equipment/3d-printing" className="category-card">
              <div className="category-icon">🖨️</div>
              <h3>3D Printing</h3>
              <p>Professional 3D printers for prototyping and production</p>
              <ul>
                <li>FDM Printers (PLA, ABS, PETG)</li>
                <li>Resin Printers (SLA/DLP)</li>
                <li>Large Format Printers</li>
                <li>Post-processing Equipment</li>
              </ul>
            </Link>

            <Link to="/equipment/electronics" className="category-card">
              <div className="category-icon">⚡</div>
              <h3>Electronics</h3>
              <p>Tools and equipment for electronic projects</p>
              <ul>
                <li>Soldering Stations</li>
                <li>Oscilloscopes & Multimeters</li>
                <li>Arduino & Raspberry Pi</li>
                <li>PCB Design Software</li>
              </ul>
            </Link>

            <Link to="/equipment/cnc-machining" className="category-card">
              <div className="category-icon">🔪</div>
              <h3>CNC & Machining</h3>
              <p>Computer-controlled manufacturing tools</p>
              <ul>
                <li>CNC Milling Machines</li>
                <li>Laser Cutters</li>
                <li>Plasma Cutters</li>
                <li>Water Jet Cutters</li>
              </ul>
            </Link>

            <Link to="/equipment/woodworking" className="category-card">
              <div className="category-icon">🪵</div>
              <h3>Woodworking</h3>
              <p>Traditional woodworking tools and equipment</p>
              <ul>
                <li>Table Saws & Band Saws</li>
                <li>Planers & Jointers</li>
                <li>Drill Presses</li>
                <li>Hand Tools & Clamps</li>
              </ul>
            </Link>

            <Link to="/equipment/textiles-sewing" className="category-card">
              <div className="category-icon">✂️</div>
              <h3>Textiles & Sewing</h3>
              <p>Fabric and textile working equipment</p>
              <ul>
                <li>Industrial Sewing Machines</li>
                <li>Embroidery Machines</li>
                <li>Fabric Cutters</li>
                <li>Ironing Stations</li>
              </ul>
            </Link>

            <Link to="/equipment/graphic-design" className="category-card">
              <div className="category-icon">🎨</div>
              <h3>Graphic Design</h3>
              <p>Digital design and printing equipment</p>
              <ul>
                <li>Large Format Printers</li>
                <li>Vinyl Cutters</li>
                <li>Heat Press Machines</li>
                <li>Design Software Access</li>
              </ul>
            </Link>
          </section>

          {/* Safety & Training */}
          <section className="safety-training">
            <h2>Safety & Training</h2>
            <div className="safety-content">
              <div className="safety-info">
                <h3>Safety First</h3>
                <p>All equipment requires proper training and safety certification before use. Our staff provides comprehensive training sessions for each piece of equipment.</p>
                <ul>
                  <li>Mandatory safety orientation</li>
                  <li>Equipment-specific training</li>
                  <li>Safety equipment provided</li>
                  <li>Supervised operation available</li>
                </ul>
              </div>
              <div className="training-info">
                <h3>Training Schedule</h3>
                <p>Regular training sessions are available for all equipment. Contact our staff to schedule your training session.</p>
                <div className="training-times">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 2:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </div>
          </section>

          {/* Booking Information */}
          <section className="booking-info">
            <h2>Equipment Booking</h2>
            <div className="booking-content">
              <div className="booking-card">
                <h3>Reserve Equipment</h3>
                <p>Book equipment in advance to ensure availability for your project.</p>
                <div className="reservation-info">
                  <p><strong>IMPORTANT:</strong> To ensure that everyone has an opportunity to use the machines at the Makerspace, reservations cannot be made for more than 3 hours per day, twice per week, per machine. You may only reserve one machine at a time.</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.open('https://fab.makerspace.rutgers.edu/#!/machines', '_blank')}
                >
                  Book Equipment
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Equipment;
