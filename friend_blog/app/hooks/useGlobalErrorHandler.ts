"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";

export function useGlobalErrorHandler() {
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    // Listen for 401 errors and redirect to login
    const handle401 = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        showToast("Session expired. Please login again.", "error");
        router.push("/login");
      }
    };

    // Listen for 403 errors (not authorized)
    const handle403 = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.status === 403) {
        showToast(
          event.detail?.message ||
            "Not authorized or not friends to view this.",
          "error"
        );
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("api:error:401", handle401);
      window.addEventListener("api:error:403", handle403);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("api:error:401", handle401);
        window.removeEventListener("api:error:403", handle403);
      }
    };
  }, [router, showToast]);
}
