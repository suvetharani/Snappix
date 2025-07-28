import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post";
import Stories from "../components/Stories";
import Profile from "../assets/profiles/profile.jpg";
import { FiSearch, FiBell } from "react-icons/fi";
import SearchBox from "../components/SearchBox";
import Notifications from "../components/Notifications";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const currentUsername = localStorage.getItem("username");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recents, setRecents] = useState(() => {
    const stored = localStorage.getItem("recents");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // If recents is array of objects, convert to usernames
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].username) {
      return parsed.map(u => u.username);
    }
    return parsed;
  });
  const addRecent = (username) => {
    const updated = [username, ...recents.filter((r) => r !== username)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem("recents", JSON.stringify(updated));
  };
  const clearAll = () => {
    setRecents([]);
    localStorage.removeItem("recents");
  };
  const removeRecent = (username) => {
    const updated = recents.filter(r => r !== username);
    setRecents(updated);
    localStorage.setItem("recents", JSON.stringify(updated));
  };
  
    const suggestions = [
    { id: 1, username: "user1", profile: Profile },
    { id: 2, username: "user2", profile: Profile },
    { id: 3, username: "user3", profile: Profile },
    { id: 4, username: "user4", profile: Profile },
    { id: 5, username: "user5", profile: Profile },
    { id: 6, username: "user6", profile: Profile },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/all");
        const allPosts = res.data.map((post) => ({
          ...post,
profile: post.profilePic
  ? post.profilePic.startsWith("/uploads")
    ? post.profilePic
    : `/uploads/${post.profilePic}`
  : "/uploads/default.jpg", // fallback if profilePic is missing
        }));

        setPosts(allPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="w-full max-w-2xl min-w-[330px] mx-auto pt-8 bg-white dark:bg-black dark:text-white min-h-screen transition-colors duration-300">
      {/* Top bar for mobile */}
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800 tablet:hidden fixed top-0 left-0 w-full bg-white dark:bg-black z-40">
        <span className="font-logo text-2xl">Instagram</span>
        <div className="flex gap-4">
          <button onClick={() => setShowSearch((v) => !v)} className="text-2xl">
            <FiSearch />
          </button>
          <button onClick={() => setShowNotifications((v) => !v)} className="text-2xl">
            <FiBell />
          </button>
        </div>
      </div>
      {/* SearchBox modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col tablet:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800">
            <span className="font-logo text-2xl">Search</span>
            <button className="text-3xl" onClick={() => setShowSearch(false)}>&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SearchBox
              onClose={() => setShowSearch(false)}
              recents={recents}
              addRecent={addRecent}
              clearAll={clearAll}
              removeRecent={removeRecent}
              fullscreen={true}
            />
          </div>
        </div>
      )}
      {/* Notifications modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start pt-20 tablet:hidden">
          <div className="relative w-full max-w-sm mx-auto bg-white dark:bg-black rounded shadow-lg">
            <button className="absolute top-2 right-2 text-2xl" onClick={() => setShowNotifications(false)}>&times;</button>
            <Notifications />
          </div>
        </div>
      )}
      <div className="tablet:pt-8 pt-16" />
      <Stories />
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post._id}
            postId={post._id}
            username={post.username}
            collaborators={post.collaborators || []}
            profile={`http://localhost:5000${post.profile}`}
            image={`http://localhost:5000${post.fileUrl}`}
            caption={post.caption}
            currentUser={currentUsername}
            initialLikes={post.likes || []}
            initialComments={post.comments || []}
          />
        ))
      ) : (
        <p className="text-center text-gray-500">No posts found</p>
      )}
    </div>
  );
}
