import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevHosts: ['.trycloudflare.com'],
  },
};

export default nextConfig;
