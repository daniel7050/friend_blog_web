"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../lib/api";

type FollowingUser = {
  id: string | number;
  username: string;
};

export default function FollowingPage() {
  const [following, setFollowing] = useState<FollowingUser[]>([]);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchFollowing = useCallback(async () => {
    if (!userId) return;
    const { res, data } = await apiFetch(`/api/follow/${userId}/following`);
    if (res && res.ok && data) setFollowing(data as FollowingUser[]);
  }, [userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">People You Follow</h1>

      {following.map((u) => (
        <div key={u.id} className="p-3 shadow bg-white mb-2 rounded">
          {u.username}
        </div>
      ))}
    </div>
  );
}
