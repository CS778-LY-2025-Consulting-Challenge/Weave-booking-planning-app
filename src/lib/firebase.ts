// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCysuLVHktiHpH9x3Sx-q0Gogv04fipCzM",
  authDomain: "weave-travel.firebaseapp.com",
  databaseURL: "https://weave-travel-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "weave-travel",
  storageBucket: "weave-travel.firebasestorage.app",
  messagingSenderId: "105840210544",
  appId: "1:105840210544:web:a5882c023f142d3f617ab5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { db };