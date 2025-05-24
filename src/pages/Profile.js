import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    languages: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);

  const [userBlogs, setUserBlogs] = useState([]);
  const [editingBlogId, setEditingBlogId] = useState(null); // Track blog being edited
  const [editedBlogData, setEditedBlogData] = useState({});

  const navigate = useNavigate();

  // 🟢 Fetch user profile
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

  // 🟢 Fetch user's blogs
  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const blogsRef = collection(db, "blogs");
          const q = query(blogsRef, where("authorId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const blogs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserBlogs(blogs);
        }
      } catch (error) {
        console.error("Error fetching user blogs:", error.message);
      }
    };
    fetchUserBlogs();
  }, []);

  // 🟢 Handle profile edit
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, profileData);
        alert("Profile updated successfully");
        setEditingProfile(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile. Please try again.");
    }
  };

  // 🟢 Blog edit handlers
  const handleBlogEdit = (blog) => {
    setEditingBlogId(blog.id);
    setEditedBlogData({ ...blog }); // copy blog data for editing
  };

  const handleBlogChange = (e) => {
    setEditedBlogData({
      ...editedBlogData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveBlog = async () => {
    try {
      const docRef = doc(db, "blogs", editingBlogId);
      await updateDoc(docRef, editedBlogData);
      alert("Blog updated successfully");

      // Update local blogs state
      setUserBlogs((prev) =>
        prev.map((b) =>
          b.id === editingBlogId ? { ...b, ...editedBlogData } : b
        )
      );

      setEditingBlogId(null);
      setEditedBlogData({});
    } catch (error) {
      console.error("Error updating blog:", error.message);
      alert("Error updating blog. Please try again.");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  const goToAddBlog = () => {
    navigate("/add-blog");
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {editingProfile ? (
        <>
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={handleProfileChange}
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={handleProfileChange}
            placeholder="Last Name"
          />
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleProfileChange}
            placeholder="Email"
            disabled
          />
          <input
            type="text"
            name="languages"
            value={profileData.languages}
            onChange={handleProfileChange}
            placeholder="Languages"
          />
          <button onClick={handleSaveProfile}>Save</button>
          <button onClick={() => setEditingProfile(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p><strong>First Name:</strong> {profileData.firstName}</p>
          <p><strong>Last Name:</strong> {profileData.lastName}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Languages:</strong> {profileData.languages}</p>
          <button onClick={() => setEditingProfile(true)}>Edit Profile</button>
        </>
      )}

      <button onClick={goToAddBlog} style={{ marginTop: "10px", backgroundColor: "#28a745", color: "white" }}>
        Add a Blog
      </button>

      <button onClick={handleLogout} style={{ marginTop: "10px" }}>Logout</button>

      {/* 🟢 User's Blogs Section */}
      <div className="blogs-section" style={{ marginTop: "20px" }}>
        <h3>My Blogs</h3>
        {userBlogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          userBlogs.map((blog) => (
            <div key={blog.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
              {editingBlogId === blog.id ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={editedBlogData.title}
                    onChange={handleBlogChange}
                    placeholder="Title"
                  />
                  <textarea
                    name="content"
                    value={editedBlogData.content}
                    onChange={handleBlogChange}
                    placeholder="Content"
                  />
                  <button onClick={handleSaveBlog}>Save</button>
                  <button onClick={() => setEditingBlogId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <h4>{blog.title}</h4>
                  <p>{blog.content}</p>
                  <button onClick={() => handleBlogEdit(blog)}>Edit</button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
