import axios from "../../utils/axios";
import ProfileCard from "../../components/ProfileCard";

async function getUser(username: string) {
  const res = await axios.get(`/users/${username}`);
  return res.data;
}

export default async function PublicProfile({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUser(params.username);
  return <ProfileCard user={user} />;
}
