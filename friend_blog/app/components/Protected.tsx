"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Protected({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  if (!token) return null;

  return <>{children}</>;
}
