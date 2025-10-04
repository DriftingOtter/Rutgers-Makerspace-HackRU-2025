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
            <h1>About Me</h1>
            <div className="about-content">
              <div className="about-text">
                <p>Welcome to my personal makerspace journey! I'm passionate about creating, innovating, and bringing ideas to life through technology and craftsmanship.</p>
                
                <p>My journey in the makerspace world began with a simple curiosity about how things work. From tinkering with electronics to exploring 3D printing, I've discovered that the best way to learn is by doing. Every project teaches me something new, and every failure is just another step toward success.</p>
                
                <p>I believe that makerspaces are more than just places with tools – they're communities where creativity flourishes and knowledge is shared. Whether you're a seasoned maker or just starting out, there's always something exciting to discover and create.</p>
                
                <p>Through this website, I hope to share my experiences, showcase my projects, and connect with fellow makers who share the same passion for innovation and creation.</p>
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
