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
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    content: "",
    backgroundImage: "",
    blogImage: "",
  });

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
        setLoading(true);
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchUserBlogs();
  }, []);

  // Profile handlers
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, profileData);
        alert("Profile updated successfully");
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile. Please try again.");
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
    setBlogFormData({
      title: capitalizeFirstLetter(blog.title),
      content: capitalizeFirstLetter(blog.content),
      backgroundImage: blog.backgroundImage || "",
      blogImage: blog.blogImage || "",
    });
  };

  const handleBlogChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'content') {
      setBlogFormData(prev => ({
        ...prev,
        [name]: capitalizeFirstLetter(value)
      }));
    } else {
      setBlogFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveBlog = async () => {
    try {
      if (editingBlog) {
        const blogRef = doc(db, "blogs", editingBlog.id);
        const updatedData = {
          ...blogFormData,
          updatedAt: serverTimestamp(),
          views: editingBlog.views || 0 // Preserve the view count
        };
        
        await updateDoc(blogRef, updatedData);
        
        // Update the local blogs state
        const updatedBlogs = blogs.map((b) =>
          b.id === editingBlog.id ? { ...b, ...updatedData } : b
        );
        
        // Recalculate total views
        const totalViews = updatedBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        
        setBlogs(updatedBlogs);
        setStats(prev => ({
          ...prev,
          totalViews: totalViews
        }));
        
        alert("Blog updated successfully");
        setEditingBlog(null);
      }
    } catch (error) {
      console.error("Error updating blog:", error.message);
      alert("Error updating blog. Please try again.");
    }
  };

  // Add delete blog handler
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const blogToDelete = blogs.find(blog => blog.id === blogId);
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
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="profile-form">
              <div className="form-group">
                <label htmlFor="firstName">
                  <i className="fas fa-user"></i> First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">
                  <i className="fas fa-user"></i> Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                />
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
                />
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
                />
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
                />
                <small className="form-help">
                  <i className="fas fa-info-circle"></i> Write a brief description about yourself
                </small>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button type="submit" className="save-btn">
                  <i className="fas fa-save"></i> Save Changes
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
