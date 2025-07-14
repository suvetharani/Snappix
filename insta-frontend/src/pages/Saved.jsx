import { useState } from "react";

export default function Saved() {
  const [activeTab, setActiveTab] = useState("posts");
  const [showLangs, setShowLangs] = useState(false);
  const [language, setLanguage] = useState("English");

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setShowLangs(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          Only you can see what you’ve saved
        </h1>
        <button className="text-blue-500 font-semibold hover:underline">
          + New Collection
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-2 ${
            activeTab === "posts"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`py-2 ${
            activeTab === "audio"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Audio
        </button>
      </div>

      {/* Content */}
      {activeTab === "posts" ? (
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-200 aspect-square"></div>
          <div className="bg-gray-300 aspect-square"></div>
          <div className="bg-gray-400 aspect-square"></div>
        </div>
      ) : (
        <div className="mb-12">
          <div className="bg-gray-200 p-8 text-center rounded">
            Saved Audio
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-sm text-gray-500 text-center space-y-2">
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
            "Contact Uploading & Non-Users",
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

        {/* Language & Copyright */}
        <div className="mt-4 relative inline-block">
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
    </div>
  );
}
