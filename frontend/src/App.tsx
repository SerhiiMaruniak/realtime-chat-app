import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "./store/useAuthStore.ts";

import Home from "./pages/Home.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader.tsx";
import Settings from "./pages/Settings.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import { useChatStore } from "./store/useChatStore.ts";

const App = () => {
  const { user, checkAuth, isCheckingAuth } = useAuthStore();
  const { subscribeMessages, unsubscribeMessages, showContextMenu } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      subscribeMessages();

      return () => unsubscribeMessages();
    }
  }, [subscribeMessages, unsubscribeMessages, user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      if (!target || !target.closest("#context_menu")) {
        showContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showContextMenu]);

  useEffect(() => {
    const localTheme = localStorage.getItem("color_theme");

    document.documentElement.setAttribute(
      "data-theme",
      localTheme ? localTheme : "default",
    );
  }, []);

  if (isCheckingAuth && !user) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-main">
        <Loader size={48} className="text-label-brighter-text" />
      </div>
    );
  }

  return (
    <div
      className="bg-main w-full h-screen flex justify-center items-center font-[Roboto]"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <Toaster />

      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to={"/signin"} />} />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to={"/signin"} />}
        />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to={"/"} />} />
        <Route
          path="/forgot-password"
          element={!user ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/reset-password"
          element={!user ? <ResetPassword /> : <Navigate to={"/"} />}
        />
      </Routes>
    </div>
  );
};

export default App;
