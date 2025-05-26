import React from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import './BlogViewModal.css';

const BlogViewModal = ({ blog, onClose, onLikeUpdate }) => {
  if (!blog) return null;

  const handleLike = async (e) => {
    e.stopPropagation();
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to like blogs');
        return;
      }

      const blogRef = doc(db, 'blogs', blog.id);
      const blogDoc = await getDoc(blogRef);
      const blogData = blogDoc.data();

      if (!blogData) {
        console.error('Blog not found');
        return;
      }

      // Check if user has already liked this blog
      const hasLiked = blogData.likedBy?.includes(user.uid);
      
      // Update Firestore
      await updateDoc(blogRef, {
        likes: increment(hasLiked ? -1 : 1),
        likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });

      // Get the updated document to ensure we have the correct data
      const updatedDoc = await getDoc(blogRef);
      const updatedData = updatedDoc.data();

      // Call the onLikeUpdate callback with the updated data
      if (onLikeUpdate) {
        onLikeUpdate({
          ...blog,
          likes: updatedData.likes || 0,
          likedBy: updatedData.likedBy || []
        });
      }

    } catch (error) {
      console.error('Error updating like:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  const isLiked = blog.likedBy?.includes(auth.currentUser?.uid);

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
            <button 
              className={`modal-blog-stat like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              title={auth.currentUser ? "Click to like" : "Sign in to like"}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              {blog.likes || 0} likes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal; 