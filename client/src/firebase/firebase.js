import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import "firebase/compat/auth";
import "firebase/compat/firestore";
// import firebaseConfig from "./config/firebaseConfig";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyD9JHMbAw8lL1DrihXhJijMootlHvWwxww",
    authDomain: "group-notify-4a4b4.firebaseapp.com",
    projectId: "group-notify-4a4b4",
    storageBucket: "group-notify-4a4b4.appspot.com",
    messagingSenderId: "146902455392",
    appId: "1:146902455392:web:6763210b5ad6203bc89f05"
});

const auth = getAuth(firebaseApp); // For Authentication
const db = getFirestore(firebaseApp); // For Using Database

export { auth, db };
