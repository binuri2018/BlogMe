// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    languages: "",
  });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, profileData);
        alert("Profile updated successfully");
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile. Please try again.");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {editing ? (
        <>
          <input type="text" name="firstName" value={profileData.firstName} onChange={handleChange} placeholder="First Name" />
          <input type="text" name="lastName" value={profileData.lastName} onChange={handleChange} placeholder="Last Name" />
          <input type="email" name="email" value={profileData.email} onChange={handleChange} placeholder="Email" disabled />
          <input type="text" name="languages" value={profileData.languages} onChange={handleChange} placeholder="Languages" />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p><strong>First Name:</strong> {profileData.firstName}</p>
          <p><strong>Last Name:</strong> {profileData.lastName}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Languages:</strong> {profileData.languages}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
