"use client";
import { useUser } from "../hooks/useUser";
import ProfileCard from "../components/ProfileCard";

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>You must be logged in.</p>;

  return <ProfileCard user={user} />;
}
