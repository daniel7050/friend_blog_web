"use client";

import { FormEvent, useState } from "react";
import Protected from "../../components/Protected";
import { apiFetch } from "../../../lib/api";
import { useToast } from "../../components/ToastProvider";
import { uploadImageDirect } from "../../../lib/uploadImage";
import { useAuth } from "../../context/AuthContext";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<"friends" | "public">("public");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useToast();
  const { token } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;

      if (file && token) {
        setUploading(true);
        const uploaded = await uploadImageDirect(file, token);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
        setUploading(false);
      }

      const { res } = await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content, visibility, imageUrl, imagePublicId }),
      });

      if (!res.ok) throw new Error("Failed to create post");
      setContent("");
      setFile(null);
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
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "friends" | "public")
              }
              className="w-full border rounded-md p-2"
            >
              <option value="public">Public</option>
              <option value="friends">Friends only</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full border rounded-md p-2"
            />
            {file && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected preview"
                  className="max-h-64 rounded border"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading
                ? "Uploading image..."
                : loading
                ? "Posting..."
                : "Create Post"}
            </button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </div>
      </div>
    </Protected>
  );
}
