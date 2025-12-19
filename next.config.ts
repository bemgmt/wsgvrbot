import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Note: frame-ancestors removed as we're using direct widget embedding (no iframe)
          // If you still need iframe support for backward compatibility, uncomment:
          // {
          //   key: "Content-Security-Policy",
          //   value: "frame-ancestors https://www.wsgvr.org",
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
