import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6zcOyaFTO_HeBKgbK83JzHYK8PfXIZFM",
  authDomain: "final-proj-klade-photography.firebaseapp.com",
  projectId: "final-proj-klade-photography",
  storageBucket: "final-proj-klade-photography.firebasestorage.app",
  messagingSenderId: "479271062092",
  appId: "1:479271062092:web:fe2e73f67a8e71f74402e9",
  measurementId: "G-B59G1X7TX4",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
