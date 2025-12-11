import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increased to support avatar uploads (max 5MB per file)
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    qualities: [75, 90, 100],
  },
  // Allow cross-origin requests from local network devices (e.g., testing on mobile)
  devIndicators: {
    position: 'bottom-left',
  },
  // Configure allowed dev origins for local network testing
  allowedDevOrigins: [
    '192.168.1.12',
    '192.168.1.6',
    '127.0.0.1',
    'http://192.168.1.12',
    'http://192.168.1.12:3000',
    'http://192.168.1.6',
    'http://192.168.1.6:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://localhost:3000',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
