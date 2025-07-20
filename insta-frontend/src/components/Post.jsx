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
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { Bookmark, BookmarkCheck } from "lucide-react";

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
const [replyTo, setReplyTo] = useState(null); // holds the comment being replied to
const [visibleReplies, setVisibleReplies] = useState({});
const [showPostLikers, setShowPostLikers] = useState(false);
const [postLikers, setPostLikers] = useState([]);

const [saved, setSaved] = useState(false);
const [loadingSaved, setLoadingSaved] = useState(true);


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
    <FaBookmark className="w-5 h-5 text-gray-600 cursor-pointer" />
  ) : (
    <FaRegBookmark className="w-5 h-5 text-gray-700 cursor-pointer" />
  )}
</button>


      </div>

      {/* Likes Count */}
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
  <div className="absolute bg-white border shadow-md rounded-md text-sm w-64 max-h-60 overflow-y-auto p-3 z-50">
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
          {username} <span className="font-normal text-gray-800">{caption}</span>
        </p>
      </div>

      {/* Dropdown Comments */}
      {showComments && (
  <div
    ref={commentBoxRef}
    className="absolute top-12 right-2 z-40 bg-white border rounded-md shadow-lg w-80 max-h-96 flex flex-col"
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
</Link>{`: `}
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
</Link>{`: `}
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

    </div>
  );
}  