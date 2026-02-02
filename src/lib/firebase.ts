// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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
const db = getDatabase(app); // Realtime Database
const firestore = getFirestore(app); // Firestore

// if (typeof window !== "undefined") {
//   // Enable offline persistence
//   enableIndexedDbPersistence(firestore).catch((err) => {
//     if (err.code === 'failed-precondition') {
//       // Multiple tabs open, persistence can only be enabled in one tab at a a time.
//       console.log('Persistence failed: Multiple tabs open');
//     } else if (err.code === 'unimplemented') {
//       // The current browser does not support all of the features required to enable persistence
//       console.log('Persistence failed: Browser not supported');
//     }
//   });
// }

const storage = getStorage(app); // Storage

export { db, firestore, storage };