// src/pages/Login.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/home");
    } catch (error) {
      console.error("Error logging in:", error.message);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrors(prev => ({
          ...prev,
          auth: 'Invalid email or password'
        }));
      } else if (error.code === 'auth/too-many-requests') {
        setErrors(prev => ({
          ...prev,
          auth: 'Too many failed attempts. Please try again later.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          auth: 'An error occurred. Please try again.'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render error message
  const renderError = (field) => {
    return errors[field] ? (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i> {errors[field]}
      </div>
    ) : null;
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2><i className="fas fa-sign-in-alt"></i> Login</h2>
        {errors.auth && (
          <div className="auth-error-message">
            <i className="fas fa-exclamation-circle"></i> {errors.auth}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email
              <span className="required-mark">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {renderError('email')}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Password
              <span className="required-mark">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {renderError('password')}
            <small className="form-help">
              <i className="fas fa-info-circle"></i> 
              Password must be at least 6 characters long
            </small>
          </div>

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Login
              </>
            )}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
