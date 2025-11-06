"use client";
import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

type Post = {
  id: string;
  content: string;
  createdAt?: string;
};

export default function EditPost() {
  const router = useRouter();
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const posts = (await res.json()) as Post[];
      const current = posts.find((p) => p.id === id);
      if (current) setContent(current.content);
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setMessage("✅ Post updated successfully!");
        router.push("/posts");
      } else {
        setMessage("Failed to update post.");
      }
    } catch (error) {
      console.error("Update post error:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Edit Post
        </h2>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border w-full p-2 rounded mb-4 h-32 resize-none"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Save Changes
        </button>

        {message && (
          <p className="mt-3 text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
