// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyqJFwH3bY1zUZqo3l5bBEYET9RlVlqXY",
  authDomain: "blog-me-eaab5.firebaseapp.com",
  projectId: "blog-me-eaab5",
  storageBucket: "blog-me-eaab5.firebasestorage.app",
  messagingSenderId: "236158309659",
  appId: "1:236158309659:web:ed768df3394fe5b1ed6fbe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);