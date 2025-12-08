"use client";

import { FormEvent, useState } from "react";
import Protected from "../../components/Protected";
import { apiFetch } from "../../../lib/api";
import { useToast } from "../../components/ToastProvider";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { res } = await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to create post");
      setContent("");
      setMessage("Post created!");
      showToast("Post created", "success");
    } catch (error) {
      console.error(error);
      setMessage("Failed to create post");
      showToast("Failed to create post", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Create Post</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Write something..."
              rows={4}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Posting..." : "Create Post"}
            </button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </div>
      </div>
    </Protected>
  );
}
