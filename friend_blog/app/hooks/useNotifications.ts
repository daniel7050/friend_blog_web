"use client";

import { useEffect, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export type Notification = {
  id: string;
  userId: string;
  actorId: string;
  type: "like" | "comment" | "follow-request";
  data: unknown;
  read: boolean;
  createdAt: string;
};

let socketInstance: Socket | null = null;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

    // Initialize socket connection if not already initialized
    if (!socketInstance) {
      socketInstance = io(API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Listen for new notifications
      socketInstance.on("notification", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount((prev) => prev + 1);
        }
        if (
          notification.type === "follow-request" &&
          typeof window !== "undefined"
        ) {
          window.dispatchEvent(new CustomEvent("follow-requests:increment"));
        }
      });

      // Optional: listen on per-user channel if backend emits `user:{userId}`
      if (userId) {
        const userChannel = `user:${userId}` as const;
        socketInstance.on(userChannel, (notification: Notification) => {
          setNotifications((prev) => [notification, ...prev]);
          if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
          }
          if (
            notification.type === "follow-request" &&
            typeof window !== "undefined"
          ) {
            window.dispatchEvent(new CustomEvent("follow-requests:increment"));
          }
        });
      }

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

    return () => {
      // Cleanup: keep socket alive for other hooks but don't close on unmount
    };
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
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
