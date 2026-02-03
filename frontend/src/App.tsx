import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "./store/useAuthStore.ts";
import { PageContext } from "./context/PageContext.ts";

import Home from "./pages/Home.tsx";
import Friends from "./pages/Friends.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader.tsx";
import Settings from "./pages/Settings.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import { useChatStore } from "./store/useChatStore.ts";

const App = () => {
  // selectedPage - responds for selected page in friends page on small devices
  const [selectedPage, setSelectedPage] = useState<"add" | "manage">("add");
  const [screen, setScreen] = useState<Record<string, number>>({ width: 0, height: 0 });

  const { user, checkAuth, isCheckingAuth } = useAuthStore();
  const { subscribeMessages, unsubscribeMessages, showContextMenu } = useChatStore();

  useEffect(() => {
    function updateScreenSize() {
      setScreen({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    }

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

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

  if (isCheckingAuth && !user) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-main_dark">
        <Loader size={48} className="text-label-brighter-text" />
      </div>
    );
  }

  return (
    <PageContext.Provider value={{ screen, selectedPage, setSelectedPage }}>
      <div
        className="bg-main_dark w-full h-screen flex justify-center items-center font-[Roboto]"
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <Toaster />

        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to={"/signin"} />} />
          <Route
            path="/friends"
            element={user ? <Friends /> : <Navigate to={"/signin"} />}
          />
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
    </PageContext.Provider>
  );
};

export default App;
