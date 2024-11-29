// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyBRwozINh8ZFMZv2aLl9BjZRS3dCR5qHFw",
  authDomain: "le-drone.firebaseapp.com",
  projectId: "le-drone",
  storageBucket: "le-drone.firebasestorage.app",
  messagingSenderId: "287971760739",
  appId: "1:287971760739:web:6949ec664b1e4385737656",
  measurementId: "G-XXF9J8W1W1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
