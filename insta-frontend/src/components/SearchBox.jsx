import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

export default function SearchBox({ onClose, recents, addRecent, clearAll, removeRecent, fullscreen }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/search?username=${searchTerm}`
        );
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800">
          <span className="font-logo text-2xl">Search</span>
          <button className="text-3xl" onClick={onClose}>&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search content below (copied from original return) */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search username..."
              className="w-full border p-2 pr-8 rounded mb-2"
            />
            <button className="absolute right-2 top-2 text-gray-500">
              <FiSearch />
            </button>
          </div>
          {results.length > 0 ? (
            <ul className="text-sm mb-2">
              {results.map((user) => (
                <li key={user._id} className="py-1 border-b">
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => {
                      addRecent(user.username);
                      onClose();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    {user.username}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 mb-2">No results.</p>
          )}
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
          {recents.length === 0 ? (
            <p className="text-sm text-gray-400">No recent searches.</p>
          ) : (
            <ul className="text-sm">
              {recents.map((item, index) => (
                <li
                  key={index}
                  className="py-1 flex justify-between items-center border-b"
                >
                  <Link
                    to={`/profile/${item}`}
                    onClick={() => {
                      onClose();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
      </div>
    );
  }
  return (
    <div className="absolute top-20 left-4 w-56 bg-white border shadow-lg rounded p-4 z-50">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search username..."
          className="w-full border p-2 pr-8 rounded mb-2"
        />
        <button className="absolute right-2 top-2 text-gray-500">
          <FiSearch />
        </button>
      </div>

      {results.length > 0 ? (
        <ul className="text-sm mb-2">
          {results.map((user) => (
            <li key={user._id} className="py-1 border-b">
              <Link
                to={`/profile/${user.username}`}
                onClick={() => {
                  addRecent(user.username);
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block hover:bg-gray-100 px-2 py-1 rounded"
              >
                {user.username}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 mb-2">No results.</p>
      )}

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
      {recents.length === 0 ? (
        <p className="text-sm text-gray-400">No recent searches.</p>
      ) : (
        <ul className="text-sm">
          {recents.map((item, index) => (
            <li
              key={index}
              className="py-1 flex justify-between items-center border-b"
            >
              <Link
                to={`/profile/${item}`}
                onClick={() => {
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
  );
}
