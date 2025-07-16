import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import SearchBox from "./SearchBox";
import axios from "axios";
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiFilm,
  FiMessageCircle,
  FiBell,
  FiUser,
  FiMoreHorizontal,
  FiSettings,
  FiClock,
  FiBookmark,
  FiSun,
  FiMoon,
  FiLogOut,
  FiEdit3,
  FiAlertCircle,
  FiMenu,
  FiX,
} from "react-icons/fi";
import ReportModal from "./ReportModal";

export default function Sidebar({ isOpen, setIsOpen }) {
  const [foundUser, setFoundUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();
  const [recents, setRecents] = useState(() => {
    const stored = localStorage.getItem("recents");
    return stored ? JSON.parse(stored) : [];
  });

const handleSearch = async () => {
  if (!searchTerm.trim()) return;

  try {
    const res = await axios.get(`http://localhost:5000/api/users?username=${searchTerm}`);
    setSearchResults(res.data);

    // ✅ Add to recents and persist it
    const updated = [searchTerm.trim(), ...recents.filter(r => r !== searchTerm.trim())].slice(0, 5);
    setRecents(updated);
    localStorage.setItem("recents", JSON.stringify(updated));

  } catch (err) {
    console.error(err);
    setSearchResults([]);
  }
};


 const clearAll = () => {
  setRecents([]);
  localStorage.removeItem("recents");
};

const removeRecent = (index) => {
  const updated = [...recents];
  updated.splice(index, 1);
  setRecents(updated);
  localStorage.setItem("recents", JSON.stringify(updated));
};


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleLogout = () => {
    alert("Logged out!");
    navigate("/");
  };

  return (
    <aside
      className={`flex flex-col justify-between h-screen
        ${isOpen ? "w-64 relative md:fixed" : "w-20 absolute md:fixed"}
        p-4 border-r bg-white z-50 transition-all duration-300`}
    >
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-10 px-2">
          <h1 className={`text-3xl font-normal font-logo ${!isOpen && "hidden"}`}>
            Instagram
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xl p-2 hover:bg-gray-100 rounded"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className={`flex flex-col gap-4 ${isOpen ? "items-start" : "items-center"}`}>

          <Link
            to="/"
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded w-full"
          >
            <FiHome /> {isOpen && "Home"}
          </Link>

          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setShowMore(false);
              setShowCreate(false);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 text-left px-2 py-2 rounded w-full"
          >
            <FiSearch /> {isOpen && "Search"}
          </button>

          <Link
            to="/explore"
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded w-full"
          >
            <FiCompass /> {isOpen && "Explore"}
          </Link>

          <Link
            to="/reels"
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded w-full"
          >
            <FiFilm /> {isOpen && "Reels"}
          </Link>

          <Link
            to="/messages"
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded w-full"
          >
            <FiMessageCircle /> {isOpen && "Messages"}
          </Link>

          <Link
            to="/notifications"
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded w-full"
          >
            <FiBell /> {isOpen && "Notifications"}
          </Link>

          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowMore(false);
              setShowSearch(false);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 text-left px-2 py-2 rounded w-full"
          >
            <FiEdit3 /> {isOpen && "Create"}
          </button>

          <Link
            to={`/profile/${localStorage.getItem("username")}`}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-2 rounded w-full"
          >
            <FiUser /> {isOpen && "Profile"}
          </Link>


          <button
            onClick={() => {
              setShowMore(!showMore);
              setShowCreate(false);
              setShowSearch(false);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 text-left px-2 py-2 rounded w-full"
          >
            <FiMoreHorizontal /> {isOpen && "More"}
          </button>
        </nav>

        {showSearch && isOpen && (
  <div className="absolute top-20 left-4 w-56 bg-white border shadow-lg rounded p-4 z-50">
    <div className="relative">
      <input
         type="text"
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        placeholder="Search username..."
        className="w-full border p-2 pr-8 rounded mb-2"
      />
<button
  onClick={handleSearch}
  className="absolute right-2 top-2 text-gray-500"
>
  <FiSearch />
</button>




    </div>
    <div className="flex justify-between items-center mb-1">
      <h4 className="text-sm font-semibold text-gray-500">Recent</h4>
      {recents.length > 0 && (
        <button
          onClick={clearAll}
          className="text-xs text-blue-500 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>

    {/* ✅ Show search results if there are any */}
{searchResults.length > 0 && (
  <ul className="text-sm mb-2 border-t pt-2">
    {searchResults.map((user) => (
      <li key={user._id}>
        <Link
          to={`/profile/${user.username}`} // ✅ Dynamic profile route
          onClick={() => {
            setRecents([user.username, ...recents.filter((r) => r !== user.username)].slice(0, 5));
            setSearchResults([]);
            setSearchTerm("");
            setShowSearch(false);
          }}
          className="block py-1 hover:bg-gray-100 px-2 rounded"
        >
          {user.username}
        </Link>
      </li>
    ))}
  </ul>
)}



    {/* ✅ If no results and no recents */}
    {searchResults.length === 0 && recents.length === 0 && (
      <p className="text-sm text-gray-400">No recent searches.</p>
    )}

    {/* ✅ Show recents if no results */}
    {recents.length > 0 && searchResults.length === 0 && (
      <ul className="text-sm">
        {recents.map((item, index) => (
          <li
            key={index}
            className="py-1 flex justify-between items-center border-b"
          >
            <Link
              to={`/profile/${item}`}
              onClick={() => setShowSearch(false)}
              className="hover:underline"
            >
              {item}
            </Link>
            <button
              onClick={() => removeRecent(index)}
              className="text-gray-400 hover:text-red-500"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)}



        {showCreate && isOpen && (
          <div className="absolute top-40 left-4 w-40 bg-white border shadow-lg rounded p-2 z-50">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Post
            </button>
          </div>
        )}

        {showMore && isOpen && (
          <div className="absolute top-40 left-4 w-56 bg-white border shadow-lg rounded p-2 z-50">
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <FiSettings /> Settings
            </Link>
            <Link
              to="/activity"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <FiClock /> Your Activity
            </Link>
            <Link
              to="/saved"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <FiBookmark /> Saved
            </Link>
            <button
              onClick={() => setShowAppearance(!showAppearance)}
              className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {darkMode ? <FiSun /> : <FiMoon />} Switch Appearance
            </button>
            {showAppearance && (
              <div className="pl-8 py-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  Dark Mode
                </label>
              </div>
            )}
            <Link
              onClick={(e) => {
                e.preventDefault();
                setIsReportOpen(true);
              }}
              to="#"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <FiAlertCircle /> Report a Problem
            </Link>

            <ReportModal
              isOpen={isReportOpen}
              onClose={() => setIsReportOpen(false)}
            />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              <FiLogOut /> Log Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
