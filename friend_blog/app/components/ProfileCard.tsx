import UserAvatar from "./UserAvatar";
import type { User } from "../context/AuthContext";

export default function ProfileCard({ user }: { user: User }) {
  return (
    <div className="border rounded p-4 space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar src={user.profileImage} />
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p>@{user.username}</p>
        </div>
      </div>

      {user.bio && <p>{user.bio}</p>}

      <div className="flex gap-4 text-sm text-gray-600">
        <span>{user._count?.followers || 0} Followers</span>
        <span>{user._count?.following || 0} Following</span>
        <span>{user._count?.posts || 0} Posts</span>
      </div>
    </div>
  );
}
