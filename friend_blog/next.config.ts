import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // allow external avatar host used by default fallback avatars
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
