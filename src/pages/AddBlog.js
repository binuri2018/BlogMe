// src/pages/AddBlog.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import "./AddBlog.css";

function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [blogImage, setBlogImage] = useState("");
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
        backgroundImage,
        blogImage,
        authorName,
        userId: user.uid,
        createdAt: serverTimestamp(),
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
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Blog Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Background Image URL"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Blog Image URL"
          value={blogImage}
          onChange={(e) => setBlogImage(e.target.value)}
          required
        />
        <button type="submit">Add Blog</button>
      </form>
    </div>
  );
}

export default AddBlog;
