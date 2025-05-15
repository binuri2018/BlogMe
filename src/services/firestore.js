// src/services/firestore.js
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const storage = getStorage();

export const createUserProfile = async (uid, name, email) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { name, email, profilePicture: "" });
};

export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateProfilePicture = async (uid, file) => {
  const storageRef = ref(storage, `profile-pictures/${uid}`);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { profilePicture: imageUrl });
};
