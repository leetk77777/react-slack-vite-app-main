// import firebase from "firebase/app";
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyDmkMzG0foAOgnHdMpfYvBnpcsInNyzMiY",
    authDomain: "react-slack-app-f3fc7.firebaseapp.com",
    databaseURL: "https://react-slack-app-f3fc7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "react-slack-app-f3fc7",
    storageBucket: "react-slack-app-f3fc7.appspot.com",
    messagingSenderId: "474862963570",
    appId: "1:474862963570:web:a746c9cf57c4e2f85b2beb"
};

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);

export default app;

export const db = getDatabase(app);




