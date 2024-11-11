// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8An12gWXjPcoV8D73D3kM6UzLZD_wny8",
  authDomain: "hackxetra.firebaseapp.com",
  projectId: "hackxetra",
  storageBucket: "hackxetra.firebasestorage.app",
  messagingSenderId: "22094012938",
  appId: "1:22094012938:web:19cf39cae9c48059a4b5f3",
  measurementId: "G-Z4LE63CJ1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };