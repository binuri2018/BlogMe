// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, orderBy("createdAt", "desc"), limit(6));
        const querySnapshot = await getDocs(q);
        const blogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedBlogs(blogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  const categories = [
    { icon: 'fas fa-pen-fancy', title: 'Personal Blog', description: 'Share your thoughts and experiences' },
    { icon: 'fas fa-laptop-code', title: 'Tech Blog', description: 'Write about technology and innovation' },
    { icon: 'fas fa-utensils', title: 'Food Blog', description: 'Share your culinary adventures' },
    { icon: 'fas fa-camera', title: 'Photo Blog', description: 'Showcase your photography' },
    { icon: 'fas fa-book', title: 'Book Reviews', description: 'Share your literary insights' },
    { icon: 'fas fa-plane', title: 'Travel Blog', description: 'Document your journeys' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Publish your passions, your way</h1>
          <p>Create a unique and beautiful blog. It's easy and free.</p>
          <Link to="/add-blog" className="cta-button">
            Create your blog
          </Link>
        </div>
        <div className="hero-background"></div>
      </section>

      {/* Featured Blogs Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Blogs</h2>
          <p>Discover stories, thinking, and expertise from writers on any topic.</p>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading featured blogs...</p>
          </div>
        ) : (
          <div className="featured-grid">
            {featuredBlogs.map((blog) => (
              <Link to={`/blog/${blog.id}`} key={blog.id} className="featured-card">
                {blog.blogImage && (
                  <div className="featured-image">
                    <img src={blog.blogImage} alt={blog.title} />
                  </div>
                )}
                <div className="featured-content">
                  <h3>{blog.title}</h3>
                  <p className="featured-excerpt">{blog.content.substring(0, 150)}...</p>
                  <div className="featured-meta">
                    <span className="author">
                      <i className="fas fa-user"></i> {blog.authorName}
                    </span>
                    <span className="date">
                      <i className="far fa-calendar-alt"></i> {new Date(blog.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Choose your category</h2>
          <p>Find the perfect category for your blog</p>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">
                <i className={category.icon}></i>
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <Link to="/add-blog" className="category-link">
                Start writing <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to start your blogging journey?</h2>
          <p>Join millions of others and share your story with the world.</p>
          <Link to="/add-blog" className="cta-button">
            Create your blog
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
