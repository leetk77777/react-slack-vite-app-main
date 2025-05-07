import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import ChatPage from "./pages/ChatPage/ChatPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { useDispatch } from "react-redux";
import { clearUser, setUser } from "./store/userSlice";
import app from "./firebase";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        const userData = {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
        dispatch(setUser(userData));
      } else {
        navigate("/login");
        dispatch(clearUser());
      }
    });

    return () => {
      unsubscribe();
    }
  }, []);


  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );

}

export default App;
