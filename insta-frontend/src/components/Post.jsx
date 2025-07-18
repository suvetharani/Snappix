import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";

export default function Post({
  postId,
  username,
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
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

const handlePostComment = async () => {
  try {
    if (!commentInput.trim()) return;

    const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
      username: currentUser,
      text: commentInput.trim(),
    });

    setComments((prev) => [...prev, res.data]);
    setCommentInput("");
    setShowComments(true); // <-- force dropdown to stay open and refresh
  } catch (err) {
    console.error("Error posting comment:", err);
    alert("Failed to post comment");
  }
};

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


  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  return (
    <div className="bg-white border rounded-md shadow mb-6 w-full max-w-md mx-auto relative">
      {/* Post Header */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <img
            src={profile}
            alt={username}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <Link to={`/profile/${username}`} className="font-semibold hover:underline">
            {username}
          </Link>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl hover:bg-gray-100 p-1 rounded-full"
        >
          <FiMoreHorizontal />
        </button>
        {menuOpen && (
          <div className="absolute top-12 right-4 bg-white border rounded shadow z-50 w-48">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                alert("Added to Favourites!");
                setMenuOpen(false);
              }}
            >
              Add to Favourite
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                handleCopyLink();
                setMenuOpen(false);
              }}
            >
              Copy Link
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                alert(`About ${username}'s account`);
                setMenuOpen(false);
              }}
            >
              About this Account
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Post Image */}
      <div className="relative">
        <img
          src={image}
          alt="post"
          className="w-full max-h-[400px] object-cover cursor-pointer"
          onDoubleClick={handleLike}
        />
      </div>

      {/* Post Actions */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex gap-4 text-2xl">
          <button onClick={handleLike} className="hover:scale-110">
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:scale-110"
          >
            <FaRegComment />
          </button>
          <FaRegPaperPlane className="hover:scale-110 cursor-pointer" />
        </div>
        <FaRegBookmark className="text-2xl hover:scale-110 cursor-pointer" />
      </div>

      {/* Likes Count */}
      <div className="px-4">
        <p className="font-semibold mb-1">{likesCount} likes</p>
      </div>

      {/* Post Caption */}
      <div className="px-4 pb-2">
        <p className="font-semibold">
          {username} <span className="font-normal text-gray-800">{caption}</span>
        </p>
      </div>

      {/* Dropdown Comments */}
      {showComments && (
        <div
          ref={commentBoxRef}
          className="absolute top-12 right-2 z-40 bg-white border rounded-md shadow-lg w-80 max-h-96 overflow-y-auto p-4"
        >
          <h4 className="font-semibold mb-2">Comments</h4>
          <div className="space-y-2">
{comments.length > 0 ? (
  comments.map((c) => {
    const isLiked = c.likes.includes(currentUser);


    return (
      <div key={c._id} className="flex items-start justify-between relative group">
        <div>
          <p>
            <span className="font-semibold">{c.username}: </span>
            {c.text}
          </p>
        </div>

        <div className="flex flex-col items-center ml-2">
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

          {/* Likers dropdown */}
          {showLikers === c._id && c.likes.length > 0 && (
            <div className="absolute top-6 right-6 bg-white border shadow-md rounded-md text-xs w-40 max-h-32 overflow-y-auto p-2 z-50">
              <p className="font-semibold mb-1">Liked by:</p>
              {c.likes.map((user, i) => (
                <p key={i} className="text-gray-800">{user}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  })
) : (
  <p className="text-gray-500">No comments yet</p>
)}



          </div>
          <div className="flex items-center mt-4 border-t pt-2">
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
    </div>
  );
}  