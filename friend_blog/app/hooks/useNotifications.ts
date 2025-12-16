"use client";

import { useEffect, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "../../lib/api";

export type Notification = {
  id: string;
  userId: string;
  actorId: string;
  type: "like" | "comment" | "follow_request" | "follow_accepted";
  data: unknown;
  read: boolean;
  createdAt: string;
};

let socketInstance: Socket | null = null;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadExisting = useCallback(async () => {
    try {
      console.log("[useNotifications] Fetching existing notifications...");
      const { res, data } = await apiFetch("/api/notifications");
      console.log("[useNotifications] Response:", {
        ok: res.ok,
        status: res.status,
        dataType: Array.isArray(data) ? "array" : typeof data,
        itemCount: Array.isArray(data) ? data.length : "n/a",
      });
      if (res.ok && Array.isArray(data)) {
        const items = data as Notification[];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
        console.log("[useNotifications] Loaded", items.length, "notifications");
      } else {
        console.warn("[useNotifications] Failed to load:", res.status, data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const rawUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let userId: string | undefined;
    try {
      userId = rawUser
        ? (JSON.parse(rawUser)?.id as string | undefined)
        : undefined;
      if (!userId && typeof window !== "undefined") {
        const legacyId = localStorage.getItem("userId");
        userId = legacyId || undefined;
      }
    } catch {
      // ignore parse errors
    }

    // Ensure a single socket connection
    if (!socketInstance) {
      socketInstance = io(API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
      socketInstance.on("connect_error", (err) => {
        console.error("Notification socket connect_error", err?.message);
      });
      socketInstance.on("connect", () => {
        console.log("Connected to notification server");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("socket:connected"));
        }
      });
      socketInstance.on("disconnect", () => {
        console.log("Disconnected from notification server");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("socket:disconnected"));
        }
      });
    }

    // Register per-hook listeners so all consumers update in real time
    const onNotification = (notification: Notification) => {
      console.log(
        "[useNotifications] Received socket notification:",
        notification
      );
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }
      if (
        notification.type === "follow_request" &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new CustomEvent("follow-requests:increment"));
      }
    };

    socketInstance.on("notification", onNotification);

    let userChannel: string | undefined;
    const onUserChannel = (notification: Notification) =>
      onNotification(notification);
    if (userId) {
      userChannel = `user:${userId}`;
      socketInstance.on(userChannel, onUserChannel);
    }

    // Load existing notifications on first mount so the list isn't empty
    loadExisting();

    return () => {
      // Remove this hook's listeners but keep the shared socket alive
      socketInstance?.off("notification", onNotification);
      if (userChannel) {
        socketInstance?.off(userChannel, onUserChannel);
      }
    };
  }, [loadExisting]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { res } = await apiFetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          raw: true,
        }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  return { notifications, unreadCount, markAsRead };
}
