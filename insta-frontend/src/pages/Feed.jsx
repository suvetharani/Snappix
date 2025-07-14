import Post from "../components/Post";
import Stories from "../components/Stories";

import profile from "../assets/profiles/profile.jpg";
import post1 from "../assets/post1.jpg";
import post2 from "../assets/post2.jpg";

export default function Feed() {
  const posts = [
    {
      username: "john_doe",
      profile: profile,
      image: post1,
      caption: "Blossom!"
    },
    {
      username: "jane_smith",
      profile: profile,
      image: post2,
      caption: "Sunset Goals"
    },
  ];

  return (
    <main className="w-full max-w-xl">
      {posts.map((post, index) => (
        <Post
          key={index}
          username={post.username}
          profile={post.profile}
          image={post.image}
          caption={post.caption}
        />
      ))}
    </main>
  );
}
