// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDkIWaJyAaHpyFJfknMOWoMqrojt4npC4k",
  authDomain: "stuvely-data.firebaseapp.com",
  databaseURL: "https://stuvely-data-default-rtdb.firebaseio.com/",
  projectId: "stuvely-data",
  storageBucket: "stuvely-data.appspot.com",
  messagingSenderId: "369051556031",
  appId: "1:369051556031:web:5f43472d12905505b7ce0a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
