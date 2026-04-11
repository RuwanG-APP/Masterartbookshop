import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "ඔයාගේ-API-KEY-එක",
  authDomain: "ඔයාගේ-AUTH-DOMAIN-එක",
  projectId: "ඔයාගේ-PROJECT-ID-එක",
  storageBucket: "ඔයාගේ-STORAGE-BUCKET-එක",
  messagingSenderId: "ඔයාගේ-SENDER-ID-එක",
  appId: "ඔයාගේ-APP-ID-එක"
};

// 👇 Firebase App එක දැනටමත් තිබේ නම් එය පාවිච්චි කිරීමටත්, නැතිනම් අලුතින් සෑදීමටත් මෙය උපකාරී වේ.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export { db, app };