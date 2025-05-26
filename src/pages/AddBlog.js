// src/pages/AddBlog.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./AddBlog.css";

function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [category, setCategory] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { value: "technology", label: "Technology" },
    { value: "food", label: "Food & Cooking" },
    { value: "travel", label: "Travel" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "health", label: "Health & Wellness" },
    { value: "education", label: "Education" },
    { value: "business", label: "Business" },
    { value: "entertainment", label: "Entertainment" },
    { value: "sports", label: "Sports" },
    { value: "other", label: "Other" }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const { firstName, lastName } = docSnap.data();
            setAuthorName(`${firstName} ${lastName}`);
          } else {
            console.log("No user data found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      }
    };

    fetchUserData();
  }, []);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Content validation
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }

    // Category validation
    if (!category) {
      newErrors.category = 'Please select a category';
    }

    // Blog Image URL validation
    if (!blogImage.trim()) {
      newErrors.blogImage = 'Blog image URL is required';
    } else {
      try {
        new URL(blogImage);
        // Check if the URL ends with an image extension
        const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = validImageExtensions.some(ext => 
          blogImage.toLowerCase().endsWith(ext)
        );
        if (!hasValidExtension) {
          newErrors.blogImage = 'URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)';
        }
      } catch (e) {
        newErrors.blogImage = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create a blog");
        return;
      }

      const blogData = {
        title: title.trim(),
        content: content.trim(),
        category,
        blogImage: blogImage.trim(),
        createdAt: new Date(),
        userId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL,
        views: 0,
        lastViewedBy: null,
        lastViewedAt: null,
        likes: 0,
        likedBy: [],
        comments: []
      };

      await addDoc(collection(db, "blogs"), blogData);
      alert("Blog added successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error adding blog:", error.message);
      alert("Failed to add blog. Please try again.");
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
    <div className="add-blog-page">
      {/* Hero Section */}
      <header className="add-blog-header">
        <div className="header-content">
          <h1>Share Your Story</h1>
          <p className="header-subtitle">
            Create a compelling blog post that resonates with your audience
          </p>
        </div>
      </header>

      {/* Form Section */}
      <section className="add-blog-section">
        <div className="add-blog-container">
          <div className="form-header">
            <h2><i className="fas fa-pen-fancy"></i> Create New Blog</h2>
            <p>Fill in the details below to publish your blog</p>
          </div>

          <form onSubmit={handleSubmit} className="blog-form">
            <div className="form-group">
              <label htmlFor="title">
                <i className="fas fa-heading"></i> Blog Title
                <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="title"
                placeholder="Enter a catchy title for your blog (5-100 characters)"
                value={title}
                onChange={(e) => {
                  setTitle(capitalizeFirstLetter(e.target.value));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: null }));
                  }
                }}
                className={errors.title ? 'error' : ''}
                maxLength={100}
              />
              {renderError('title')}
              <small className="form-help">
                <i className="fas fa-info-circle"></i> 
                Title should be between 5 and 100 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="category">
                <i className="fas fa-tags"></i> Category
                <span className="required-mark">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) {
                    setErrors(prev => ({ ...prev, category: null }));
                  }
                }}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {renderError('category')}
            </div>

            <div className="form-group">
              <label htmlFor="content">
                <i className="fas fa-align-left"></i> Blog Content
                <span className="required-mark">*</span>
              </label>
              <textarea
                id="content"
                placeholder="Write your blog content here... (minimum 50 characters)"
                value={content}
                onChange={(e) => {
                  setContent(capitalizeFirstLetter(e.target.value));
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: null }));
                  }
                }}
                className={errors.content ? 'error' : ''}
                rows="12"
              />
              {renderError('content')}
              <small className="form-help">
                <i className="fas fa-info-circle"></i> 
                Write engaging content that captures your readers' attention. Minimum 50 characters required.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="blogImage">
                <i className="fas fa-image"></i> Blog Image URL
                <span className="required-mark">*</span>
              </label>
              <input
                type="url"
                id="blogImage"
                placeholder="Enter the URL of your blog image (e.g., https://example.com/image.jpg)"
                value={blogImage}
                onChange={(e) => {
                  setBlogImage(e.target.value);
                  if (errors.blogImage) {
                    setErrors(prev => ({ ...prev, blogImage: null }));
                  }
                }}
                className={errors.blogImage ? 'error' : ''}
              />
              {renderError('blogImage')}
              <small className="form-help">
                <i className="fas fa-info-circle"></i> 
                Add a high-quality image URL that ends with .jpg, .jpeg, .png, .gif, or .webp
              </small>
            </div>

            <div className="form-actions">
              <Link to="/home" className="cancel-button">
                <i className="fas fa-times"></i> Cancel
              </Link>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Publishing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Publish Blog
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AddBlog;
