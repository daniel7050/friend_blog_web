"use client";

import React, { useState } from "react";
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
  createdAt: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function PostCard({
  id,
  content,
  author,
  createdAt,
  onEdit,
  onDelete,
}: PostCardProps) {
  // token and API_URL not needed here — apiFetch handles auth and base URL

  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

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
      const likeData = data as { liked?: boolean } | null;
      if (likeData && typeof likeData.liked !== "undefined") {
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
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <p className="text-gray-800">{content}</p>

      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>by {author}</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={toggleLike}
          className="text-red-500 hover:text-red-700"
        >
          {liked ? "❤️ Liked" : "🤍 Like"}
        </button>

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
                  className="w-full border rounded p-2"
                  placeholder="Write a comment..."
                />
                <button
                  onClick={submitComment}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
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
