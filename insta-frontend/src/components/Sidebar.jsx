import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import SearchBox from "./SearchBox";
import axios from "axios";
import {
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlineGlobeAlt,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePlusCircle,
  HiOutlineUserCircle,
  HiOutlineUserPlus,
  HiOutlineMoon,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark
} from "react-icons/hi2";
import { BsCameraReels } from "react-icons/bs";
import ReportModal from "./ReportModal";
import { FaInstagram, FaPlus } from "react-icons/fa";
import { UnreadContext } from "../context/UnreadContext";

export default function Sidebar({ isOpen, setIsOpen, onReportOpen }) {
  const [foundUser, setFoundUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for persisted theme
    const stored = localStorage.getItem('darkMode');
    return stored === 'true';
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();
  const [recents, setRecents] = useState(() => {
    const stored = localStorage.getItem("recents");
    return stored ? JSON.parse(stored) : [];
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const { unreadUserCount } = useContext(UnreadContext);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users?username=${searchTerm}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // Fetch current user's profilePic
  useEffect(() => {
    const fetchProfile = async () => {
      const username = localStorage.getItem("username");
      if (!username) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${username}`);
        setCurrentUserProfile(res.data);
      } catch (err) {
        setCurrentUserProfile(null);
      }
    };
    fetchProfile();
  }, []);


 const clearAll = () => {
  setRecents([]);
  localStorage.removeItem("recents");
};

const removeRecent = (username) => {
  const updated = recents.filter(r => r.username !== username);
  setRecents(updated);
  localStorage.setItem("recents", JSON.stringify(updated));
};


  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', next);
      return next;
    });
  };

  // On mount, apply dark mode if needed
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <>
    
    
      {/* Sidebar for tablet and up */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 bg-white dark:bg-black dark:text-white rounded p-2 shadow border dark:border-gray-800 tablet:block hidden"
          onClick={() => setIsOpen(true)}
        >
          <HiOutlineBars3 className="text-2xl" />
        </button>
      )}
      <aside
        className={`hidden tablet:flex flex-col justify-between h-screen ${showSearch ? 'w-20' : 'w-64'} fixed left-0 top-0 z-50 p-4 border-r bg-white dark:bg-black dark:border-gray-800 dark:text-white transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ pointerEvents: "auto" }}
      >
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between mb-10 px-2">
            <Link to="/">
              <h1
                className={`text-3xl font-normal font-logo ${
                  (!isOpen || showSearch) && "hidden"
                }`}
              >
                Snappix
              </h1>
              {showSearch && (
                <FaInstagram className="text-2xl" />
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xl p-2 hover:bg-gray-100 rounded"
            >
              {isOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
            </button>
          </div>
          <nav className={`flex flex-col gap-4 ${isOpen ? "items-start" : "items-center"}`}>

            <Link
              to="/"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full"
            >
              <HiOutlineHome className="text-2xl" /> {isOpen && !showSearch && "Home"}
            </Link>

            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setShowMore(false);
                setShowCreate(false);
              }}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full"
            >
              <HiOutlineMagnifyingGlass className="text-2xl" /> {isOpen && !showSearch && "Search"}
            </button>

            <Link
              to="/explore"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full"
            >
              <HiOutlineGlobeAlt className="text-2xl" /> {isOpen && !showSearch && "Explore"}
            </Link>

            <Link
              to="/reels"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full"
            >
              <BsCameraReels className="text-2xl" /> {isOpen && !showSearch && "Reels"}
            </Link>

            <Link
              to="/messages"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full relative"
            >
              <HiOutlineChatBubbleLeftRight className="text-2xl" /> {isOpen && !showSearch && "Messages"}
              {unreadUserCount > 0 && (
                <span className="absolute left-5 -top-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadUserCount}
                </span>
              )}
            </Link>



            <button
              onClick={() => {
                setShowCreate(!showCreate);
                setShowMore(false);
                setShowSearch(false);
              }}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full relative"
            >
              <HiOutlinePlusCircle className="text-2xl" /> {isOpen && !showSearch && "Create"}
            </button>

            <Link
              to={`/profile/${localStorage.getItem("username")}`}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full"
            >
              <HiOutlineUserCircle className="text-2xl" /> {isOpen && !showSearch && "Profile"}
            </Link>


            {/* Switch Appearance */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full"
            >
              <HiOutlineMoon className="text-2xl" /> {isOpen && !showSearch && "Switch Appearance"}
            </button>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-2 rounded w-full text-red-500"
            >
              <HiOutlineArrowRightOnRectangle className="text-2xl" /> {isOpen && !showSearch && "Log Out"}
            </button>
          </nav>

          {showCreate && isOpen && (
            <div className="absolute top-40 left-4 w-40 bg-white dark:bg-neutral-900 border dark:border-gray-800 shadow-lg rounded p-2 z-50">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  document.getElementById("sidebarFileInput").click();
                  setShowCreate(false);
                }}
              >
                Post
              </button>
            </div>
          )}
          <input
    id="sidebarFileInput"
    type="file"
    accept="image/*,video/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setShowCreateModal(true);
      }
    }}
  />
  {showCreateModal && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md flex flex-col gap-4">
        <p>Write a caption:</p>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={async () => {
            if (!selectedFile) return;
            setUploading(true);
            const formData = new FormData();
            formData.append("username", localStorage.getItem("username"));
            formData.append("file", selectedFile);
            formData.append("caption", caption);
            try {
              await axios.post("http://localhost:5000/api/posts/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              setSelectedFile(null);
              setCaption("");
              setShowCreateModal(false);
              setUploading(false);
              window.location.reload();
            } catch (err) {
              setUploading(false);
              alert("Failed to upload post");
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={uploading}
        >
          {uploading ? "Posting..." : "Post"}
        </button>
        <button
          onClick={() => {
            setSelectedFile(null);
            setCaption("");
            setShowCreateModal(false);
          }}
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded"
          disabled={uploading}
        >
          Cancel
        </button>
      </div>
    </div>
  )}





        </div>
      </aside>

      {/* Bottom nav for mobile/tablet (<= 750px) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-between items-center bg-white dark:bg-black border-t dark:border-gray-800 px-2 py-1 z-50 tablet:hidden">
        <Link to="/home" className="flex-1 flex flex-col items-center justify-center py-2">
          <HiOutlineHome className="text-2xl" />
        </Link>
        <Link to="/explore" className="flex-1 flex flex-col items-center justify-center py-2">
          <HiOutlineGlobeAlt className="text-2xl" />
        </Link>
        <Link to="/reels" className="flex-1 flex flex-col items-center justify-center py-2">
          <BsCameraReels className="text-2xl" />
        </Link>
        {/* Suggested icon for mobile only */}
        <Link to="/suggested" className="flex-1 flex flex-col items-center justify-center py-2">
          <HiOutlineUserPlus className="text-2xl" />
        </Link>
        <Link to="/messages" className="flex-1 flex flex-col items-center justify-center py-2 relative">
          <HiOutlineChatBubbleLeftRight className="text-2xl" />
          {unreadUserCount > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {unreadUserCount}
            </span>
          )}
        </Link>
        <Link to={`/profile/${localStorage.getItem("username")}`} className="flex-1 flex flex-col items-center justify-center py-2">
          <HiOutlineUserCircle className="text-2xl" />
        </Link>
      </nav>

      {/* Mobile top bar with search and appearance toggle */}
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-black border-b dark:border-gray-800 px-4 py-2 z-50 tablet:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black dark:text-white">Snappix</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <HiOutlineMoon className="text-xl" />
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <HiOutlineMagnifyingGlass className="text-xl" />
            </button>
          </div>
        </div>
      </div>
      {showSearch && isOpen && (
        <div className="fixed top-0 left-20 h-screen w-[397px] bg-white dark:bg-neutral-900 dark:text-white border-x dark:border-gray-800 rounded-r-2xl shadow-lg z-40 p-4 flex flex-col transition-all duration-300">
          <h2 className="text-2xl font-bold mt-4 mb-6 px-2">Search</h2>
          <div className="relative mb-6 px-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full bg-gray-100 dark:bg-neutral-800 dark:text-white p-2 pr-8 rounded-lg"
            />
            <span
              className="absolute right-4 top-2.5 text-gray-500"
            >
              <HiOutlineMagnifyingGlass />
            </span>
          </div>
          <div className="flex-grow overflow-y-auto border-t dark:border-gray-800">
            {/* Live Search Results */}
            {searchTerm.trim() && searchResults.length > 0 && (
              <>
                <h4 className="font-semibold pt-6 pb-2 px-2">Search Results</h4>
                <ul className="text-sm mb-2">
                  {searchResults.map((user) => (
                    <li key={user._id}>
                      <Link
                        to={`/profile/${user.username}`}
                        onClick={() => {
                          const updatedRecents = [
                            user,
                            ...recents.filter((r) => r.username !== user.username),
                          ].slice(0, 5);
                          setRecents(updatedRecents);
                          localStorage.setItem("recents", JSON.stringify(updatedRecents));
                          setSearchResults([]);
                          setSearchTerm("");
                          setShowSearch(false);
                        }}
                        className="block py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.profilePic
                                ? `http://localhost:5000${user.profilePic}`
                                : `https://ui-avatars.com/api/?name=${user.username}&background=random`
                            }
                            alt={user.username}
                            className="w-11 h-11 rounded-full"
                          />
                          <span className="font-semibold">{user.username}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Recent Searches */}
            {recents.length > 0 && (
              <>
                <div className="flex justify-between items-center pt-6 pb-2 px-2">
                  <h4 className="font-semibold">Recent</h4>
                  {recents.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-sm text-blue-500 font-semibold hover:text-gray-900 dark:hover:text-white"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <ul className="text-sm">
                  {recents.map((item, index) => (
                    <li
                      key={index}
                      className="py-2 px-2 flex justify-between items-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Link
                        to={`/profile/${item.username}`}
                        onClick={() => setShowSearch(false)}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={
                            item.profilePic
                              ? `http://localhost:5000${item.profilePic}`
                              : `https://ui-avatars.com/api/?name=${item.username}&background=random`
                          }
                          alt={item.username}
                          className="w-11 h-11 rounded-full"
                        />
                        <span className="font-semibold">{item.username}</span>
                      </Link>
                      <button
                        onClick={() => removeRecent(item.username)}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <HiOutlineXMark />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {searchResults.length === 0 && recents.length === 0 && (
              <p className="text-sm text-gray-400 px-2 pt-6">No recent searches.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
