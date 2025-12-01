"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../lib/api";

type Follower = {
  id: string | number;
  username: string;
};

export default function FollowersPage() {
  const [followers, setFollowers] = useState<Follower[]>([]);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchFollowers = useCallback(async () => {
    if (!userId) return;
    const { res, data } = await apiFetch(`/api/follow/${userId}/followers`);
    if (res && res.ok && data) setFollowers(data as Follower[]);
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Followers</h1>

      {followers.map((u) => (
        <div key={u.id} className="p-3 shadow bg-white mb-2 rounded">
          {u.username}
        </div>
      ))}
    </div>
  );
}
