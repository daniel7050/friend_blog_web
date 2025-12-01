"use client";

import React, { useState } from "react";
import { apiFetch } from "../../lib/api";

interface Comment {
  id: string;
  content: string;
  author: { username: string };
  createdAt: string;
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
    if (res && res.ok && data) setLiked(Boolean(data.liked));
  };

  // Submit comment
  const submitComment = async () => {
    if (!commentText.trim()) return;

    await apiFetch(`/api/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: commentText }),
    });

    setCommentText("");
    loadComments();
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
          </div>

          {/* Comments list */}
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-100 p-2 rounded mb-2">
              <p className="text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500">
                by {c.author.username} •{" "}
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
