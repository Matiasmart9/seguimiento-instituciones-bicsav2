import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyBx2mFMSIeqfP9QNoa4gfSs7xBITURXswM",
  authDomain: "seguimiento-intituciones-bicsa.firebaseapp.com",
  projectId: "seguimiento-intituciones-bicsa",
  storageBucket: "seguimiento-intituciones-bicsa.firebasestorage.app",
  messagingSenderId: "94401329915",
  appId: "1:94401329915:web:9b1c1557a0c1af0a868e5e",
  measurementId: "G-LG8RCNQSD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Para debugging
console.log('Firebase configurado. Project ID:', firebaseConfig.projectId);

export { app, analytics, auth, db };