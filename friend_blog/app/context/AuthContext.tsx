"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type User = {
  id?: string;
  username?: string;
  name?: string;
  profileImage?: string | null;
  bio?: string | null;
  _count?: {
    followers?: number;
    following?: number;
    posts?: number;
  };
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  refresh: () => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; message?: string }>;
  register: (
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    try {
      const axios = (await import("../utils/axios")).default;
      const res = await axios.get("/api/auth/me");
      setUser(res.data ?? null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const axios = (await import("../utils/axios")).default;
      const res = await axios.post("/api/auth/login", { email, password });
      const data = res.data;
      if (res.status >= 200 && res.status < 300 && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
        return { ok: true };
      }
      return { ok: false, message: data.message || data.error };
    } catch (err: unknown) {
      type AxiosErr = {
        response?: {
          status?: number;
          data?: { message?: string; error?: string; errors?: unknown };
        };
      };
      const axiosErr = err as AxiosErr;
      const errLike = err as { isAxiosError?: boolean; code?: string };
      const errorObj = err as Error;

      console.error("Login error (detailed):", {
        status: axiosErr?.response?.status,
        data: axiosErr?.response?.data,
        message: errorObj?.message,
        isAxiosError: errLike?.isAxiosError,
        code: errLike?.code,
        stack: errorObj?.stack,
      });

      // Handle rate limiting (429 Too Many Requests)
      if (axiosErr?.response?.status === 429) {
        return {
          ok: false,
          message:
            "Too many login attempts. Please try again in a few minutes.",
        };
      }

      const errorData = axiosErr?.response?.data;
      const msg =
        errorData?.message ||
        errorData?.error ||
        (errorData?.errors ? JSON.stringify(errorData.errors) : undefined) ||
        errorObj?.message ||
        String(err);
      return { ok: false, message: msg || "Network error" };
    }
  };

  const register = async (payload: Record<string, unknown>) => {
    try {
      const axios = (await import("../utils/axios")).default;
      console.log("Registration payload:", payload);
      const res = await axios.post("/api/auth/register", payload);
      const data = res.data;
      if (res.status >= 200 && res.status < 300 && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
        return { ok: true };
      }
      return { ok: false, message: data.message || data.error };
    } catch (err: unknown) {
      type AxiosErr = {
        response?: {
          status?: number;
          data?: { message?: string; error?: string; errors?: unknown };
        };
      };
      const axiosErr = err as AxiosErr;

      // Log full error details for debugging network/CORS vs validation issues
      const errLike = err as { isAxiosError?: boolean; code?: string };
      const errorObj = err as Error;

      console.error("Registration error (detailed):", {
        status: axiosErr?.response?.status,
        data: axiosErr?.response?.data,
        message: errorObj?.message,
        isAxiosError: errLike?.isAxiosError,
        code: errLike?.code,
        stack: errorObj?.stack,
      });

      // Handle rate limiting (429 Too Many Requests)
      if (axiosErr?.response?.status === 429) {
        return {
          ok: false,
          message:
            "Too many registration attempts. Please try again in a few minutes.",
        };
      }

      // Extract detailed error message
      const errorData = axiosErr?.response?.data;
      const msg =
        errorData?.message ||
        errorData?.error ||
        (errorData?.errors ? JSON.stringify(errorData.errors) : undefined) ||
        errorObj?.message ||
        String(err);
      return { ok: false, message: msg || "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, token, refresh, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default AuthContext;
