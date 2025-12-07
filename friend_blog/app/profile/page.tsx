"use client";
import { useUser } from "../hooks/useUser";
import ProfileCard from "../components/ProfileCard";
import { ProfileSkeleton } from "../components/Skeletons";

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) return <ProfileSkeleton />;
  if (!user) return <p>You must be logged in.</p>;

  return <ProfileCard user={user} />;
}
