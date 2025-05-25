// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import logo from "../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Use firstName and lastName if available, otherwise use name or email
            const displayName = userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.name || user.email?.split('@')[0] || 'User';
            setUserName(displayName);
            setUserPhoto(userData.photoURL || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to email username if there's an error
          setUserName(user.email?.split('@')[0] || 'User');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".navbar-profile") && !event.target.closest(".mobile-menu-button")) {
        closeMenus();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    closeMenus();
  }, [location]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="Blog Me" />
          </Link>
          <div className="navbar-links">
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
              <i className="fas fa-home"></i>
              Home
            </Link>
            <Link to="/add-blog" className={`nav-link ${location.pathname === "/add-blog" ? "active" : ""}`}>
              <i className="fas fa-pen"></i>
              Write
            </Link>
            <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
              <i className="fas fa-user"></i>
              Profile
            </Link>
          </div>
        </div>

        <div className="navbar-right">
          <button className="mobile-menu-button" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>

          <div className="navbar-profile" onClick={toggleProfileMenu}>
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="profile-photo" />
            ) : (
              <div className="profile-photo-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="profile-name">{userName}</span>
            <i className={`fas fa-chevron-${isProfileMenuOpen ? "up" : "down"}`}></i>
          </div>

          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  {userPhoto ? (
                    <img src={userPhoto} alt={userName} className="dropdown-profile-photo" />
                  ) : (
                    <div className="dropdown-profile-photo-placeholder">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="dropdown-username">{userName}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                My Profile
              </Link>
              <Link to="/add-blog" className="dropdown-item">
                <i className="fas fa-pen"></i>
                Write Blog
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`}>
            <i className="fas fa-home"></i>
            Home
          </Link>
          <Link to="/add-blog" className={`mobile-nav-link ${location.pathname === "/add-blog" ? "active" : ""}`}>
            <i className="fas fa-pen"></i>
            Write Blog
          </Link>
          <Link to="/profile" className={`mobile-nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
            <i className="fas fa-user"></i>
            Profile
          </Link>
          <button onClick={handleLogout} className="mobile-nav-link logout">
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
