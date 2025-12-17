"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import { useNotifications } from "../hooks/useNotifications";
import { useFollowRequestsCount } from "../hooks/useFollowRequests";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { count: followReqCount } = useFollowRequestsCount();
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinkBase =
    "text-sm sm:text-base px-3 py-2 rounded-md transition flex items-center gap-1";
  const navLinkClass = (href: string) => {
    const active = pathname === href || pathname?.startsWith(`${href}/`);
    return `${navLinkBase} ${
      active ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"
    }`;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-blue-600 font-bold text-lg sm:text-xl">
          Friend Blog
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-3 flex-1 ml-6">
          <Link href="/feed" className={navLinkClass("/feed")}>
            Feed
          </Link>
          <Link href="/posts/create" className={navLinkClass("/posts/create")}>
            Create
          </Link>
          <Link href="/users" className={navLinkClass("/users")}>
            Find Users
          </Link>
          <Link
            href="/follow/requests"
            className={navLinkClass("/follow/requests")}
          >
            Follow Requests
            {followReqCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5">
                {followReqCount}
              </span>
            )}
          </Link>
          <Link
            href="/notifications"
            className={navLinkClass("/notifications")}
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3 sm:gap-4">
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

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg lg:hidden">
            <nav className="flex flex-col gap-2 p-4">
              <Link href="/feed" className={navLinkClass("/feed")}>
                Feed
              </Link>
              <Link
                href="/posts/create"
                className={`${navLinkClass("/posts/create")} justify-center`}
              >
                Create
              </Link>
              <Link href="/users" className={navLinkClass("/users")}>
                Find Users
              </Link>
              <Link
                href="/follow/requests"
                className={`${navLinkClass(
                  "/follow/requests"
                )} flex items-center gap-2`}
              >
                Follow Requests
                {followReqCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5">
                    {followReqCount}
                  </span>
                )}
              </Link>
              <Link
                href="/notifications"
                className={`${navLinkClass(
                  "/notifications"
                )} flex items-center gap-2`}
              >
                🔔 Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {user ? (
                <>
                  <hr className="my-2" />
                  <span className="text-sm text-gray-700 py-2">
                    User: {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:underline py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-blue-600 border border-blue-600 px-3 py-2 rounded-md text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
