import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Suggested() {
  const [suggestions, setSuggestions] = useState([]);
  const currentUsername = localStorage.getItem("username");
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
    <div
      style={{
        maxWidth: '430px',
        margin: '4vh auto 2vh auto',
        width: '100vw',
        overflow: 'hidden',
        height: '91vh',
        maxHeight: '91vh',
        background: 'inherit',
      }}
    >
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Suggested for you</h1>

        <div className="space-y-4">
          {suggestions.map((s) => (
            <div
              key={s.username}
              className="flex items-center justify-between border-b pb-4"
            >
              <Link to={`/profile/${s.username}`} className="flex items-center gap-4 group">
                <img
                  src={s.profilePic ? `http://localhost:5000${s.profilePic}` : '/assets/profiles/profile.jpg'}
                  alt={s.username}
                  className="w-12 h-12 rounded-full object-cover group-hover:opacity-80 transition"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold group-hover:underline">{s.username}</span>
                  <span className="text-xs text-gray-500">Suggested for you</span>
                </div>
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
    </div>
  );
}
