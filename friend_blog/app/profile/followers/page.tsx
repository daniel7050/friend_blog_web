"use client";

import { useState, useEffect, useCallback } from "react";

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
    const res = await fetch(
      `http://localhost:5000/api/follow/${userId}/followers`
    );
    const data = (await res.json()) as Follower[];
    setFollowers(data);
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
