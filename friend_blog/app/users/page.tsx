"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../lib/api";

type User = {
  id: string | number;
  username: string;
  name?: string;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const [following, setFollowing] = useState<string[]>([]);

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

  const toggleFollow = async (id: string) => {
    const isFollowing = following.includes(id);

    await apiFetch(`${API_FOLLOW}/${id}`, {
      method: isFollowing ? "DELETE" : "POST",
      raw: true,
    });

    fetchFollowing();
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
                <button
                  onClick={() => toggleFollow(u.id.toString())}
                  className={`px-4 py-1 rounded ${
                    following.includes(u.id.toString())
                      ? "bg-red-500 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {following.includes(u.id.toString()) ? "Unfollow" : "Follow"}
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
