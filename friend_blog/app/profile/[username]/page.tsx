import axios from "../../utils/axios";
import ProfileCard from "../../components/ProfileCard";

async function getUser(username: string) {
  const res = await axios.get(`/users/${username}`);
  return res.data;
}

export default async function PublicProfile({
  params,
}: {
  params?: Promise<{ username: string }>;
}) {
  const resolved = params ? await params : undefined;
  const username = resolved?.username;
  if (!username) return null;
  const user = await getUser(username);
  return <ProfileCard user={user} />;
}
