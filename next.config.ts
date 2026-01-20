import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization configuration
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['react-icons', '@fortawesome/react-fontawesome'],
  },
};

export default nextConfig;
