import Image from "next/image";

export default function UserAvatar({ src }: { src?: string | null }) {
  const imageSrc = src || "https://avatar.iran.liara.run/username";
  return (
    <Image
      src={imageSrc}
      width={40}
      height={40}
      className="w-10 h-10 rounded-full object-cover"
      alt="avatar"
    />
  );
}
