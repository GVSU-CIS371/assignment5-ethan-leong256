import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJzeJYHqaa8mIv1MVXDiuhyqUhQPdc1o0",
  authDomain: "cis371-a5bc3.firebaseapp.com",
  projectId: "cis371-a5bc3",
  storageBucket: "cis371-a5bc3.firebasestorage.app",
  messagingSenderId: "504418340",
  appId: "1:504418340:web:063c31389e70578320c8b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;