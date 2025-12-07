"use client";

import { useNotifications } from "../hooks/useNotifications";
import Protected from "../components/Protected";

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <Protected>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border ${
                  notif.read
                    ? "bg-white border-gray-200"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {notif.type === "like"
                        ? "❤️ Someone liked your post"
                        : "💬 Someone commented on your post"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Protected>
  );
}
