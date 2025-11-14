"use client";

import React from "react";

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
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
      <p className="text-gray-800 mb-2">{content}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>by {author}</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => onEdit(id, content)}
          className="text-blue-600 hover:text-blue-800"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
