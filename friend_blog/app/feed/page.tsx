"use client";
import {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import PostCard from "./PostCard";

type Post = {
  id: string;
  content: string;
  author?: { username?: string } | null;
  createdAt?: string;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = "http://localhost:5000/api/posts";

  // 🟢 Fetch all posts
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as Post[];
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 🟢 Create or Update Post
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setMessage("You must be logged in to post.");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to save post");
      setContent("");
      setEditingId(null);
      setMessage(editingId ? "Post updated!" : "Post created!");
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      setMessage("Failed to save post");
    }
  };

  // 🟠 Edit Post
  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setContent(content);
  };

  // 🔴 Delete Post
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Post deleted!");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      setMessage("Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Your Feed</h1>

        {/* 🟢 Create/Edit Post Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
            className="w-full border rounded-md p-2 mb-2"
            placeholder="Write something..."
            rows={3}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editingId ? "Update Post" : "Create Post"}
          </button>
        </form>

        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

        {/* 🧾 Post List */}
        <div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.content}
                author={post.author?.username || "You"}
                createdAt={post.createdAt ?? new Date().toISOString()}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
