import { auth, storage, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Sign Up
export const signUp = async (name, email, password, profileImage) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Upload profile picture to Firebase Storage
    const imageRef = ref(storage, `profilePictures/${user.uid}`);
    await uploadBytes(imageRef, profileImage);
    const imageUrl = await getDownloadURL(imageRef);

    // Save user info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      profileImage: imageUrl,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

// Login
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
  }
};

// Log Out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};

// Get User Info
export const getUserInfo = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  } catch (error) {
    console.error("Error fetching user info:", error.message);
  }
};

// Update User Info
export const updateUserInfo = async (userId, updatedData) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error updating user info:", error.message);
  }
};
