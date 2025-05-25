import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './AuthorProfileModal.css';

function AuthorProfileModal({ author, onClose }) {
  const [authorData, setAuthorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (author?.uid) {
        try {
          const docRef = doc(db, "users", author.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAuthorData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching author data:", error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAuthorData();
  }, [author]);

  if (!author || !author.uid) return null;

  return (
    <div className="author-modal-overlay" onClick={onClose}>
      <div className="author-modal-content" onClick={e => e.stopPropagation()}>
        <div className="author-modal-header">
          <div className="author-avatar">
            <span className="avatar-text">
              {authorData ? `${authorData.firstName?.[0] || ''}${authorData.lastName?.[0] || ''}` : '?'}
            </span>
          </div>
          <button onClick={onClose} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="author-modal-loading">
            <div className="loading-spinner"></div>
            <p>Loading author information...</p>
          </div>
        ) : authorData ? (
          <div className="author-modal-body">
            <h3>{`${authorData.firstName || ''} ${authorData.lastName || ''}`}</h3>
            
            <div className="author-info-group">
              <label><i className="fas fa-envelope"></i> Email</label>
              <p>{authorData.email}</p>
            </div>

            {authorData.location && (
              <div className="author-info-group">
                <label><i className="fas fa-map-marker-alt"></i> Location</label>
                <p>{authorData.location}</p>
              </div>
            )}

            {authorData.languages && (
              <div className="author-info-group">
                <label><i className="fas fa-language"></i> Languages</label>
                <p>{authorData.languages}</p>
              </div>
            )}

            {authorData.bio && (
              <div className="author-info-group">
                <label><i className="fas fa-book"></i> Bio</label>
                <p className="bio-text">{authorData.bio}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="author-modal-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>Could not load author information</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorProfileModal; 