import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import './BlogViewModal.css';

const BlogViewModal = ({ blog, onClose, onLikeUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (blog.likedBy?.includes(auth.currentUser?.uid)) {
      setIsLiked(true);
    }
    // Initialize comments from blog data
    setComments(blog.comments || []);
  }, [blog]);

  const handleLike = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to like blogs');
        return;
      }

      const blogRef = doc(db, 'blogs', blog.id);
      const hasLiked = blog.likedBy?.includes(user.uid);

      await updateDoc(blogRef, {
        likes: increment(hasLiked ? -1 : 1),
        likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });

      const updatedBlog = {
        ...blog,
        likes: (blog.likes || 0) + (hasLiked ? -1 : 1),
        likedBy: hasLiked 
          ? (blog.likedBy || []).filter(id => id !== user.uid)
          : [...(blog.likedBy || []), user.uid]
      };

      setIsLiked(!hasLiked);
      onLikeUpdate(updatedBlog);
    } catch (error) {
      console.error('Error updating like:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  const getUserDisplayName = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const { firstName, lastName } = userDoc.data();
        return `${firstName} ${lastName}`;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return user.displayName || 'Anonymous';
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to comment');
        return;
      }

      setIsSubmitting(true);

      // Get user's full name from Firestore
      const userDisplayName = await getUserDisplayName(user);

      const newComment = {
        id: Date.now().toString(), // Temporary ID for optimistic update
        text: commentText.trim(),
        userId: user.uid,
        userDisplayName: userDisplayName,
        userPhotoURL: user.photoURL,
        createdAt: Timestamp.now(),
      };

      const blogRef = doc(db, 'blogs', blog.id);
      
      // Optimistically update the UI
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setCommentText('');

      // Update Firestore
      await updateDoc(blogRef, {
        comments: arrayUnion(newComment)
      });

      // Get the updated document to ensure we have the correct data
      const updatedDoc = await getDoc(blogRef);
      const updatedData = updatedDoc.data();
      
      // Update comments with the actual data from Firestore
      setComments(updatedData.comments || []);

    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
      // Revert optimistic update on error
      setComments(comments);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to delete comments');
        return;
      }

      const commentToDelete = comments.find(c => c.id === commentId);
      if (!commentToDelete || commentToDelete.userId !== user.uid) {
        alert('You can only delete your own comments');
        return;
      }

      const blogRef = doc(db, 'blogs', blog.id);
      
      // Optimistically update the UI
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);

      // Update Firestore
      await updateDoc(blogRef, {
        comments: arrayRemove(commentToDelete)
      });

      // Get the updated document to ensure we have the correct data
      const updatedDoc = await getDoc(blogRef);
      const updatedData = updatedDoc.data();
      
      // Update comments with the actual data from Firestore
      setComments(updatedData.comments || []);

    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
      // Revert optimistic update on error
      setComments(comments);
    }
  };

  // Helper function to format comment date
  const formatCommentDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    
    // Check if it's a Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    
    // If it's a regular Date object or timestamp number
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="blog-view-modal-overlay" onClick={onClose}>
      <div className="blog-view-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-content">
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

          <div className="modal-blog-content">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="modal-blog-paragraph">{paragraph}</p>
            ))}
          </div>

          <div className="modal-blog-stats">
            <span className="modal-blog-stat">
              <i className="far fa-eye"></i>
              {blog.views || 0} views
            </span>
            <span className="modal-blog-stat">
              <i className="far fa-comment"></i>
              {comments.length} comments
            </span>
            <button 
              className={`modal-blog-stat like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              title={auth.currentUser ? "Click to like" : "Sign in to like"}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              {blog.likes || 0}
            </button>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            
            {/* Add Comment Form */}
            {auth.currentUser ? (
              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows="3"
                  maxLength="500"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="submit-comment"
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <p className="login-to-comment">
                Please <a href="/login">sign in</a> to leave a comment.
              </p>
            )}

            {/* Comments List */}
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <div className="comment-user">
                        {comment.userPhotoURL ? (
                          <img 
                            src={comment.userPhotoURL} 
                            alt={comment.userDisplayName} 
                            className="comment-user-avatar"
                          />
                        ) : (
                          <div className="comment-user-avatar-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                        <span className="comment-user-name">{comment.userDisplayName}</span>
                      </div>
                      <div className="comment-meta">
                        <span className="comment-date">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                        {auth.currentUser && comment.userId === auth.currentUser.uid && (
                          <button 
                            className="delete-comment"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete comment"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal; 