import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post";
import Stories from "../components/Stories";
import Profile from "../assets/profiles/profile.jpg";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const currentUsername = localStorage.getItem("username");
  
    const suggestions = [
    { id: 1, username: "user1", profile: Profile },
    { id: 2, username: "user2", profile: Profile },
    { id: 3, username: "user3", profile: Profile },
    { id: 4, username: "user4", profile: Profile },
    { id: 5, username: "user5", profile: Profile },
    { id: 6, username: "user6", profile: Profile },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/all");
        const allPosts = res.data.map((post) => ({
          ...post,
profile: post.profilePic
  ? post.profilePic.startsWith("/uploads")
    ? post.profilePic
    : `/uploads/${post.profilePic}`
  : "/uploads/default.jpg", // fallback if profilePic is missing
        }));

        setPosts(allPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto pt-8 bg-white dark:bg-black dark:text-white min-h-screen transition-colors duration-300">
      <Stories />
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post._id}
            postId={post._id}
            username={post.username}
            profile={`http://localhost:5000${post.profile}`}
            image={`http://localhost:5000${post.fileUrl}`}
            caption={post.caption}
            currentUser={currentUsername}
            initialLikes={post.likes || []}
            initialComments={post.comments || []}
          />
        ))
      ) : (
        <p className="text-center text-gray-500">No posts found</p>
      )}
    </div>
  );
}
