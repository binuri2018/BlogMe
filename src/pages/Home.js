// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import './Home.css';
import AuthorProfileModal from '../components/AuthorProfileModal';

function Home() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);

  const categories = [
    { value: 'all', label: 'All Blogs', icon: 'fas fa-th-large' },
    { value: 'personal', label: 'Personal Blog', icon: 'fas fa-pen-fancy' },
    { value: 'tech', label: 'Tech Blog', icon: 'fas fa-laptop-code' },
    { value: 'food', label: 'Food Blog', icon: 'fas fa-utensils' },
    { value: 'photo', label: 'Photo Blog', icon: 'fas fa-camera' },
    { value: 'book', label: 'Book Reviews', icon: 'fas fa-book' },
    { value: 'travel', label: 'Travel Blog', icon: 'fas fa-plane' }
  ];

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const blogsRef = collection(db, "blogs");
        const q = query(
          blogsRef, 
          orderBy("createdAt", "desc"), 
          limit(selectedCategory === 'all' ? 12 : 6)
        );
        const querySnapshot = await getDocs(q);
        const blogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter blogs by category if not 'all'
        const filteredBlogs = selectedCategory === 'all' 
          ? blogs 
          : blogs.filter(blog => blog.category === selectedCategory);
        
        setFeaturedBlogs(filteredBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, [selectedCategory]);

  const handleAuthorClick = (e, userId) => {
    e.preventDefault(); // Prevent navigation to blog
    e.stopPropagation(); // Prevent event bubbling
    setSelectedAuthorId(userId);
  };

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

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.value}
              className={`category-filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <i className={category.icon}></i>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading featured blogs...</p>
          </div>
        ) : featuredBlogs.length === 0 ? (
          <div className="no-blogs">
            <i className="fas fa-pen-fancy"></i>
            <h3>No Blogs Found</h3>
            <p>No blogs available in this category yet.</p>
            <Link to="/add-blog" className="cta-button">
              Be the first to write
            </Link>
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
                  <div className="blog-category">
                    <i className={categories.find(cat => cat.value === blog.category)?.icon}></i>
                    {categories.find(cat => cat.value === blog.category)?.label}
                  </div>
                  <h3>{blog.title}</h3>
                  <p className="featured-excerpt">{blog.content.substring(0, 150)}...</p>
                  <div className="featured-meta">
                    <span 
                      className="author clickable"
                      onClick={(e) => handleAuthorClick(e, blog.userId)}
                    >
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
              <h3>{category.label}</h3>
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

      {/* Author Profile Modal */}
      {selectedAuthorId && (
        <AuthorProfileModal
          authorId={selectedAuthorId}
          onClose={() => setSelectedAuthorId(null)}
        />
      )}
    </div>
  );
}

export default Home;
