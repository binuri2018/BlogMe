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
  });
  const [editing, setEditing] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    content: "",
    backgroundImage: "",
    blogImage: "",
  });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'blogs'
  const navigate = useNavigate();

  // Fetch profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
        <div className="profile-avatar">
          {profileData.firstName && profileData.lastName && (
            <div className="avatar-text">
              {profileData.firstName[0]}{profileData.lastName[0]}
            </div>
          )}
        </div>
        <div className="profile-welcome">
          <h1>Welcome, {profileData.firstName}!</h1>
          <p className="profile-subtitle">Manage your profile and blogs</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          My Blogs
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' ? (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="edit-btn">
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
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
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    disabled
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
                <div className="button-group">
                  <button onClick={handleSave} className="save-btn">Save Changes</button>
                  <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
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
                  <p>{profileData.languages}</p>
                </div>
              </div>
            )}

            <div className="profile-actions">
              <button onClick={goToAddBlog} className="add-blog-btn">
                <i className="fas fa-plus"></i> Create New Blog
              </button>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="blogs-section">
            <div className="section-header">
              <h2>My Blogs</h2>
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
                  Create Your First Blog
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
                      />
                    )}
                    <div className="blog-content">
                      <h4>{blog.title}</h4>
                      <p>{blog.content.substring(0, 150)}...</p>
                      {blog.blogImage && (
                        <img 
                          src={blog.blogImage} 
                          alt={blog.title} 
                          className="blog-thumbnail"
                        />
                      )}
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
      </div>

      {editingBlog && (
        <div className="edit-blog-modal">
          <div className="edit-blog-form">
            <div className="modal-header">
              <h3>Edit Blog</h3>
              <button 
                onClick={() => setEditingBlog(null)} 
                className="close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
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
                required
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
                required
              />
            </div>
            <div className="button-group">
              <button onClick={handleSaveBlog} className="save-btn">
                <i className="fas fa-save"></i> Save Changes
              </button>
              <button onClick={() => setEditingBlog(null)} className="cancel-btn">
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
