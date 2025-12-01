"use client";
import { useUser } from "../../hooks/useUser";
import axios from "../../utils/axios";
import { useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";

export default function SettingsPage() {
  const { user, refresh } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [image, setImage] = useState(user?.profileImage || "");

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await axios.put(`/users/me`, {
      name,
      username,
      bio,
      profileImage: image,
    });

    refresh();
    alert("Profile updated!");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const url = await uploadToCloudinary(file);
    setImage(url);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Profile</h1>

      <form onSubmit={handleUpdate} className="space-y-3">
        <div>
          <label>Name</label>
          <input
            className="w-full border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Username</label>
          <input
            className="w-full border p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Bio</label>
          <textarea
            className="w-full border p-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <label>Profile Image</label>
          <input type="file" onChange={handleImageUpload} />
          {image && (
            <img
              src={image}
              alt="profile"
              className="w-20 h-20 mt-2 rounded-full"
            />
          )}
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
