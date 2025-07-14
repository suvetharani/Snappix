import profilePic from "../assets/profiles/profile.jpg";

export default function Notifications() {
  // Example notifications grouped by category
  const notifications = {
    New: [
      { id: 1, user: "emma_watson", action: "liked your photo", time: "1m" },
      { id: 2, user: "alex_dev", action: "started following you", time: "5m" },
    ],
    Today: [
      { id: 3, user: "mike_jordan", action: "commented: Nice!", time: "2h" },
    ],
    Yesterday: [
      { id: 4, user: "ron_weasley", action: "mentioned you in a comment", time: "1d" },
    ],
    "This Week": [
      { id: 5, user: "lily_potter", action: "liked your reel", time: "3d" },
    ],
    "This Month": [
      { id: 6, user: "hermione_g", action: "sent you a message", time: "1w" },
    ],
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      {Object.entries(notifications).map(([section, items]) => (
        <div key={section} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">{section}</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={profilePic}
                    alt={item.user}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{item.user}</span>{" "}
                      {item.action}
                    </p>
                    <p className="text-xs text-gray-500">{item.time} ago</p>
                  </div>
                </div>
                {/* Example Follow button for new followers */}
                {item.action.includes("started following") && (
                  <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded">
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
