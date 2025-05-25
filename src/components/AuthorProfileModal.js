import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './AuthorProfileModal.css';

function AuthorProfileModal({ authorId, onClose }) {
  const [authorData, setAuthorData] = useState(null);
  const [blogCount, setBlogCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper function to format languages
  const formatLanguages = (languages) => {
    if (!languages) return [];
    if (Array.isArray(languages)) return languages;
    if (typeof languages === 'string') {
      return languages.split(',').map(lang => lang.trim()).filter(lang => lang);
    }
    if (typeof languages === 'object') {
      return Object.values(languages).filter(lang => lang);
    }
    return [];
  };

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", authorId));
        if (userDoc.exists()) {
          setAuthorData(userDoc.data());
        }

        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, where("userId", "==", authorId));
        const querySnapshot = await getDocs(q);
        setBlogCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching author data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  if (!authorId) return null;

  const languages = formatLanguages(authorData?.languages);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        {loading ? (
          <div className="modal-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading profile...</p>
          </div>
        ) : authorData ? (
          <div className="author-profile">
            <div className="profile-main">
              <div className="profile-avatar">
                {authorData.profilePicture ? (
                  <img src={authorData.profilePicture} alt={authorData.firstName} />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <div className="profile-info">
                <h2>{authorData.firstName} {authorData.lastName}</h2>
                <div className="profile-meta">
                  {authorData.location && (
                    <span className="meta-item">
                      <i className="fas fa-map-marker-alt"></i>
                      {authorData.location}
                    </span>
                  )}
                  <span className="meta-item">
                    <i className="fas fa-pen-fancy"></i>
                    {blogCount} blogs
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <span>{authorData.email || "Not available"}</span>
              </div>
              
              <div className="detail-item languages">
                <i className="fas fa-language"></i>
                <div className="languages-list">
                  {languages.length > 0 ? (
                    languages.map((language, index) => (
                      <span key={index} className="language-tag">{language}</span>
                    ))
                  ) : (
                    <span className="no-languages">No languages specified</span>
                  )}
                </div>
              </div>

              {authorData.bio && (
                <div className="detail-item bio">
                  <i className="fas fa-quote-left"></i>
                  <p>{authorData.bio}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="modal-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>Could not load author profile</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorProfileModal; 