// src/pages/Register.js
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    languages: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s-']+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s-']+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Languages validation
    if (!formData.languages.trim()) {
      newErrors.languages = 'Languages are required';
    } else if (formData.languages.length < 2) {
      newErrors.languages = 'Please enter at least one language';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Capitalize first letter for name fields
    if (name === 'firstName' || name === 'lastName') {
      setFormData(prev => ({
        ...prev,
        [name]: capitalizeFirstLetter(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      const { firstName, lastName, email, languages, password } = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        languages: languages.trim(),
        createdAt: new Date()
      });

      navigate("/home");
    } catch (error) {
      console.error("Error registering user:", error.message);
      if (error.code === 'auth/email-already-in-use') {
        setErrors(prev => ({
          ...prev,
          auth: 'This email is already registered. Please use a different email or try logging in.'
        }));
      } else if (error.code === 'auth/weak-password') {
        setErrors(prev => ({
          ...prev,
          auth: 'Password is too weak. Please use a stronger password.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          auth: 'An error occurred during registration. Please try again.'
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
        <h2><i className="fas fa-user-plus"></i> Register</h2>
        {errors.auth && (
          <div className="auth-error-message">
            <i className="fas fa-exclamation-circle"></i> {errors.auth}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">
              <i className="fas fa-user"></i> First Name
              <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
            />
            {renderError('firstName')}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              <i className="fas fa-user"></i> Last Name
              <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
            />
            {renderError('lastName')}
          </div>

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
            <label htmlFor="languages">
              <i className="fas fa-language"></i> Languages
              <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="languages"
              name="languages"
              placeholder="Enter languages you know (e.g., English, Spanish)"
              value={formData.languages}
              onChange={handleChange}
              className={errors.languages ? 'error' : ''}
            />
            {renderError('languages')}
            <small className="form-help">
              <i className="fas fa-info-circle"></i> 
              Enter languages separated by commas
            </small>
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {renderError('password')}
            <small className="form-help">
              <i className="fas fa-info-circle"></i> 
              Password must be at least 6 characters long and contain uppercase, lowercase, and numbers
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-lock"></i> Confirm Password
              <span className="required-mark">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {renderError('confirmPassword')}
          </div>

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> Register
              </>
            )}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
