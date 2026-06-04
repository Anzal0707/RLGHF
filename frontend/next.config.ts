import type { NextConfig } from "next";

const lanDevOrigins =
  process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  /* Allow dev access from phones/tablets on the local network (set NEXT_ALLOWED_DEV_ORIGINS). */
  allowedDevOrigins: ["localhost", "127.0.0.1", ...lanDevOrigins],
};

export default nextConfig;
