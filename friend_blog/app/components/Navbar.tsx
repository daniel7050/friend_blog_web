"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import { useNotifications } from "../hooks/useNotifications";
import { useFollowRequestsCount } from "../hooks/useFollowRequests";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { count: followReqCount } = useFollowRequestsCount();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
        <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/" className="text-blue-600 font-bold">
            Friend Blog
          </Link>
          <Link href="/feed" className="text-gray-600 hover:text-blue-600">
            Feed
          </Link>
          <Link href="/posts" className="text-gray-600 hover:text-blue-600">
            My Posts
          </Link>
          <Link
            href="/posts/create"
            className="text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 w-full sm:w-auto text-center"
          >
            Create
          </Link>
          <Link href="/users" className="text-gray-600 hover:text-blue-600">
            Find Users
          </Link>
          <Link
            href="/follow/requests"
            className="text-gray-600 hover:text-blue-600"
          >
            Follow Requests
            {followReqCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5">
                {followReqCount}
              </span>
            )}
          </Link>
          <Link
            href="/notifications"
            className="text-gray-600 hover:text-blue-600 relative"
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {user ? (
            <>
              <UserAvatar src={user.profileImage} />
              <span className="text-sm text-gray-700">{user.username}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/register"
                className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
