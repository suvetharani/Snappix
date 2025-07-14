import { useState, useRef, useEffect } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaPaperPlane,
  FaBookmark,
  FaLink,
  FaWhatsapp,
  FaFacebookMessenger,
  FaFacebookF,
  FaEnvelope,
  FaXTwitter,
} from "react-icons/fa6";
import { FaEllipsisH } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import profilePic from "../assets/profiles/profile.jpg";
import reel1 from "../assets/videos/video1.mp4";

// Emoji list
const EMOJIS = ["😊", "😂", "😍", "🔥", "👍"];

export default function Reels() {
  const reels = [
    {
      id: 1,
      username: "john_doe",
      profile: profilePic,
      video: reel1,
      caption: "Beach vibes 🌊🌴",
      likes: 987,
      comments: 345,
      shares: 45,
    },
    {
      id: 2,
      username: "emma_watson",
      profile: profilePic,
      video: reel1,
      caption: "Sunset mood 🌅",
      likes: 567,
      comments: 123,
      shares: 12,
    },
  ];

  const [currentReel, setCurrentReel] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState([
    { username: "alex99", text: "Awesome reel! ❤️" },
    { username: "emma", text: "Love this! 🔥" },
  ]);
  const [newComment, setNewComment] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const videoRefs = useRef([]);

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
  }, [currentReel]);

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

  return (
    <div className="flex justify-center bg-gray-100 h-screen overflow-y-scroll">
      <div className="relative w-[360px] h-[640px] my-10 bg-black rounded-xl overflow-hidden">
        {reels.map((reel, index) => (
          <video
            key={reel.id}
            ref={(el) => (videoRefs.current[index] = el)}
            src={reel.video}
            muted
            playsInline
            autoPlay
            loop
            className={`absolute inset-0 w-full h-full object-cover ${
              index === currentReel ? "block" : "hidden"
            }`}
            onClick={() =>
              setCurrentReel((prev) => (prev + 1) % reels.length)
            }
          />
        ))}

        {/* Right actions */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 text-white">
          <button onClick={() => setLiked(!liked)}>
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          <span>{reels[currentReel].likes}</span>

          <button onClick={() => setShowComments(true)}>
            <FaComment />
          </button>
          <span>{reels[currentReel].comments}</span>

          <button onClick={() => setShowShare(true)}>
            <FaPaperPlane />
          </button>
          <span>{reels[currentReel].shares}</span>

          <FaBookmark />
          <button onClick={() => setShowMenu(!showMenu)}>
            <FaEllipsisH />
          </button>
        </div>

        {/* User info */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center mb-2">
            <img
              src={reels[currentReel].profile}
              alt="profile"
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="font-semibold mr-2">
              {reels[currentReel].username}
            </span>
            <button className="text-sm text-blue-400">Follow</button>
          </div>
          <p className="text-sm">{reels[currentReel].caption}</p>
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-xl z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Comments</h2>
              <button onClick={() => setShowComments(false)}>
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((c, i) => (
                <p key={i}>
                  <span className="font-semibold">{c.username}:</span>{" "}
                  {c.text}
                </p>
              ))}
            </div>
            <div className="mt-4 flex items-center border-t pt-2 relative">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
              {newComment.trim() && (
                <button
                  onClick={postComment}
                  className="ml-2 text-blue-500 font-semibold"
                >
                  Post
                </button>
              )}
              <button
                className="ml-2"
                onClick={() => setShowEmoji(!showEmoji)}
              >
                😊
              </button>

              {showEmoji && (
                <div className="absolute bottom-10 right-0 bg-white border rounded shadow p-2 grid grid-cols-5 gap-2">
                  {EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => addEmoji(emoji)}
                      className="text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Share popup */}
        {showShare && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-sm rounded-lg p-4 relative">
              <button
                onClick={() => setShowShare(false)}
                className="absolute top-4 right-4"
              >
                <FiX className="text-xl" />
              </button>
              <h2 className="text-center font-semibold mb-4">Share</h2>
              <input
                type="text"
                placeholder="Search usernames..."
                className="border w-full px-2 py-1 mb-4"
              />
              <div className="grid grid-cols-3 gap-4 mb-4">
                {["alex_dev", "emma_watson", "mike_jordan"].map(
                  (username, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <img
                        src={profilePic}
                        alt={username}
                        className="w-12 h-12 rounded-full"
                      />
                      <span className="text-xs">{username}</span>
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-around text-2xl">
                <FaLink title="Copy Link" className="cursor-pointer" />
                <FaWhatsapp title="WhatsApp" className="cursor-pointer" />
                <FaFacebookMessenger
                  title="Messenger"
                  className="cursor-pointer"
                />
                <FaFacebookF title="Facebook" className="cursor-pointer" />
                <FaEnvelope title="Email" className="cursor-pointer" />
                <FaXTwitter title="X" className="cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* Three dots menu */}
        {showMenu && (
          <div className="absolute right-4 bottom-4 bg-white text-black rounded shadow-lg z-50 w-48 p-2">
            <button
              className="w-full text-left py-2 hover:bg-gray-100"
              onClick={() => alert("Reported")}
            >
              Report
            </button>
            <button className="w-full text-left py-2 hover:bg-gray-100">
              Follow
            </button>
            <button className="w-full text-left py-2 hover:bg-gray-100">
              Go to Post
            </button>
            <button className="w-full text-left py-2 hover:bg-gray-100">
              Share to...
            </button>
            <button className="w-full text-left py-2 hover:bg-gray-100">
              Copy Link
            </button>
            <button className="w-full text-left py-2 hover:bg-gray-100">
              Embed
            </button>
            <button className="w-full text-left py-2 hover:bg-gray-100">
              About this Account
            </button>
            <button
              className="w-full text-left py-2 text-red-500 hover:bg-gray-100"
              onClick={() => setShowMenu(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
