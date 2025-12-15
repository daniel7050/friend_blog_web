"use client";

import React, { useState } from "react";
import Image from "next/image";
import { apiFetch } from "../../lib/api";

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
  onEdit: (id: string, content: string) => void;
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
  onEdit,
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

  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const isOwnPost = !!(
    authorId &&
    currentUserId &&
    authorId.toString() === currentUserId
  );

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

  return (
    <div
      className="bg-white rounded-lg shadow p-4 mb-4"
      data-testid="post-card"
    >
      <p className="text-gray-800 whitespace-pre-wrap">{content}</p>

      {/* Post image with responsive variants */}
      {imageUrl && (
        <div className="mt-3 rounded overflow-hidden relative w-full h-64">
          <Image
            src={
              imageVariants?.medium?.url ||
              imageVariants?.small?.url ||
              imageUrl
            }
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>by {author}</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>

      <div className="flex gap-4 mt-4 items-center">
        <button
          onClick={toggleLike}
          disabled={isOwnPost}
          className={`${
            isOwnPost
              ? "text-gray-400 cursor-not-allowed"
              : "text-red-500 hover:text-red-700"
          }`}
          title={isOwnPost ? "You can't like your own post" : ""}
        >
          {liked ? "❤️ Liked" : "🤍 Like"}
        </button>

        <span className="text-sm text-gray-600">{likeCount} likes</span>

        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) loadComments();
          }}
          className="text-blue-500 hover:text-blue-700"
        >
          💬 Comments
        </button>

        <button
          onClick={() => onEdit(id, content)}
          className="text-gray-700 hover:text-gray-900"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <div className="mb-2">
            {editingCommentId ? (
              <>
                <textarea
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Edit comment..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCommentText(editingCommentText);
                      submitComment();
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingCommentText("");
                    }}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
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
                  disabled={isOwnPost}
                  className="w-full border rounded p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={
                    isOwnPost
                      ? "You can't comment on your own post"
                      : "Write a comment..."
                  }
                />
                <button
                  onClick={submitComment}
                  disabled={isOwnPost || !commentText.trim()}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
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
