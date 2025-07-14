import { useState } from "react";
import Profile from "../assets/profiles/profile.jpg";

export default function Suggested() {
  // Dummy suggestions
  const suggestions = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    username: `user_${i + 1}`,
    profile: Profile,
  }));

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Suggested for you</h1>

      <div className="space-y-4">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={s.profile}
                alt={s.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{s.username}</span>
                <span className="text-xs text-gray-500">Suggested for you</span>
              </div>
            </div>

            <button
              className="text-xs text-blue-500 font-semibold hover:underline"
              onClick={() => alert(`Followed ${s.username}`)}
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
