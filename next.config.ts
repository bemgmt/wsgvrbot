import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow the embed page to be loaded in iframes from wsgvr.org
        source: "/embed",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.wsgvr.org",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://www.wsgvr.org",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.wsgvr.org",
          },
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
