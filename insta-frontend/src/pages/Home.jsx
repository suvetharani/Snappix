import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post";
// import Stories from "../components/Stories";
// import Profile from "../assets/profiles/profile.jpg";
import { FiSearch, FiBell } from "react-icons/fi";
import SearchBox from "../components/SearchBox";
import Notifications from "../components/Notifications";
import { useNavigate, Link } from "react-router-dom";

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
  
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Fetch all users except current
        const usersRes = await axios.get(`http://localhost:5000/api/users/all?exclude=${currentUsername}`);
        // Fetch current user's following list
        const profileRes = await axios.get(`http://localhost:5000/api/profile/${currentUsername}`);
        const followingUsernames = (profileRes.data.following || []).map(u => u.username);
        // Filter out followed users
        const filtered = usersRes.data.filter(u => !followingUsernames.includes(u.username));
        setSuggestions(filtered);
      } catch (err) {
        setSuggestions([]);
      }
    };
    if (currentUsername) fetchSuggestions();
  }, [currentUsername]);

  return (
    <div className="w-full max-w-5xl min-w-[330px] mx-auto pt-8 bg-white dark:bg-black dark:text-white min-h-screen transition-colors duration-300">
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
      <div className="flex flex-col tablet:flex-row gap-8">
        {/* Main Content: Stories and Posts */}
        <div className="flex-1 min-w-0">
          {/* Stories removed as per request */}
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
        {/* Suggestions Section (Right Side) */}
        <aside className="hidden tablet:block w-72 flex-shrink-0 mt-16">
          <div className="bg-white dark:bg-neutral-900 border dark:border-gray-800 rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Suggestions For You</h3>
              <button
                className="text-xs text-blue-500 font-semibold hover:underline"
                onClick={() => navigate('/suggested')}
              >
                See All
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {suggestions.slice(0, 6).map((s) => (
                <div key={s.username} className="flex items-center gap-3">
                  <Link to={`/profile/${s.username}`} className="flex items-center gap-3 group">
                    <img src={s.profilePic ? `http://localhost:5000${s.profilePic}` : '/assets/profiles/profile.jpg'} alt={s.username} className="w-10 h-10 rounded-full object-cover border group-hover:opacity-80 transition" />
                    <span className="text-sm font-semibold group-hover:underline">{s.username}</span>
                  </Link>
                  <button
                    className="text-xs text-blue-500 font-semibold hover:underline"
                    onClick={async () => {
                      try {
                        await axios.post("http://localhost:5000/api/profile/follow", {
                          username: s.username,
                          follower: currentUsername,
                        });
                        // Remove from suggestions after follow
                        setSuggestions(prev => prev.filter(u => u.username !== s.username));
                      } catch (err) {
                        alert("Failed to follow user");
                      }
                    }}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
