import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="flex">
      {isLoggedIn && <Sidebar />}

      <main className={isLoggedIn ? "ml-64 w-full" : "w-full"}>
        <Routes>
          {!isLoggedIn ? (
            <Route
              path="*"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/suggested" element={<Suggested />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}
