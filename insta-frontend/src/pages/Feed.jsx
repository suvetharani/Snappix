import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post";
import Stories from "../components/Stories";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  // Hardcode your logged-in user for now
  const currentUser = "suvetharani.7";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts");
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="w-full max-w-6xl mx-auto p-4">
      <Stories /> {/* If you want stories */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {posts.map((post) => (
          <Post
            key={post._id}
            postId={post._id}
            username={post.username}
            profile={post.profile}
            image={post.image}
            caption={post.caption}
            initialLikes={post.likes}
            initialComments={post.comments}
            currentUser={currentUser}
          />
        ))}
      </div>
    </main>
  );
}
