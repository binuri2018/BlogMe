// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import logo from "../assets/logo.png";

function Navbar() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const { firstName, lastName } = docSnap.data();
            setUsername(`${firstName} ${lastName}`);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, []);

  return (
    <nav className="navbar">
      <Link to="/home">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </Link>
      <div className="navbar-user">
        <span>{username}</span>
      </div>
    </nav>
  );
}

export default Navbar;
