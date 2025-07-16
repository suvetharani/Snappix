import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // ✅ Import axios
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";

export default function Post({
  postId,          // ✅ New: pass this from parent
  username,
  profile,
  image,
  caption,
  currentUser,     // ✅ New: who is logged in
  initialLikes = [], // ✅ Optionally pass initial likes/comments
  initialComments = [],
}) {
  const [liked, setLiked] = useState(initialLikes.includes(currentUser));
  const [likesCount, setLikesCount] = useState(initialLikes.length);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments);

  // ✅ Connect to backend to like/unlike post

// Inside Post component:

const handleLike = async () => {
  try {
    await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {
      username: currentUser,
    });

    // Local state update for instant UI feedback:
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  } catch (err) {
    console.error("Like failed:", err);
  }
};



  // ✅ Connect to backend to post comment
  const handleCommentPost = async () => {
  if (comment.trim() === "") return;

  try {
    const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
      username: currentUser,
      text: comment.trim(),
    });

    // Add the new comment from the response
    setComments([res.data, ...comments]);
    setComment("");
  } catch (err) {
    console.error("Comment failed:", err);
  }
};


  const toggleCommentLike = (id) => {
    // Optional: implement like for individual comment
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
          <Link to={`profile`} className="font-semibold hover:underline">
            {username}
          </Link>
        </div>

        {/* 3 Dots */}
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
            {liked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
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
          {username}{" "}
          <span className="font-normal text-gray-800">{caption}</span>
        </p>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-2">
          {comments.map((c) => (
            <div key={c._id} className="flex items-center justify-between mb-1">
              <p>
                <span className="font-semibold mr-1">{c.username}</span>
                <span>{c.text}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <div className="flex items-center justify-between px-4 pb-4 border-t pt-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full focus:outline-none py-1"
        />
        {comment.trim() !== "" && (
          <button
            onClick={handleCommentPost}
            className="text-blue-500 font-semibold ml-2"
          >
            Post
          </button>
        )}
      </div>
    </div>
  );
}
