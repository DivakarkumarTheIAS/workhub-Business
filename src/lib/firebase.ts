import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA21oWW-1mClnsNAktXNdi2IAOyY-clt48",
    authDomain: "work-hub-c31ef.firebaseapp.com",
    projectId: "work-hub-c31ef",
    storageBucket: "work-hub-c31ef.firebasestorage.app",
    messagingSenderId: "907495421370",
    appId: "1:907495421370:web:458cf918691b7552785983",
    databaseURL: "https://work-hub-c31ef-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app;
