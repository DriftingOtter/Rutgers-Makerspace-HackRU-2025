import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../firebase/auth';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setError: setAuthError } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    if (isSignUp && !formData.displayName) {
      setError('Please enter your display name for sign up.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await signUpWithEmail(formData.email, formData.password, formData.displayName);
        if (result.user) {
          setSuccess('Account created successfully! Please check your email for verification.');
          setIsSignUp(false);
          setFormData({ email: '', password: '', displayName: '' });
        }
      } else {
        result = await signInWithEmail(formData.email, formData.password);
        if (result.user) {
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', displayName: '' });
  };

  return (
    <div className="login-page">
      <main className="main-content">
        <div className="container">
          <section className="login-section">
            <div className="login-container">
              <h1>{isSignUp ? 'Create Account' : 'Login to Print Request'}</h1>
              <p className="login-description">
                {isSignUp 
                  ? 'Create a new account to access the print request system.' 
                  : 'Please enter your credentials to access the print request system.'
                }
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
              
              <form className="login-form" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="form-group">
                    <label htmlFor="displayName">Full Name:</label>
                    <input 
                      type="text" 
                      id="displayName" 
                      name="displayName" 
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required 
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    minLength="6"
                    required 
                  />
                </div>
                
                <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                  {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </form>
              
              {/* Google Sign In */}
              <div className="divider">
                <span>or</span>
              </div>
              
              <button 
                type="button" 
                className="btn btn-google btn-full" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing In...' : 'Continue with Google'}
              </button>
              
              {/* Toggle between Login and Sign Up */}
              <div className="login-toggle">
                <p>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button 
                    type="button" 
                    className="link-button" 
                    onClick={toggleMode}
                    disabled={isLoading}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
              
              <div className="login-note">
                <p><small>
                  {isSignUp 
                    ? 'By creating an account, you agree to our Terms of Service and Privacy Policy.'
                    : 'Secure authentication powered by Firebase.'
                  }
                </small></p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
