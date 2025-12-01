"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <nav className="flex items-center gap-4">
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
            className="text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700"
          >
            Create
          </Link>
          <Link href="/users" className="text-gray-600 hover:text-blue-600">
            Find Users
          </Link>
        </nav>

        <div className="flex items-center gap-4">
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
