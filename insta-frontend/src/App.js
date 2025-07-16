import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import Messages from "./pages/Messages";
import Notifications from "./components/Notifications";
import Settings from "./pages/Settings";
import Activity from "./pages/Activity";
import Saved from "./pages/Saved";
import Home from "./pages/Home";
import Suggested from "./pages/Suggested";
import Login from "./pages/Login";
import EditProfile from "./pages/EditProfile";
import PostDetails from "./pages/PostDetails";
import Layout from "./components/Layout";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("username");
  });

  return (
    <Routes>
      {/* ✅ Root always goes to Login or Home */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/home" /> : <Login setIsLoggedIn={setIsLoggedIn} />
        }
      />

      {isLoggedIn && (
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/suggested" element={<Suggested />} />
          <Route path="/edit-profile/:username" element={<EditProfile />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/profile/:username" element={<Profile />} />

        </Route>
      )}

      {/* ✅ Fallback */}
      <Route
        path="*"
        element={
          isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/" />
        }
      />
    </Routes>
  );
}
