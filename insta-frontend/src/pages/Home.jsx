import { Link } from "react-router-dom";
import Stories from "../components/Stories";
import Post from "../components/Post";

// Import your profile images and post images here:
import Profile1 from "../assets/profiles/profile1.jpg";
import Profile2 from "../assets/profiles/profile2.jpg";
import Profile from "../assets/profiles/profile.jpg";
import post1 from "../assets/post1.jpg";
import post2 from "../assets/post2.jpg";

export default function Home() {
  const posts = [
    {
      id: 1,
      username: "john_doe",
      profile: Profile1,
      image: post1,
      caption: "Coffee time ☕️✨",
    },
    {
      id: 2,
      username: "jane_smith",
      profile: Profile2,
      image: post2,
      caption: "Enjoying the sunset at the beach!",
    },
  ];

  const suggestions = [
    { id: 1, username: "user1", profile: Profile },
    { id: 2, username: "user2", profile: Profile },
    { id: 3, username: "user3", profile: Profile },
    { id: 4, username: "user4", profile: Profile },
    { id: 5, username: "user5", profile: Profile },
    { id: 6, username: "user6", profile: Profile },
  ];

  return (
    <div className="flex justify-center max-w-7xl mx-auto px-4 pt-8">
      {/* Main Feed */}
      <div className="w-full max-w-2xl">
        {/* Stories */}
        <Stories />

        {/* Posts */}
        {posts.map((post) => (
          <Post
            key={post.id}
            username={post.username}
            profile={post.profile}
            image={post.image}
            caption={post.caption}
          />
        ))}
      </div>

      {/* Suggested sidebar */}
      <div className="hidden lg:block w-80 ml-10">
        <div className="bg-white border rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Suggested for you
            </h3>
            <Link
                to="/suggested"
                className="text-xs text-blue-500 font-semibold hover:underline"
                >
                See All
            </Link>
          </div>

          <div className="space-y-4">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={s.profile}
                    alt={s.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {s.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      Suggested for you
                    </span>
                  </div>
                </div>

                <button
                  className="text-xs text-blue-500 font-semibold hover:underline"
                  onClick={() => alert(`You followed ${s.username}`)}
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
