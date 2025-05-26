// src/pages/Home.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Home.css';
import AuthorProfileModal from '../components/AuthorProfileModal';
import BlogViewModal from '../components/BlogViewModal';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'food', label: 'Food & Cooking' },
    { value: 'travel', label: 'Travel' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const blogsQuery = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(blogsQuery, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          author: {
            displayName: data.authorName || data.author?.displayName || 'Anonymous',
            uid: data.userId || data.author?.uid || null,
            photoURL: data.authorPhotoURL || data.author?.photoURL || null
          }
        };
      });
      setBlogs(blogsData);
      setFilteredBlogs(blogsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog => blog.category === selectedCategory);
      setFilteredBlogs(filtered);
    }
  }, [selectedCategory, blogs]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleAuthorClick = (author) => {
    if (author && author.uid) {
      setSelectedAuthor(author);
    }
  };

  const handleBlogClick = async (blog) => {
    try {
      // Get the blog document reference
      const blogRef = doc(db, 'blogs', blog.id);
      
      // Get the current blog data to check last view
      const blogDoc = await getDoc(blogRef);
      const blogData = blogDoc.data();
      
      // Get user's last view timestamp from localStorage
      const lastViewKey = `lastView_${blog.id}`;
      const lastView = localStorage.getItem(lastViewKey);
      const now = new Date().getTime();
      
      // Only increment view if:
      // 1. User hasn't viewed this blog in the last hour
      // 2. Or if it's a different user (based on auth state)
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      const shouldIncrementView = !lastView || 
        (now - parseInt(lastView) > oneHour) || 
        (auth.currentUser && blogData.lastViewedBy !== auth.currentUser.uid);

      if (shouldIncrementView) {
        // Update the view count
        await updateDoc(blogRef, {
          views: increment(1),
          lastViewedBy: auth.currentUser ? auth.currentUser.uid : 'anonymous',
          lastViewedAt: new Date()
        });

        // Update local storage with current timestamp
        localStorage.setItem(lastViewKey, now.toString());

        // Update the blog object in state to reflect new view count
        setSelectedBlog(prevBlog => {
          if (!prevBlog) return blog;
          return {
            ...prevBlog,
            views: (prevBlog.views || 0) + 1
          };
        });
      } else {
        // If we're not incrementing views, just set the blog
        setSelectedBlog(blog);
      }
    } catch (error) {
      console.error('Error updating view count:', error);
      // Still open the modal even if view count update fails
      setSelectedBlog(blog);
    }
  };

  const handleCloseBlogModal = () => {
    setSelectedBlog(null);
  };

  const features = [
    {
      icon: 'fas fa-pen-fancy',
      title: 'Create Your Blog',
      description: 'Start your blogging journey with our easy-to-use platform. Share your thoughts and stories with the world.'
    },
    {
      icon: 'fas fa-paint-brush',
      title: 'Beautiful Design',
      description: 'Choose from a variety of stunning templates and customize your blog to match your style.'
    },
    {
      icon: 'fas fa-globe',
      title: 'Get a Domain',
      description: 'Get your own custom domain or use our free blogspot.com domain to establish your online presence.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Know Your Audience',
      description: 'Track your blog\'s performance with built-in analytics and understand your readers better.'
    }
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="home-header">
        <div className="header-content">
          <h1>Publish your passions, your way</h1>
          <p className="header-subtitle">
            Create a unique and beautiful blog. It's easy and free.
          </p>
          <Link to="/add-blog" className="cta-button">
            Create your blog
          </Link>
        </div>
      </header>

      {/* Blog Feed Section */}
      <section className="blog-feed">
        <div className="section-header">
          <div className="section-header-content">
            <h2>Latest Stories</h2>
            <p>Discover the most recent posts from our community</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <div className="category-filter-container">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`category-filter-button ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="blog-grid">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map(blog => (
              <div 
                key={blog.id} 
                className="blog-card"
                onClick={() => handleBlogClick(blog)}
                style={{ cursor: 'pointer' }}
              >
                <div className="blog-image-container">
                  {blog.blogImage ? (
                    <img 
                      src={blog.blogImage} 
                      alt={blog.title} 
                      className="blog-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x450?text=Blog+Image';
                      }}
                    />
                  ) : (
                    <div className="blog-image-placeholder">
                      <i className="fas fa-image"></i>
                      <span>No Image Available</span>
                    </div>
                  )}
                </div>
                <div className="blog-content">
                  <div className="blog-category">
                    {blog.category ? blog.category.charAt(0).toUpperCase() + blog.category.slice(1) : 'Uncategorized'}
                  </div>
                  <h3 className="blog-title">
                    {blog.title}
                  </h3>
                  <div className="blog-excerpt-container">
                    <p className="blog-excerpt">
                      {blog.content ? (
                        blog.content.split('\n')[0].substring(0, 150) + (blog.content.split('\n')[0].length > 150 ? '...' : '')
                      ) : 'No content available'}
                    </p>
                  </div>
                  <div className="blog-meta">
                    <div className="blog-meta-left">
                      <span 
                        className={`author ${blog.author?.uid ? 'clickable' : ''}`} 
                        onClick={() => blog.author?.uid && handleAuthorClick(blog.author)}
                      >
                        <i className="fas fa-user"></i>
                        {blog.author?.displayName || blog.authorName || 'Anonymous'}
                      </span>
                      <span className="blog-date">
                        <i className="far fa-clock"></i>
                        {blog.createdAt ? new Date(blog.createdAt.toDate()).toLocaleDateString() : 'Date not available'}
                      </span>
                    </div>
                    <div className="blog-stats">
                      <span className="blog-stat">
                        <i className="far fa-eye"></i>
                        {blog.views || 0}
                      </span>
                      <span className="blog-stat">
                        <i className="far fa-comment"></i>
                        {blog.comments?.length || 0}
                      </span>
                      <span className="blog-stat">
                        <i className="far fa-heart"></i>
                        {blog.likes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-blogs-message">
              <i className="fas fa-newspaper"></i>
              <h3>No blogs found</h3>
              <p>There are no blogs in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Blog Me?</h2>
          <p>Everything you need to start your blogging journey</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <i className={`feature-icon ${feature.icon}`}></i>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section about-us">
            <h3>About Us</h3>
            <p>Blog Me is a modern platform for writers and readers to share their stories, experiences, and knowledge. We believe in the power of storytelling and creating meaningful connections through written content.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-section contact">
            <h3>Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>support@blogme.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Blog Street, Digital City, 12345</span>
              </div>
            </div>
          </div>

          <div className="footer-section quick-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/add-blog">Write a Blog</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Blog Me. All rights reserved.</p>
        </div>
      </footer>

      {/* Author Profile Modal */}
      {selectedAuthor && (
        <AuthorProfileModal
          author={selectedAuthor}
          onClose={() => setSelectedAuthor(null)}
        />
      )}

      {/* Blog View Modal */}
      {selectedBlog && (
        <BlogViewModal
          blog={selectedBlog}
          onClose={handleCloseBlogModal}
        />
      )}
    </div>
  );
};

export default Home;
