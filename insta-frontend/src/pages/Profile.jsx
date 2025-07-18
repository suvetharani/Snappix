import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCog, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useNavigate } from 'react-router-dom';
import { FaEllipsisH, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";


export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Posts");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [posts, setPosts] = useState([]);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [isPostDisabled, setIsPostDisabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  //const loggedInUsername = localStorage.getItem("username");
  const { username } = useParams();
  const loggedInUserId = localStorage.getItem("userId");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);


  const handleUploadPost = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("file", selectedFile);
    formData.append("caption", caption);

    try {
      await axios.post("http://localhost:5000/api/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedFile(null);
      setCaption("");
      setShowCaptionModal(false);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to upload post");
    }
  };

const handleFollow = async () => {
  try {
    const loggedInUsername = localStorage.getItem("username");

    const res = await axios.post("http://localhost:5000/api/profile/follow", {
      username: user.username,      // the profile you are viewing
      follower: loggedInUsername,   // you
    });

    setIsFollowing(!isFollowing);
    // ✅ Update followers in local state too
    setUser(prev => ({ ...prev, followers: res.data.followers }));
  } catch (err) {
    console.error("Follow error:", err);
  }
};

const handlePostComment = async () => {
  try {
    const loggedInUsername = localStorage.getItem("username");

    const res = await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/comments`, {
      username: loggedInUsername,
      text: commentInput,
    });

    // Update post comments with new comment
    setSelectedPost((prev) => ({
      ...prev,
      comments: [...prev.comments, res.data],
    }));

    setCommentInput("");
    setIsPostDisabled(true);
  } catch (err) {
    console.error("Error posting comment:", err);
    alert("Failed to post comment");
  }
};


  const handleDeletePost = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${selectedPost._id}`);
      setSelectedPost(null);
      setShowDeleteConfirm(false);
      setPosts((prev) => prev.filter((p) => p._id !== selectedPost._id));
    } catch (err) {
      console.error(err);
      alert("Error deleting post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    window.location.href = "/";
  };

useEffect(() => {
  const fetchProfile = async () => {
    const loggedInUsername = localStorage.getItem("username");

    if (!username) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/profile/${username}`);
      setUser(res.data);

      // ✅ THIS LINE must match your backend:
setIsFollowing(res.data.followers.some(f => f.username === loggedInUsername));

      const postsRes = await axios.get(`http://localhost:5000/api/posts/${username}`);
      setPosts(postsRes.data);
    } catch (err) {
      console.error("Error fetching profile or posts:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [username]);


  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!user) return <div className="text-center p-10 text-red-500">User not found.</div>;

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-4">
        <img
          src={user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://via.placeholder.com/150"}
          alt={user.username}
          className="w-28 h-28 rounded-full object-cover border"
        />

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-semibold">{user.username}</h2>

            {user.username === localStorage.getItem("username") ? (
              // 👉 Show Edit Profile if it's *my* profile
              <Link
                to={`/edit-profile/${user.username}`}
                className="px-4 py-1 rounded-md font-semibold border"
              >
                Edit Profile
              </Link>
            ) : (
              // 👉 Show Follow button if it's *not* my profile
              <button
                onClick={handleFollow}
                className="px-4 py-1 rounded-md font-semibold border"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}

            <FaCog
              className="text-2xl cursor-pointer"
              onClick={() => setShowSettings(true)}
            />
          </div>


          <div className="flex gap-6 mb-2">
            <p><span>{posts.length}</span> posts</p>
            <p onClick={() => setShowFollowers(true)}>
              <span className="font-semibold">{user.followers?.length || 0}</span> followers
            </p>

            <p onClick={() => setShowFollowing(true)}>
              <span className="font-semibold">{user.following?.length || 0}</span> following
            </p>
          </div>

          <p>{user.bio || "Add a bio!"}</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowNewModal(true)}
            className="w-16 h-16 border rounded-full flex items-center justify-center"
          >
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
            className={`py-2 px-4 font-semibold ${activeTab === tab ? "border-t-2 border-black" : "text-gray-500"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {activeTab === "Posts" && (
        <div className="grid grid-cols-3 gap-2 mb-10">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={async () => {
                  const res = await axios.get(`http://localhost:5000/api/posts/single/${post._id}`);
                  setSelectedPost(res.data);
                }}
              >
                <img
                  src={`http://localhost:5000${post.fileUrl}`}
                  alt={`Post ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))
          ) : (
            <div>No posts</div>
          )}
        </div>
      )}

      {/* Post Viewer Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-md flex flex-col md:flex-row w-full max-w-4xl relative">

<div className="absolute top-2 right-2">
  <div className="relative">
    <button
      onClick={() => setShowDropdown(prev => !prev)}
      className="text-2xl text-gray-700 hover:text-black"
      title="Options"
    >
      <FaEllipsisH />
    </button>

{showDropdown && (
  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
    {selectedPost.username === localStorage.getItem("username") && (
      <button
        onClick={() => {
          setShowDeleteConfirm(true);
          setShowDropdown(false);
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        Delete
      </button>
    )}
    <button
      onClick={() => {
        setSelectedPost(null);
        setShowDropdown(false);
      }}
      className="w-full text-left px-4 py-2 hover:bg-gray-100"
    >
      Cancel
    </button>
  </div>
)}

  </div>
</div>


            <img
              src={`http://localhost:5000${selectedPost.fileUrl}`}
              alt="Full"
              className="w-full md:w-1/2 object-cover"
            />

            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold mb-2">{selectedPost.username}</h2>
              <p className="mb-4">{selectedPost.caption}</p>

              <div className="flex-1 overflow-y-auto mb-4">
                {selectedPost.comments?.length ? (
                  selectedPost.comments.map((c, i) => (
                    <div key={i} className="text-sm border-b pb-2 mb-2">
                      <strong>{c.username}:</strong> {c.text}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No comments yet.</p>
                )}
              </div>
<div className="flex items-center justify-between px-4 py-2">
  {/* Like Button */}
  <button
    className={`text-xl transition-colors duration-200 ${
      isLiked ? "text-red-500" : "text-gray-600"
    }`}
    onClick={() => setIsLiked(!isLiked)}
  >
    {isLiked ? <FaHeart /> : <FaRegHeart />}
  </button>

  {/* Save Button */}
  <button
    className="text-xl text-gray-600 hover:opacity-80"
    onClick={() => setIsSaved(!isSaved)}
  >
    {isSaved ? <FaBookmark /> : <FaRegBookmark />}
  </button>
</div>


              <div className="flex items-center border-t pt-2 relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-2xl mr-2"
                  title="Emoji"
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-50">
                    <Picker data={data} onEmojiSelect={(emoji) =>
                      setCommentInput(prev => prev + emoji.native)
                    } />
                  </div>
                )}

                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => {
                    setCommentInput(e.target.value);
                    setIsPostDisabled(e.target.value.trim() === "");
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  onClick={handlePostComment}
                  disabled={isPostDisabled}
                  className={`ml-2 px-4 py-2 rounded text-white ${
                    isPostDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded p-6 w-80 text-center">
                <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
                <p className="mb-4">Are you sure you want to delete this post?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Modals */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md flex flex-col gap-4">
            <button
              onClick={() => {
                setUploadType("post");
                document.getElementById("fileInput").click();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Post
            </button>
            <button
              onClick={() => alert("Story feature not implemented yet!")}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Story
            </button>
            <button
              onClick={() => setShowNewModal(false)}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        id="fileInput"
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedFile(file);
            setShowNewModal(false);
            setShowCaptionModal(true);
          }
        }}
      />

      {selectedFile && showCaptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md flex flex-col gap-4">
            <p>Write a caption:</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={handleUploadPost}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Post
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setCaption("");
                setShowCaptionModal(false);
              }}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md flex flex-col gap-4">
            {user.username === localStorage.getItem("username") && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Logout
              </button>
            )}
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Followers Modal */}
{showFollowers && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-80">
      <h3 className="text-lg font-semibold mb-4">Followers</h3>
      {user.followers.length === 0 ? (
        <p className="text-gray-500">No followers yet.</p>
      ) : (
        <ul className="space-y-2">
          {user.followers.map(f => (
            <li
              key={f.username}
              onClick={() => navigate(`/profile/${f.username}`)}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded"
            >
              <img
                src={`http://localhost:5000${f.profilePic}`}
                alt={f.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{f.username}</span>
            </li>
          ))}
        </ul>

      )}
      <button
        onClick={() => setShowFollowers(false)}
        className="mt-4 px-4 py-2 bg-gray-200 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

{showFollowing && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-80">
      <h3 className="text-lg font-semibold mb-4">Following</h3>
      {user.following.length === 0 ? (
        <p className="text-gray-500">Not following anyone yet.</p>
      ) : (
        <ul className="space-y-4">
          {user.following.map((f, i) => (
            <li
              key={i}
              onClick={() => navigate(`/profile/${f.username}`)}
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded"
            >
              <img
                src={f.profilePic ? `http://localhost:5000${f.profilePic}` : "https://via.placeholder.com/40"}
                alt={f.username}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <span>{f.username}</span>
            </li>
          ))}

        </ul>
      )}
      <button
        onClick={() => setShowFollowing(false)}
        className="mt-4 px-4 py-2 bg-gray-200 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}


      <footer className="text-xs text-gray-500 text-center space-y-2 mb-10">
        <div className="flex flex-wrap justify-center gap-4">
          <span>Meta</span><span>About</span><span>Blog</span><span>Jobs</span><span>Help</span>
          <span>API</span><span>Privacy</span><span>Terms</span><span>Locations</span>
          <span>Instagram Lite</span><span>Threads</span><span>Contact Uploading & Non-Users</span>
          <span>Meta Verified</span>
        </div>
        <div>English</div>
        <div className="mt-2">© 2025 Instagram from Meta</div>
      </footer>
    </main>
  );
}
