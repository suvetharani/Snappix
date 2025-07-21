import React, { useEffect, useState, useRef } from "react";
import { FaHeart, FaRegComment, FaBookmark,FaRegHeart, FaRegBookmark, FaVolumeMute, FaVolumeUp, FaPlay } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { createPortal } from "react-dom";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalComments, setModalComments] = useState([]);
  const [modalReplyTo, setModalReplyTo] = useState(null);
  const [modalReplyInput, setModalReplyInput] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSavedModal, setIsSavedModal] = useState(false);
  const [showModalLikers, setShowModalLikers] = useState(false);
  const [modalLikers, setModalLikers] = useState([]);
  const [showCommentLikers, setShowCommentLikers] = useState({});
  const [dropdownPos, setDropdownPos] = useState({});
  const [modalVisibleReplies, setModalVisibleReplies] = useState({});
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commentInputRef = useRef(null);
  const postLikeCountRef = useRef(null);
  const [postDropdownPos, setPostDropdownPos] = useState(null);
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/all");
        setPosts(res.data);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Helper to check if a file is a video
  function isVideoFile(fileUrl) {
    return /\.(mp4|webm|ogg)$/i.test(fileUrl);
  }

  // Modal logic (copied/adapted from Profile.jsx)
  useEffect(() => {
    if (selectedPost) {
      setModalComments(selectedPost.comments || []);
      setIsLiked(selectedPost.likes?.includes(localStorage.getItem("username")));
      // Fetch saved status
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

  const handleModalSave = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/save`, {
        username: localStorage.getItem("username"),
      });
      setIsSavedModal(res.data.savedPosts.includes(selectedPost._id));
    } catch (err) {}
  };

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

  const toggleModalReplies = (commentId) => {
    setModalVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Helper to render text with clickable @mentions
  function renderWithMentions(text) {
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

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>
      <div className="grid grid-cols-3 gap-1 md:gap-2 lg:gap-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="relative group w-full aspect-square overflow-hidden cursor-pointer"
            onClick={async () => {
              const res = await axios.get(`http://localhost:5000/api/posts/single/${post._id}`);
              setSelectedPost(res.data);
            }}
          >
            {isVideoFile(post.fileUrl) ? (
              <video
                src={`http://localhost:5000${post.fileUrl}`}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={`http://localhost:5000${post.fileUrl}`}
                alt="Explore post"
                className="w-full h-full object-cover"
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold space-x-4 transition">
              <div className="flex items-center gap-1">
                <FaHeart className="text-lg" />
                <span>{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaRegComment className="text-lg" />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal (copied/adapted from Profile.jsx) */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-md flex flex-row w-auto max-w-4xl relative overflow-hidden">
            {/* X Close Button */}
            <button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black z-50 bg-white rounded-full p-1"
              onClick={() => setSelectedPost(null)}
              title="Close"
            >
              &times;
            </button>
            {/* Image/Video Section */}
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
                style={{ width: 400, height: 400, minWidth: 300, minHeight: 300 }}
              >
                <img
                  src={`http://localhost:5000${selectedPost.fileUrl}`}
                  alt="Full"
                  className="object-cover w-full h-full rounded"
                  style={{ aspectRatio: '1/1', width: 400, height: 400, minWidth: 300, minHeight: 300 }}
                />
              </div>
            )}
            {/* Comments & Details Section (copied/adapted from Profile.jsx) */}
            <div className="p-4 flex-1 flex flex-col min-w-[300px] max-w-[400px] h-[640px] relative">
              <h2 className="font-semibold mb-1">{selectedPost.username}</h2>
              <p className="mb-2">{selectedPost.caption}</p>
              {/* Scrollable comments section */}
              <div className="flex-1 overflow-y-auto border-b pr-1 pb-24"> {/* pb-24 ensures comments are not hidden behind controls */}
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
                              {renderWithMentions(c.text)}
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
                                    setShowCommentLikers((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [c._id]: !prev[c._id] }));
                                    const rect = e.target.getBoundingClientRect();
                                    const dropdownWidth = 144;
                                    const dropdownHeight = 120;
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
                                    setDropdownPos((prev) => ({ ...prev, [c._id]: { left, top, direction } }));
                                  }}
                                >
                                  {showCommentLikers[c._id] && c.likes?.length > 0 && dropdownPos[c._id] &&
                                    createPortal(
                                      <div
                                        style={{
                                          position: 'fixed',
                                          left: dropdownPos[c._id].left,
                                          top: dropdownPos[c._id].top,
                                          zIndex: 9999,
                                          width: '9rem',
                                          maxHeight: '7rem',
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
                                      {renderWithMentions(r.text)}
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
              {/* Like, Save, and Like Count + Comment input absolutely fixed at bottom */}
              <div className="absolute left-0 right-0 bottom-0 border-t bg-white">
                <div className="flex items-center px-1 py-1 relative">
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
                        const rect = (postLikeCountRef.current || e.target).getBoundingClientRect();
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
                          width: '16rem',
                          maxHeight: '15rem',
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
                <div className="flex items-center border-t pt-1 relative">
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
                        setModalReplyInput(prev => prev + emoji.native)
                      } />
                    </div>
                  )}
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={modalReplyInput}
                    onChange={(e) => setModalReplyInput(e.target.value)}
                    placeholder={modalReplyTo ? 'Replying...' : 'Add a comment...'}
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    onClick={handleModalPostComment}
                    disabled={modalReplyInput.trim() === ""}
                    className={`ml-2 px-3 py-1 rounded text-white ${modalReplyInput.trim() === "" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}