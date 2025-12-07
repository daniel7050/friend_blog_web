"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../lib/api";
import { ListSkeleton } from "../../components/Skeletons";

type Follower = {
  id: string | number;
  username: string;
};

export default function FollowersPage() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchFollowers = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { res, data } = await apiFetch(`/api/follow/${userId}/followers`);
      if (res && res.ok && data) setFollowers(data as Follower[]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  if (loading) return <ListSkeleton count={5} />;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Followers</h1>

      {followers.length === 0 ? (
        <p className="text-gray-500">No followers yet.</p>
      ) : (
        followers.map((u) => (
          <div key={u.id} className="p-3 shadow bg-white mb-2 rounded">
            {u.username}
          </div>
        ))
      )}
    </div>
  );
}
