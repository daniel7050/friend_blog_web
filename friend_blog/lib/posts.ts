export type CreatePostPayload = {
  content: string;
  visibility: "friends" | "public";
  imageUrl?: string;
  imagePublicId?: string;
};

export async function createPost(token: string, payload: CreatePostPayload) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Create post failed");
  return res.json();
}
