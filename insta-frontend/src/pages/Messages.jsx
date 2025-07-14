import { useState } from "react";
import { FiSearch, FiPhone, FiVideo, FiInfo, FiX, FiMic } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react"; // npm i emoji-picker-react
import emma from "../assets/profiles/profile4.jpg";
import john from "../assets/profiles/profile1.jpg";

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [mute, setMute] = useState(false);

  const chats = [
    {
      id: 1,
      name: "john_doe",
      dp: john,
      messages: [
        { from: "them", text: "Hey there!" },
        { from: "me", text: "Hello! How are you?" },
      ],
    },
    {
      id: 2,
      name: "emma_watson",
      dp: emma,
      messages: [
        { from: "them", text: "Hi, let’s meet up!" },
        { from: "me", text: "Sure! When?" },
      ],
    },
  ];

  const selectChat = (chat) => {
    setSelectedChat(chat);
    setShowDetails(false);
  };

  const sendMessage = () => {
    if (message.trim()) {
      selectedChat.messages.push({ from: "me", text: message });
      setMessage("");
      setShowEmoji(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <aside className="w-1/3 border-r flex flex-col">
        <div className="p-4 font-bold text-xl">your_id</div>

        {/* Better Search */}
        <div className="px-4 mb-6">
          <div className="flex items-center bg-gray-100 border rounded-full px-4 py-2 shadow-sm">
            <FiSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="px-4 mb-2 overflow-y-auto">
          <h4 className="font-semibold mb-2">Messages</h4>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-100 rounded px-2"
              onClick={() => selectChat(chat)}
            >
              <img
                src={chat.dp}
                alt={chat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>{chat.name}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right Chat Section */}
      <div className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <>
            {/* Top bar */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <img
                  src={selectedChat.dp}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{selectedChat.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xl">
                <FiPhone className="cursor-pointer" />
                <FiVideo className="cursor-pointer" />
                <FiInfo
                  className="cursor-pointer"
                  onClick={() => setShowDetails(!showDetails)}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedChat.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 max-w-xs ${
                    msg.from === "me" ? "ml-auto text-right" : ""
                  }`}
                >
                  <p
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.from === "me"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center border-t p-4 relative">
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
                className="flex-1 border rounded px-2 py-1 mr-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="text-2xl text-gray-600">
                <FiMic />
              </button>
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
              >
                Send
              </button>
            </div>

            {/* Details Panel */}
            {showDetails && (
              <div className="absolute right-0 top-0 w-64 h-full bg-white border-l shadow p-4 z-50">
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
                      onChange={() => setMute(!mute)}
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
                <button className="w-full text-left py-2 hover:bg-gray-100 text-red-500">
                  Report
                </button>
                <button className="w-full text-left py-2 hover:bg-gray-100 text-red-500">
                  Block
                </button>
                <button className="w-full text-left py-2 hover:bg-gray-100 text-red-500">
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
    </div>
  );
}
