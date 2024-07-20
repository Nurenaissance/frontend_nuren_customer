import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPsLD_NgSwchMrpG2U81UsH_USQGSiNZU",
  authDomain: "nurenai.firebaseapp.com",
  projectId: "nurenai",
  storageBucket: "nurenai.appspot.com",
  messagingSenderId: "667498046930",
  appId: "1:667498046930:web:cb281b053ddc016e18940b"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db,app };
