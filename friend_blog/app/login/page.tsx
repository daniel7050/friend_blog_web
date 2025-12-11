"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../utils/validation";
import { useState } from "react";
import { useToast } from "../components/ToastProvider";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setMessage("");

    const result = await login(data.email, data.password);
    if (result.ok) {
      setMessage("Login successful! 🎉");
      showToast("Login successful!", "success");
      router.push("/feed");
    } else {
      const msg = result.message || "Login failed";
      setMessage(msg);
      showToast(msg, "error");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <div className="mb-2">
          <input
            placeholder="Email"
            className={`border p-2 w-full ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            placeholder="Password"
            className={`border p-2 w-full ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 w-full rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p
            className={`mt-2 text-sm ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
