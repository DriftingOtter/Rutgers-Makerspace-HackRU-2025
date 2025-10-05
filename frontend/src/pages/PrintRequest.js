import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PrintRequest.css';

const PrintRequest = () => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    material: 'PLA',
    color: 'Any',
    quantity: 1,
    urgency: 'normal',
    specialInstructions: '',
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.projectName || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!formData.file) {
      setError('Please upload a 3D model file.');
      return;
    }

    // Check file type
    const allowedTypes = ['.stl', '.obj', '.3mf'];
    const fileExtension = formData.file.name.toLowerCase().substring(formData.file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please upload a valid 3D model file (.stl, .obj, or .3mf).');
      return;
    }

    // Check file size (max 50MB)
    if (formData.file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('projectName', formData.projectName);
      submitData.append('description', formData.description);
      submitData.append('material', formData.material);
      submitData.append('color', formData.color);
      submitData.append('quantity', formData.quantity);
      submitData.append('urgency', formData.urgency);
      submitData.append('specialInstructions', formData.specialInstructions);
      submitData.append('file', formData.file);
      submitData.append('userEmail', user?.email);
      submitData.append('userName', user?.displayName || user?.email);

      // Submit to API
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/print-request`, {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Print request submitted successfully! You will receive an email confirmation shortly.');
        setFormData({
          projectName: '',
          description: '',
          material: 'PLA',
          color: 'Any',
          quantity: 1,
          urgency: 'normal',
          specialInstructions: '',
          file: null
        });
        // Reset file input
        document.getElementById('file').value = '';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit print request. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Print request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const materials = [
    { 
      value: 'ABS', 
      label: 'ABS (Acrylonitrile Butadiene Styrene)', 
      description: 'Durable, heat resistant, good for functional parts',
      colors: ['Black', 'White', 'Carbon Fiber Reinforced']
    },
    { 
      value: 'Markforged', 
      label: 'Markforged (Advanced Composites)', 
      description: 'High-strength composite materials for industrial applications',
      colors: ['Carbon Fiber Reinforced', 'Fiberglass Reinforced', 'Kevlar Reinforced', 'Onyx']
    },
    { 
      value: 'PETG', 
      label: 'PETG (Polyethylene Terephthalate Glycol)', 
      description: 'Strong, flexible, chemical resistant',
      colors: ['Any', 'Black', 'Grey', 'Red', 'Translucent (Clear)', 'Translucent (Light Blue)', 'Translucent (Orange)', 'Translucent (Purple)', 'Translucent (Teal)', 'White']
    },
    { 
      value: 'PLA', 
      label: 'PLA (Polylactic Acid)', 
      description: 'Easy to print, biodegradable, good for beginners',
      colors: ['Any', 'Black', 'Grey', 'Red', 'Translucent (Clear)', 'Translucent (Light Blue)', 'Translucent (Orange)', 'Translucent (Purple)', 'Translucent (Teal)', 'White']
    },
    { 
      value: 'Resin', 
      label: 'Resin (SLA/DLP)', 
      description: 'High detail, smooth finish, perfect for miniatures',
      colors: ['Black', 'White', 'Clear', 'Hi-temp', 'Surgical', 'Tough', 'Durable', 'Flex']
    },
    { 
      value: 'TPU', 
      label: 'TPU (Thermoplastic Polyurethane)', 
      description: 'Flexible, rubber-like, good for phone cases',
      colors: ['Black', 'Red', 'White']
    }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low (1-2 weeks)' },
    { value: 'normal', label: 'Normal (3-5 days)' },
    { value: 'high', label: 'High (1-2 days)', extraCost: '+$5.00' },
    { value: 'urgent', label: 'Urgent (Same day)', extraCost: '+$15.00' }
  ];

  return (
    <div className="print-request-page">
      <main className="main-content">
        <div className="container">
          <section className="print-section">
            <div className="print-container">
              <h1>Submit Print Request</h1>
              <p className="print-description">
                Submit your 3D printing request. Our team will review your project and provide a quote.
              </p>
              
              {/* Error and Success Messages */}
              {error && (
                <div className="alert alert-error">
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <p>{success}</p>
                </div>
              )}

              <form className="print-form" onSubmit={handleSubmit}>
                {/* Project Information */}
                <div className="form-section">
                  <h2>Project Information</h2>
                  
                  <div className="form-group">
                    <label htmlFor="projectName">Project Name *</label>
                    <input
                      type="text"
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="e.g., Custom Phone Case"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Project Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your project, its purpose, and any specific requirements..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="file">3D Model File *</label>
                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleChange}
                      accept=".stl,.obj,.3mf"
                      required
                    />
                    <small>Accepted formats: .stl, .obj, .3mf (Max 50MB)</small>
                  </div>
                </div>

                {/* Print Settings */}
                <div className="form-section">
                  <h2>Print Settings</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="material">Material *</label>
                      <select
                        id="material"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        required
                      >
                        {materials.map(material => (
                          <option key={material.value} value={material.value}>
                            {material.label}
                          </option>
                        ))}
                      </select>
                      <small>{materials.find(m => m.value === formData.material)?.description}</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="color">Color *</label>
                      <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a color</option>
                        {materials.find(m => m.value === formData.material)?.colors.map(color => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <small>Available colors for selected material</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="quantity">Quantity</label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="urgency">Urgency</label>
                      <select
                        id="urgency"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                      >
                        {urgencyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label} {option.extraCost || ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h2>Additional Information</h2>
                  
                  <div className="form-group">
                    <label htmlFor="specialInstructions">Special Instructions</label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      placeholder="Any special requirements, post-processing needs, or additional notes..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="pricing-info">
                  <h3>Pricing Information</h3>
                  <div className="pricing-details">
                    <div className="pricing-item">
                      <span>Material Cost:</span>
                      <span>~$0.10-0.20 per gram</span>
                    </div>
                    <div className="pricing-item">
                      <span>Print Time:</span>
                      <span>~$2.50 per hour</span>
                    </div>
                    <div className="pricing-item">
                      <span>Setup Fee:</span>
                      <span>$5.00</span>
                    </div>
                    {formData.urgency === 'high' && (
                      <div className="pricing-item urgent">
                        <span>Rush Fee:</span>
                        <span>+$5.00</span>
                      </div>
                    )}
                    {formData.urgency === 'urgent' && (
                      <div className="pricing-item urgent">
                        <span>Urgent Fee:</span>
                        <span>+$15.00</span>
                      </div>
                    )}
                  </div>
                  <p className="pricing-note">
                    * Final pricing will be calculated based on your file and provided via email.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Print Request'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrintRequest;
