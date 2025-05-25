// src/pages/AddBlog.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
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
    <div className="add-blog-container">
      <h2>Add New Blog</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Blog Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter your blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
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
          <label htmlFor="content">Blog Content</label>
          <textarea
            id="content"
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="10"
          />
        </div>

        <div className="form-group">
          <label htmlFor="blogImage">Blog Image URL</label>
          <input
            type="url"
            id="blogImage"
            placeholder="Enter the URL of your blog image"
            value={blogImage}
            onChange={(e) => setBlogImage(e.target.value)}
            required
          />
          <small className="form-help">Enter a valid image URL (e.g., https://example.com/image.jpg)</small>
        </div>

        <button type="submit" className="submit-button">
          <i className="fas fa-paper-plane"></i> Publish Blog
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
