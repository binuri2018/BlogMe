// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(blogList);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <button onClick={() => navigate("/add-blog")}>Add Blog</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="blog-feed">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="blog-card"
            style={{ backgroundImage: `url(${blog.backgroundImage})` }}
          >
            <h3>{blog.title}</h3>
            <p>by {blog.authorName}</p>
            <div className="blog-content">
              <img src={blog.blogImage} alt="Blog" />
              <p>{blog.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
