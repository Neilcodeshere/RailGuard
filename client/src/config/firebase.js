import { initializeApp } from "firebase/app";
import { getAuth }      from "firebase/auth";
import { getDatabase }  from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCfy3oi3HvO4keKlKoyXNgkdmYkLrst4VE",
  authDomain:        "rail-guard.firebaseapp.com",
  projectId:         "rail-guard",
  storageBucket:     "rail-guard.firebasestorage.app",
  messagingSenderId: "382610266219",
  appId:             "1:382610266219:web:da004e3d0e4d8b0131792e",
  measurementId:     "G-GSP7M1CCYH",
  databaseURL:       "https://rail-guard-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const database = getDatabase(app);   // RTDB — live sensor data
const db       = getFirestore(app);  // Firestore — user profiles & preferences

export { auth, database, db };
