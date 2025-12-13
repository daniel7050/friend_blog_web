"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../components/ToastProvider";

type User = {
  id: string | number;
  username: string;
  name?: string;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const [following, setFollowing] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);
  const { showToast } = useToast();

  const API_FOLLOW = "http://localhost:5000/api/follow";

  const fetchUsers = useCallback(async (q = "") => {
    const { res, data } = await apiFetch(
      `/api/auth/users?q=${encodeURIComponent(q)}`
    );
    if (res && res.ok && data) setUsers(data as User[]);
  }, []);

  const fetchFollowing = useCallback(async () => {
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!userId) return;

    const { res, data } = await apiFetch(`/api/follow/${userId}/following`);
    if (res && res.ok && data)
      setFollowing((data as User[]).map((u) => u.id.toString()));
  }, []);

  const requestFollow = async (id: string) => {
    try {
      const { res } = await apiFetch(`${API_FOLLOW}/${id}`, {
        method: "POST",
        raw: true,
      });
      if (!res.ok) throw new Error("Request follow failed");
      setRequested((prev) => [...new Set([...prev, id])]);
      showToast("Follow request sent", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to send follow request", "error");
    }
  };
  const unfollow = async (id: string) => {
    try {
      const { res } = await apiFetch(`${API_FOLLOW}/${id}`, {
        method: "DELETE",
        raw: true,
      });
      if (!res.ok) throw new Error("Unfollow failed");
      fetchFollowing();
      showToast("Unfollowed", "info");
    } catch (e) {
      console.error(e);
      showToast("Failed to unfollow", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFollowing();
  }, [fetchUsers, fetchFollowing]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Find Users</h1>

      <input
        className="border p-2 w-full mb-4 rounded"
        placeholder="Search username..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchUsers(e.target.value);
        }}
      />

      <div>
        {users.map((u) => (
          <div
            key={u.id}
            className="flex justify-between items-center bg-white shadow p-3 mb-2 rounded"
          >
            <div>
              <p className="font-semibold">{u.username}</p>
              <p className="text-sm text-gray-500">{u.name}</p>
            </div>

            {typeof window !== "undefined" &&
              localStorage.getItem("userId") !== u.id.toString() && (
                <>
                  {following.includes(u.id.toString()) ? (
                    <button
                      onClick={() => unfollow(u.id.toString())}
                      className="px-4 py-1 rounded bg-red-500 text-white"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => requestFollow(u.id.toString())}
                      className="px-4 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                      disabled={requested.includes(u.id.toString())}
                    >
                      {requested.includes(u.id.toString())
                        ? "Requested"
                        : "Request follow"}
                    </button>
                  )}
                </>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
