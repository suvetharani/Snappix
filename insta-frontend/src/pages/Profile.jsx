import { useState } from "react";
import { FaCog, FaPlus } from "react-icons/fa";
import profile from "../assets/profiles/profile1.jpg";
import post1 from "../assets/post1.jpg";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Posts");

  const user = {
    username: "john_doe",
    profilePic: profile,
    posts: 34,
    followers: 1200,
    following: 180,
    bio: "✨ Frontend Developer | 📸 Love capturing moments | 🌍 Travel addict",
    postsImages: [post1],
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-4">
        <img
          src={user.profilePic}
          alt={user.username}
          className="w-28 h-28 rounded-full object-cover border"
        />

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <button className="px-4 py-1 rounded-md font-semibold border">
              Edit Profile
            </button>
            <button className="px-4 py-1 rounded-md font-semibold border">
              Archive
            </button>
            <FaCog className="text-2xl cursor-pointer" />
          </div>

          <div className="flex gap-6 mb-2">
            <p>
              <span className="font-semibold">{user.posts}</span> posts
            </p>
            <p>
              <span className="font-semibold">{user.followers}</span> followers
            </p>
            <p>
              <span className="font-semibold">{user.following}</span> following
            </p>
          </div>

          <p>{user.bio}</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col items-center">
          <button className="w-16 h-16 border rounded-full flex items-center justify-center">
            <FaPlus className="text-xl" />
          </button>
          <span className="text-sm mt-1">New</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t flex justify-center gap-8 mb-4">
        {["Posts", "Saved", "Tagged"].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 font-semibold ${
              activeTab === tab ? "border-t-2 border-black" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {activeTab === "Posts" && (
        <div className="grid grid-cols-3 gap-2 mb-10">
          {user.postsImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Post ${index + 1}`}
              className="w-full h-48 object-cover"
            />
          ))}
        </div>
      )}

      {activeTab !== "Posts" && (
        <div className="text-center text-gray-500 py-10">
          No {activeTab.toLowerCase()} to show.
        </div>
      )}

      {/* Instagram Footer */}
      <footer className="text-xs text-gray-500 text-center space-y-2 mb-10">
        <div className="flex flex-wrap justify-center gap-4">
          <span>Meta</span>
          <span>About</span>
          <span>Blog</span>
          <span>Jobs</span>
          <span>Help</span>
          <span>API</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Locations</span>
          <span>Instagram Lite</span>
          <span>Threads</span>
          <span>Contact Uploading & Non-Users</span>
          <span>Meta Verified</span>
        </div>
        <div>English</div>
        <div className="mt-2">© 2025 Instagram from Meta</div>
      </footer>
    </main>
  );
}
