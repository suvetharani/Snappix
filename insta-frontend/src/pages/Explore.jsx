import React from "react";
import { FaHeart, FaRegComment } from "react-icons/fa";

// Example images — replace with your own
import post1 from "../assets/profiles/profile1.jpg";
import post2 from "../assets/profiles/profile.jpg";
import post3 from "../assets/profiles/profile2.jpg";
import post4 from "../assets/profiles/profile3.jpg";
import post5 from "../assets/profiles/profile4.jpg";
import post6 from "../assets/profiles/profile5.jpg";


export default function Explore() {
  const posts = [
    { id: 1, image: post1, type: "post", likes: 123, comments: 12 },
    { id: 2, image: post2, type: "reel", likes: 87, comments: 4 },
    { id: 3, image: post3, type: "post", likes: 156, comments: 22 },
    { id: 4, image: post4, type: "post", likes: 94, comments: 5 },
    { id: 5, image: post5, type: "reel", likes: 231, comments: 19 },
    { id: 6, image: post6, type: "post", likes: 68, comments: 2 },

  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      <div className="grid grid-cols-3 gap-1 md:gap-2 lg:gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative group w-full aspect-square overflow-hidden cursor-pointer"
          >
            <img
              src={post.image}
              alt={`Explore ${post.type}`}
              className="w-full h-full object-cover"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold space-x-4 transition">
              <div className="flex items-center gap-1">
                <FaHeart className="text-lg" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaRegComment className="text-lg" />
                <span>{post.comments}</span>
              </div>
            </div>

            {/* Reel tag */}
            {post.type === "reel" && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                Reel
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
