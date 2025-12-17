"use client";

import { useEffect, useState, useCallback } from "react";
import Protected from "../../components/Protected";
import { useToast } from "../../components/ToastProvider";
import { apiFetch } from "../../../lib/api";

type PendingRequest = {
  id: string;
  fromUser?: {
    id?: string | number;
    username?: string;
    name?: string | null;
    profileImage?: string | null;
  } | null;
  createdAt?: string;
};

export default function FollowRequestsPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const getCurrentUsername = () => {
    if (typeof window === "undefined") return undefined;
    const raw = localStorage.getItem("user");
    if (!raw) return undefined;
    try {
      return (JSON.parse(raw) as { username?: string })?.username;
    } catch {
      return undefined;
    }
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { res, data } = await apiFetch("/api/follow/requests/pending");
      if (res.ok && Array.isArray(data)) {
        setRequests(data as PendingRequest[]);
      } else if (res.status === 401) {
        showToast("Please login to view follow requests.", "error");
      } else if (res.status === 403) {
        showToast("Not authorized to view follow requests.", "error");
      } else {
        const detail = typeof data === "string" ? data : res.statusText;
        showToast(`Failed to load requests (${detail || res.status})`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const notifyRequester = async (request: PendingRequest) => {
    if (!request?.fromUser?.id) return;
    try {
      const actorName = getCurrentUsername();
      await apiFetch(`/api/notifications`, {
        method: "POST",
        body: JSON.stringify({
          type: "follow_accepted",
          targetUserId: request.fromUser.id,
          data: {
            message: `${actorName || "Your follow request"} was accepted`,
            actorName,
            requestId: request.id,
          },
        }),
      });
    } catch (e) {
      console.warn("Unable to push follow_accepted notification", e);
    }
  };

  const acceptRequest = async (id: string) => {
    const request = requests.find((r) => r.id === id);
    try {
      const { res, data } = await apiFetch(
        `/api/follow/requests/${id}/accept`,
        {
          method: "POST",
          raw: true,
        }
      );
      if (!res.ok) {
        const detail = typeof data === "string" ? data : res.statusText;
        throw new Error(detail || "Accept failed");
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("Follow request accepted", "success");
      if (request) {
        notifyRequester(request);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("follow-requests:refresh"));
      }
    } catch (e) {
      console.error(e);
      showToast(`Failed to accept request (${(e as Error).message})`, "error");
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      const { res, data } = await apiFetch(
        `/api/follow/requests/${id}/reject`,
        {
          method: "POST",
          raw: true,
        }
      );
      if (!res.ok) {
        const detail = typeof data === "string" ? data : res.statusText;
        throw new Error(detail || "Reject failed");
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("Follow request rejected", "info");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("follow-requests:refresh"));
      }
    } catch (e) {
      console.error(e);
      showToast(`Failed to reject request (${(e as Error).message})`, "error");
    }
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            Follow Requests
          </h1>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-600">No pending requests.</p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded p-3 sm:p-4 gap-3"
                >
                  <div>
                    <p className="font-semibold text-sm sm:text-base">
                      {req.fromUser?.username || "Unknown user"}
                    </p>
                    {req.fromUser?.name && (
                      <p className="text-xs sm:text-sm text-gray-500">
                        {req.fromUser.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="flex-1 sm:flex-none px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="flex-1 sm:flex-none px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Protected>
  );
}
