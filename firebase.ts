import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore"; // initializeFirestore ඇඩ් කළා


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2FOXA42Df70SE59MZgVEAV16eipXKnik",
  authDomain: "my-bookshop-130c8.firebaseapp.com",
  projectId: "my-bookshop-130c8",
  storageBucket: "my-bookshop-130c8.firebasestorage.app",
  messagingSenderId: "887183389723",
  appId: "1:887183389723:web:e8b268bf13529f7f1a74be",
  measurementId: "G-WPDTFCZ92H"
};



const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 👇 මෙන්න මේ පේළිය පාවිච්චි කරන්න (සාමාන්‍ය getFirestore වෙනුවට)
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // මේකෙන් Connection එක ස්ථාවර කරනවා
});

export { db, app };