"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../lib/api";

export function useFollowRequestsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socketDisconnected, setSocketDisconnected] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { res, data } = await apiFetch("/api/follow/requests");
      if (res.ok && Array.isArray(data)) {
        setCount((data as unknown[]).length);
      }
    } catch {
      // ignore; leave previous count
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Live updates: increment on socket follow-request notification
    const increment = () => setCount((prev) => prev + 1);
    const doRefresh = () => refresh();
    // Listen for socket connectivity changes
    const onConnected = () => setSocketDisconnected(false);
    const onDisconnected = () => setSocketDisconnected(true);
    if (typeof window !== "undefined") {
      window.addEventListener("follow-requests:increment", increment);
      window.addEventListener("follow-requests:refresh", doRefresh);
      window.addEventListener("socket:connected", onConnected);
      window.addEventListener("socket:disconnected", onDisconnected);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("follow-requests:increment", increment);
        window.removeEventListener("follow-requests:refresh", doRefresh);
        window.removeEventListener("socket:connected", onConnected);
        window.removeEventListener("socket:disconnected", onDisconnected);
      }
    };
  }, [refresh]);

  // Exponential backoff polling only when socket is disconnected
  useEffect(() => {
    if (typeof window === "undefined") return;
    let timeoutId: number | undefined;
    const baseDelay = 15000; // 15s
    const maxDelay = 120000; // 2m
    let delay = baseDelay;

    const schedule = () => {
      // Only poll when disconnected
      if (!socketDisconnected) return;
      timeoutId = window.setTimeout(async () => {
        try {
          if (!loading) {
            await refresh();
          }
        } finally {
          // Increase delay up to max and reschedule
          delay = Math.min(maxDelay, delay * 2);
          schedule();
        }
      }, delay);
    };

    if (socketDisconnected) {
      // Reset delay and start backoff polling
      delay = baseDelay;
      schedule();
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [socketDisconnected, refresh, loading]);

  return { count, loading, refresh };
}
