export type UploadSignatureResponse = {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
};

export type UploadResult = {
  url: string;
  publicId: string;
};

export async function uploadImageDirect(
  file: File,
  token: string
): Promise<UploadResult> {
  const sigRes = await fetch("/api/uploads/signature", {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!sigRes.ok) {
    throw new Error(`Signature fetch failed: ${sigRes.status}`);
  }
  const { timestamp, signature, cloudName, apiKey } =
    (await sigRes.json()) as UploadSignatureResponse;

  const form = new FormData();
  form.append("file", file);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("api_key", apiKey);
  form.append("folder", "friend-blog");

  const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const upRes = await fetch(cloudUrl, { method: "POST", body: form });
  if (!upRes.ok) throw new Error("Cloudinary upload failed");
  const data = await upRes.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
  };
}
