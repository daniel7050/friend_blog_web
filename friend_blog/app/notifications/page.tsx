"use client";

import { useNotifications } from "../hooks/useNotifications";
import Protected from "../components/Protected";

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();

  const renderTitle = (type: string, actorName?: string | null): string => {
    if (type === "like") return `❤️ ${actorName || "Someone"} liked your post`;
    if (type === "comment")
      return `💬 ${actorName || "Someone"} commented on your post`;
    if (type === "follow_request")
      return `👤 ${actorName || "Someone"} sent you a follow request`;
    if (type === "follow_accepted")
      return `✅ ${actorName || "Someone"} accepted your follow request`;
    return "🔔 New notification";
  };

  return (
    <Protected>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 sm:p-4 rounded-lg border ${
                  notif.read
                    ? "bg-white border-gray-200"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">
                      {renderTitle(
                        notif.type,
                        (notif.data as { actorName?: string })?.actorName
                      )}
                    </p>
                    {(() => {
                      const details = (() => {
                        if (typeof notif.data === "string") return notif.data;
                        if (
                          notif.data &&
                          typeof notif.data === "object" &&
                          "message" in notif.data
                        ) {
                          return (notif.data as { message?: string }).message;
                        }
                        return null;
                      })();
                      return details ? (
                        <p className="text-xs sm:text-sm text-gray-700 mt-1 break-words">
                          {details}
                        </p>
                      ) : null;
                    })()}
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs sm:text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition whitespace-nowrap"
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
