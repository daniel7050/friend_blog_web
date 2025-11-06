"use client";
import { useState, FormEvent } from "react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You must be logged in to post.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Post created successfully!");
        setContent("");
      } else {
        setMessage(data.error || "Failed to create post.");
      }
    } catch (error) {
      console.error("Create post error:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Create a New Post
        </h2>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post..."
          className="border w-full p-2 rounded mb-4 h-32 resize-none"
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Post
        </button>

        {message && (
          <p className="mt-3 text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
