import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.username || !formData.password) {
      alert('Please fill in both username and password fields.');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate login process
    console.log('Login attempt:', formData);
    
    // Simulate network delay
    setTimeout(() => {
      // Redirect to print request page
      navigate('/print-request');
    }, 1000);
  };

  return (
    <div className="login-page">
      <main className="main-content">
        <div className="container">
          <section className="login-section">
            <div className="login-container">
              <h1>Login to Print Request</h1>
              <p className="login-description">Please enter your credentials to access the print request system.</p>
              
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={formData.username}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Submit'}
                </button>
              </form>
              
              <div className="login-note">
                <p><small>Note: Any username and password combination will work for demonstration purposes.</small></p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
