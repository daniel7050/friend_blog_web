"use client";
import {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import PostCard from "./PostCard";
import { apiFetch } from "../../lib/api";
import { useToast } from "../components/ToastProvider";

type Post = {
  id: string;
  content: string;
  author?: { username?: string } | null;
  createdAt?: string;
  likesCount?: number;
  imageUrl?: string;
  imageVariants?: {
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { showToast } = useToast();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🟢 Fetch all posts with cursor-based pagination
  const fetchPosts = useCallback(
    async (isLoadMore = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (isLoadMore && cursor) params.append("cursor", cursor);
        params.append("limit", "10");

        const { res, data } = await apiFetch(`/api/posts?${params.toString()}`);
        if (res && res.ok && data) {
          const postsData = data as {
            items: Post[];
            nextCursor: string | null;
            hasNext: boolean;
          };
          if (isLoadMore) {
            setPosts((prev) => [...prev, ...(postsData.items || [])]);
          } else {
            setPosts(postsData.items || []);
          }
          setCursor(postsData.nextCursor || null);
          setHasMore(postsData.hasNext ?? true);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        showToast("Failed to load posts", "error");
      } finally {
        setLoading(false);
      }
    },
    [cursor, showToast]
  );

  useEffect(() => {
    fetchPosts(false);
  }, [fetchPosts]);

  // 🟢 Create or Update Post
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setMessage("You must be logged in to post.");
      showToast("You must be logged in to post.", "error");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const { res } = await apiFetch(url.replace(API_URL, "/api/posts"), {
        method,
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to save post");
      setContent("");
      setEditingId(null);
      setMessage(editingId ? "Post updated!" : "Post created!");
      showToast(editingId ? "Post updated" : "Post created", "success");
      fetchPosts(false);
    } catch (error) {
      console.error("Error saving post:", error);
      setMessage("Failed to save post");
      showToast("Failed to save post", "error");
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
      await apiFetch(`/api/posts/${id}`, { method: "DELETE", raw: true });
      setMessage("Post deleted!");
      showToast("Post deleted", "info");
      fetchPosts(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      setMessage("Failed to delete post");
      showToast("Failed to delete post", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
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
          {loading && posts.length === 0 ? (
            // Skeleton Loader
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  author={post.author?.username || "You"}
                  createdAt={post.createdAt ?? new Date().toISOString()}
                  likesCount={post.likesCount ?? 0}
                  imageUrl={post.imageUrl}
                  imageVariants={post.imageVariants}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              {hasMore && (
                <button
                  onClick={() => fetchPosts(true)}
                  disabled={loading}
                  className="w-full mt-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
