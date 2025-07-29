import { useState, useEffect, useRef, useContext } from "react";
import { FiInfo, FiX, FiBellOff } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import { io } from "socket.io-client";
import { UnreadContext } from "../context/UnreadContext";

const SOCKET_URL = "http://localhost:5000";

export default function Messages() {
  // Update initial state
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth <= 500);
  const [isTinyScreen, setIsTinyScreen] = useState(() => window.innerWidth <= 500);

  // Update useEffect for resize
  useEffect(() => {
    const handleResize = () => {
      setIsTinyScreen(window.innerWidth <= 500);
      if (window.innerWidth > 500) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [mute, setMute] = useState(false);
  const [following, setFollowing] = useState([]);
  const [myUsername, setMyUsername] = useState("");
  const [unreadMap, setUnreadMap] = useState({});
  const [mutedUsers, setMutedUsers] = useState(() => {
    const stored = localStorage.getItem("mutedUsers");
    return stored ? JSON.parse(stored) : [];
  });
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { setUnreadUserCount } = useContext(UnreadContext);
  const [acceptedCollabs, setAcceptedCollabs] = useState([]); // array of postIds

  // Update mute state when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      setMute(mutedUsers.includes(selectedChat.name));
    }
  }, [selectedChat, mutedUsers]);

  // Update unread user count, excluding muted users
  useEffect(() => {
    const count = Object.entries(unreadMap)
      .filter(([username, val]) => val && !mutedUsers.includes(username)).length;
    setUnreadUserCount(count);
  }, [unreadMap, setUnreadUserCount, mutedUsers]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    setMyUsername(username);
    if (username) {
      axios.get(`http://localhost:5000/api/profile/${username}`)
        .then(res => {
          setFollowing(res.data.following || []);
        })
        .catch(() => setFollowing([]));
    }
    // Setup socket.io connection
    socketRef.current = io(SOCKET_URL);
    if (username) {
      socketRef.current.emit("register", username);
    }
    // Listen for incoming messages
    socketRef.current.on("receive_message", (data) => {
      // Only update if the message is for the currently selected chat
      if (selectedChat && data.sender === selectedChat.name) {
        setSelectedChat(prevChat => ({
          ...prevChat,
          messages: [...prevChat.messages, data],
        }));
      }
      // Mark as unread in the sidebar (unless muted)
      if (data.receiver === username && !mutedUsers.includes(data.sender)) {
        setUnreadMap(prev => ({ ...prev, [data.sender]: true }));
      }
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [myUsername, selectedChat, mutedUsers]);

  // Check unread status for all followings
  useEffect(() => {
    if (!myUsername) return;
    const fetchUnread = async () => {
      const map = {};
      for (const user of following) {
        try {
          const res = await axios.get(`http://localhost:5000/api/messages/${myUsername}/${user.username}`);
          const hasUnread = (res.data.messages || []).some(msg => (msg.unreadBy || []).includes(myUsername));
          map[user.username] = hasUnread;
        } catch {}
      }
      setUnreadMap(map);
    };
    fetchUnread();
    // eslint-disable-next-line
  }, [following, myUsername]);

  // After selectedChat.messages changes, scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [selectedChat && selectedChat.messages && selectedChat.messages.length]);

  // Update selectChat
  const selectChat = async (user) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${myUsername}/${user.username}`);
      setSelectedChat({
        name: user.username,
        dp: user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://ui-avatars.com/api/?name=" + user.username,
        messages: res.data.messages || [],
      });
      // Mark all as read
      await axios.post('http://localhost:5000/api/messages/mark-read', {
        user1: myUsername,
        user2: user.username,
      });
      setUnreadMap(prev => ({ ...prev, [user.username]: false }));
    } catch (err) {
      setSelectedChat({
        name: user.username,
        dp: user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://ui-avatars.com/api/?name=" + user.username,
        messages: [],
      });
    }
    setShowDetails(false);
    if (window.innerWidth <= 500) setShowSidebar(false);
  };

  // Toggle mute for the selected chat
  const handleMuteToggle = () => {
    if (!selectedChat) return;
    let updated;
    if (mute) {
      updated = mutedUsers.filter(u => u !== selectedChat.name);
    } else {
      updated = [...mutedUsers, selectedChat.name];
    }
    setMutedUsers(updated);
    localStorage.setItem("mutedUsers", JSON.stringify(updated));
    setMute(!mute);
  };

  const sendMessage = async () => {
    if (message.trim() && selectedChat) {
      try {
        const newMessage = {
          sender: myUsername,
          receiver: selectedChat.name,
          text: message.trim(),
        };
        await axios.post('http://localhost:5000/api/messages/send', newMessage);
        setSelectedChat(prevChat => ({
          ...prevChat,
          messages: [...prevChat.messages, { ...newMessage, from: 'me' }],
        }));
        // Emit real-time event
        if (socketRef.current) {
          socketRef.current.emit("send_message", newMessage);
        }
        setMessage('');
      setShowEmoji(false);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  // Delete chat for current user
  const handleDeleteChat = async () => {
    if (!selectedChat) return;
    try {
      await axios.post('http://localhost:5000/api/messages/delete-chat', {
        user1: myUsername,
        user2: selectedChat.name,
      });
      setSelectedChat(null);
      setUnreadMap(prev => ({ ...prev, [selectedChat.name]: false }));
      setFollowing(following.filter(u => u.username !== selectedChat.name ? true : true)); // Optionally, you can filter out the chat from the sidebar if you want
    } catch (err) {
      alert('Failed to delete chat');
    }
  };

  const handleAcceptCollab = async (msg) => {
    try {
      await axios.post('http://localhost:5000/api/posts/add-collaborator', {
        postId: msg.postId,
        username: myUsername
      });
      setAcceptedCollabs(prev => [...prev, msg.postId]);
      // Optionally, show a confirmation
    } catch (err) {
      alert('Failed to accept collaboration');
    }
  };

  // Determine if mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 500;

  return (
    isMobile ? (
      <div
        style={{
          maxWidth: '430px',
          margin: '4vh auto 2vh auto',
          width: '100vw',
          overflow: 'hidden',
          height: '91vh',
          maxHeight: '91vh',
          background: 'inherit',
        }}
      >
        <div className="flex h-full bg-white dark:bg-black dark:text-white transition-colors duration-300 w-full min-w-0">
          {/* Left Sidebar (show only if no chat selected on tiny screens) */}
          {(!isTinyScreen || (isTinyScreen && showSidebar)) && (
            <aside className="w-1/3 border-r flex flex-col bg-white dark:bg-neutral-900 dark:border-gray-800 dark:text-white min-w-[120px] max-w-[300px] flex-shrink-0">
            <div className="p-4 font-bold text-xl">{myUsername || "your_id"}</div>
            {/* Messages List from Following */}
            <div className="px-4 mb-2 overflow-y-auto">
              <h4 className="font-semibold mb-2">Messages</h4>
              {following.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-2"
                  onClick={() => selectChat(user)}
                >
                  <img
                    src={user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://ui-avatars.com/api/?name=" + user.username}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{user.username}</span>
                  {unreadMap[user.username] && !mutedUsers.includes(user.username) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-1"></span>
                  )}
                  {mutedUsers.includes(user.username) && (
                    <FiBellOff className="text-gray-400 ml-auto" title="Muted" />
                  )}
                </div>
              ))}
            </div>
          </aside>
          )}

          {/* Right Chat Section (show only if chat selected on tiny screens) */}
          {(!isTinyScreen || (isTinyScreen && !showSidebar)) && (
            <div className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-black dark:text-white">
              {isTinyScreen && (
                <button className="absolute top-2 left-2 z-50 bg-gray-200 dark:bg-neutral-800 rounded-full p-2" onClick={() => { setShowSidebar(true); setSelectedChat(null); }}>
                  &larr;
                </button>
              )}
            {selectedChat ? (
              <>
                {/* Top bar */}
                  <div className="flex justify-between items-center p-4 border-b dark:border-gray-800 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={selectedChat.dp}
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span
                        className="font-semibold cursor-pointer hover:underline truncate"
                      onClick={() => window.location.href = `/profile/${selectedChat.name}`}
                    >
                      {selectedChat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xl">
                    <FiInfo
                      className="cursor-pointer"
                      onClick={() => setShowDetails(!showDetails)}
                    />
                  </div>
                </div>

                {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto min-w-0 tablet:pb-0 pb-20" ref={messagesEndRef}>
                  {selectedChat.messages.map((msg, i) => (
                    (msg.type === 'collab_invite' || msg.type === 'shared_post') ? (
                      <div
                        key={i}
                        className={`mb-4 max-w-xs bg-blue-50 dark:bg-neutral-800 rounded-lg shadow p-0 flex flex-col ${msg.sender === myUsername ? 'ml-auto text-right' : ''}`}
                      >
                        <div className="w-full px-4 pt-3 pb-2 text-left">
                          <span
                            className="font-semibold text-blue-700 dark:text-blue-300 cursor-pointer hover:underline"
                            onClick={() => window.location.href = `/profile/${msg.sender}`}
                          >
                            {msg.sender}
                          </span>
                        </div>
                        {msg.fileUrl && (msg.fileUrl.endsWith('.mp4') || msg.fileUrl.endsWith('.webm') || msg.fileUrl.endsWith('.ogg')) ? (
                          <video src={`http://localhost:5000${msg.fileUrl}`} controls className="w-full h-64 object-cover rounded-b-none" />
                        ) : msg.fileUrl ? (
                          <img src={`http://localhost:5000${msg.fileUrl}`} alt="collab post" className="w-full h-64 object-cover rounded-b-none" />
                        ) : null}
                        {msg.caption && <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{msg.caption}</div>}
                        {/* Only show accept button for actual collaboration invites */}
                        {msg.type === 'collab_invite' && myUsername === msg.receiver && msg.sender !== myUsername && (
                          <button
                            className="m-4 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={() => handleAcceptCollab(msg)}
                            disabled={acceptedCollabs.includes(msg.postId)}
                          >
                            {acceptedCollabs.includes(msg.postId) ? 'Accepted' : 'Accept'}
                          </button>
                        )}
                      </div>
                    ) : (
                    <div
                      key={i}
                      className={`mb-2 max-w-xs ${
                        msg.sender === myUsername ? "ml-auto text-right" : ""
                      }`}
                    >
                      <p
                        className={`inline-block px-4 py-2 rounded-lg ${
                          msg.sender === myUsername
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-neutral-800 dark:text-white text-black"
                        }`}
                      >
                        {msg.text}
                      </p>
                    </div>
                    )
                  ))}
                </div>

                {/* Input */}
                  <div className="flex items-center border-t p-4 relative dark:border-gray-800 bg-white dark:bg-black tablet:static tablet:bottom-auto fixed bottom-0 left-0 right-0 z-40 tablet:z-auto w-full tablet:w-auto" style={{maxWidth: '100vw'}}>
                  <button
                    className="text-2xl mr-2"
                    onClick={() => setShowEmoji(!showEmoji)}
                  >
                    😊
                  </button>

                  {showEmoji && (
                    <div className="absolute bottom-16 left-4 z-50">
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          setMessage((prev) => prev + emojiData.emoji)
                        }
                      />
                    </div>
                  )}

                  <textarea
                    rows={1}
                    placeholder="Type a message..."
                      className="flex-1 border rounded px-2 py-1 mr-2 bg-white dark:bg-neutral-900 dark:text-white border-gray-300 dark:border-gray-700 min-w-0"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    onClick={sendMessage}
                    className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
                  >
                    Send
                  </button>
                </div>

                {/* Details Panel */}
                {showDetails && (
                  <div className="absolute right-0 top-0 w-64 h-full bg-white dark:bg-neutral-900 dark:text-white border-l dark:border-gray-800 shadow p-4 z-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Details</h4>
                      <FiX
                        className="cursor-pointer"
                        onClick={() => setShowDetails(false)}
                      />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span>Mute Messages</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mute}
                          onChange={handleMuteToggle}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-5 rounded-full shadow-inner relative transition-colors duration-200 ${
                            mute ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transform duration-200 ${
                              mute ? "translate-x-5" : ""
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                    <button className="w-full text-left py-2 hover:bg-gray-100 text-red-500" onClick={handleDeleteChat}>
                      Delete Chat
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a chat to start messaging
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    ) : (
      <div className="flex h-screen bg-white dark:bg-black dark:text-white transition-colors duration-300 w-full min-w-0">
        {/* Left Sidebar (show only if no chat selected on tiny screens) */}
        {(!isTinyScreen || (isTinyScreen && showSidebar)) && (
          <aside className="w-1/3 border-r flex flex-col bg-white dark:bg-neutral-900 dark:border-gray-800 dark:text-white min-w-[120px] max-w-[300px] flex-shrink-0">
          <div className="p-4 font-bold text-xl">{myUsername || "your_id"}</div>
          {/* Messages List from Following */}
          <div className="px-4 mb-2 overflow-y-auto">
            <h4 className="font-semibold mb-2">Messages</h4>
            {following.map((user, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-2"
                onClick={() => selectChat(user)}
              >
                <img
                  src={user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://ui-avatars.com/api/?name=" + user.username}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span>{user.username}</span>
                {unreadMap[user.username] && !mutedUsers.includes(user.username) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-1"></span>
                )}
                {mutedUsers.includes(user.username) && (
                  <FiBellOff className="text-gray-400 ml-auto" title="Muted" />
                )}
              </div>
            ))}
          </div>
        </aside>
        )}

        {/* Right Chat Section (show only if chat selected on tiny screens) */}
        {(!isTinyScreen || (isTinyScreen && !showSidebar)) && (
          <div className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-black dark:text-white">
            {isTinyScreen && (
              <button className="absolute top-2 left-2 z-50 bg-gray-200 dark:bg-neutral-800 rounded-full p-2" onClick={() => { setShowSidebar(true); setSelectedChat(null); }}>
                &larr;
              </button>
            )}
          {selectedChat ? (
            <>
              {/* Top bar */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-800 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={selectedChat.dp}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                      className="font-semibold cursor-pointer hover:underline truncate"
                    onClick={() => window.location.href = `/profile/${selectedChat.name}`}
                  >
                    {selectedChat.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xl">
                  <FiInfo
                    className="cursor-pointer"
                    onClick={() => setShowDetails(!showDetails)}
                  />
                </div>
              </div>

              {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto min-w-0 tablet:pb-0 pb-20" ref={messagesEndRef}>
                {selectedChat.messages.map((msg, i) => (
                  (msg.type === 'collab_invite' || msg.type === 'shared_post') ? (
                    <div
                      key={i}
                      className={`mb-4 max-w-xs bg-blue-50 dark:bg-neutral-800 rounded-lg shadow p-0 flex flex-col ${msg.sender === myUsername ? 'ml-auto text-right' : ''}`}
                    >
                      <div className="w-full px-4 pt-3 pb-2 text-left">
                        <span
                          className="font-semibold text-blue-700 dark:text-blue-300 cursor-pointer hover:underline"
                          onClick={() => window.location.href = `/profile/${msg.sender}`}
                        >
                          {msg.sender}
                        </span>
                      </div>
                      {msg.fileUrl && (msg.fileUrl.endsWith('.mp4') || msg.fileUrl.endsWith('.webm') || msg.fileUrl.endsWith('.ogg')) ? (
                        <video src={`http://localhost:5000${msg.fileUrl}`} controls className="w-full h-64 object-cover rounded-b-none" />
                      ) : msg.fileUrl ? (
                        <img src={`http://localhost:5000${msg.fileUrl}`} alt="collab post" className="w-full h-64 object-cover rounded-b-none" />
                      ) : null}
                      {msg.caption && <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{msg.caption}</div>}
                      {/* Only show accept button for actual collaboration invites */}
                      {msg.type === 'collab_invite' && myUsername === msg.receiver && msg.sender !== myUsername && (
                        <button
                          className="m-4 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={() => handleAcceptCollab(msg)}
                          disabled={acceptedCollabs.includes(msg.postId)}
                        >
                          {acceptedCollabs.includes(msg.postId) ? 'Accepted' : 'Accept'}
                        </button>
                      )}
                    </div>
                  ) : (
                  <div
                    key={i}
                    className={`mb-2 max-w-xs ${
                      msg.sender === myUsername ? "ml-auto text-right" : ""
                    }`}
                  >
                    <p
                      className={`inline-block px-4 py-2 rounded-lg ${
                        msg.sender === myUsername
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-neutral-800 dark:text-white text-black"
                      }`}
                    >
                      {msg.text}
                    </p>
                  </div>
                  )
                ))}
              </div>

              {/* Input */}
                <div className="flex items-center border-t p-4 relative dark:border-gray-800 bg-white dark:bg-black tablet:static tablet:bottom-auto fixed bottom-0 left-0 right-0 z-40 tablet:z-auto w-full tablet:w-auto" style={{maxWidth: '100vw'}}>
                <button
                  className="text-2xl mr-2"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  😊
                </button>

                {showEmoji && (
                  <div className="absolute bottom-16 left-4 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setMessage((prev) => prev + emojiData.emoji)
                      }
                    />
                  </div>
                )}

                <textarea
                  rows={1}
                  placeholder="Type a message..."
                    className="flex-1 border rounded px-2 py-1 mr-2 bg-white dark:bg-neutral-900 dark:text-white border-gray-300 dark:border-gray-700 min-w-0"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
                >
                  Send
                </button>
              </div>

              {/* Details Panel */}
              {showDetails && (
                <div className="absolute right-0 top-0 w-64 h-full bg-white dark:bg-neutral-900 dark:text-white border-l dark:border-gray-800 shadow p-4 z-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Details</h4>
                    <FiX
                      className="cursor-pointer"
                      onClick={() => setShowDetails(false)}
                    />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span>Mute Messages</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mute}
                        onChange={handleMuteToggle}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full shadow-inner relative transition-colors duration-200 ${
                          mute ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform duration-200 ${
                            mute ? "translate-x-5" : ""
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                  <button className="w-full text-left py-2 hover:bg-gray-100 text-red-500" onClick={handleDeleteChat}>
                    Delete Chat
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
        )}
      </div>
    )
  );
}
