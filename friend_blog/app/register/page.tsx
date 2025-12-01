"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { register } = useAuth();

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const result = await register(form);
    if (result.ok) {
      setMessage("Registration successful! 🎉 Redirecting...");
      router.push("/feed");
    } else {
      setMessage(result.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input
          name="name"
          placeholder="Name"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          required
        />
        <input
          name="username"
          placeholder="Username"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 w-full rounded"
        >
          Register
        </button>

        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
}
