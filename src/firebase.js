// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXV7ay6XnxK-2s3O34AfSytkcDtlfg4RU",
  authDomain: "react-chat-app-97edd.firebaseapp.com",
  projectId: "react-chat-app-97edd",
  storageBucket: "react-chat-app-97edd.firebasestorage.app",
  messagingSenderId: "1065748018771",
  appId: "1:1065748018771:web:b31e612c31e33abbc538a6",
  measurementId: "G-RGVGK8SJZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;

export const db = getDatabase(app);




