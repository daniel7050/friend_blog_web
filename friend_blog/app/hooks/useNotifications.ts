"use client";

import { useEffect, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export type Notification = {
  id: string;
  userId: string;
  actorId: string;
  type: "like" | "comment";
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
      });

      socketInstance.on("connect", () => {
        console.log("Connected to notification server");
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from notification server");
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
