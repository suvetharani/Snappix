import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCog, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useNavigate } from 'react-router-dom';
import { FaEllipsisH, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { FaEllipsisV } from "react-icons/fa";
import { createPortal } from "react-dom";
import { FaPlay } from "react-icons/fa";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useCallback } from "react";
import Post from "../components/Post";


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
  // Add state for saved posts
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  // Add state for showing likers dropdown in the modal
  const [showModalLikers, setShowModalLikers] = useState(false);
  const [modalLikers, setModalLikers] = useState([]);
  // Add state for save status in the modal if not present
  const [isSavedModal, setIsSavedModal] = useState(false);
  // Add state for replying to comments in the modal
  const [modalReplyTo, setModalReplyTo] = useState(null); // comment id being replied to
  const [modalReplyInput, setModalReplyInput] = useState("");
  const [modalComments, setModalComments] = useState([]);
  // Add state for syncing like status
  const [modalLikeSync, setModalLikeSync] = useState(false);
  // Add state for showing comment likers dropdown in the modal
  const [showCommentLikers, setShowCommentLikers] = useState({}); // {commentId: bool}
  const [commentLikers, setCommentLikers] = useState({}); // {commentId: [user]}
  // Add state to track dropdown position
  const [dropdownPos, setDropdownPos] = useState({});

  const commentInputRef = useRef(null);
  // Add ref and state for post like count position
  const postLikeCountRef = useRef(null);
  const [postDropdownPos, setPostDropdownPos] = useState(null);

  // Collaborator logic for post modal
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaborators, setCollaborators] = useState([]); // array of usernames
  const [collabResults, setCollabResults] = useState([]); // array of user objects
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabDropdown, setCollabDropdown] = useState(false);

  // Debounced search for collaborators
  useEffect(() => {
    if (!collaboratorInput.trim()) {
      setCollabResults([]);
      setCollabDropdown(false);
      return;
    }
    setCollabLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users?username=${collaboratorInput}`);
        setCollabResults(res.data.filter(u => !collaborators.includes(u.username)));
        setCollabDropdown(true);
      } catch {
        setCollabResults([]);
      } finally {
        setCollabLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [collaboratorInput, collaborators]);

  const addCollaborator = (username) => {
    if (!collaborators.includes(username)) {
      setCollaborators([...collaborators, username]);
    }
    setCollaboratorInput("");
    setCollabDropdown(false);
  };
  const removeCollaborator = (username) => {
    setCollaborators(collaborators.filter(u => u !== username));
  };

  const handleUploadPost = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("file", selectedFile);
    formData.append("caption", caption);

    try {
      const postRes = await axios.post("http://localhost:5000/api/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Send collab invite message to each collaborator
      for (const collaborator of collaborators) {
        try {
          await axios.post('http://localhost:5000/api/messages/send', {
            sender: user.username,
            receiver: collaborator,
            type: "collab_invite",
            postId: postRes.data._id,
            fileUrl: postRes.data.fileUrl,
            caption: caption
          });
        } catch (err) {
          // Optionally handle error for each collaborator
        }
      }

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

// Fetch saved posts when Saved tab is selected
useEffect(() => {
  if (activeTab === "Saved") {
    const fetchSavedPosts = async () => {
      setSavedLoading(true);
      try {
        const loggedInUsername = localStorage.getItem("username");
        const res = await axios.get(`http://localhost:5000/api/posts/${loggedInUsername}/saved`);
        // res.data.savedPosts is an array of post IDs, so fetch full post data for each
        const posts = await Promise.all(
          res.data.savedPosts.map(async (postId) => {
            const postRes = await axios.get(`http://localhost:5000/api/posts/single/${postId}`);
            return postRes.data;
          })
        );
        setSavedPosts(posts);
      } catch (err) {
        setSavedPosts([]);
      } finally {
        setSavedLoading(false);
      }
    };
    fetchSavedPosts();
  }
}, [activeTab]);

// Add effect to fetch save status when modal opens
useEffect(() => {
  if (selectedPost) {
    const fetchSaved = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${localStorage.getItem("username")}/saved`);
        setIsSavedModal(res.data.savedPosts.includes(selectedPost._id));
      } catch (err) {
        setIsSavedModal(false);
      }
    };
    fetchSaved();
  }
}, [selectedPost]);

// Persist isLiked state based on selectedPost.likes
useEffect(() => {
  if (selectedPost) {
    const liked = selectedPost.likes?.includes(localStorage.getItem("username"));
    console.log('Setting isLiked:', liked);
    setIsLiked(liked);
  }
}, [selectedPost]);

// Save/unsave handler
const handleModalSave = async () => {
  try {
    const res = await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/save`, {
      username: localStorage.getItem("username"),
    });
    setIsSavedModal(res.data.savedPosts.includes(selectedPost._id));
  } catch (err) {}
};

// Fetch comments when modal opens
useEffect(() => {
  if (selectedPost) {
    setModalComments(selectedPost.comments || []);
  }
}, [selectedPost]);

// Post a new comment or reply in modal
const handleModalPostComment = async () => {
  if (!selectedPost || modalReplyInput.trim() === "") return;
  try {
    if (modalReplyTo) {
      // Reply to a comment
      const res = await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/comments/${modalReplyTo}/replies`, {
        username: localStorage.getItem("username"),
        text: modalReplyInput.trim(),
      });
      setModalComments((prev) =>
        prev.map((c) =>
          c._id === modalReplyTo
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        )
      );
      setModalReplyTo(null);
    } else {
      // New top-level comment
      const res = await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/comments`, {
        username: localStorage.getItem("username"),
        text: modalReplyInput.trim(),
      });
      setModalComments((prev) => [...prev, res.data]);
    }
    setModalReplyInput("");
  } catch (err) {}
};

// Like/unlike a comment in modal
const handleModalCommentLike = async (commentId) => {
  try {
    const res = await axios.post(
      `http://localhost:5000/api/posts/${selectedPost._id}/comments/${commentId}/like`,
      { username: localStorage.getItem("username") }
    );
    setModalComments((prev) =>
      prev.map((c) =>
        c._id === commentId ? { ...c, likes: res.data.likes } : c
      )
    );
  } catch (err) {}
};

// Like/unlike a reply in modal
const handleModalReplyLike = async (commentId, replyId) => {
  try {
    const res = await axios.patch(
      `http://localhost:5000/api/posts/${selectedPost._id}/comments/${commentId}/replies/${replyId}/like`,
      { userId: localStorage.getItem("username") }
    );
    setModalComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === replyId ? { ...reply, likes: res.data.likes } : reply
            ),
          };
        }
        return comment;
      })
    );
  } catch (error) {}
};

// Toggle replies visibility in modal
const [modalVisibleReplies, setModalVisibleReplies] = useState({});
const toggleModalReplies = (commentId) => {
  setModalVisibleReplies((prev) => ({
    ...prev,
    [commentId]: !prev[commentId],
  }));
};

// Helper to render text with clickable @mentions
function renderWithMentions(text, setSelectedPost) {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) => {
    if (/^@[a-zA-Z0-9_]+$/.test(part)) {
      const username = part.slice(1);
      return (
        <Link
          key={i}
          to={`/profile/${username}`}
          className="text-gray-600 hover:underline"
          onClick={() => setSelectedPost && setSelectedPost(null)}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

// Helper to check if a file is a video
function isVideoFile(fileUrl) {
  return /\.(mp4|webm|ogg)$/i.test(fileUrl);
}

// Add state for mute/unmute in modal
const [isVideoMuted, setIsVideoMuted] = useState(true);
const videoModalRef = useRef(null);
let touchTimeout = useRef();
function handleTouchStart() {
  touchTimeout.current = setTimeout(() => {
    if (videoModalRef.current) {
      if (videoModalRef.current.paused) videoModalRef.current.play();
      else videoModalRef.current.pause();
    }
  }, 400);
}
function handleTouchEnd() {
  clearTimeout(touchTimeout.current);
}


  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!user) return <div className="text-center p-10 text-red-500">User not found.</div>;


  return (
    <main className="max-w-4xl min-w-[330px] mx-auto p-4 bg-white dark:bg-black dark:text-white min-h-screen transition-colors duration-300 w-full min-w-0">
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
                className="cursor-pointer aspect-square overflow-hidden bg-black flex items-center justify-center relative"
                onClick={async () => {
                  const res = await axios.get(`http://localhost:5000/api/posts/single/${post._id}`);
                  setSelectedPost(res.data);
                }}
              >
                <Post
                  postId={post._id}
                  username={post.username}
                  collaborators={post.collaborators || []}
                  profile={`http://localhost:5000${post.profilePic || ''}`}
                  image={`http://localhost:5000${post.fileUrl}`}
                  caption={post.caption}
                  currentUser={username}
                  initialLikes={post.likes || []}
                  initialComments={post.comments || []}
                />
              </div>
            ))
          ) : (
            <div>No posts</div>
          )}
        </div>
      )}

      {/* Saved Posts Grid */}
      {activeTab === "Saved" && (
        <div className="grid grid-cols-3 gap-2 mb-10">
          {savedLoading ? (
            <div>Loading...</div>
          ) : savedPosts.length > 0 ? (
            savedPosts.map((post, index) => (
              <div
                key={index}
                className="cursor-pointer aspect-square overflow-hidden bg-black"
                onClick={async () => {
                  const res = await axios.get(`http://localhost:5000/api/posts/single/${post._id}`);
                  setSelectedPost(res.data);
                }}
              >
                <img
                  src={`http://localhost:5000${post.fileUrl}`}
                  alt={`Saved Post ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '1/1' }}
                />
              </div>
            ))
          ) : (
            <div>No saved posts</div>
          )}
        </div>
      )}

      {/* Post Viewer Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black dark:text-white rounded shadow-md flex flex-row w-auto max-w-4xl relative overflow-hidden">
            {/* Three Dots Dropdown Button */}
            <div className="absolute top-2 right-2 z-50">
              <button
                className="text-2xl text-gray-500 hover:text-black"
                onClick={() => setShowDropdown(prev => !prev)}
                title="Options"
              >
                <FaEllipsisV />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-900 border dark:border-gray-800 rounded shadow-lg z-50">
                  {selectedPost.username === localStorage.getItem("username") && (
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setSelectedPost(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
  </div>
            {/* Image Section */}
            {isVideoFile(selectedPost.fileUrl) ? (
              <div className="flex-shrink-0 flex items-center justify-center bg-black relative"
                style={{ width: 360, height: 640, minWidth: 180, minHeight: 320 }}
              >
                <video
                  ref={videoModalRef}
                  src={`http://localhost:5000${selectedPost.fileUrl}`}
                  autoPlay
                  muted={isVideoMuted}
                  playsInline
                  className="object-cover w-full h-full rounded cursor-pointer"
                  style={{ aspectRatio: '9/16', width: 360, height: 640, minWidth: 180, minHeight: 320 }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                />
                {/* Mute/unmute icon overlay */}
                <span className="absolute bottom-4 right-4 bg-black bg-opacity-60 rounded-full p-2 z-10"
                  onClick={() => setIsVideoMuted((prev) => !prev)}
                >
                  {isVideoMuted ? <FaVolumeMute className="w-6 h-6 text-white" /> : <FaVolumeUp className="w-6 h-6 text-white" />}
                </span>
</div>
            ) : (
              <div className="flex-shrink-0 flex items-center justify-center bg-black"
                style={isVideoFile(selectedPost.fileUrl)
                  ? { width: 360, height: 640, minWidth: 180, minHeight: 320 }
                  : { width: 400, height: 400, minWidth: 300, minHeight: 300 }}
              >
              <img
                src={`http://localhost:5000${selectedPost.fileUrl}`}
                alt="Full"
                className="object-cover w-full h-full rounded"
                  style={{ aspectRatio: '1/1', width: 400, height: 400, minWidth: 300, minHeight: 300 }}
              />
            </div>
            )}
            {/* Comments & Details Section */}
            {isVideoFile(selectedPost.fileUrl) ? (
              <div className="flex flex-col min-w-[180px] max-w-[360px]" style={{ width: 360, height: 640 }}>
                <div className="flex-1 flex flex-col p-2">
                  <h2 className="font-semibold mb-1">{selectedPost.username}</h2>
                  <p className="mb-2">{selectedPost.caption}</p>
              {/* Scrollable comments section */}
                  <div className="flex-1 overflow-y-auto mb-2 border-b pb-1 pr-1">
                {modalComments.length ? (
                  modalComments.map((c) => {
                    const isLiked = c.likes?.includes(localStorage.getItem("username"));
                    return (
                          <div key={c._id} className="mb-1 relative">
                        <div className="flex items-start justify-between group">
                          <div>
                            <p>
                                  <Link to={`/profile/${c.username}`} className="font-semibold hover:underline" onClick={() => setSelectedPost(null)}>{c.username}</Link>
{c.username === selectedPost.username && (
  <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>
)}
{': '}
{renderWithMentions(c.text, setSelectedPost)}
                            </p>
                          </div>
                          <div className="flex flex-col items-center ml-2">
                            <div className="flex items-start space-x-2 ml-2">
                              <span
                                className="text-xs text-blue-500 cursor-pointer"
                                onClick={() => {
                                  setModalReplyTo(c._id);
                                  setModalReplyInput(`@${c.username} `);
                                  setTimeout(() => commentInputRef.current && commentInputRef.current.focus(), 0);
                                }}
                              >
                                Reply
                              </span>
                              <div className="flex flex-col items-center">
                                <button onClick={() => handleModalCommentLike(c._id)}>
                                  {isLiked ? (
                                    <FaHeart className="text-red-500 text-sm" />
                                  ) : (
                                    <FaRegHeart className="text-sm" />
                                  )}
                                </button>
                                <span
                                      className="text-xs text-gray-600 cursor-pointer hover:underline relative"
                                      onClick={(e) => {
                                        // Toggle dropdown for this comment
                                        setShowCommentLikers((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [c._id]: !prev[c._id] }));
                                        // Get bounding rect for dropdown position
                                        const rect = e.target.getBoundingClientRect();
                                        const dropdownWidth = 144; // 9rem in px
                                        const dropdownHeight = 120; // px
                                        let left = rect.left;
                                        let top, direction;
                                        // Clamp left so dropdown never overflows right edge
                                        if (left + dropdownWidth > window.innerWidth) {
                                          left = window.innerWidth - dropdownWidth - 8; // 8px margin
                                        }
                                        if (rect.top > dropdownHeight) {
                                          // Enough space above
                                          top = rect.top - dropdownHeight;
                                          direction = 'above';
                                        } else {
                                          // Not enough space above, show below
                                          top = rect.bottom;
                                          direction = 'below';
                                        }
                                        // Clamp top so dropdown never goes off top
                                        if (top < 0) top = rect.bottom;
                                        setDropdownPos((prev) => ({ ...prev, [c._id]: { left, top, direction } }));
                                      }}
                                    >
                                      {/* Dropdown for likers, always visible and never cut off, rendered via portal */}
                                      {showCommentLikers[c._id] && c.likes?.length > 0 && dropdownPos[c._id] &&
                                        createPortal(
                                          <div
                                            style={{
                                              position: 'fixed',
                                              left: dropdownPos[c._id].left,
                                              top: dropdownPos[c._id].top,
                                              zIndex: 9999,
                                              width: '9rem', // w-36
                                              maxHeight: '7rem', // max-h-28
                                              overflowY: 'auto',
                                              background: 'white',
                                              border: '1px solid #e5e7eb',
                                              borderRadius: '0.375rem',
                                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                              padding: '0.5rem',
                                            }}
                                          >
                                            <p className="font-semibold mb-1">Liked by:</p>
                                            {c.likes.map((username, i) => (
                                              <Link
                                                key={i}
                                                to={`/profile/${username}`}
                                                className="block text-gray-600 hover:underline p-1 rounded hover:bg-gray-100"
                                                onClick={() => setSelectedPost(null)}
                                              >
                                                {username}
                                              </Link>
                                            ))}
                                          </div>,
                                          document.body
                                        )
                                      }
                                      {c.likes?.length || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Replies */}
                            {c.replies && c.replies.length > 0 && (
                              <div className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-1">
                                <span
                                  onClick={() => toggleModalReplies(c._id)}
                                  className="text-xs text-blue-500 cursor-pointer"
                                >
                                  {modalVisibleReplies[c._id]
                                    ? `Hide replies`
                                    : `View all ${c.replies.length} replies`}
                                </span>
                                {modalVisibleReplies[c._id] &&
                                  c.replies.map((r) => {
                                    const isReplyLiked = r.likes?.includes(localStorage.getItem("username"));
                                    return (
                                      <div key={r._id} className="flex items-start justify-between group">
                                        <p className="text-sm text-gray-700">
                                          <Link to={`/profile/${r.username}`} className="font-semibold hover:underline" onClick={() => setSelectedPost(null)}>{r.username}</Link>
{r.username === selectedPost.username && (
  <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>
)}
{': '}
{renderWithMentions(r.text, setSelectedPost)}
                                        </p>
                                        <div className="flex items-start space-x-2 ml-2">
                                          <span
                                            className="text-xs text-blue-500 cursor-pointer"
                                            onClick={() => {
                                              setModalReplyTo(c._id);
                                              setModalReplyInput(`@${r.username} `);
                                              setTimeout(() => commentInputRef.current && commentInputRef.current.focus(), 0);
                                            }}
                                          >
                                            Reply
                                          </span>
                                          <div className="flex flex-col items-center">
                                            <button onClick={() => handleModalReplyLike(c._id, r._id)}>
                                              {isReplyLiked ? (
                                                <FaHeart className="text-red-500 text-sm" />
                                              ) : (
                                                <FaRegHeart className="text-sm" />
                                              )}
                                            </button>
                                            <span className="text-xs text-gray-600 cursor-pointer hover:underline">
                                              {r.likes?.length || 0}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-sm">No comments yet.</p>
                    )}
                  </div>
                </div>
                {/* Like, Save, and Like Count */}
                <div className="px-1 py-1">
                  <div className="flex items-center gap-2 relative">
                    <button
                      className={`text-2xl transition-colors duration-200 ${isLiked ? "text-red-500" : "text-gray-600"}`}
                                  onClick={async () => {
                                    try {
                          await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/like`, {
                            username: localStorage.getItem("username"),
                          });
                          setIsLiked((prev) => !prev);
                          setSelectedPost((prev) => ({
                            ...prev,
                            likes: prev.likes?.includes(localStorage.getItem("username"))
                              ? prev.likes.filter(u => u !== localStorage.getItem("username"))
                              : [...(prev.likes || []), localStorage.getItem("username")],
                          }));
                                    } catch (err) {}
                                  }}
                                >
                      {isLiked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <span
                      ref={postLikeCountRef}
                      className="text-sm cursor-pointer hover:underline"
                      onClick={async (e) => {
                        try {
                          const res = await axios.get(`http://localhost:5000/api/posts/${selectedPost._id}/likers`);
                          setModalLikers(res.data.likers);
                          setShowModalLikers((prev) => !prev);
                          // Get bounding rect for dropdown position
                          const rect = (postLikeCountRef.current || e.target).getBoundingClientRect();
                          const dropdownWidth = 256; // 16rem in px (w-64)
                          const dropdownHeight = 240; // 15rem in px (max-h-60)
                          let left = rect.left;
                          let top, direction;
                          // Clamp left so dropdown never overflows right edge
                          if (left + dropdownWidth > window.innerWidth) {
                            left = window.innerWidth - dropdownWidth - 8; // 8px margin
                          }
                          if (rect.top > dropdownHeight) {
                            // Enough space above
                            top = rect.top - dropdownHeight;
                            direction = 'above';
                          } else {
                            // Not enough space above, show below
                            top = rect.bottom;
                            direction = 'below';
                          }
                          // Clamp top so dropdown never goes off top
                          if (top < 0) top = rect.bottom;
                          setPostDropdownPos({ left, top, direction });
                        } catch (err) {}
                      }}
                    >
                      {selectedPost.likes?.length || 0} likes
                                </span>
                    {/* Post likers dropdown rendered via portal */}
                    {showModalLikers && modalLikers.length > 0 && postDropdownPos &&
                      createPortal(
                        <div
                          style={{
                            position: 'fixed',
                            left: postDropdownPos.left,
                            top: postDropdownPos.top,
                            zIndex: 9999,
                            width: '16rem', // w-64
                            maxHeight: '15rem', // max-h-60
                            overflowY: 'auto',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            padding: '0.75rem',
                          }}
                        >
                          <p className="font-semibold mb-2">Liked by:</p>
                          {modalLikers.map((user, i) => (
                                      <Link
                                        key={i}
                                        to={`/profile/${user.username}`}
                              className="flex items-center gap-3 p-1 rounded hover:bg-gray-100"
                              onClick={() => setSelectedPost(null)}
                                      >
                                        <img
                                          src={user.profilePic}
                                          alt={user.username}
                                className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="text-blue-500 hover:underline">{user.username}</span>
                                      </Link>
                                    ))}
                        </div>,
                        document.body
                      )
                    }
                    <button
                      className="ml-auto text-2xl text-gray-600 hover:opacity-80"
                      onClick={handleModalSave}
                    >
                      {isSavedModal ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>
                  {/* Comment input */}
                  <div className="flex items-center border-t pt-1 relative dark:border-gray-800 bg-white dark:bg-black">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-2xl mr-2"
                      title="Emoji"
                    >
                      😊
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 z-50">
                        <Picker data={data} onEmojiSelect={(emoji) =>
                          setCommentInput(prev => prev + emoji.native)
                        } />
                                  </div>
                                )}

                    <input
                      ref={commentInputRef}
                      type="text"
                      value={modalReplyInput}
                      onChange={(e) => setModalReplyInput(e.target.value)}
                      placeholder={modalReplyTo ? `Replying...` : "Add a comment..."}
                      className="flex-1 border rounded px-2 py-1 bg-white dark:bg-neutral-900 dark:text-white border-gray-300 dark:border-gray-700"
                    />
                    <button
                      onClick={handleModalPostComment}
                      disabled={modalReplyInput.trim() === ""}
                      className={`ml-2 px-3 py-1 rounded text-white ${modalReplyInput.trim() === "" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 dark:bg-blue-600"}`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex-1 flex flex-col min-w-[300px] max-w-[400px]">
                <h2 className="font-semibold mb-1">{selectedPost.username}</h2>
                <p className="mb-2">{selectedPost.caption}</p>
                {/* Scrollable comments section */}
                <div className="flex-1 overflow-y-auto mb-2 max-h-56 border-b pb-1 pr-1">
                  {modalComments.length ? (
                    modalComments.map((c) => {
                      const isLiked = c.likes?.includes(localStorage.getItem("username"));
                      return (
                        <div key={c._id} className="mb-1 relative">
                          <div className="flex items-start justify-between group">
                            <div>
                              <p>
                                <Link to={`/profile/${c.username}`} className="font-semibold hover:underline" onClick={() => setSelectedPost(null)}>{c.username}</Link>
{c.username === selectedPost.username && (
  <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>
)}
{': '}
{renderWithMentions(c.text, setSelectedPost)}
                              </p>
                            </div>
                            <div className="flex flex-col items-center ml-2">
                              <div className="flex items-start space-x-2 ml-2">
                                <span
                                  className="text-xs text-blue-500 cursor-pointer"
                                  onClick={() => {
                                    setModalReplyTo(c._id);
                                    setModalReplyInput(`@${c.username} `);
                                    setTimeout(() => commentInputRef.current && commentInputRef.current.focus(), 0);
                                  }}
                                >
                                  Reply
                                </span>
                                <div className="flex flex-col items-center">
                                  <button onClick={() => handleModalCommentLike(c._id)}>
                                    {isLiked ? (
                                      <FaHeart className="text-red-500 text-sm" />
                                    ) : (
                                      <FaRegHeart className="text-sm" />
                                    )}
                                  </button>
                                  <span
                                    className="text-xs text-gray-600 cursor-pointer hover:underline relative"
                                    onClick={(e) => {
                                      // Toggle dropdown for this comment
                                      setShowCommentLikers((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [c._id]: !prev[c._id] }));
                                      // Get bounding rect for dropdown position
                                      const rect = e.target.getBoundingClientRect();
                                      const dropdownWidth = 144; // 9rem in px
                                      const dropdownHeight = 120; // px
                                      let left = rect.left;
                                      let top, direction;
                                      // Clamp left so dropdown never overflows right edge
                                      if (left + dropdownWidth > window.innerWidth) {
                                        left = window.innerWidth - dropdownWidth - 8; // 8px margin
                                      }
                                      if (rect.top > dropdownHeight) {
                                        // Enough space above
                                        top = rect.top - dropdownHeight;
                                        direction = 'above';
                                      } else {
                                        // Not enough space above, show below
                                        top = rect.bottom;
                                        direction = 'below';
                                      }
                                      // Clamp top so dropdown never goes off top
                                      if (top < 0) top = rect.bottom;
                                      setDropdownPos((prev) => ({ ...prev, [c._id]: { left, top, direction } }));
                                    }}
                                  >
                                    {/* Dropdown for likers, always visible and never cut off, rendered via portal */}
                                    {showCommentLikers[c._id] && c.likes?.length > 0 && dropdownPos[c._id] &&
                                      createPortal(
                                        <div
                                          style={{
                                            position: 'fixed',
                                            left: dropdownPos[c._id].left,
                                            top: dropdownPos[c._id].top,
                                            zIndex: 9999,
                                            width: '9rem', // w-36
                                            maxHeight: '7rem', // max-h-28
                                            overflowY: 'auto',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.375rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            padding: '0.5rem',
                                          }}
                                        >
                                          <p className="font-semibold mb-1">Liked by:</p>
                                          {c.likes.map((username, i) => (
                                            <Link
                                              key={i}
                                              to={`/profile/${username}`}
                                              className="block text-gray-600 hover:underline p-1 rounded hover:bg-gray-100"
                                              onClick={() => setSelectedPost(null)}
                                            >
                                              {username}
                                            </Link>
                                          ))}
                                        </div>,
                                        document.body
                                      )
                                    }
                                    {c.likes?.length || 0}
                                  </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Replies */}
                        {c.replies && c.replies.length > 0 && (
                            <div className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-1">
                            <span
                              onClick={() => toggleModalReplies(c._id)}
                              className="text-xs text-blue-500 cursor-pointer"
                            >
                              {modalVisibleReplies[c._id]
                                ? `Hide replies`
                                : `View all ${c.replies.length} replies`}
                            </span>
                            {modalVisibleReplies[c._id] &&
                              c.replies.map((r) => {
                                const isReplyLiked = r.likes?.includes(localStorage.getItem("username"));
                                return (
                                  <div key={r._id} className="flex items-start justify-between group">
                                    <p className="text-sm text-gray-700">
                                        <Link to={`/profile/${r.username}`} className="font-semibold hover:underline" onClick={() => setSelectedPost(null)}>{r.username}</Link>
{r.username === selectedPost.username && (
  <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>
)}
{': '}
{renderWithMentions(r.text, setSelectedPost)}
                                    </p>
                                    <div className="flex items-start space-x-2 ml-2">
                                      <span
                                        className="text-xs text-blue-500 cursor-pointer"
                                        onClick={() => {
                                          setModalReplyTo(c._id);
                                          setModalReplyInput(`@${r.username} `);
                                          setTimeout(() => commentInputRef.current && commentInputRef.current.focus(), 0);
                                        }}
                                      >
                                        Reply
                                      </span>
                                      <div className="flex flex-col items-center">
                                        <button onClick={() => handleModalReplyLike(c._id, r._id)}>
                                          {isReplyLiked ? (
                                            <FaHeart className="text-red-500 text-sm" />
                                          ) : (
                                            <FaRegHeart className="text-sm" />
                                          )}
                                        </button>
                                        <span className="text-xs text-gray-600 cursor-pointer hover:underline">
                                          {r.likes?.length || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No comments yet.</p>
                )}
              </div>
              {/* Like, Save, and Like Count */}
                <div className="flex items-center gap-2 px-1 py-1 relative">
                <button
                  className={`text-2xl transition-colors duration-200 ${isLiked ? "text-red-500" : "text-gray-600"}`}
                  onClick={async () => {
                    try {
                      await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/like`, {
                        username: localStorage.getItem("username"),
                      });
                      setIsLiked((prev) => !prev);
                      setSelectedPost((prev) => ({
                        ...prev,
                        likes: prev.likes?.includes(localStorage.getItem("username"))
                          ? prev.likes.filter(u => u !== localStorage.getItem("username"))
                          : [...(prev.likes || []), localStorage.getItem("username")],
                      }));
                    } catch (err) {}
                  }}
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                </button>
                <span
                    ref={postLikeCountRef}
                  className="text-sm cursor-pointer hover:underline"
                    onClick={async (e) => {
                    try {
                      const res = await axios.get(`http://localhost:5000/api/posts/${selectedPost._id}/likers`);
                      setModalLikers(res.data.likers);
                      setShowModalLikers((prev) => !prev);
                        // Get bounding rect for dropdown position
                        const rect = (postLikeCountRef.current || e.target).getBoundingClientRect();
                        const dropdownWidth = 256; // 16rem in px (w-64)
                        const dropdownHeight = 240; // 15rem in px (max-h-60)
                        let left = rect.left;
                        let top, direction;
                        // Clamp left so dropdown never overflows right edge
                        if (left + dropdownWidth > window.innerWidth) {
                          left = window.innerWidth - dropdownWidth - 8; // 8px margin
                        }
                        if (rect.top > dropdownHeight) {
                          // Enough space above
                          top = rect.top - dropdownHeight;
                          direction = 'above';
                        } else {
                          // Not enough space above, show below
                          top = rect.bottom;
                          direction = 'below';
                        }
                        // Clamp top so dropdown never goes off top
                        if (top < 0) top = rect.bottom;
                        setPostDropdownPos({ left, top, direction });
                    } catch (err) {}
                  }}
                >
                  {selectedPost.likes?.length || 0} likes
                </span>
                  {/* Post likers dropdown rendered via portal */}
                  {showModalLikers && modalLikers.length > 0 && postDropdownPos &&
                    createPortal(
                      <div
                        style={{
                          position: 'fixed',
                          left: postDropdownPos.left,
                          top: postDropdownPos.top,
                          zIndex: 9999,
                          width: '16rem', // w-64
                          maxHeight: '15rem', // max-h-60
                          overflowY: 'auto',
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          padding: '0.75rem',
                        }}
                      >
                    <p className="font-semibold mb-2">Liked by:</p>
                    {modalLikers.map((user, i) => (
                      <Link
                        key={i}
                        to={`/profile/${user.username}`}
                        className="flex items-center gap-3 p-1 rounded hover:bg-gray-100"
                            onClick={() => setSelectedPost(null)}
                      >
                        <img
                          src={user.profilePic}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-blue-500 hover:underline">{user.username}</span>
                      </Link>
                    ))}
                      </div>,
                      document.body
                    )
                  }
                <button
                  className="ml-auto text-2xl text-gray-600 hover:opacity-80"
                  onClick={handleModalSave}
                >
                  {isSavedModal ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
                {/* Comment input */}
                <div className="flex items-center border-t pt-1 relative dark:border-gray-800 bg-white dark:bg-black">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-2xl mr-2"
                  title="Emoji"
                >
                  😊
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50">
                    <Picker data={data} onEmojiSelect={(emoji) =>
                      setCommentInput(prev => prev + emoji.native)
                    } />
                  </div>
                )}

                <input
                  ref={commentInputRef}
                  type="text"
                  value={modalReplyInput}
                  onChange={(e) => setModalReplyInput(e.target.value)}
                  placeholder={modalReplyTo ? `Replying...` : "Add a comment..."}
                    className="flex-1 border rounded px-2 py-1 bg-white dark:bg-neutral-900 dark:text-white border-gray-300 dark:border-gray-700"
                />
                <button
                  onClick={handleModalPostComment}
                  disabled={modalReplyInput.trim() === ""}
                    className={`ml-2 px-3 py-1 rounded text-white ${modalReplyInput.trim() === "" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 dark:bg-blue-600"}`}
                >
                  Post
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-neutral-900 dark:text-white rounded p-6 w-80 text-center">
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 dark:text-white p-6 rounded shadow-md flex flex-col gap-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 dark:text-white p-6 rounded shadow-md flex flex-col gap-4">
            <p>Write a caption:</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            {/* Add Collaborator input */}
            <div className="mb-2">
              <div className="relative">
                <input
                  type="text"
                  value={collaboratorInput}
                  onChange={e => setCollaboratorInput(e.target.value)}
                  onFocus={() => setCollabDropdown(!!collabResults.length)}
                  placeholder="Add collaborator"
                  className="border px-3 py-2 rounded w-full"
                  disabled={collaborators.length >= 5}
                />
                {collabDropdown && collabResults.length > 0 && (
                  <div className="absolute left-0 right-0 bg-white dark:bg-neutral-900 border dark:border-gray-700 rounded shadow z-50 mt-1 max-h-40 overflow-y-auto">
                    {collabResults.map(user => (
                      <div
                        key={user._id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => addCollaborator(user.username)}
                      >
                        <span className="font-semibold">{user.username}</span>
                        {user.fullname && <span className="ml-2 text-gray-500">{user.fullname}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {collabDropdown && !collabLoading && collabResults.length === 0 && (
                  <div className="absolute left-0 right-0 bg-white dark:bg-neutral-900 border dark:border-gray-700 rounded shadow z-50 mt-1 px-3 py-2 text-gray-500">No users found</div>
                )}
                {collabLoading && (
                  <div className="absolute left-0 right-0 bg-white dark:bg-neutral-900 border dark:border-gray-700 rounded shadow z-50 mt-1 px-3 py-2 text-gray-500">Searching...</div>
                )}
              </div>
              {/* Show selected collaborators as tags */}
              {collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {collaborators.map(username => (
                    <span key={username} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full flex items-center text-xs">
                      {username}
                      <button onClick={() => removeCollaborator(username)} className="ml-1 text-xs text-red-500 hover:text-red-700">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 dark:text-white p-6 rounded shadow-md flex flex-col gap-4">
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
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-neutral-900 dark:text-white p-6 rounded shadow-md w-80">
      <h3 className="text-lg font-semibold mb-4">Followers</h3>
      {user.followers.length === 0 ? (
        <p className="text-gray-500">No followers yet.</p>
      ) : (
        <ul className="space-y-2">
          {user.followers.map(f => (
            <li
              key={f.username}
              onClick={() => {
                setShowFollowers(false);
                setSelectedPost && setSelectedPost(null);
                navigate(`/profile/${f.username}`);
              }}
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
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-neutral-900 dark:text-white p-6 rounded shadow-md w-80">
      <h3 className="text-lg font-semibold mb-4">Following</h3>
      {user.following.length === 0 ? (
        <p className="text-gray-500">Not following anyone yet.</p>
      ) : (
        <ul className="space-y-4">
          {user.following.map((f, i) => (
            <li
              key={i}
              onClick={() => {
                setShowFollowing(false);
                setSelectedPost && setSelectedPost(null);
                navigate(`/profile/${f.username}`);
              }}
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