import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes - allow iframe embedding from wsgvr.org
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://www.wsgvr.org",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
