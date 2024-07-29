// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPsLD_NgSwchMrpG2U81UsH_USQGSiNZU",
  authDomain: "nurenai.firebaseapp.com",
  databaseURL: "https://nurenai-default-rtdb.firebaseio.com",
  projectId: "nurenai",
  storageBucket: "nurenai.appspot.com",
  messagingSenderId: "667498046930",
  appId: "1:667498046930:web:cb281b053ddc016e18940b",
  measurementId: "G-WD8MF1MXSM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };
