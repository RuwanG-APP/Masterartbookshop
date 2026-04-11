import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "ඔයාගේ-API-KEY-එක",
  authDomain: "ඔයාගේ-AUTH-DOMAIN-එක",
  projectId: "ඔයාගේ-PROJECT-ID-එක",
  storageBucket: "ඔයාගේ-STORAGE-BUCKET-එක",
  messagingSenderId: "ඔයාගේ-SENDER-ID-එක",
  appId: "ඔයාගේ-APP-ID-එක"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);