import React, { useState, useEffect } from 'react';
import './ImageGallery.css';

// Import images directly
import image1 from '../Images/image1.jpeg';
import image3 from '../Images/image3.jpeg';
import banner from '../Images/makerspace_3d_printers_banner_0.png';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load images from the Images folder
    const imageList = [
      {
        src: image1,
        alt: 'Makerspace Project 1',
        title: '3D Printing Project'
      },
      {
        src: image3,
        alt: 'Makerspace Project 2',
        title: 'Electronics Workshop'
      },
      {
        src: banner,
        alt: '3D Printers Banner',
        title: '3D Printing Station'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setImages(imageList);
      setLoading(false);
    }, 1000);
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <p>Loading images...</p>
      </div>
    );
  }

  return (
    <div className="gallery-section">
      <h2>The Makerspace</h2>
      <p className="gallery-description">Here are some of my recent projects and creations:</p>
      
      <div className="gallery-grid">
        {images.map((image, index) => (
          <div key={index} className="gallery-item" onClick={() => openModal(image)}>
            <img 
              src={image.src} 
              alt={image.alt}
              title={image.title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="gallery-placeholder" style={{ display: 'none' }}>
              <p>Image not found</p>
              <p><small>{image.alt}</small></p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <h3>{selectedImage.title}</h3>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
