"use client";
import { useEffect, useState } from "react";

type Post = {
  id: string;
  content: string;
  createdAt: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in to view posts.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as Post[];
        setPosts(data);
      } catch (error) {
        console.error("Fetch posts error:", error);
        setMessage("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading posts...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        My Posts
      </h1>

      {message && <p className="text-center text-gray-600 mb-4">{message}</p>}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded shadow">
            <p className="text-gray-800 mb-2">{post.content}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{new Date(post.createdAt).toLocaleString()}</span>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-center text-gray-600">
            You haven’t written any posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
