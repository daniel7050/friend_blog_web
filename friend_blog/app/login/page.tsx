"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const result = await login(form.email, form.password);
    if (result.ok) {
      setMessage("Login successful! 🎉");
      router.push("/feed");
    } else {
      setMessage(result.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 w-full rounded"
        >
          Login
        </button>

        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
}
