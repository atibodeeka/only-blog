import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    prefetchHints: false,
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
