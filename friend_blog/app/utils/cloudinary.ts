import axios from "./axios";

export async function uploadToCloudinary(file: File) {
  if (!file) return "";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  const res = await axios.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (res.status >= 400)
    throw new Error(res.data?.message || "Cloudinary upload failed");
  return res.data?.secure_url || res.data?.url;
}
