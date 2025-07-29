import { useState } from "react";
import {
  FiHeart,
  FiX,
  FiUser,
  FiLock,
  FiMail,
  FiCalendar,
} from "react-icons/fi";
import { IoMdPhotos, IoMdTime, IoMdCreate } from "react-icons/io";

export default function YourActivity() {
  const [activeSection, setActiveSection] = useState("Interactions");
  const [activeSubTab, setActiveSubTab] = useState("Likes");
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [language, setLanguage] = useState("English");

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setShowLangs(false);
  };

  const renderMainContent = () => {
    if (activeSection === "Interactions") {
      return (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-6 mb-4">
            {["Likes", "Comments", "Story Replies", "Reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-sm ${
                  activeSubTab === tab
                    ? "border-b-2 border-black font-semibold"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort & Filter + Select */}
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setShowSortFilter(true)}
              className="px-4 py-1 border rounded text-sm hover:bg-gray-50"
            >
              Sort & Filter
            </button>
            <button
              onClick={() => setSelectMode(!selectMode)}
              className="text-blue-500 text-sm font-semibold"
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className={`aspect-square bg-gray-300 rounded relative ${
                  selectMode ? "cursor-pointer" : ""
                }`}
              >
                {selectMode && (
                  <input
                    type="checkbox"
                    className="absolute top-2 left-2 w-4 h-4"
                  />
                )}
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeSection === "Photos & Videos") {
      return (
        <>
          <div className="flex gap-6 mb-4">
            {["Posts", "Reels", "Highlights"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-sm ${
                  activeSubTab === tab
                    ? "border-b-2 border-black font-semibold"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Just static grid for now */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square bg-gray-300 rounded"
              ></div>
            ))}
          </div>
        </>
      );
    }

    if (activeSection === "Account History") {
      return (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-center mb-2">
            About Account History
          </h2>
          <p className="text-center text-gray-500 mb-4">
            Review changes you&apos;ve made to your account since you created it.
          </p>
          <hr className="mb-4" />
          <h3 className="text-sm font-semibold mb-2">This year</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 items-start">
              <FiUser className="mt-1" />
              <div>
                <p className="font-semibold">Username</p>
                <p className="text-sm">You changed your username to <strong>xxx</strong>.</p>
                <p className="text-xs text-gray-400">8w</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <IoMdCreate className="mt-1" />
              <div>
                <p className="font-semibold">Bio</p>
                <p className="text-sm">
                  You changed your bio to &apos;til death, we do art.
                </p>
                <p className="text-xs text-gray-400">9w</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <FiUser className="mt-1" />
              <div>
                <p className="font-semibold">Name</p>
                <p className="text-sm">You changed your name to yyy.</p>
                <p className="text-xs text-gray-400">10w</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <FiLock className="mt-1" />
              <div>
                <p className="font-semibold">Privacy</p>
                <p className="text-sm">You made your account private.</p>
                <p className="text-xs text-gray-400">10w</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <FiMail className="mt-1" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm">
                  You changed your email address to notrhys7s@gmail.com
                </p>
                <p className="text-xs text-gray-400">10w</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <FiCalendar className="mt-1" />
              <div>
                <p className="font-semibold">Account Created</p>
                <p className="text-sm">
                  You created your account on April 25, 2025.
                </p>
                <p className="text-xs text-gray-400">10w</p>
              </div>
            </li>
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r p-6">
          <h2 className="text-lg font-bold mb-6">Your activity</h2>
          <ul className="space-y-4">
            <li
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => {
                setActiveSection("Interactions");
                setActiveSubTab("Likes");
              }}
            >
              <FiHeart className="text-lg" />
              <div>
                <p className="font-semibold">Interactions</p>
                <p className="text-xs text-gray-500">
                  Likes, comments, and more.
                </p>
              </div>
            </li>
            <li
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => {
                setActiveSection("Photos & Videos");
                setActiveSubTab("Posts");
              }}
            >
              <IoMdPhotos className="text-lg" />
              <div>
                <p className="font-semibold">Photos & Videos</p>
                <p className="text-xs text-gray-500">
                  Posts, reels, highlights.
                </p>
              </div>
            </li>
            <li
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => setActiveSection("Account History")}
            >
              <IoMdTime className="text-lg" />
              <div>
                <p className="font-semibold">Account History</p>
                <p className="text-xs text-gray-500">
                  Review changes you&apos;ve made.
                </p>
              </div>
            </li>
          </ul>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">{renderMainContent()}</main>
      </div>

      {/* Footer */}
      <footer className="text-sm text-gray-500 text-center space-y-2 mb-4">
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Meta",
            "About",
            "Blog",
            "Jobs",
            "Help",
            "API",
            "Privacy",
            "Terms",
            "Locations",
            "Threads",
            "Contact Uploading & Non-Users",
            "Meta Verified",
          ].map((item) => (
            <button
              key={item}
              className="hover:underline"
              onClick={() => alert(`Clicked ${item}`)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-2 relative inline-block">
          <button
            onClick={() => setShowLangs(!showLangs)}
            className="hover:underline"
          >
            {language}
          </button>
          {showLangs && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white border rounded shadow-lg z-10 w-40">
              {["English", "Hindi", "Tamil", "Telugu", "Kannada"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangChange(lang)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
          <span className="mx-2">•</span>
          <span>© 2025 Instagram</span>
        </div>
      </footer>

      {/* Sort & Filter Modal */}
      {showSortFilter && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
            <h2 className="text-lg font-semibold text-center mb-4">
              Sort & Filter
            </h2>
            <button
              onClick={() => setShowSortFilter(false)}
              className="absolute top-4 left-4 text-gray-500 hover:text-black text-xl"
            >
              <FiX />
            </button>
            <button
              onClick={() => alert("Reset clicked")}
              className="absolute top-4 right-4 text-blue-500 text-sm font-semibold"
            >
              Reset
            </button>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-1">Sort by</p>
                <button className="block w-full text-left px-4 py-2 border rounded mb-2">
                  Newest to Oldest
                </button>
                <button className="block w-full text-left px-4 py-2 border rounded">
                  Oldest to Newest
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Start Date</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="MM"
                    className="border p-2 w-1/3"
                  />
                  <input
                    type="text"
                    placeholder="DD"
                    className="border p-2 w-1/3"
                  />
                  <input
                    type="text"
                    placeholder="YYYY"
                    className="border p-2 w-1/3"
                  />
                </div>
                <p className="text-sm font-semibold mb-1">End Date</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM"
                    className="border p-2 w-1/3"
                  />
                  <input
                    type="text"
                    placeholder="DD"
                    className="border p-2 w-1/3"
                  />
                  <input
                    type="text"
                    placeholder="YYYY"
                    className="border p-2 w-1/3"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSortFilter(false)}
              className="block mx-auto mt-6 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
