"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../utils/validation";

export default function Register() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setMessage("");

    const result = await registerUser({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
    });
    if (result.ok) {
      setMessage("Registration successful! 🎉 Redirecting...");
      showToast("Registration successful!", "success");
      router.push("/feed");
    } else {
      const msg = result.message || "Registration failed. Please try again.";
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
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <div className="mb-2">
          <input
            placeholder="Name"
            className={`border p-2 w-full ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-2">
          <input
            placeholder="Username"
            className={`border p-2 w-full ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-2">
          <input
            placeholder="Email"
            type="email"
            className={`border p-2 w-full ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-2">
          <input
            placeholder="Password"
            type="password"
            className={`border p-2 w-full ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            placeholder="Confirm Password"
            type="password"
            className={`border p-2 w-full ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 w-full rounded disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
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
