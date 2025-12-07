import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import "./Profile.css";

function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    languages: "",
    bio: "",
    location: "",
  });

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

  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);

  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    lastActive: null
  });
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const navigate = useNavigate();
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Fetch profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Capitalize first letter of specific fields when loading data
            setProfileData({
              ...data,
              firstName: capitalizeFirstLetter(data.firstName),
              lastName: capitalizeFirstLetter(data.lastName),
              bio: data.bio ? capitalizeFirstLetter(data.bio) : '',
              location: data.location ? capitalizeFirstLetter(data.location) : ''
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    const fetchUserBlogs = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const blogsRef = collection(db, "blogs");
          const q = query(blogsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const blogsData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt || new Date(),
              authorName: data.authorName || 'Anonymous',
              views: data.views || 0 // Ensure views is initialized
            };
          });
          
          // Sort blogs by creation date (newest first)
          blogsData.sort((a, b) => {
            const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
          });
          
          // Calculate total views
          const totalViews = blogsData.reduce((sum, blog) => sum + (blog.views || 0), 0);
          
          setBlogs(blogsData);
          setStats(prev => ({
            ...prev,
            totalBlogs: blogsData.length,
            totalViews: totalViews,
            lastActive: blogsData.length > 0 ? blogsData[0].createdAt : null
          }));
        }
      } catch (error) {
        console.error("Error fetching user blogs:", error.message);
      }
    };

    fetchUserData();
    fetchUserBlogs();
  }, []);

  // Profile handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Capitalize first letter for specific fields
    if (['firstName', 'lastName', 'bio', 'location'].includes(name)) {
      setProfileData(prev => ({
        ...prev,
        [name]: capitalizeFirstLetter(value)
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validation rules for profile form
  const validateProfileForm = (formData) => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must not exceed 50 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must not exceed 50 characters';
    }

    // Languages validation
    if (formData.languages && formData.languages.length > 200) {
      newErrors.languages = 'Languages must not exceed 200 characters';
    }

    // Location validation
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location must not exceed 100 characters';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must not exceed 500 characters';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to render profile error message
  const renderProfileError = (field) => {
    return profileErrors[field] ? (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i> {profileErrors[field]}
      </div>
    ) : null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm(profileData)) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsProfileSubmitting(true);

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          ...profileData,
          updatedAt: serverTimestamp()
        });
        alert("Profile updated successfully");
        setEditing(false);
        setProfileErrors({});
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  // Navigation to Add Blog
  const goToAddBlog = () => {
    navigate("/add-blog");
  };

  // Blog edit handlers
  const handleEditBlog = (blog) => {
    setEditingBlog({
      ...blog,
      title: capitalizeFirstLetter(blog.title),
      content: capitalizeFirstLetter(blog.content)
    });
  };


  // Add delete blog handler
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteDoc(doc(db, "blogs", blogId));
        
        // Update local state and recalculate total views
        const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
        const totalViews = updatedBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        
        setBlogs(updatedBlogs);
        setStats(prev => ({
          ...prev,
          totalBlogs: updatedBlogs.length,
          totalViews: totalViews,
          lastActive: updatedBlogs.length > 0 ? updatedBlogs[0].createdAt : null
        }));
        
        alert("Blog deleted successfully");
      } catch (error) {
        console.error("Error deleting blog:", error.message);
        alert("Error deleting blog. Please try again.");
      }
    }
  };

  // Add author info handlers
  const handleAuthorClick = (authorData) => {
    if (authorData) {
      setSelectedAuthor(authorData);
      setShowAuthorInfo(true);
    }
  };

  const closeAuthorInfo = () => {
    setShowAuthorInfo(false);
    setSelectedAuthor(null);
  };

  // Validation rules for edit form
  const validateEditForm = (formData) => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Blog Image URL validation
    if (!formData.blogImage.trim()) {
      newErrors.blogImage = 'Blog image URL is required';
    } else {
      try {
        new URL(formData.blogImage);
        // Check if the URL ends with an image extension
        const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = validImageExtensions.some(ext => 
          formData.blogImage.toLowerCase().endsWith(ext)
        );
        if (!hasValidExtension) {
          newErrors.blogImage = 'URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)';
        }
      } catch (e) {
        newErrors.blogImage = 'Please enter a valid URL';
      }
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to render error message
  const renderEditError = (field) => {
    return editErrors[field] ? (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i> {editErrors[field]}
      </div>
    ) : null;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm(editingBlog)) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const blogRef = doc(db, "blogs", editingBlog.id);
      await updateDoc(blogRef, {
        title: editingBlog.title.trim(),
        content: editingBlog.content.trim(),
        category: editingBlog.category,
        blogImage: editingBlog.blogImage.trim(),
        updatedAt: new Date()
      });

      // Update local state
      setBlogs(blogs.map(blog => 
        blog.id === editingBlog.id 
          ? { ...blog, ...editingBlog, updatedAt: new Date() }
          : blog
      ));

      setEditingBlog(null);
      setEditErrors({});
      alert("Blog updated successfully!");
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <header className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <span className="avatar-text">
              {profileData.firstName?.[0]}{profileData.lastName?.[0]}
            </span>
          </div>
          <div className="profile-welcome">
            <h1>Welcome, {profileData.firstName} {profileData.lastName}</h1>
            <p className="profile-subtitle">{profileData.email}</p>
            {profileData.location && (
              <p className="profile-location">
                <i className="fas fa-map-marker-alt"></i> {profileData.location}
              </p>
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <i className="fas fa-blog"></i>
            <div className="stat-info">
              <span className="stat-value">{stats.totalBlogs}</span>
              <span className="stat-label">Total Blogs</span>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-eye"></i>
            <div className="stat-info">
              <span className="stat-value">{stats.totalViews}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-clock"></i>
            <div className="stat-info">
              <span className="stat-value">{formatDate(stats.lastActive)}</span>
              <span className="stat-label">Last Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i> Profile Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          <i className="fas fa-blog"></i> My Blogs
        </button>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' ? (
        <div className="profile-section">
          <div className="section-header">
            <h2><i className="fas fa-user-circle"></i> Profile Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="edit-btn">
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label htmlFor="firstName">
                  <i className="fas fa-user"></i> First Name
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className={profileErrors.firstName ? 'error' : ''}
                  required
                />
                {renderProfileError('firstName')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  First name should be between 2 and 50 characters
                </small>
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
                  value={profileData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className={profileErrors.lastName ? 'error' : ''}
                  required
                />
                {renderProfileError('lastName')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  Last name should be between 2 and 50 characters
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                />
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> Email cannot be changed
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="languages">
                  <i className="fas fa-language"></i> Languages
                </label>
                <input
                  type="text"
                  id="languages"
                  name="languages"
                  value={profileData.languages}
                  onChange={handleChange}
                  placeholder="Enter languages you know (e.g., English, Spanish)"
                  className={profileErrors.languages ? 'error' : ''}
                />
                {renderProfileError('languages')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  List the languages you know, separated by commas
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="location">
                  <i className="fas fa-map-marker-alt"></i> Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  className={profileErrors.location ? 'error' : ''}
                />
                {renderProfileError('location')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  Enter your city, country, or general location
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="bio">
                  <i className="fas fa-book"></i> Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className={profileErrors.bio ? 'error' : ''}
                />
                {renderProfileError('bio')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  Write a brief description about yourself (max 500 characters)
                </small>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setEditing(false);
                    setProfileErrors({});
                  }} 
                  className="cancel-btn"
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isProfileSubmitting}
                >
                  {isProfileSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-group">
                <label><i className="fas fa-user"></i> First Name</label>
                <p>{profileData.firstName}</p>
              </div>
              <div className="info-group">
                <label><i className="fas fa-user"></i> Last Name</label>
                <p>{profileData.lastName}</p>
              </div>
              <div className="info-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <p>{profileData.email}</p>
              </div>
              <div className="info-group">
                <label><i className="fas fa-language"></i> Languages</label>
                <p>{profileData.languages || 'Not specified'}</p>
              </div>
              <div className="info-group">
                <label><i className="fas fa-map-marker-alt"></i> Location</label>
                <p>{profileData.location || 'Not specified'}</p>
              </div>
              {profileData.bio && (
                <div className="info-group">
                  <label><i className="fas fa-book"></i> Bio</label>
                  <p className="bio-text">{profileData.bio}</p>
                </div>
              )}
              <div className="profile-actions">
                <button onClick={handleLogout} className="logout-btn">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
                <button onClick={goToAddBlog} className="add-blog-btn">
                  <i className="fas fa-plus"></i> Add New Blog
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="blogs-section">
          <div className="section-header">
            <h2><i className="fas fa-blog"></i> My Blogs</h2>
            <button onClick={goToAddBlog} className="add-blog-btn">
              <i className="fas fa-plus"></i> New Blog
            </button>
          </div>

          {blogs.length === 0 ? (
            <div className="no-blogs">
              <div className="no-blogs-icon">
                <i className="fas fa-pen-fancy"></i>
              </div>
              <h3>No Blogs Yet</h3>
              <p>Start sharing your thoughts with the world!</p>
              <button onClick={goToAddBlog} className="create-blog-btn">
                <i className="fas fa-plus"></i> Create Your First Blog
              </button>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <div key={blog.id} className="blog-card">
                  <div className="blog-image-container">
                    {blog.blogImage ? (
                      <img 
                        src={blog.blogImage} 
                        alt={blog.title} 
                        className="blog-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/800x450?text=Blog+Image';
                        }}
                      />
                    ) : (
                      <div className="blog-image-placeholder">
                        <i className="fas fa-image"></i>
                        <span>No Image Available</span>
                      </div>
                    )}
                  </div>
                  <div className="blog-content">
                    <h4>{blog.title}</h4>
                    <p>{blog.content.substring(0, 150)}...</p>
                    <div className="blog-meta">
                      <div className="blog-author">
                        <i className="fas fa-user"></i>
                        <button 
                          className="author-name"
                          onClick={() => handleAuthorClick(blog.authorData)}
                          type="button"
                        >
                          {blog.authorName}
                        </button>
                      </div>
                      <div className="blog-date">
                        <i className="fas fa-calendar-alt"></i>
                        {formatDate(blog.createdAt)}
                      </div>
                    </div>
                    <div className="blog-actions">
                      <button 
                        onClick={() => handleEditBlog(blog)} 
                        className="edit-btn"
                        type="button"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBlog(blog.id)} 
                        className="delete-btn"
                        type="button"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Blog Modal */}
      {editingBlog && (
        <div className="edit-blog-modal">
          <div className="edit-blog-form">
            <div className="form-header">
              <h3><i className="fas fa-edit"></i> Edit Blog</h3>
              <button 
                className="close-edit-btn"
                onClick={() => {
                  setEditingBlog(null);
                  setEditErrors({});
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label htmlFor="edit-title">
                  <i className="fas fa-heading"></i> Blog Title
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editingBlog.title}
                  onChange={(e) => {
                    setEditingBlog(prev => ({ 
                      ...prev, 
                      title: capitalizeFirstLetter(e.target.value) 
                    }));
                    if (editErrors.title) {
                      setEditErrors(prev => ({ ...prev, title: null }));
                    }
                  }}
                  className={editErrors.title ? 'error' : ''}
                  maxLength={100}
                  placeholder="Enter a catchy title for your blog (5-100 characters)"
                />
                {renderEditError('title')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  Title should be between 5 and 100 characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">
                  <i className="fas fa-tags"></i> Category
                  <span className="required-mark">*</span>
                </label>
                <select
                  id="edit-category"
                  value={editingBlog.category}
                  onChange={(e) => {
                    setEditingBlog(prev => ({ ...prev, category: e.target.value }));
                    if (editErrors.category) {
                      setEditErrors(prev => ({ ...prev, category: null }));
                    }
                  }}
                  className={editErrors.category ? 'error' : ''}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {renderEditError('category')}
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">
                  <i className="fas fa-align-left"></i> Blog Content
                  <span className="required-mark">*</span>
                </label>
                <textarea
                  id="edit-content"
                  value={editingBlog.content}
                  onChange={(e) => {
                    setEditingBlog(prev => ({ 
                      ...prev, 
                      content: capitalizeFirstLetter(e.target.value) 
                    }));
                    if (editErrors.content) {
                      setEditErrors(prev => ({ ...prev, content: null }));
                    }
                  }}
                  className={editErrors.content ? 'error' : ''}
                  rows="12"
                  placeholder="Write your blog content here... (minimum 50 characters)"
                />
                {renderEditError('content')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  Write engaging content that captures your readers' attention. Minimum 50 characters required.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-blogImage">
                  <i className="fas fa-image"></i> Blog Image URL
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="url"
                  id="edit-blogImage"
                  value={editingBlog.blogImage}
                  onChange={(e) => {
                    setEditingBlog(prev => ({ ...prev, blogImage: e.target.value }));
                    if (editErrors.blogImage) {
                      setEditErrors(prev => ({ ...prev, blogImage: null }));
                    }
                  }}
                  className={editErrors.blogImage ? 'error' : ''}
                  placeholder="Enter the URL of your blog image (e.g., https://example.com/image.jpg)"
                />
                {renderEditError('blogImage')}
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> 
                  Add a high-quality image URL that ends with .jpg, .jpeg, .png, .gif, or .webp
                </small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setEditingBlog(null);
                    setEditErrors({});
                  }}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Author Info Modal */}
      {showAuthorInfo && selectedAuthor && (
        <div className="author-info-modal" onClick={closeAuthorInfo}>
          <div className="author-info-content" onClick={e => e.stopPropagation()}>
            <div className="author-info-header">
              <div className="author-avatar">
                <span className="avatar-text">
                  {selectedAuthor.firstName?.[0]}{selectedAuthor.lastName?.[0]}
                </span>
              </div>
              <button onClick={closeAuthorInfo} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="author-info-body">
              <h3>{selectedAuthor.firstName} {selectedAuthor.lastName}</h3>
              <div className="author-info-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <p>{selectedAuthor.email}</p>
              </div>
              {selectedAuthor.location && (
                <div className="author-info-group">
                  <label><i className="fas fa-map-marker-alt"></i> Location</label>
                  <p>{selectedAuthor.location}</p>
                </div>
              )}
              {selectedAuthor.languages && (
                <div className="author-info-group">
                  <label><i className="fas fa-language"></i> Languages</label>
                  <p>{selectedAuthor.languages}</p>
                </div>
              )}
              {selectedAuthor.bio && (
                <div className="author-info-group">
                  <label><i className="fas fa-book"></i> Bio</label>
                  <p className="bio-text">{selectedAuthor.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
