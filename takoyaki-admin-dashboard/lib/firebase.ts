import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBPO_8mGzTAhCKU_dE9iyUnmJNyS7petWM",
    authDomain: "takoyakihub-a075e.firebaseapp.com",
    projectId: "takoyakihub-a075e",
    storageBucket: "takoyakihub-a075e.firebasestorage.app",
    messagingSenderId: "831373878622",
    appId: "1:831373878622:web:d66b266da0bbc92ee71bcf",
    measurementId: "G-BQ7774ERKY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
