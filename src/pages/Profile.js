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
  const navigate = useNavigate();

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
          const blogsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBlogs(blogsData);
          setStats(prev => ({
            ...prev,
            totalBlogs: blogsData.length,
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
    setEditingBlog(blog);
    setBlogFormData({
      title: blog.title,
      content: blog.content,
      backgroundImage: blog.backgroundImage || "",
      blogImage: blog.blogImage || "",
    });
  };

  const handleBlogChange = (e) => {
    setBlogFormData({ ...blogFormData, [e.target.name]: e.target.value });
  };

  const handleSaveBlog = async () => {
    try {
      if (editingBlog) {
        const blogRef = doc(db, "blogs", editingBlog.id);
        await updateDoc(blogRef, {
          ...blogFormData,
          updatedAt: serverTimestamp(),
        });
        alert("Blog updated successfully");

        // Update the local blogs state
        setBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            b.id === editingBlog.id ? { ...b, ...blogFormData } : b
          )
        );

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
        await deleteDoc(doc(db, "blogs", blogId));
        // Update local state
        setBlogs(blogs.filter(blog => blog.id !== blogId));
        alert("Blog deleted successfully");
      } catch (error) {
        console.error("Error deleting blog:", error.message);
        alert("Error deleting blog. Please try again.");
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
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
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            <i className="fas fa-blog"></i> My Blogs
          </button>
        </div>

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
              <form className="profile-edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    className="disabled"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="languages">Languages</label>
                  <input
                    type="text"
                    id="languages"
                    name="languages"
                    value={profileData.languages}
                    onChange={handleChange}
                    placeholder="Languages (e.g., English, Spanish)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    placeholder="Your Location"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-group">
                  <label>First Name</label>
                  <p>{profileData.firstName}</p>
                </div>
                <div className="info-group">
                  <label>Last Name</label>
                  <p>{profileData.lastName}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="info-group">
                  <label>Languages</label>
                  <p>{profileData.languages || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Location</label>
                  <p>{profileData.location || 'Not specified'}</p>
                </div>
                {profileData.bio && (
                  <div className="info-group full-width">
                    <label>Bio</label>
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
                <i className="fas fa-plus"></i> Add New Blog
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading your blogs...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="no-blogs">
                <i className="fas fa-pen-fancy"></i>
                <h3>No Blogs Yet</h3>
                <p>Start sharing your thoughts with the world!</p>
                <button onClick={goToAddBlog} className="add-blog-btn">
                  <i className="fas fa-plus"></i> Create Your First Blog
                </button>
              </div>
            ) : (
              <div className="blogs-grid">
                {blogs.map((blog) => (
                  <div key={blog.id} className="blog-card">
                    {blog.backgroundImage && (
                      <div 
                        className="blog-background" 
                        style={{ backgroundImage: `url(${blog.backgroundImage})` }}
                      >
                        <div className="blog-overlay"></div>
                      </div>
                    )}
                    <div className="blog-content">
                      <div className="blog-content-wrapper">
                        {blog.blogImage && (
                          <div className="blog-thumbnail-wrapper">
                            <img 
                              src={blog.blogImage} 
                              alt={blog.title} 
                              className="blog-thumbnail"
                            />
                          </div>
                        )}
                        <div className="blog-header">
                          <h4>{blog.title}</h4>
                          <div className="blog-meta">
                            <span className="blog-author">
                              <i className="fas fa-user"></i> {profileData.firstName} {profileData.lastName}
                            </span>
                            <div className="blog-date">
                              <i className="far fa-calendar-alt"></i>
                              {formatDate(blog.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="blog-body">
                        <p className="blog-excerpt">{blog.content}</p>
                      </div>
                      <div className="blog-actions">
                        <button 
                          onClick={() => handleEditBlog(blog)} 
                          className="edit-btn"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)} 
                          className="delete-btn"
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editingBlog && (
        <div className="edit-blog-modal">
          <div className="edit-blog-form">
            <div className="modal-header">
              <h3><i className="fas fa-edit"></i> Edit Blog</h3>
              <button onClick={() => setEditingBlog(null)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBlog(); }}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={blogFormData.title}
                  onChange={handleBlogChange}
                  placeholder="Blog Title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={blogFormData.content}
                  onChange={handleBlogChange}
                  placeholder="Blog Content"
                  rows="6"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="backgroundImage">Background Image URL</label>
                <input
                  type="text"
                  id="backgroundImage"
                  name="backgroundImage"
                  value={blogFormData.backgroundImage}
                  onChange={handleBlogChange}
                  placeholder="Background Image URL"
                />
              </div>
              <div className="form-group">
                <label htmlFor="blogImage">Blog Image URL</label>
                <input
                  type="text"
                  id="blogImage"
                  name="blogImage"
                  value={blogFormData.blogImage}
                  onChange={handleBlogChange}
                  placeholder="Blog Image URL"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="save-btn">
                  <i className="fas fa-save"></i> Save Changes
                </button>
                <button type="button" onClick={() => setEditingBlog(null)} className="cancel-btn">
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
