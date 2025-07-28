import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
  FaBookmark,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
  FaEllipsisV,
  FaTrash,
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { createPortal } from "react-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Profile from "../pages/Profile";

// Helper to check if a file is a video
function isVideoFile(fileUrl) {
  return /\.(mp4|webm|ogg)$/i.test(fileUrl);
}

export default function Post({
  postId,
  username,
  collaborators = [],
  profile,
  image,
  caption,
  currentUser,
  initialLikes = [],
  initialComments = [],
}) {
  const [liked, setLiked] = useState(initialLikes.includes(currentUser));
  const [likesCount, setLikesCount] = useState(initialLikes.length);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const commentBoxRef = useRef();
  const [commentLikes, setCommentLikes] = useState({});
  const [showLikers, setShowLikers] = useState(null);
  const [replyTo, setReplyTo] = useState(null); // holds the comment being replied to
  const [visibleReplies, setVisibleReplies] = useState({});
  const [showPostLikers, setShowPostLikers] = useState(false);
  const [postLikers, setPostLikers] = useState([]);

  const [saved, setSaved] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef(null);
  let touchTimeout = useRef();

  // State for Profile-style Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalPost, setProfileModalPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalIsLiked, setModalIsLiked] = useState(false);
  const [isSavedModal, setIsSavedModal] = useState(false);
  const [showModalLikers, setShowModalLikers] = useState(false);
  const [modalLikers, setModalLikers] = useState([]);
  const [modalReplyTo, setModalReplyTo] = useState(null);
  const [modalReplyInput, setModalReplyInput] = useState("");
  const [modalComments, setModalComments] = useState([]);
  const [showCommentLikers, setShowCommentLikers] = useState({});
  const [dropdownPos, setDropdownPos] = useState({});
  const [postDropdownPos, setPostDropdownPos] = useState(null);
  const [modalIsVideoMuted, setModalIsVideoMuted] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [modalVisibleReplies, setModalVisibleReplies] = useState({});

  const videoModalRef = useRef(null);
  const commentInputRef = useRef(null);
  const postLikeCountRef = useRef(null);


  const [comments, setComments] = useState(
    initialComments.map((c) => ({
      ...c,
      likes: c.likes || [], // if your backend doesn't send this, we default to []
    }))
  );

  const toggleCommentLike = (commentId) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleShowPostLikers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${postId}/likers`);
      setPostLikers(res.data.likers); // assuming array of usernames
      setShowPostLikers(!showPostLikers);
    } catch (err) {
      console.error("Failed to fetch likers:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (commentBoxRef.current && !commentBoxRef.current.contains(e.target)) {
        setShowComments(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {
        username: currentUser,
      });

      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

      // 🔄 Fetch updated likers
      const res = await axios.get(`http://localhost:5000/api/posts/${postId}/likers`);
      setPostLikers(res.data.likers);  // ✅ make sure setPostLikers is defined

    } catch (err) {
      console.error("Like failed:", err);
    }
  };
  useEffect(() => {
    const fetchLikers = async () => {
      const res = await axios.get(`http://localhost:5000/api/posts/${postId}/likers`);
      setPostLikers(res.data.likers);
    };
    fetchLikers();
  }, [postId]);


  const handlePostComment = async () => {
    if (!commentInput.trim()) return;

    try {
      const payload = {
        username: currentUser,
        text: commentInput.trim(),
      };

      let res;
      if (replyTo) {
        // POST reply to existing comment
        res = await axios.post(`http://localhost:5000/api/posts/${postId}/comments/${replyTo}/replies`, payload);
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === replyTo
              ? { ...comment, replies: [...(comment.replies || []), res.data] }
              : comment
          )
        );
      } else {
        // POST new top-level comment
        res = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, payload);
        setComments((prev) => [...prev, res.data]);
      }

      setCommentInput("");
      setReplyTo(null);
      setShowComments(true);
    } catch (err) {
      console.error("Error posting comment/reply:", err);
      alert("Failed to post comment");
    }
  };


  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/save`, {
        username: currentUser,
      });
      // Update saved state based on backend response
      setSaved(res.data.savedPosts.map(id => id.toString()).includes(postId));
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${currentUser}/saved`);
        // If the postId is in the savedPosts array, set saved true
        setSaved(res.data.savedPosts.map(id => id.toString()).includes(postId));
      } catch (err) {
        setSaved(false);
      } finally {
        setLoadingSaved(false);
      }
    };
    fetchSaved();
  }, [postId, currentUser]);



  const handleCommentLike = async (commentId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}/like`,
        { username: currentUser }
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? { ...comment, likes: res.data.likes } : comment
        )
      );
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const handleReplyLike = async (commentId, replyId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`,
        { userId: currentUser }
      );

      setComments((prevComments) =>
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
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  function handleTouchStart() {
    touchTimeout.current = setTimeout(() => {
      if (videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    }, 400); // 400ms for long press
  }
  function handleTouchEnd() {
    clearTimeout(touchTimeout.current);
  }

  const handleOpenProfileModal = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/single/${postId}`);
      setProfileModalPost(res.data);
      setShowProfileModal(true);
    } catch (err) {
      alert("Failed to load post");
    }
  };

  // Handlers for the Profile-style modal
  useEffect(() => {
    if (profileModalPost) {
      setModalComments(profileModalPost.comments || []);
      setModalIsLiked(profileModalPost.likes?.includes(currentUser));
      const fetchSaved = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/posts/${currentUser}/saved`);
          setIsSavedModal(res.data.savedPosts.includes(profileModalPost._id));
        } catch (err) {
          setIsSavedModal(false);
        }
      };
      fetchSaved();
    }
  }, [profileModalPost, currentUser]);

  const handleDeletePost = async () => {
    if (!profileModalPost) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${profileModalPost._id}`);
      setShowProfileModal(false);
      setProfileModalPost(null);
      window.location.reload(); // Refresh to reflect deletion
    } catch (err) {
      alert("Error deleting post");
    }
  };

  const handleModalSave = async () => {
    if (!profileModalPost) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${profileModalPost._id}/save`, {
        username: currentUser,
      });
      setIsSavedModal(res.data.savedPosts.includes(profileModalPost._id));
    } catch (err) {}
  };

  const handleModalPostComment = async () => {
    if (!profileModalPost || modalReplyInput.trim() === "") return;
    try {
      const payload = { username: currentUser, text: modalReplyInput.trim() };
      if (modalReplyTo) {
        const res = await axios.post(`http://localhost:5000/api/posts/${profileModalPost._id}/comments/${modalReplyTo}/replies`, payload);
        setModalComments((prev) => prev.map((c) => (c._id === modalReplyTo ? { ...c, replies: [...(c.replies || []), res.data] } : c)));
        setModalReplyTo(null);
      } else {
        const res = await axios.post(`http://localhost:5000/api/posts/${profileModalPost._id}/comments`, payload);
        setModalComments((prev) => [...prev, res.data]);
      }
      setModalReplyInput("");
    } catch (err) {}
  };

  const handleModalCommentLike = async (commentId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${profileModalPost._id}/comments/${commentId}/like`, { username: currentUser });
      setModalComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, likes: res.data.likes } : c)));
    } catch (err) {}
  };

  const handleModalReplyLike = async (commentId, replyId) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/posts/${profileModalPost._id}/comments/${commentId}/replies/${replyId}/like`, { userId: currentUser });
      setModalComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, replies: c.replies.map((r) => (r._id === replyId ? { ...r, likes: res.data.likes } : r)) } : c)));
    } catch (error) {}
  };

  const toggleModalReplies = (commentId) => {
    setModalVisibleReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  function renderWithMentions(text) {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (/^@[a-zA-Z0-9_]+$/.test(part)) {
        const mentionUsername = part.slice(1);
        return (
          <Link key={i} to={`/profile/${mentionUsername}`} className="text-gray-600 hover:underline" onClick={() => setShowProfileModal(false)}>
            {part}
          </Link>
        );
      }
      return part;
    });
  }

  function modalHandleTouchStart() {
    touchTimeout.current = setTimeout(() => {
      if (videoModalRef.current) {
        if (videoModalRef.current.paused) videoModalRef.current.play();
        else videoModalRef.current.pause();
      }
    }, 400);
  }

  function modalHandleTouchEnd() {
    clearTimeout(touchTimeout.current);
  }

  return (
    <div className="bg-white dark:bg-black dark:border-gray-800 dark:text-white border rounded-md shadow mb-6 w-full max-w-md min-w-[330px] mx-auto relative">
      {/* Post Header */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <img
            src={profile}
            alt={username}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <span>
            {[username, ...collaborators].map((u, i, arr) => (
              <span key={u}>
                <Link to={`/profile/${u}`} className="font-semibold hover:underline">
                  {u}
                </Link>
                {i < arr.length - 1 && ', '}
              </span>
            ))}
          </span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full"
        >
          <FiMoreHorizontal />
        </button>
        {menuOpen && (
          <div className="absolute top-12 right-4 bg-white dark:bg-neutral-900 border dark:border-gray-800 rounded shadow z-50 w-48">
            <button
              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Post Media (1:1) */}
      <div className="relative aspect-square w-full bg-black flex items-center justify-center cursor-pointer"
        onClick={() => {
          if (isVideoFile(image)) setShowVideoModal(true);
        }}
      >
        {isVideoFile(image) && (
          <span className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full p-1 z-10">
            <FaPlay className="w-4 h-4" />
          </span>
        )}
        {isVideoFile(image) ? (
          <video
            src={image}
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1/1' }}
            muted
            autoPlay
            playsInline
            poster={caption}
          />
        ) : (
          <img
            src={image}
            alt="post"
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1/1' }}
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex gap-4 text-2xl">
          <button onClick={handleLike} className="hover:scale-110">
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          <button
            onClick={handleOpenProfileModal}
            className="hover:scale-110"
          >
            <FaRegComment />
          </button>
          <button
            onClick={(handleSave)}
            className="hover:scale-110 cursor-pointer"
          >
            <FaRegPaperPlane />
          </button>
        </div>
          <button onClick={handleSave} disabled={loadingSaved}>
            {loadingSaved ? (
              <span className="w-5 h-5 inline-block animate-spin">⏳</span>
            ) : saved ? (
              <FaBookmark className="w-5 h-5 cursor-pointer text-gray-600 dark:text-white" />
            ) : (
              <FaRegBookmark className="w-5 h-5 cursor-pointer text-gray-700 dark:text-white" />
            )}
          </button>
      </div>

      {/* Likes Count */}

      <div className="px-4 relative">
        <p
          className="font-semibold mb-1 cursor-pointer hover:underline"
          onClick={handleShowPostLikers}
        >
          {likesCount} likes
        </p>

        {/* Dropdown showing usernames */}
        {showPostLikers && postLikers.length > 0 && (
          <div className="absolute bg-white dark:bg-neutral-900 border dark:border-gray-800 shadow-md rounded-md text-sm w-64 max-h-60 overflow-y-auto p-3 z-50">
            <p className="font-semibold mb-2">Liked by:</p>
            {postLikers.map((user, i) => (
              <Link
                 key={i}
                 to={`/profile/${user.username}`}
                 className="flex items-center gap-3 p-1 rounded hover:bg-gray-100"
               >
                 <img
                   src={user.profilePic}
                   alt={user.username}
                   className="w-8 h-8 rounded-full object-cover"
                 />
                 <span className="text-blue-500 hover:underline">{user.username}</span>
               </Link>
             ))}
           </div>
         )}
      </div>


      {/* Post Caption */}
      <div className="px-4 pb-2">
        <p className="font-semibold">
          {username} <span className="font-normal text-gray-800 dark:text-white">{caption}</span>
        </p>
      </div>

      {/* Dropdown Comments (OLD) - This can be removed or kept as a fallback */}
      {showComments && (
        <div
          ref={commentBoxRef}
          className="absolute top-12 right-2 z-40 bg-white dark:bg-neutral-900 border dark:border-gray-800 rounded-md shadow-lg w-80 max-h-96 flex flex-col"
        >
          <h4 className="font-semibold px-4 pt-4">Comments</h4>

          {/* 🟡 Scrollable comment list */}
          <div className="overflow-y-auto flex-1 px-4 space-y-2">
            {comments.length > 0 ? (
              comments.map((c) => {
                const isLiked = c.likes.includes(currentUser);

                return (
                  <div key={c._id} className="mb-2 relative">
                    <div className="flex items-start justify-between group">
                      <div>
                        <p>
                          <Link
                            to={`/profile/${c.username}`}
                            className="font-semibold hover:underline"
                          >
                            {c.username}
                          </Link>
                          {c.username === username && (
                            <span className="ml-1 text-xs text-gray-500 font-semibold">author</span>
                          )}
                          {`: `}
                          {c.text}
                        </p>
                      </div>
                      <div className="flex flex-col items-center ml-2">
                        <div className="flex items-start space-x-2 ml-2">
                          <span
                            className="text-xs text-blue-500 cursor-pointer"
                            onClick={() => {
                              setReplyTo(c._id);
                              setCommentInput(`@${c.username} `);
                              setShowComments(true);
                            }}
                          >
                            Reply
                          </span>
                          <div className="flex flex-col items-center">
                            <button onClick={() => handleCommentLike(c._id)}>
                              {isLiked ? (
                                <FaHeart className="text-red-500 text-sm" />
                              ) : (
                                <FaRegHeart className="text-sm" />
                              )}
                            </button>
                            <span
                              className="text-xs text-gray-600 cursor-pointer hover:underline"
                              onClick={() =>
                                setShowLikers((prev) => (prev === c._id ? null : c._id))
                              }
                            >
                              {c.likes.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-2">
                        {/* Toggle Button */}
                        <span
                          onClick={() => toggleReplies(c._id)}
                          className="text-xs text-blue-500 cursor-pointer"
                        >
                          {visibleReplies[c._id]
                            ? `Hide replies`
                            : `View all ${c.replies.length} replies`}
                        </span>

                        {/* Replies List */}
                        {visibleReplies[c._id] &&
                          c.replies.map((r) => {
                            const isReplyLiked = r.likes?.includes(currentUser);
                            return (
                              <div key={r._id}>
                                <div className="flex items-start justify-between group">
                                  <p className="text-sm text-gray-700">
                                    <Link
                                      to={`/profile/${r.username}`}
                                      className="font-semibold hover:underline"
                                    >
                                      {r.username}
                                    </Link>
                                    {r.username === username && (
                                      <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>
                                    )}
                                    {`: `}
                                    {r.text}
                                  </p>
                                  <div className="flex items-start space-x-2 ml-2">
                                    <span
                                      className="text-xs text-blue-500 cursor-pointer"
                                      onClick={() => {
                                        setReplyTo(c._id);
                                        setCommentInput(`@${r.username} `);
                                        setShowComments(true);
                                      }}
                                    >
                                      Reply
                                    </span>
                                    <div className="flex flex-col items-center">
                                      <button onClick={() => handleReplyLike(c._id, r._id)}>
                                        {isReplyLiked ? (
                                          <FaHeart className="text-red-500 text-sm" />
                                        ) : (
                                          <FaRegHeart className="text-sm" />
                                        )}
                                      </button>
                                      <span
                                        className="text-xs text-gray-600 cursor-pointer hover:underline"
                                        onClick={() =>
                                          setShowLikers((prev) =>
                                            prev === r._id ? null : r._id
                                          )
                                        }
                                      >
                                        {r.likes?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Likers Dropdown */}
                                {showLikers === r._id && r.likes?.length > 0 && (
                                  <div className="absolute top-6 right-6 bg-white border shadow-md rounded-md text-xs w-40 max-h-32 overflow-y-auto p-2 z-50">
                                    <p className="font-semibold mb-1">Liked by:</p>
                                    {r.likes.map((user, i) => (
                                      <Link
                                        key={i}
                                        to={`/profile/${user}`}
                                        className="block text-blue-600 hover:underline"
                                      >
                                        {user}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                    {/* Likers dropdown */}
                    {showLikers === c._id && c.likes.length > 0 && (
                      <div className="absolute top-6 right-6 bg-white border shadow-md rounded-md text-xs w-40 max-h-32 overflow-y-auto p-2 z-50">
                        <p className="font-semibold mb-1">Liked by:</p>
                          {c.likes.map((user, i) => (
                            <Link
                              key={i}
                              to={`/profile/${user}`}
                              className="block text-blue-600 hover:underline"
                            >
                              {user}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>
          {/* 🟢 Input bar fixed at the bottom */}
          <div className="flex items-center border-t px-4 py-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full text-sm focus:outline-none"
            />
            <button
              onClick={handlePostComment}
              disabled={commentInput.trim() === ""}
              className={`ml-2 text-sm font-semibold ${
                commentInput.trim() !== "" ? "text-blue-500" : "text-gray-400"
              }`}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Profile Page Style Modal */}
      {showProfileModal && profileModalPost && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white dark:bg-black dark:text-white rounded shadow-md flex flex-row w-auto max-w-4xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            {/* Three Dots Dropdown Button */}
            <div className="absolute top-2 right-2 z-50">
              <button className="text-2xl text-gray-500 hover:text-black" onClick={() => setShowDropdown((prev) => !prev)} title="Options">
                <FaEllipsisV />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-900 border dark:border-gray-800 rounded shadow-lg z-50">
                  {profileModalPost.username === currentUser && (
                    <button onClick={() => { setShowDeleteConfirm(true); setShowDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600">
                      Delete
                    </button>
                  )}
                  <button onClick={() => setShowProfileModal(false)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {/* Media Section */}
            {isVideoFile(profileModalPost.fileUrl) ? (
              <div className="flex-shrink-0 flex items-center justify-center bg-black relative" style={{ width: 360, height: 640 }}>
                <video ref={videoModalRef} src={`http://localhost:5000${profileModalPost.fileUrl}`} autoPlay muted={modalIsVideoMuted} playsInline className="object-cover w-full h-full rounded" style={{ aspectRatio: '9/16' }} onTouchStart={modalHandleTouchStart} onTouchEnd={modalHandleTouchEnd} />
                <span className="absolute bottom-4 right-4 bg-black bg-opacity-60 rounded-full p-2 z-10" onClick={() => setModalIsVideoMuted((prev) => !prev)}>
                  {modalIsVideoMuted ? <FaVolumeMute className="w-6 h-6 text-white" /> : <FaVolumeUp className="w-6 h-6 text-white" />}
                </span>
              </div>
            ) : (
              <div className="flex-shrink-0 flex items-center justify-center bg-black" style={{ width: 400, height: 400 }}>
                <img src={`http://localhost:5000${profileModalPost.fileUrl}`} alt="Full" className="object-cover w-full h-full rounded" style={{ aspectRatio: '1/1' }} />
              </div>
            )}
            {/* Comments & Details Section */}
            <div className={`flex flex-col ${isVideoFile(profileModalPost.fileUrl) ? 'min-w-[180px] max-w-[360px]' : 'min-w-[300px] max-w-[400px]'} p-4`} style={{ height: isVideoFile(profileModalPost.fileUrl) ? 640 : 'auto' }}>
              <h2 className="font-semibold mb-1">{profileModalPost.username}</h2>
              <p className="mb-2">{profileModalPost.caption}</p>
              {/* Scrollable comments section */}
              <div className="flex-1 overflow-y-auto mb-2 border-b pb-1 pr-1">
                {modalComments.length ? (
                  modalComments.map((c) => {
                    const isCommentLiked = c.likes?.includes(currentUser);
                    return (
                      <div key={c._id} className="mb-1 relative">
                        <div className="flex items-start justify-between group">
                          <div>
                            <p>
                              <Link to={`/profile/${c.username}`} className="font-semibold hover:underline" onClick={() => setShowProfileModal(false)}>{c.username}</Link>
                              {c.username === profileModalPost.username && <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>}
                              {': '}
                              {renderWithMentions(c.text)}
                            </p>
                          </div>
                          <div className="flex flex-col items-center ml-2">
                            <div className="flex items-start space-x-2 ml-2">
                              <span className="text-xs text-blue-500 cursor-pointer" onClick={() => { setModalReplyTo(c._id); setModalReplyInput(`@${c.username} `); commentInputRef.current?.focus(); }}>
                                Reply
                              </span>
                              <div className="flex flex-col items-center">
                                <button onClick={() => handleModalCommentLike(c._id)}>
                                  {isCommentLiked ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-sm" />}
                                </button>
                                <span className="text-xs text-gray-600 cursor-pointer hover:underline" onClick={(e) => { setShowCommentLikers((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [c._id]: !prev[c._id] })); const rect = e.target.getBoundingClientRect(); setDropdownPos((prev) => ({ ...prev, [c._id]: { left: rect.left - 150, top: rect.top - 120 } })); }}>
                                  {c.likes?.length || 0}
                                </span>
                                {showCommentLikers[c._id] && c.likes?.length > 0 && dropdownPos[c._id] &&
                                  createPortal(
                                    <div style={{ position: 'fixed', left: dropdownPos[c._id].left, top: dropdownPos[c._id].top, zIndex: 9999, width: '9rem', maxHeight: '7rem', overflowY: 'auto', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '0.5rem' }}>
                                      <p className="font-semibold mb-1">Liked by:</p>
                                      {c.likes.map((u, i) => <Link key={i} to={`/profile/${u}`} className="block text-gray-600 hover:underline" onClick={() => setShowProfileModal(false)}>{u}</Link>)}
                                    </div>, document.body)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {c.replies && c.replies.length > 0 && (
                          <div className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-1">
                            <span onClick={() => toggleModalReplies(c._id)} className="text-xs text-blue-500 cursor-pointer">{modalVisibleReplies[c._id] ? `Hide replies` : `View all ${c.replies.length} replies`}</span>
                            {modalVisibleReplies[c._id] && c.replies.map((r) => {
                              const isReplyLiked = r.likes?.includes(currentUser);
                              return (
                                <div key={r._id} className="flex items-start justify-between group">
                                  <p className="text-sm text-gray-700">
                                    <Link to={`/profile/${r.username}`} className="font-semibold hover:underline" onClick={() => setShowProfileModal(false)}>{r.username}</Link>
                                    {r.username === profileModalPost.username && <span className="ml-1 text-xs text-blue-500 font-semibold">author</span>}
                                    {': '} {renderWithMentions(r.text)}
                                  </p>
                                  <div className="flex items-start space-x-2 ml-2">
                                    <span className="text-xs text-blue-500 cursor-pointer" onClick={() => { setModalReplyTo(c._id); setModalReplyInput(`@${r.username} `); commentInputRef.current?.focus(); }}>Reply</span>
                                    <div className="flex flex-col items-center">
                                      <button onClick={() => handleModalReplyLike(c._id, r._id)}>
                                        {isReplyLiked ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-sm" />}
                                      </button>
                                      <span className="text-xs text-gray-600">{r.likes?.length || 0}</span>
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
                ) : <p className="text-gray-400 text-sm">No comments yet.</p>}
              </div>
              {/* Actions & Input */}
              <div className="px-1 py-1">
                <div className="flex items-center gap-2 relative">
                  <button className={`text-2xl ${modalIsLiked ? "text-red-500" : "text-gray-600"}`} onClick={async () => { await axios.post(`http://localhost:5000/api/posts/${profileModalPost._id}/like`, { username: currentUser }); setModalIsLiked(!modalIsLiked); setProfileModalPost(p => ({ ...p, likes: p.likes.includes(currentUser) ? p.likes.filter(u => u !== currentUser) : [...p.likes, currentUser] })); }}>
                    {modalIsLiked ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <span ref={postLikeCountRef} className="text-sm cursor-pointer hover:underline" onClick={async (e) => { const res = await axios.get(`http://localhost:5000/api/posts/${profileModalPost._id}/likers`); setModalLikers(res.data.likers); setShowModalLikers(p => !p); const rect = e.target.getBoundingClientRect(); setPostDropdownPos({ left: rect.left - 260, top: rect.top - 240 }); }}>
                    {profileModalPost.likes?.length || 0} likes
                  </span>
                  {showModalLikers && modalLikers.length > 0 && postDropdownPos && createPortal(
                      <div style={{ position: 'fixed', left: postDropdownPos.left, top: postDropdownPos.top, zIndex: 9999, width: '16rem', maxHeight: '15rem', overflowY: 'auto', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '0.75rem' }}>
                        <p className="font-semibold mb-2">Liked by:</p>
                        {modalLikers.map((u, i) => <Link key={i} to={`/profile/${u.username}`} className="flex items-center gap-3 p-1 rounded hover:bg-gray-100" onClick={() => setShowProfileModal(false)}><img src={u.profilePic} alt={u.username} className="w-8 h-8 rounded-full" /><span className="text-blue-500">{u.username}</span></Link>)}
                      </div>, document.body)}
                  <button className="ml-auto text-2xl text-gray-600" onClick={handleModalSave}>
                    {isSavedModal ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                </div>
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
          </div>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white dark:bg-neutral-900 dark:text-white rounded p-6 w-80 text-center">
                <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
                <p>Are you sure you want to delete this post?</p>
                <div className="flex justify-end gap-4 mt-4">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button onClick={handleDeletePost} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Modal (9:16) */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative flex flex-col items-center">
            <span
              className="absolute top-2 right-2 text-3xl text-white cursor-pointer z-50"
              onClick={() => setShowVideoModal(false)}
            >
              &times;
            </span>
            <div className="flex items-center justify-center bg-black rounded" style={{ width: 360, height: 640 }}>
              <video
                ref={videoRef}
                src={image}
                autoPlay
                playsInline
                muted={isVideoMuted}
                className="object-cover w-full h-full rounded"
                style={{ aspectRatio: '9/16', width: 360, height: 640 }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
              {/* Mute/unmute icon overlay */}
              <span
                className="absolute bottom-4 right-4 bg-black bg-opacity-60 rounded-full p-2 z-10"
                onClick={() => setIsVideoMuted((prev) => !prev)}
              >
                {isVideoMuted ? <FaVolumeMute className="w-6 h-6 text-white" /> : <FaVolumeUp className="w-6 h-6 text-white" />}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}  