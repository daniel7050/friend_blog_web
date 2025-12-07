"use client";
import { useUser } from "../../hooks/useUser";
import axios from "../../utils/axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "../../utils/validation";

export default function SettingsPage() {
  const { user, refresh, loading: userLoading } = useUser();
  const [image, setImage] = useState(user?.profileImage || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
      });
      setImage(user.profileImage || "");
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setMessage("");

    try {
      await axios.put(`/users/me`, {
        name: data.name,
        username: data.username,
        bio: data.bio,
        profileImage: image,
      });

      refresh();
      setMessage("Profile updated successfully!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      setImage(url);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setMessage("Failed to upload image");
    }
  }

  if (userLoading) {
    return <p className="text-center">Loading profile...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Edit Profile</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className={`w-full border p-2 rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            className={`w-full border p-2 rounded ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            className={`w-full border p-2 rounded ${
              errors.bio ? "border-red-500" : "border-gray-300"
            }`}
            {...register("bio")}
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Profile Image
          </label>
          <input type="file" onChange={handleImageUpload} accept="image/*" />
          {image && (
            <Image
              src={image}
              alt="profile"
              width={80}
              height={80}
              className="w-20 h-20 mt-2 rounded-full object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p
            className={`text-sm ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
