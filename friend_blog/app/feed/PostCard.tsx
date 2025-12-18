"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { apiFetch } from "../../lib/api";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";

interface Comment {
  id: string;
  content: string;
  author: { username: string };
  createdAt: string;
  authorId?: string;
}

interface PostCardProps {
  id: string;
  content: string;
  author: string;
  authorId?: string;
  createdAt: string;
  likesCount?: number;
  imageUrl?: string;
  imageVariants?: {
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
  onDelete: (id: string) => void;
}

export default function PostCard({
  id,
  content,
  author,
  authorId,
  createdAt,
  likesCount = 0,
  imageUrl,
  imageVariants,
  onDelete,
}: PostCardProps) {
  // token and API_URL not needed here — apiFetch handles auth and base URL

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostText, setEditPostText] = useState(content);
  const [postContent, setPostContent] = useState(content);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const { user } = useAuth();
  const currentUserId = (() => {
    // Prefer AuthContext
    if (user?.id !== undefined && user?.id !== null) {
      return String(user.id);
    }
    // Fallbacks: stored full user object or legacy userId
    if (typeof window !== "undefined") {
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser) as { id?: string | number };
          if (parsed?.id !== undefined && parsed?.id !== null) {
            return String(parsed.id);
          }
        }
      } catch {}
      const legacyId = localStorage.getItem("userId");
      if (legacyId) return legacyId;
    }
    return null;
  })();

  const isOwnPost = Boolean(
    authorId && currentUserId && authorId.toString() === currentUserId
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Fetch comments
  const loadComments = async () => {
    const { res, data } = await apiFetch(`/api/posts/${id}/comments`);
    if (res && res.ok && data) setComments(data as Comment[]);
  };

  // Like toggle
  const toggleLike = async () => {
    const { res, data } = await apiFetch(`/api/posts/${id}/like`, {
      method: "POST",
    });
    if (res && res.ok && data) {
      const likeData = data as { liked?: boolean; likesCount?: number } | null;

      // Prefer backend count if available, otherwise adjust locally
      if (typeof likeData?.likesCount === "number") {
        setLikeCount(Math.max(0, likeData.likesCount));
      } else if (typeof likeData?.liked !== "undefined") {
        setLikeCount((prev) => Math.max(0, prev + (likeData.liked ? 1 : -1)));
      }

      if (typeof likeData?.liked !== "undefined") {
        setLiked(Boolean(likeData.liked));
      }
    }
  };

  // Submit comment
  const submitComment = async () => {
    if (!commentText.trim()) return;

    if (editingCommentId) {
      // Update comment
      await apiFetch(`/api/posts/${id}/comments/${editingCommentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: commentText }),
      });
      setEditingCommentId(null);
      setEditingCommentText("");
    } else {
      // Create comment
      await apiFetch(`/api/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      });
    }

    setCommentText("");
    loadComments();
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      await apiFetch(`/api/posts/${id}/comments/${commentId}`, {
        method: "DELETE",
        raw: true,
      });
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Update post content
  const savePostEdit = async () => {
    const trimmed = editPostText.trim();
    if (!trimmed) return;
    try {
      const { res, data } = await apiFetch(`/api/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content: trimmed }),
      });
      if (res && res.ok) {
        setPostContent(trimmed);
        setIsEditingPost(false);
        setShowDropdown(false);
        showToast("Post updated", "success");
      } else {
        const detail = typeof data === "string" ? data : res.statusText;
        showToast(`Failed to update (${detail || res.status})`, "error");
      }
    } catch (e) {
      console.error("Error updating post", e);
      showToast("Error updating post", "error");
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition mb-4 p-4 sm:p-6"
      data-testid="post-card"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-gray-500 text-sm">{author}</p>
          <p className="text-gray-400 text-xs">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        {isOwnPost && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition"
              aria-label="Post options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setIsEditingPost(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditingPost ? (
        <div className="mb-3">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            className="w-full border rounded p-2 text-sm sm:text-base"
            rows={4}
            placeholder="Edit your post..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={savePostEdit}
              disabled={!editPostText.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingPost(false);
                setEditPostText(postContent);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded text-sm hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base">
          {postContent}
        </p>
      )}
      {imageUrl && (
        <div className="mt-4 rounded overflow-hidden relative w-full h-40 sm:h-56 md:h-64">
          <Image
            src={
              imageVariants?.medium?.url ||
              imageVariants?.small?.url ||
              imageUrl
            }
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
          />
        </div>
      )}

      <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-3 pt-3 border-t">
        <span className="font-semibold text-blue-600">by {author}</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <button
          onClick={toggleLike}
          className="text-red-500 hover:text-red-700 transition"
        >
          {liked ? "❤️ Liked" : "🤍 Like"}
        </button>

        <span className="text-sm text-gray-600">{likeCount} likes</span>

        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) loadComments();
          }}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          💬 Comments
        </button>
      </div>

      {showComments && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="mb-2">
            {editingCommentId ? (
              <>
                <textarea
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                  className="w-full border rounded p-2 mb-2 text-sm"
                  placeholder="Edit comment..."
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCommentText(editingCommentText);
                      submitComment();
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingCommentText("");
                    }}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Write a comment..."
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Add Comment
                </button>
              </>
            )}
          </div>

          {/* Comments list */}
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-100 p-2 rounded mb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800">{c.content}</p>
                  <p className="text-xs text-gray-500">
                    by {c.author.username} •{" "}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                {c.authorId?.toString() === currentUserId && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id);
                        setEditingCommentText(c.content);
                      }}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
