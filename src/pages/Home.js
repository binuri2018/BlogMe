// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div>
      <h2>Welcome to the Blogging Site</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
