"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import PostCard from "./PostCard";
import { apiFetch } from "../../lib/api";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";

type Post = {
  id: string;
  content: string;
  author?: { username?: string; id?: string } | null;
  authorId?: string;
  createdAt?: string;
  likesCount?: number;
  _count?: { likes?: number };
  imageUrl?: string;
  imageVariants?: {
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

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

          // Normalize likes count from various possible backend shapes
          type BackendPost = Post & {
            likeCount?: number;
            likes_count?: number;
            likes?: number | unknown[];
            reactions?: { likes?: number | unknown[] };
          };

          const normalizeLikesCount = (item: BackendPost): number => {
            // Prisma count field
            const countLikes = item?._count?.likes;
            if (typeof countLikes === "number") return countLikes;
            // Direct numeric fields
            if (typeof item?.likesCount === "number") return item.likesCount;
            if (typeof item?.likeCount === "number") return item.likeCount;
            if (typeof item?.likes_count === "number") return item.likes_count;
            // Array or number likes field
            const likes = item?.likes;
            if (typeof likes === "number") return likes;
            if (Array.isArray(likes)) return likes.length;
            // Nested reactions
            const rLikes = item?.reactions?.likes;
            if (typeof rLikes === "number") return rLikes;
            if (Array.isArray(rLikes)) return rLikes.length;
            return 0;
          };

          const normalizedItems = (postsData.items || []).map((p) => ({
            ...p,
            likesCount: normalizeLikesCount(p as unknown as BackendPost),
          })) as Post[];

          if (isLoadMore) {
            setPosts((prev) => [...prev, ...normalizedItems]);
          } else {
            setPosts(normalizedItems);
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

  // Infinite scroll: load more when sentinel becomes visible
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts(true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchPosts]);

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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 px-4">
          Your Feed
        </h1>

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
              {posts.map((post) => {
                // Only show logged-in user's name if we can confirm it's their post via authorId
                const isOwnPost =
                  user?.id &&
                  post.authorId &&
                  post.authorId.toString() === user.id.toString();

                const displayAuthor =
                  post.author?.username ||
                  (isOwnPost && user?.username) ||
                  "Unknown User";

                return (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    content={post.content}
                    author={displayAuthor}
                    authorId={post.authorId || post.author?.id}
                    createdAt={post.createdAt ?? new Date().toISOString()}
                    likesCount={post.likesCount ?? 0}
                    imageUrl={post.imageUrl}
                    imageVariants={post.imageVariants}
                    onDelete={handleDelete}
                  />
                );
              })}
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />
              {loading && hasMore && (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading more posts...</p>
                </div>
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
