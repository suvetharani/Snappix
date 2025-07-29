import { useState, useRef, useEffect } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaLink,
  FaWhatsapp,
  FaFacebookMessenger,
  FaFacebookF,
  FaEnvelope,
  FaXTwitter,
} from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import axios from "axios";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

// Emoji list
const EMOJIS = ["😊", "😂", "😍", "🔥", "👍"];

export default function Reels() {
  const currentUsername = localStorage.getItem("username");
  const [reels, setReels] = useState([]);
  const [currentReel, setCurrentReel] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const videoRefs = useRef([]);
  const [showCommentLikers, setShowCommentLikers] = useState({});
  const [showVideoLikers, setShowVideoLikers] = useState(false);
  const [videoLikers, setVideoLikers] = useState([]);
  const [videoLikersDropdownPos, setVideoLikersDropdownPos] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState({});
  const [dropdownPos, setDropdownPos] = useState({});
  const scrollTimeout = useRef();
  const lastScrollY = useRef(0);
  const touchStartY = useRef(null);
  

  
  // Save functionality state
  const [saved, setSaved] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/all");
        // Filter for video files only (mp4, webm, ogg)
        const videoPosts = res.data.filter(
          (post) => /\.(mp4|webm|ogg)$/i.test(post.fileUrl)
        );
        setReels(videoPosts);
        setComments(videoPosts[0]?.comments || []);
      } catch (err) {
        setReels([]);
      }
    };
    fetchReels();
  }, []);



  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReel) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
    setComments(reels[currentReel]?.comments || []);
  }, [currentReel, reels]);

  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (reels.length > 0) {
      setLiked(reels[currentReel]?.likes?.includes(currentUsername));
      setLikesCount(reels[currentReel]?.likes?.length || 0);
    }
  }, [currentReel, reels, currentUsername]);

  // Save functionality
  const handleSave = async () => {
    if (!reels[currentReel]) return;
    
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${reels[currentReel]._id}/save`, {
        username: currentUsername,
      });
      // Update saved state based on backend response
      setSaved(res.data.savedPosts.map(id => id.toString()).includes(reels[currentReel]._id));
    } catch (err) {
      console.error("Error saving reel:", err);
    }
  };

  useEffect(() => {
    const fetchSaved = async () => {
      if (!reels[currentReel]) return;
      
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${currentUsername}/saved`);
        // If the reel ID is in the savedPosts array, set saved true
        setSaved(res.data.savedPosts.map(id => id.toString()).includes(reels[currentReel]._id));
      } catch (err) {
        setSaved(false);
      } finally {
        setLoadingSaved(false);
      }
    };
    fetchSaved();
  }, [currentReel, reels, currentUsername]);

  const handleLike = async () => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${reels[currentReel]._id}/like`, {
        username: currentUsername,
      });
      // Fetch updated likes for this reel
      const res = await axios.get(`http://localhost:5000/api/posts/single/${reels[currentReel]._id}`);
      setLiked(res.data.likes?.includes(currentUsername));
      setLikesCount(res.data.likes?.length || 0);
      // Optionally update reels state for consistency
      setReels((prev) => prev.map((r, i) => i === currentReel ? { ...r, likes: res.data.likes } : r));
    } catch (err) {}
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${reels[currentReel]._id}/comments`,
        {
          username: currentUsername,
          text: newComment.trim(),
        }
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      setShowEmoji(false);
    } catch (err) {}
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (reels.length > 0) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/posts/single/${reels[currentReel]._id}`
          );
          setComments(res.data.comments || []);
        } catch (err) {
          setComments([]);
        }
      }
    };
    fetchComments();
  }, [currentReel, reels]);

  const postComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { username: "you", text: newComment.trim() }]);
      setNewComment("");
      setShowEmoji(false);
    }
  };

  const addEmoji = (emoji) => {
    setNewComment((prev) => prev + emoji);
  };

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  if (reels.length === 0) {
    return <div className="text-center p-10">No reels found.</div>;
  }

  function handleWheel(e) {
    if (scrollTimeout.current) return;
    if (e.deltaY > 30) {
      // Scroll down
      setCurrentReel((prev) => Math.min(prev + 1, reels.length - 1));
    } else if (e.deltaY < -30) {
      // Scroll up
      setCurrentReel((prev) => Math.max(prev - 1, 0));
    }
    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 400);
  }
  function handleTouchStart(e) {
    if (e.touches && e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
    }
  }
  function handleTouchEnd(e) {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - endY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe up
        setCurrentReel((prev) => Math.min(prev + 1, reels.length - 1));
      } else {
        // Swipe down
        setCurrentReel((prev) => Math.max(prev - 1, 0));
      }
    }
    touchStartY.current = null;
  }

  return (
    <div className="flex justify-center items-center bg-gray-100 dark:bg-black dark:text-white h-screen w-screen overflow-hidden transition-colors duration-300">
      <div
        className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          height: '100vh',
          width: 'calc(100vh * 9 / 16)',
          maxWidth: '100vw',
          aspectRatio: '9/16',
          overscrollBehavior: 'none',
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => (
          <video
            key={reel._id}
            ref={(el) => (videoRefs.current[index] = el)}
            src={`http://localhost:5000${reel.fileUrl}`}
            muted
            playsInline
            autoPlay
            loop
            className={`absolute inset-0 w-full h-full object-cover ${
              index === currentReel ? "block" : "hidden"
            }`}
            style={{ aspectRatio: '9/16' }}
          />
        ))}

        {/* Right actions */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 text-white">
          <button onClick={handleLike}>
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          <span
            className="text-white text-sm cursor-pointer hover:underline relative"
            onClick={async (e) => {
              try {
                const res = await axios.get(`http://localhost:5000/api/posts/${reels[currentReel]._id}/likers`);
                setVideoLikers(res.data.likers);
                setShowVideoLikers((prev) => !prev);
                // Position dropdown
                const rect = e.target.getBoundingClientRect();
                const dropdownWidth = 256;
                const dropdownHeight = 240;
                let left = rect.left;
                let top, direction;
                if (left + dropdownWidth > window.innerWidth) {
                  left = window.innerWidth - dropdownWidth - 8;
                }
                if (rect.top > dropdownHeight) {
                  top = rect.top - dropdownHeight;
                  direction = 'above';
                } else {
                  top = rect.bottom;
                  direction = 'below';
                }
                if (top < 0) top = rect.bottom;
                setVideoLikersDropdownPos({ left, top, direction });
              } catch (err) {}
            }}
          >
            {likesCount}
            {showVideoLikers && videoLikers.length > 0 && videoLikersDropdownPos &&
              createPortal(
                <div
                  className="bg-white dark:bg-neutral-900 border dark:border-gray-700 text-black dark:text-white"
                  style={{
                    position: 'fixed',
                    left: videoLikersDropdownPos.left,
                    top: videoLikersDropdownPos.top,
                    zIndex: 9999,
                    width: '16rem',
                    maxHeight: '15rem',
                    overflowY: 'auto',
                    borderRadius: '0.375rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    padding: '0.75rem',
                  }}
                >
                  <p className="font-semibold mb-2">Liked by:</p>
                  {videoLikers.map((user, i) => (
                    <Link
                      key={i}
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowVideoLikers(false)}
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
          </span>

          <button onClick={() => setShowComments(true)}>
            <FaComment />
          </button>
          <span>{reels[currentReel]?.comments?.length || 0}</span>

          <button onClick={handleSave} disabled={loadingSaved}>
            {loadingSaved ? (
              <span className="w-5 h-5 inline-block animate-spin">⏳</span>
            ) : saved ? (
              <FaBookmark className="w-5 h-5 cursor-pointer text-gray-600" />
            ) : (
              <FaRegBookmark className="w-5 h-5 cursor-pointer text-white" />
            )}
          </button>
        </div>

        {/* User info */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center mb-2">
            <Link
              to={`/profile/${reels[currentReel]?.username}`}
              className="font-semibold mr-2 hover:underline"
            >
              <img
                src={reels[currentReel]?.profilePic ? `http://localhost:5000${reels[currentReel].profilePic}` : "/uploads/default.jpg"}
                alt="profile"
                className="w-8 h-8 rounded-full mr-2 inline-block"
              />
              {reels[currentReel]?.username}
            </Link>
            {/* Remove the Follow button */}
          </div>
          <p className="text-sm">{reels[currentReel]?.caption}</p>
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="fixed right-4 top-20 w-80 bg-white dark:bg-neutral-900 dark:text-white rounded-lg shadow-xl z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Comments</h2>
              <button onClick={() => setShowComments(false)}>
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.length > 0 ? comments.map((c) => {
                const isLiked = c.likes?.includes(currentUsername);
                return (
                  <div key={c._id} className="mb-1 relative">
                    <div className="flex items-start justify-between group">
                      <div>
                        <p>
                          <Link
                            to={`/profile/${c.username}`}
                            className="font-semibold hover:underline"
                            onClick={() => setShowComments(false)}
                          >
                            {c.username}
                          </Link>
                          {": "}{c.text}
                        </p>
                      </div>
                      <div className="flex flex-col items-center ml-2">
                        <div className="flex items-start space-x-2 ml-2">
                          <span
                            className="text-xs text-blue-500 cursor-pointer"
                            onClick={() => {
                              setNewComment(`@${c.username} `);
                              setShowEmoji(false);
                            }}
                          >
                            Reply
                          </span>
                          <div className="flex flex-col items-center">
                            <button onClick={async () => {
                              try {
                                const res = await axios.post(
                                  `http://localhost:5000/api/posts/${reels[currentReel]._id}/comments/${c._id}/like`,
                                  { username: currentUsername }
                                );
                                setComments((prev) => prev.map((com) => com._id === c._id ? { ...com, likes: res.data.likes } : com));
                              } catch (err) {}
                            }}>
                              {isLiked ? (
                                <FaHeart className="text-red-500 text-sm" />
                              ) : (
                                <FaRegHeart className="text-sm" />
                              )}
                            </button>
                            <span
                              className="text-xs text-gray-600 cursor-pointer hover:underline"
                              onClick={() => {
                                setShowCommentLikers((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [c._id]: !prev[c._id] }));
                              }}
                            >
                              {c.likes?.length || 0}
                            </span>
                            {/* Likers Dropdown */}
                            {showCommentLikers?.[c._id] && c.likes?.length > 0 && (
                              <div className="absolute top-6 right-6 bg-white dark:bg-neutral-900 border dark:border-gray-700 shadow-md rounded-md text-xs w-40 max-h-32 overflow-y-auto p-2 z-50">
                                <p className="font-semibold mb-1 text-black dark:text-white">Liked by:</p>
                                {c.likes.map((user, i) => (
                                  <Link key={i} to={`/profile/${user}`} className="block text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setShowComments(false)}>{user}</Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-2">
                        <span
                          onClick={() => toggleReplies(c._id)}
                          className="text-xs text-blue-500 cursor-pointer"
                        >
                          {visibleReplies[c._id] ? `Hide replies` : `View all ${c.replies.length} replies`}
                        </span>
                        {visibleReplies[c._id] && c.replies.map((r) => {
                          const isReplyLiked = r.likes?.includes(currentUsername);
                          return (
                            <div key={r._id} className="flex items-start justify-between group">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <Link
                                  to={`/profile/${r.username}`}
                                  className="font-semibold hover:underline"
                                  onClick={() => setShowComments(false)}
                                >
                                  {r.username}
                                </Link>
                                {": "}{r.text}
                              </p>
                              <div className="flex items-start space-x-2 ml-2">
                                <span
                                  className="text-xs text-blue-500 cursor-pointer"
                                  onClick={() => {
                                    setNewComment(`@${r.username} `);
                                    setShowEmoji(false);
                                  }}
                                >
                                  Reply
                                </span>
                                <div className="flex flex-col items-center">
                                  <button onClick={async () => {
                                    try {
                                      const res = await axios.patch(
                                        `http://localhost:5000/api/posts/${reels[currentReel]._id}/comments/${c._id}/replies/${r._id}/like`,
                                        { userId: currentUsername }
                                      );
                                      setComments((prev) => prev.map((com) => com._id === c._id ? {
                                        ...com,
                                        replies: com.replies.map((rep) => rep._id === r._id ? { ...rep, likes: res.data.likes } : rep)
                                      } : com));
                                    } catch (err) {}
                                  }}>
                                    {isReplyLiked ? (
                                      <FaHeart className="text-red-500 text-sm" />
                                    ) : (
                                      <FaRegHeart className="text-sm" />
                                    )}
                                  </button>
                                  <span
                                    className="text-xs text-gray-600 cursor-pointer hover:underline"
                                    onClick={() => {
                                      setShowCommentLikers((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [r._id]: !prev[r._id] }));
                                    }}
                                  >
                                    {r.likes?.length || 0}
                                  </span>
                                  {/* Likers Dropdown for replies */}
                                  {showCommentLikers?.[r._id] && r.likes?.length > 0 && (
                                    <div className="absolute top-6 right-6 bg-white dark:bg-neutral-900 border dark:border-gray-700 shadow-md rounded-md text-xs w-40 max-h-32 overflow-y-auto p-2 z-50">
                                      <p className="font-semibold mb-1 text-black dark:text-white">Liked by:</p>
                                      {r.likes.map((user, i) => (
                                        <Link key={i} to={`/profile/${user}`} className="block text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setShowComments(false)}>{user}</Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }) : <p className="text-gray-500">No comments yet</p>}
            </div>
            <div className="flex items-center mt-4">
              <button
                className="text-2xl mr-2"
                onClick={() => setShowEmoji(!showEmoji)}
              >
                😊
              </button>
              {showEmoji && (
                <div className="absolute bottom-16 left-0 z-50 bg-white rounded shadow p-2 flex gap-2">
                  {EMOJIS.map((emoji) => (
                    <span
                      key={emoji}
                      className="text-xl cursor-pointer"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded px-2 py-1 bg-white dark:bg-neutral-900 dark:text-white border-gray-300 dark:border-gray-700"
              />
              <button
                onClick={handlePostComment}
                disabled={newComment.trim() === ""}
                className={`ml-2 px-3 py-1 rounded text-white ${newComment.trim() === "" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
              >
                Post
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
