import React from 'react';
import ImageGallery from '../components/ImageGallery';
import './AboutMe.css';

const AboutMe = () => {
  return (
    <div className="about-me">
      <main className="main-content">
        <div className="container">
          {/* About Section */}
          <section className="about-section">
            <h1>About Rutgers Makerspace</h1>
            <div className="about-content">
              <div className="about-text">
                <p>Welcome to the Rutgers University Makerspace! We're a cutting-edge facility dedicated to fostering innovation, creativity, and hands-on learning through advanced manufacturing technologies and collaborative making.</p>
                
                <p>Located in the Engineering Building at Rutgers University, our makerspace provides students, faculty, and the broader community with access to state-of-the-art 3D printers, laser cutters, CNC machines, and other fabrication tools. We believe that the best way to learn engineering and design is by doing – turning ideas into tangible reality.</p>
                
                <p>Our mission is to democratize access to advanced manufacturing technologies and create an inclusive environment where anyone can bring their ideas to life. Whether you're working on a class project, conducting research, or pursuing a personal passion, our makerspace is your creative hub.</p>
                
                <p>We offer workshops, training sessions, and project support to help you master new technologies. Our community of makers, from beginners to experts, is always ready to share knowledge and collaborate on exciting projects. Join us in building the future, one project at a time!</p>
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <ImageGallery />
        </div>
      </main>
    </div>
  );
};

export default AboutMe;
