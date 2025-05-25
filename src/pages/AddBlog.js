// src/pages/AddBlog.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import "./AddBlog.css";

function AddBlog() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    backgroundImage: "",
    blogImage: "",
    category: ""
  });

  const categories = [
    { value: "personal", label: "Personal Blog", icon: "fas fa-pen-fancy" },
    { value: "tech", label: "Tech Blog", icon: "fas fa-laptop-code" },
    { value: "food", label: "Food Blog", icon: "fas fa-utensils" },
    { value: "photo", label: "Photo Blog", icon: "fas fa-camera" },
    { value: "book", label: "Book Reviews", icon: "fas fa-book" },
    { value: "travel", label: "Travel Blog", icon: "fas fa-plane" }
  ];

  const [authorName, setAuthorName] = useState("");
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const blogData = {
        ...formData,
        userId: user.uid,
        authorName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        category: formData.category || "personal"
      };

      await addDoc(collection(db, "blogs"), blogData);
      navigate("/profile");
    } catch (error) {
      console.error("Error adding blog:", error);
      alert("Error adding blog. Please try again.");
    }
  };

  return (
    <div className="add-blog-page">
      <div className="add-blog-container">
        <h1>Create New Blog</h1>
        <form onSubmit={handleSubmit} className="blog-form">
          <input
            type="text"
            placeholder="Blog Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            placeholder="Blog Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Background Image URL"
            name="backgroundImage"
            value={formData.backgroundImage}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Blog Image URL"
            name="blogImage"
            value={formData.blogImage}
            onChange={handleChange}
            required
          />
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-select">
              {categories.map((cat) => (
                <label key={cat.value} className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formData.category === cat.value}
                    onChange={handleChange}
                  />
                  <i className={cat.icon}></i>
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit">Add Blog</button>
        </form>
      </div>
    </div>
  );
}

export default AddBlog;
