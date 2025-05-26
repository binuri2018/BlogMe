import React from 'react';
import './BlogViewModal.css';

const BlogViewModal = ({ blog, onClose }) => {
  if (!blog) return null;

  return (
    <div className="blog-view-modal-overlay" onClick={onClose}>
      <div className="blog-view-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-content">
          {blog.blogImage && (
            <div className="modal-blog-image-container">
              <img 
                src={blog.blogImage} 
                alt={blog.title} 
                className="modal-blog-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x450?text=Blog+Image';
                }}
              />
            </div>
          )}
          
          <div className="modal-blog-header">
            <div className="modal-blog-category">
              {blog.category ? blog.category.charAt(0).toUpperCase() + blog.category.slice(1) : 'Uncategorized'}
            </div>
            <h2 className="modal-blog-title">{blog.title}</h2>
            <div className="modal-blog-meta">
              <span className="modal-blog-author">
                <i className="fas fa-user"></i>
                {blog.author?.displayName || blog.authorName || 'Anonymous'}
              </span>
              <span className="modal-blog-date">
                <i className="far fa-clock"></i>
                {blog.createdAt ? new Date(blog.createdAt.toDate()).toLocaleDateString() : 'Date not available'}
              </span>
            </div>
          </div>

          <div className="modal-blog-content">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="modal-blog-paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="modal-blog-stats">
            <span className="modal-blog-stat">
              <i className="far fa-eye"></i>
              {blog.views || 0} views
            </span>
            <span className="modal-blog-stat">
              <i className="far fa-comment"></i>
              {blog.comments?.length || 0} comments
            </span>
            <span className="modal-blog-stat">
              <i className="far fa-heart"></i>
              {blog.likes || 0} likes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal; 