// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy4fKPEtDav7mTHMDkChyS1TF1nkBgD10",
  authDomain: "alphareader-41f35.firebaseapp.com",
  projectId: "alphareader-41f35",
  storageBucket: "alphareader-41f35.firebasestorage.app",
  messagingSenderId: "372207804437",
  appId: "1:372207804437:web:21ae1ad18f211623572e1c",
  measurementId: "G-WQWMX5MZ9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);