// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(blogList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-content">
          <h1>Blog Me</h1>
          <p className="header-subtitle">Discover stories, thinking, and expertise from writers on any topic.</p>
        </div>
      </header>

      <main className="home-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="no-blogs">
            <div className="no-blogs-icon">
              <i className="fas fa-pen-fancy"></i>
            </div>
            <h2>No Blogs Yet</h2>
            <p>Be the first to share your story!</p>
          </div>
        ) : (
          <div className="blog-feed">
            {blogs.map((blog) => (
              <article 
                key={blog.id} 
                className="blog-card"
                style={{ backgroundImage: `url(${blog.backgroundImage})` }}
              >
                <div className="blog-overlay"></div>
                <div className="blog-card-content">
                  <div className="blog-text-content">
                    <div className="blog-header">
                      <h2>{blog.title}</h2>
                      <div className="blog-meta">
                        <span className="author">
                          <i className="fas fa-user"></i> {blog.authorName}
                        </span>
                        {blog.createdAt && (
                          <span className="date">
                            <i className="fas fa-calendar"></i> {formatDate(blog.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="blog-content">
                      <p>{blog.content}</p>
                    </div>
                  </div>

                  {blog.blogImage && (
                    <div className="blog-image-container">
                      <img 
                        src={blog.blogImage} 
                        alt={blog.title} 
                        className="blog-image"
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
