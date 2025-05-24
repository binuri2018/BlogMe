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
    <div className="profile-container">
      <div className="profile-section">
        <h2>My Profile</h2>
        {editing ? (
          <div className="profile-edit-form">
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              placeholder="Email"
              disabled
            />
            <input
              type="text"
              name="languages"
              value={profileData.languages}
              onChange={handleChange}
              placeholder="Languages"
            />
            <div className="button-group">
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <p><strong>First Name:</strong> {profileData.firstName}</p>
            <p><strong>Last Name:</strong> {profileData.lastName}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Languages:</strong> {profileData.languages}</p>
            <button onClick={() => setEditing(true)} className="edit-btn">Edit Profile</button>
          </div>
        )}

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>

        <button onClick={goToAddBlog} className="add-blog-btn">
          Add a Blog
        </button>
      </div>

      <div className="blogs-section">
        <h3>My Blogs</h3>
        {blogs.length === 0 ? (
          <p className="no-blogs">You have no blogs yet. Start writing!</p>
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
                      Edit Blog
                    </button>
                    <button 
                      onClick={() => handleDeleteBlog(blog.id)} 
                      className="delete-btn"
                      type="button"
                    >
                      Delete Blog
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingBlog && (
        <div className="edit-blog-modal">
          <div className="edit-blog-form">
            <h3>Edit Blog</h3>
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
              <button onClick={handleSaveBlog} className="save-btn">Save Changes</button>
              <button onClick={() => setEditingBlog(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
