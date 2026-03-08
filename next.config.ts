import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Separate dev/build outputs to avoid chunk manifest corruption.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next"
};

export default nextConfig;
