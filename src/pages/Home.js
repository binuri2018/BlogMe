// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');

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
                    <span className="author">
                      <i className="fas fa-user"></i> {blog.authorName}
                    </span>
                    <span className="date">
                      <i className="far fa-calendar-alt"></i> {new Date(blog.createdAt?.toDate()).toLocaleDateString()}
                    </span>

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

      </main>

    </div>
  );
}

export default Home;
