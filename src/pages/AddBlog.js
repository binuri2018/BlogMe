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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create a blog");
        return;
      }

      await addDoc(collection(db, "blogs"), {
        title,
        content,
        blogImage,
        category,
        authorName,
        userId: user.uid,
        createdAt: serverTimestamp(),
        views: 0,
        lastViewedBy: null,
        lastViewedAt: null,
        likes: 0,
        comments: []
      });
      alert("Blog added successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error adding blog:", error.message);
      alert("Failed to add blog. Please try again.");
    }
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
              </label>
              <input
                type="text"
                id="title"
                placeholder="Enter a catchy title for your blog"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                <i className="fas fa-tags"></i> Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content">
                <i className="fas fa-align-left"></i> Blog Content
              </label>
              <textarea
                id="content"
                placeholder="Write your blog content here... (You can use multiple paragraphs)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows="12"
              />
              <small className="form-help">
                <i className="fas fa-info-circle"></i> 
                Write engaging content that captures your readers' attention. Use paragraphs to organize your thoughts.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="blogImage">
                <i className="fas fa-image"></i> Blog Image URL
              </label>
              <input
                type="url"
                id="blogImage"
                placeholder="Enter the URL of your blog image (e.g., https://example.com/image.jpg)"
                value={blogImage}
                onChange={(e) => setBlogImage(e.target.value)}
                required
              />
              <small className="form-help">
                <i className="fas fa-info-circle"></i> 
                Add a high-quality image that represents your blog post. Recommended size: 800x450 pixels.
              </small>
            </div>

            <div className="form-actions">
              <Link to="/home" className="cancel-button">
                <i className="fas fa-times"></i> Cancel
              </Link>
              <button type="submit" className="submit-button">
                <i className="fas fa-paper-plane"></i> Publish Blog
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AddBlog;
