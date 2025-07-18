// src/pages/PostDetails.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/single/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="flex max-w-4xl mx-auto mt-10 border rounded overflow-hidden">
      {/* Left: Post Image */}
      <div className="flex-1">
        <img
          src={`http://localhost:5000${post.fileUrl}`}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right: Caption + Comments */}
      <div className="w-96 p-4 flex flex-col">
        <h2 className="font-semibold mb-2">{post.username}</h2>
        <p className="mb-4">{post.caption}</p>

        <div className="flex-1 overflow-y-auto">
          {/* Example placeholder comments */}
          <p className="text-gray-500">No comments yet</p>
        </div>

        <input
          type="text"
          placeholder="Add a comment..."
          className="border px-3 py-2 rounded w-full mt-auto"
        />
      </div>
    </div>
  );
}
