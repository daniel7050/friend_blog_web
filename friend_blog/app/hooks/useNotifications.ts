"use client";

import { useEffect, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "../../lib/api";

export type Notification = {
  id: string;
  userId: string;
  actorId: string;
  type: "like" | "comment" | "follow_request" | "follow_accepted" | string;
  data: { message?: string; actorName?: string; postId?: string } | unknown;
  read: boolean;
  createdAt: string;
};

const resolveType = (
  type: string | null | undefined,
  data: unknown
): string => {
  const primary = type ? String(type) : "";
  const dataType =
    data && typeof data === "object"
      ? (data as { type?: string })?.type ||
        (data as { notificationType?: string })?.notificationType ||
        (data as { event?: string })?.event ||
        (data as { kind?: string })?.kind ||
        (data as { category?: string })?.category ||
        (data as { action?: string })?.action ||
        (data as { message?: string })?.message ||
        ""
      : "";
  return (primary || dataType || "").toString();
};

const normalizeNotification = (n: Notification): Notification => {
  const normalizedType = resolveType(n?.type, n?.data);
  return { ...n, type: normalizedType || n?.type || "" };
};

let socketInstance: Socket | null = null;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadExisting = useCallback(async () => {
    try {
      const { res, data } = await apiFetch("/api/notifications");
      const items = Array.isArray(data)
        ? (data as Notification[])
        : Array.isArray((data as { items?: Notification[] })?.items)
        ? ((data as { items?: Notification[] }).items as Notification[])
        : Array.isArray(
            (data as { notifications?: Notification[] })?.notifications
          )
        ? ((data as { notifications?: Notification[] })
            .notifications as Notification[])
        : [];

      if (res.ok) {
        const normalized = items.map((n) => normalizeNotification(n));
        setNotifications(normalized);
        setUnreadCount(normalized.filter((n) => !n.read).length);
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
      console.log("  Type:", notification.type);
      console.log("  Actor:", notification.actorId);
      console.log("  Data:", notification.data);

      const normalized = normalizeNotification(notification);
      setNotifications((prev) => [normalized, ...prev]);
      if (!normalized.read) {
        setUnreadCount((prev) => prev + 1);
      }
      if (
        notification.type === "follow_request" &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new CustomEvent("follow-requests:increment"));
      }
    };

    // Listen to specific notification types for debugging
    if (socketInstance) {
      socketInstance.on("notification:like", (data) => {
        console.log("[Socket] Like notification:", data);
      });
      socketInstance.on("notification:comment", (data) => {
        console.log("[Socket] Comment notification:", data);
      });
      socketInstance.on("notification:follow_request", (data) => {
        console.log("[Socket] Follow request notification:", data);
      });
      socketInstance.on("notification:follow_accepted", (data) => {
        console.log("[Socket] Follow accepted notification:", data);
      });
    }

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

  const refresh = loadExisting;

  return { notifications, unreadCount, markAsRead, refresh };
}
